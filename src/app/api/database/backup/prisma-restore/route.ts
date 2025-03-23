import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import * as fs from 'fs';
import * as path from 'path';

// Yedek dosyaları için dizin
const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Restore işlemini kaydeden log dosyası
const RESTORE_LOG_FILE = path.join(BACKUP_DIR, 'restore_logs.json');

// Restore kaydı ekle
function saveRestoreLog(log: any) {
  try {
    let logs = [];
    if (fs.existsSync(RESTORE_LOG_FILE)) {
      logs = JSON.parse(fs.readFileSync(RESTORE_LOG_FILE, 'utf8'));
    }
    logs.push(log);
    fs.writeFileSync(RESTORE_LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
  } catch (error) {
    console.error('Geri yükleme logu kaydedilirken hata:', error);
  }
}

// Yedek kayıtlarını yükleme
function loadBackupRecords() {
  const BACKUP_RECORDS_FILE = path.join(BACKUP_DIR, 'backup_records.json');
  if (!fs.existsSync(BACKUP_RECORDS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(BACKUP_RECORDS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Yedek kayıtları yüklenirken hata:', error);
    return [];
  }
}

// Yedek kaydını ID'ye göre bul
function findBackupById(backupId: string) {
  const records = loadBackupRecords();
  return records.find((record: any) => record.id === backupId);
}

export async function POST(request: Request) {
  try {
    // Yetkilendirme kontrolü
    const user = await getUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    const requestData = await request.json();
    const { backupId } = requestData;

    if (!backupId) {
      return NextResponse.json(
        { error: 'Yedek ID belirtilmedi' },
        { status: 400 }
      );
    }

    // Yedek kaydını bul
    const backup = findBackupById(backupId);
    if (!backup || backup.type !== 'prisma-json') {
      return NextResponse.json(
        { error: 'Belirtilen ID ile uygun Prisma yedeği bulunamadı' },
        { status: 404 }
      );
    }

    // Yedek dosyasının var olup olmadığını kontrol et
    if (!fs.existsSync(backup.filePath)) {
      return NextResponse.json(
        { error: 'Yedek dosyası bulunamadı' },
        { status: 404 }
      );
    }

    console.log('Prisma ile geri yükleme başlatılıyor...');
    console.log(`Yedek dosyası: ${backup.fileName}`);

    // Mevcut durumun yedeğini al (güvenlik için)
    const currentBackupFileName = `auto-before-restore-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const currentBackupFilePath = path.join(BACKUP_DIR, currentBackupFileName);

    // Mevcut veriyi yedekle
    const currentModels = [
      { name: 'User', data: await prisma.user.findMany() },
      { name: 'Departman', data: await prisma.departman.findMany() },
      { name: 'Kategori', data: await prisma.kategori.findMany() },
      { name: 'Talep', data: await prisma.talep.findMany() },
      { name: 'TalepIslem', data: await prisma.talepIslem.findMany() },
      { name: 'Personel', data: await prisma.personel.findMany() },
      { name: 'SLAKural', data: await prisma.sLAKural.findMany() },
      { name: 'SorunEtiket', data: await prisma.sorunEtiket.findMany() },
      { name: 'CozumEtiket', data: await prisma.cozumEtiket.findMany() },
      { name: 'TalepIslemDosya', data: await prisma.talepIslemDosya.findMany() },
    ];

    const currentBackupData = {
      createdAt: new Date().toISOString(),
      version: '1.0',
      createdBy: user.name,
      data: currentModels
    };

    fs.writeFileSync(currentBackupFilePath, JSON.stringify(currentBackupData, null, 2), 'utf8');
    console.log('Mevcut durum yedeği alındı.');

    // Yedek dosyasını oku
    const backupData = JSON.parse(fs.readFileSync(backup.filePath, 'utf8'));
    
    // Veritabanı işlemleri için transaction kullan
    const restoreResults = await prisma.$transaction(async (prisma) => {
      const results = [];
      
      // Veritabanını temizle (ilişkili tablolar sebebiyle sıra önemli)
      console.log('Veritabanı temizleniyor...');
      await prisma.talepIslemDosya.deleteMany({});
      results.push({ table: 'TalepIslemDosya', action: 'delete', count: 'all' });
      
      await prisma.talepIslem.deleteMany({});
      results.push({ table: 'TalepIslem', action: 'delete', count: 'all' });
      
      await prisma.talep.deleteMany({});
      results.push({ table: 'Talep', action: 'delete', count: 'all' });
      
      await prisma.sLAKural.deleteMany({});
      results.push({ table: 'SLAKural', action: 'delete', count: 'all' });
      
      await prisma.personel.deleteMany({});
      results.push({ table: 'Personel', action: 'delete', count: 'all' });
      
      // Admin kullanıcılar hariç diğer kullanıcıları temizle
      await prisma.user.deleteMany({
        where: {
          role: {
            not: 'ADMIN'
          }
        }
      });
      results.push({ table: 'User', action: 'delete', count: 'non-admin' });
      
      await prisma.sorunEtiket.deleteMany({});
      results.push({ table: 'SorunEtiket', action: 'delete', count: 'all' });
      
      await prisma.cozumEtiket.deleteMany({});
      results.push({ table: 'CozumEtiket', action: 'delete', count: 'all' });
      
      await prisma.kategori.deleteMany({});
      results.push({ table: 'Kategori', action: 'delete', count: 'all' });
      
      await prisma.departman.deleteMany({});
      results.push({ table: 'Departman', action: 'delete', count: 'all' });
      
      console.log('Veritabanı temizlendi, veriler geri yükleniyor...');
      
      // Verileri geri yükle (Önerilen sıra)
      // Önce bağımsız tablolar
      for (const model of backupData.data) {
        if (model.name === 'Departman') {
          for (const item of model.data) {
            await prisma.departman.create({
              data: {
                id: item.id,
                ad: item.ad,
                aciklama: item.aciklama,
                olusturulmaTarihi: new Date(item.olusturulmaTarihi),
                guncellenmeTarihi: new Date(item.guncellenmeTarihi)
              }
            });
          }
          results.push({ table: 'Departman', action: 'create', count: model.data.length });
        }
        
        if (model.name === 'Kategori') {
          for (const item of model.data) {
            await prisma.kategori.create({
              data: {
                id: item.id,
                ad: item.ad,
                aciklama: item.aciklama,
                ustKategoriId: item.ustKategoriId,
                olusturulmaTarihi: new Date(item.olusturulmaTarihi),
                guncellenmeTarihi: new Date(item.guncellenmeTarihi)
              }
            });
          }
          results.push({ table: 'Kategori', action: 'create', count: model.data.length });
        }
        
        if (model.name === 'User') {
          // Mevcut admin kullanıcıları değiştirme, yalnızca diğer kullanıcıları geri yükle
          const existingAdmins = await prisma.user.findMany({
            where: { role: 'ADMIN' }
          });
          const existingAdminEmails = existingAdmins.map(admin => admin.email);
          
          // Geri yüklenecek admin olmayanlar ve mevcut olmayan adminler
          const usersToRestore = model.data.filter(user => 
            user.role !== 'ADMIN' || !existingAdminEmails.includes(user.email)
          );
          
          for (const item of usersToRestore) {
            await prisma.user.create({
              data: {
                id: item.id,
                name: item.name,
                email: item.email,
                password: item.password,
                role: item.role,
                isApproved: item.isApproved,
                createdAt: new Date(item.createdAt),
                updatedAt: new Date(item.updatedAt)
              }
            });
          }
          results.push({ table: 'User', action: 'create', count: usersToRestore.length });
        }
        
        if (model.name === 'SorunEtiket') {
          for (const item of model.data) {
            await prisma.sorunEtiket.create({
              data: {
                id: item.id,
                ad: item.ad,
                aciklama: item.aciklama,
                olusturulmaTarihi: new Date(item.olusturulmaTarihi),
                guncellenmeTarihi: new Date(item.guncellenmeTarihi)
              }
            });
          }
          results.push({ table: 'SorunEtiket', action: 'create', count: model.data.length });
        }
        
        if (model.name === 'CozumEtiket') {
          for (const item of model.data) {
            await prisma.cozumEtiket.create({
              data: {
                id: item.id,
                ad: item.ad,
                aciklama: item.aciklama,
                olusturulmaTarihi: new Date(item.olusturulmaTarihi),
                guncellenmeTarihi: new Date(item.guncellenmeTarihi)
              }
            });
          }
          results.push({ table: 'CozumEtiket', action: 'create', count: model.data.length });
        }
      }
      
      // Sonra bağımlı tablolar
      for (const model of backupData.data) {
        if (model.name === 'Personel') {
          for (const item of model.data) {
            await prisma.personel.create({
              data: {
                id: item.id,
                ad: item.ad,
                soyad: item.soyad || '',  // Eğer soyad yoksa boş string ekle
                departmanId: item.departmanId,
                telefon: item.telefon,
                olusturulmaTarihi: new Date(item.olusturulmaTarihi),
                guncellenmeTarihi: new Date(item.guncellenmeTarihi),
                aktif: item.aktif
              }
            });
          }
          results.push({ table: 'Personel', action: 'create', count: model.data.length });
        }
        
        if (model.name === 'SLAKural') {
          for (const item of model.data) {
            await prisma.sLAKural.create({
              data: {
                id: item.id,
                kategoriId: item.kategoriId,
                oncelik: item.oncelik,
                yanitlamaSuresi: item.yanitlamaSuresi,
                cozumSuresi: item.cozumSuresi,
                olusturulmaTarihi: new Date(item.olusturulmaTarihi),
                guncellenmeTarihi: new Date(item.guncellenmeTarihi)
              }
            });
          }
          results.push({ table: 'SLAKural', action: 'create', count: model.data.length });
        }
      }
      
      // Daha sonra talepler
      for (const model of backupData.data) {
        if (model.name === 'Talep') {
          for (const item of model.data) {
            await prisma.talep.create({
              data: {
                id: item.id,
                baslik: item.baslik,
                sorunDetay: item.sorunDetay,
                kategoriId: item.kategoriId,
                departmanId: item.departmanId,
                oncelik: item.oncelik,
                durum: item.durum,
                raporEdenId: item.raporEdenId,
                atananId: item.atananId,
                sonTarih: item.sonTarih ? new Date(item.sonTarih) : null,
                olusturulmaTarihi: new Date(item.olusturulmaTarihi),
                guncellenmeTarihi: new Date(item.guncellenmeTarihi),
                kapatilmaTarihi: item.kapatilmaTarihi ? new Date(item.kapatilmaTarihi) : null
              }
            });
          }
          results.push({ table: 'Talep', action: 'create', count: model.data.length });
        }
      }
      
      // En son talep işlemleri ve dosyalar
      for (const model of backupData.data) {
        if (model.name === 'TalepIslem') {
          for (const item of model.data) {
            await prisma.talepIslem.create({
              data: {
                id: item.id,
                tip: item.tip,
                aciklama: item.aciklama,
                durum: item.durum,
                olusturulmaTarihi: new Date(item.olusturulmaTarihi),
                guncellenmeTarihi: new Date(item.guncellenmeTarihi),
                talepId: item.talepId,
                yapanKullaniciId: item.yapanKullaniciId
              }
            });
          }
          results.push({ table: 'TalepIslem', action: 'create', count: model.data.length });
        }
        
        if (model.name === 'TalepIslemDosya') {
          for (const item of model.data) {
            await prisma.talepIslemDosya.create({
              data: {
                id: item.id,
                islemId: item.islemId,
                dosyaAdi: item.dosyaAdi,
                dosyaBoyutu: item.dosyaBoyutu,
                dosyaTipi: item.dosyaTipi,
                dosyaYolu: item.dosyaYolu,
                olusturulmaTarihi: new Date(item.olusturulmaTarihi),
                guncellenmeTarihi: new Date(item.guncellenmeTarihi)
              }
            });
          }
          results.push({ table: 'TalepIslemDosya', action: 'create', count: model.data.length });
        }
      }
      
      return results;
    });
    
    // Geri yükleme kaydını oluştur
    const restoreLog = {
      id: `restore-${Date.now()}`,
      backupId: backup.id,
      backupFile: backup.fileName,
      restoreDate: new Date().toISOString(),
      restoredBy: user.id,
      results: restoreResults,
      autoBackupFile: currentBackupFileName
    };
    
    // Geri yükleme kaydını kaydet
    saveRestoreLog(restoreLog);
    
    console.log('Geri yükleme işlemi tamamlandı.');
    
    return NextResponse.json({
      success: true,
      message: 'Veritabanı yedeği başarıyla geri yüklendi',
      restore: restoreLog
    });
  } catch (error: any) {
    console.error('Veritabanı geri yükleme işlemi sırasında hata:', error);
    
    return NextResponse.json(
      { 
        error: 'Veritabanı geri yükleme işlemi sırasında bir hata oluştu', 
        details: error.message 
      },
      { status: 500 }
    );
  }
} 