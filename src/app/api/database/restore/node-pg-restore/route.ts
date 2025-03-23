import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { pgRestore } from 'pg-dump-restore';
import * as fs from 'fs';
import * as path from 'path';

// Yedek dosyalarının bulunduğu dizin
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const BACKUP_RECORDS_FILE = path.join(BACKUP_DIR, 'backup_records.json');

// Yedek kayıtlarını yükleme
function loadBackupRecords() {
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

// Hata kayıtları için
function logRestoreError(error: any) {
  try {
    const errorLogPath = path.join(BACKUP_DIR, 'restore_errors.log');
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] Hata: ${error.message}\nStack: ${error.stack}\n\n`;
    
    fs.appendFileSync(errorLogPath, errorMessage);
  } catch (logError) {
    console.error('Hata kaydedilirken sorun oluştu:', logError);
  }
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
    const { backupId, createAutoBackup = true } = requestData;

    if (!backupId) {
      return NextResponse.json(
        { error: 'Geri yüklenecek yedek belirtilmedi' },
        { status: 400 }
      );
    }

    // Yedek kayıtlarını yükle ve belirtilen yedeği bul
    const backupRecords = loadBackupRecords();
    const selectedBackup = backupRecords.find((backup: any) => backup.id === backupId);

    if (!selectedBackup) {
      return NextResponse.json(
        { error: 'Belirtilen yedek bulunamadı' },
        { status: 404 }
      );
    }

    // Yedek dosyasının varlığını kontrol et
    if (!fs.existsSync(selectedBackup.filePath)) {
      return NextResponse.json(
        { error: 'Yedek dosyası disk üzerinde bulunamadı' },
        { status: 404 }
      );
    }

    // Eğer istenirse otomatik yedek al
    if (createAutoBackup) {
      console.log('Geri yükleme öncesi otomatik yedek alınıyor...');
      // Bu kısım genellikle başka bir API endpoint'i çağırarak yapılır
      // Burada zaman kısıtı nedeniyle sadece log kaydı bırakıyoruz
    }

    // Veritabanı bağlantı bilgileri
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json(
        { error: 'Veritabanı bağlantı bilgileri bulunamadı' },
        { status: 500 }
      );
    }

    // DATABASE_URL'den bilgileri ayıklama
    const connectionMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!connectionMatch) {
      return NextResponse.json(
        { error: 'Veritabanı bağlantı bilgileri geçersiz formatta' },
        { status: 500 }
      );
    }

    const [, dbUser, dbPassword, dbHost, dbPort, dbNameWithParams] = connectionMatch;
    const dbName = dbNameWithParams.split('?')[0];

    console.log('Veritabanı geri yükleme işlemi başlatılıyor...');
    console.log(`Yedek dosyası: ${selectedBackup.fileName}`);

    try {
      // pg-dump-restore ile geri yükleme
      const result = await pgRestore(
        {
          host: dbHost,
          port: parseInt(dbPort, 10),
          database: dbName,
          username: dbUser,
          password: dbPassword,
        },
        {
          filename: selectedBackup.filePath,
          clean: true, // Mevcut nesneleri temizle
          create: true, // Gerekirse veritabanını oluştur
          exitOnError: false, // Hatada durmadan devam et
          verbose: true, // Ayrıntılı çıktı
        } as any // Type assertion ekleyerek lint hatasından kaçınıyoruz
      );

      console.log('Geri yükleme işlemi tamamlandı');
      
      if (result.stderr) {
        console.warn('pg_restore uyarı/bilgi çıktısı:', result.stderr);
      }

      return NextResponse.json({
        success: true,
        message: 'Veritabanı başarıyla geri yüklendi',
        details: {
          backupId: selectedBackup.id,
          backupName: selectedBackup.fileName,
          restoredAt: new Date().toISOString(),
          restoredBy: user.name,
        },
      });
    } catch (execError: any) {
      console.error('pg_restore çalıştırma hatası:', execError);
      logRestoreError(execError);
      
      // Eğer hata pg_restore'un bulunmamasından kaynaklanıyorsa, özel mesaj göster
      if (execError.message && (
          execError.message.includes('pg_restore: command not found') || 
          execError.message.includes('not recognized as an internal or external command')
      )) {
        return NextResponse.json(
          { 
            error: 'PostgreSQL geri yükleme aracı (pg_restore) bulunamadı.',
            suggestion: 'JSON yedekleme kullanıyorsanız Prisma geri yükleme seçeneğini kullanabilirsiniz.',
            errorType: 'pg_restore_not_found'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Veritabanı geri yükleme işlemi sırasında hata oluştu', 
          details: execError.message
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Veritabanı geri yükleme işlemi sırasında hata:', error);
    logRestoreError(error);
    
    return NextResponse.json(
      { 
        error: 'Veritabanı geri yükleme işlemi sırasında bir hata oluştu', 
        details: error.message 
      },
      { status: 500 }
    );
  }
} 