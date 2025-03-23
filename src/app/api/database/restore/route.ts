import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { loadBackupRecords } from '@/lib/backupUtils';

// Exec fonksiyonunu promise olarak kullanabilmek için
const execPromise = util.promisify(exec);

// Yedek dosyaları için dizin
const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Dizin yoksa oluştur
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// JSON dosyasından (Prisma dump) geri yükleme
async function restoreFromJsonFile(filePath: string) {
  try {
    console.log('JSON dosyasından geri yükleme başlatılıyor...');
    
    // JSON dosyasını oku
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let data;
    
    try {
      data = JSON.parse(fileContent);
    } catch (error) {
      throw new Error('Geçersiz JSON formatı: Yedek dosyası okunamadı');
    }
    
    if (!data || typeof data !== 'object') {
      throw new Error('Geçersiz yedek formatı: JSON verileri bulunamadı');
    }
    
    // Veritabanı tabloları var mı kontrol et
    if (!data.tables || typeof data.tables !== 'object') {
      throw new Error('Geçersiz yedek formatı: Tablo verileri bulunamadı');
    }
    
    console.log('Geri yükleme işlemi başlatılıyor...');
    
    // Her tablo için veri ekleme
    const tabloListesi = Object.keys(data.tables);
    console.log(`Geri yüklenecek tablolar (${tabloListesi.length}): ${tabloListesi.join(', ')}`);
    
    // İşlemi transaction içinde gerçekleştir
    const result = await prisma.$transaction(async (tx) => {
      // Tüm tabloları temizle
      for (const tableName of tabloListesi) {
        try {
          // Dikkat: Burada doğrudan SQL sorgusu kullanıyoruz - güvenlik için dikkatli olun
          await tx.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`);
          console.log(`"${tableName}" tablosu temizlendi`);
        } catch (error: any) {
          console.warn(`"${tableName}" tablosu temizlenemedi: ${error.message}`);
        }
      }
      
      // Her tablo için veri ekleme
      for (const tableName of tabloListesi) {
        const records = data.tables[tableName];
        if (!Array.isArray(records) || records.length === 0) {
          console.log(`"${tableName}" tablosu için veri yok, geçiliyor`);
          continue;
        }
        
        try {
          // Döngü içinde her kayıt ekleniyor
          let başarılıKayıtSayısı = 0;
          
          for (const record of records) {
            try {
              // @ts-ignore - Dinamik model erişimi için
              await tx[tableName].create({
                data: record
              });
              başarılıKayıtSayısı++;
            } catch (recordError: any) {
              console.warn(`"${tableName}" tablosuna kayıt eklerken hata: ${recordError.message}`);
            }
          }
          
          console.log(`"${tableName}" tablosuna ${başarılıKayıtSayısı}/${records.length} kayıt eklendi`);
        } catch (tableError: any) {
          console.error(`"${tableName}" tablosu işlenirken hata: ${tableError.message}`);
        }
      }
      
      return { success: true };
    });
    
    console.log('Geri yükleme başarıyla tamamlandı');
    return result;
  } catch (error: any) {
    console.error('JSON geri yükleme hatası:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // Kullanıcı yetkilerini kontrol et
    const user = await getUser();
    if (!user || user.role !== "ADMIN") {
      console.log("Yetkisiz geri yükleme isteği:", user ? `${user.email} (${user.role})` : "Kullanıcı bulunamadı");
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    const requestData = await request.json();
    const id = requestData.id || requestData.backupId; // Eski ve yeni istek formatını destekle
    
    if (!id) {
      return NextResponse.json(
        { error: "Yedek ID'si belirtilmedi." },
        { status: 400 }
      );
    }

    console.log(`Geri yükleme isteği alındı, ID: ${id}`);

    // Yedek kaydını bul
    const backupRecords = await loadBackupRecords();
    console.log("Yedek kayıtları:", JSON.stringify(backupRecords));
    
    let backup = backupRecords.find((record) => record.id === id);
    
    // Eğer belirtilen ID ile yedek bulunamazsa, özel ID formatlarını kontrol et
    if (!backup) {
      console.log(`Belirtilen ID (${id}) ile yedek bulunamadı. Alternatif formatları kontrol ediyorum...`);
      
      // pg-backup-timestamp formatı
      if (id.startsWith("pg-backup-")) {
        const timestamp = id.replace("pg-backup-", "");
        console.log(`pg-backup ID formatı algılandı, timestamp: ${timestamp}`);
        
        // En yakın zamanlı yedeği bul
        const closestBackup = backupRecords
          .filter(record => Math.abs(new Date(record.createdAt).getTime() - parseInt(timestamp)) < 86400000) // 24 saat içinde
          .sort((a, b) => Math.abs(new Date(a.createdAt).getTime() - parseInt(timestamp)) - 
                         Math.abs(new Date(b.createdAt).getTime() - parseInt(timestamp)))[0];
        
        if (closestBackup) {
          console.log(`En yakın yedek bulundu: ${closestBackup.id}, bu yedekle işleme devam ediliyor...`);
          // Bulunan yedeği kullan
          backup = closestBackup;
        }
      }
      
      // Eğer hala bir yedek bulunamadıysa hata döndür
      if (!backup) {
        return NextResponse.json(
          { error: "Belirtilen yedek bulunamadı." },
          { status: 404 }
        );
      }
    }

    // Yedek dosyasının yolunu oluştur
    const backupFilePath = path.join(
      process.cwd(),
      "backups",
      backup.fileName
    );

    // Dosyanın var olup olmadığını kontrol et
    if (!fs.existsSync(backupFilePath)) {
      return NextResponse.json(
        { error: "Yedek dosyası bulunamadı." },
        { status: 404 }
      );
    }

    console.log(`Geri yükleme başlatılıyor: ${backup.fileName} (${backup.type})`);

    // Tüm yedekleri JSON formatında Prisma ile geri yükle
    await restoreFromJsonFile(backupFilePath);

    return NextResponse.json({
      success: true,
      message: "Veritabanı başarıyla geri yüklendi.",
    });
  } catch (error: any) {
    console.error("Geri yükleme hatası:", error);
    return NextResponse.json(
      { error: `Geri yükleme sırasında hata oluştu: ${error.message}` },
      { status: 500 }
    );
  }
} 