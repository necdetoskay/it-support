import { getUser } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { loadBackupRecords, saveBackupRecords } from '@/lib/backupUtils';
import { prisma } from '@/lib/prisma';

// Ana backup endpoint'i
export async function GET() {
  try {
    // Yetkilendirme kontrolü
    const user = await getUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    // JSON formatında Prisma dump oluştur
    const backupId = await createPrismaDump();
    
    return NextResponse.json({
      success: true,
      message: 'Veritabanı yedeği başarıyla oluşturuldu.',
      backupId
    });
  } catch (error: any) {
    console.error('Yedekleme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Yedekleme işlemi sırasında bir hata oluştu', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST metodunu da destekleyelim (eski istekler için)
export async function POST(request: Request) {
  try {
    // Yetkilendirme kontrolü
    const user = await getUser();
    if (!user || user.role !== 'ADMIN') {
      console.log("Yetkisiz yedekleme isteği:", user ? `${user.email} (${user.role})` : "Kullanıcı bulunamadı");
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    console.log("Yedekleme isteği alındı:", user.email);
    
    // JSON formatında Prisma dump oluştur
    const backupId = await createPrismaDump();
    
    return NextResponse.json({
      success: true,
      message: 'Veritabanı yedeği başarıyla oluşturuldu.',
      backupId
    });
  } catch (error: any) {
    console.error('Yedekleme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Yedekleme işlemi sırasında bir hata oluştu', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Prisma kullanarak veritabanının tüm tablolarını JSON olarak dışa aktarır
async function createPrismaDump() {
  try {
    // backups klasörü yoksa oluştur
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    
    // Tüm tabloları ve kayıtları almak için SQL sorgusu
    const databaseInfo = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT IN ('_prisma_migrations', 'pg_stat_statements')
      ORDER BY table_name;
    `;
    
    // Tablo isimlerini bir diziye dönüştür
    const tables: string[] = (databaseInfo as any[]).map(row => row.table_name);
    
    console.log(`Yedeklenecek tablolar (${tables.length}): ${tables.join(', ')}`);
    
    // Tüm tabloları ve kayıtları içerecek JSON nesnesi
    const dumpData = {
      createdAt: new Date().toISOString(),
      version: '1.0',
      tables: {} as Record<string, any[]>
    };
    
    // Her tablodan veri çek
    for (const tableName of tables) {
      try {
        // @ts-ignore - dinamik model erişimi
        const records = await prisma[tableName].findMany();
        dumpData.tables[tableName] = records;
        console.log(`"${tableName}" tablosundan ${records.length} kayıt yedeklendi`);
      } catch (error: any) {
        console.warn(`"${tableName}" tablosu yedeklenemedi: ${error.message}`);
      }
    }
    
    // Yedek için benzersiz dosya adı oluştur
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = uuidv4();
    const fileName = `database-backup-${timestamp}.json`;
    const filePath = path.join(backupsDir, fileName);
    
    // JSON dosyasını oluştur
    fs.writeFileSync(filePath, JSON.stringify(dumpData, null, 2), 'utf8');
    
    // Yedek kaydını ekle
    const backups = await loadBackupRecords();
    
    const user = await getUser();
    const backupRecord = {
      id: backupId,
      fileName,
      type: 'prisma-json',
      size: fs.statSync(filePath).size,
      createdAt: new Date().toISOString(),
      createdBy: user ? `${user.name} (${user.email})` : 'System',
      description: `Prisma JSON yedek - ${tables.length} tablo, ${Object.values(dumpData.tables).flat().length} kayıt`
    };
    
    // Yedek listesine ekle ve kaydet
    backups.push(backupRecord);
    await saveBackupRecords(backups);
    
    console.log(`Prisma JSON yedeği oluşturuldu: ${filePath}`);
    return backupId;
  } catch (error) {
    console.error('Prisma yedekleme hatası:', error);
    throw error;
  }
} 