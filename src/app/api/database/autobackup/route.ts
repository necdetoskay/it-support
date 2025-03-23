import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

// Exec fonksiyonunu promise olarak kullanabilmek için
const execPromise = util.promisify(exec);

// Yedek dosyaları için dizin
const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Dizin yoksa oluştur
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Yedekleme işlemlerini geçici olarak takip etmek için JSON dosyası
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

// Yedek kaydını ekleme
function saveBackupRecord(record: any) {
  try {
    const records = loadBackupRecords();
    records.push(record);
    fs.writeFileSync(BACKUP_RECORDS_FILE, JSON.stringify(records, null, 2), 'utf8');
    return record;
  } catch (error) {
    console.error('Yedek kaydı kaydedilirken hata:', error);
    throw error;
  }
}

// Otomatik yedekleme ayarlarını yükleme
function loadAutoBackupSettings() {
  try {
    const settingsPath = path.join(process.cwd(), 'backups', 'autobackup_settings.json');
    if (!fs.existsSync(settingsPath)) {
      return {
        enabled: false,
        frequency: 'daily',
        time: '03:00',
        type: 'full'
      };
    }
    
    const data = fs.readFileSync(settingsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Otomatik yedekleme ayarları yüklenirken hata:', error);
    return {
      enabled: false,
      frequency: 'daily',
      time: '03:00',
      type: 'full'
    };
  }
}

// Otomatik yedekleme izleme dosyasını oluştur veya güncelle
function updateAutoBackupLog(status: string, message: string) {
  try {
    const logPath = path.join(BACKUP_DIR, 'autobackup_log.json');
    let logs = [];
    
    if (fs.existsSync(logPath)) {
      const data = fs.readFileSync(logPath, 'utf8');
      logs = JSON.parse(data);
    }
    
    logs.push({
      timestamp: new Date().toISOString(),
      status,
      message
    });
    
    // Son 100 log kaydını tut
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }
    
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), 'utf8');
  } catch (error) {
    console.error('Yedekleme logu güncellenirken hata:', error);
  }
}

// POST - Otomatik yedekleme
export async function POST(request: Request) {
  try {
    // API anahtarı veya diğer yetkilendirme kontrolleri eklenebilir
    // Burada basit bir API anahtarı kontrolü yapıyoruz
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    
    // API anahtarı kontrolü (Gerçek uygulamada daha güçlü bir doğrulama kullanılmalıdır)
    if (!apiKey || apiKey !== process.env.AUTO_BACKUP_API_KEY) {
      return NextResponse.json(
        { error: 'Geçersiz veya eksik API anahtarı' },
        { status: 403 }
      );
    }
    
    // Otomatik yedekleme ayarlarını yükle
    const settings = loadAutoBackupSettings();
    
    // Eğer otomatik yedekleme etkin değilse işlemi durdur
    if (!settings.enabled) {
      updateAutoBackupLog('skipped', 'Otomatik yedekleme devre dışı bırakıldı');
      return NextResponse.json({
        success: true,
        message: 'Otomatik yedekleme devre dışı bırakıldı - işlem atlandı'
      });
    }
    
    // Veritabanı bağlantı bilgileri
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      updateAutoBackupLog('error', 'Veritabanı bağlantı bilgileri bulunamadı');
      return NextResponse.json(
        { error: 'Veritabanı bağlantı bilgileri bulunamadı' },
        { status: 500 }
      );
    }
    
    // DATABASE_URL'den bilgileri ayıklama
    const connectionMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!connectionMatch) {
      updateAutoBackupLog('error', 'Veritabanı bağlantı bilgileri geçersiz formatta');
      return NextResponse.json(
        { error: 'Veritabanı bağlantı bilgileri geçersiz formatta' },
        { status: 500 }
      );
    }
    
    const [, dbUser, dbPassword, dbHost, dbPort, dbName] = connectionMatch;
    
    // Yedek dosyası için zaman damgası
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `auto-backup-${settings.type}-${timestamp}.sql`;
    const filePath = path.join(BACKUP_DIR, fileName);
    
    // pg_dump komutunu oluşturma
    let pgDumpCommand = `PGPASSWORD=${dbPassword} pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName}`;
    
    // Yedek tipine göre komut ekleme
    if (settings.type === 'data-only') {
      pgDumpCommand += ' --data-only';
    }
    
    // Dosyaya yönlendirme
    pgDumpCommand += ` > "${filePath}"`;
    
    // Yedekleme işlemini gerçekleştirme
    await execPromise(pgDumpCommand);
    
    // Dosya boyutunu alma
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    // Yedek kaydını oluşturma
    const backupRecord = {
      id: `auto-backup-${Date.now()}`,
      fileName,
      filePath,
      fileSize,
      type: settings.type,
      description: `Otomatik yedekleme (${settings.frequency})`,
      tables: [],
      createdBy: 'system',
      createdAt: new Date().toISOString(),
    };
    
    // Kaydı JSON dosyasına ekleme
    saveBackupRecord(backupRecord);
    updateAutoBackupLog('success', `Otomatik yedek başarıyla oluşturuldu: ${fileName}`);
    
    return NextResponse.json({
      success: true,
      message: 'Otomatik veritabanı yedeği başarıyla oluşturuldu',
      backup: backupRecord,
    });
  } catch (error: any) {
    console.error('Otomatik veritabanı yedekleme işlemi sırasında hata:', error);
    updateAutoBackupLog('error', `Yedekleme hatası: ${error.message}`);
    
    return NextResponse.json(
      { 
        error: 'Otomatik veritabanı yedekleme işlemi sırasında bir hata oluştu', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET - Otomatik yedekleme durumunu al
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
    
    // Otomatik yedekleme loglarını yükle
    const logPath = path.join(BACKUP_DIR, 'autobackup_log.json');
    let logs = [];
    
    if (fs.existsSync(logPath)) {
      const data = fs.readFileSync(logPath, 'utf8');
      logs = JSON.parse(data);
    }
    
    // Otomatik yedekleme ayarlarını yükle
    const settings = loadAutoBackupSettings();
    
    return NextResponse.json({
      success: true,
      settings,
      logs: logs.slice(-20), // Son 20 log kaydını döndür
    });
  } catch (error: any) {
    console.error('Otomatik yedekleme durumu alınırken hata:', error);
    return NextResponse.json(
      { 
        error: 'Otomatik yedekleme durumu alınırken bir hata oluştu', 
        details: error.message 
      },
      { status: 500 }
    );
  }
} 