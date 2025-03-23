import fs from 'fs';
import path from 'path';

// Backup kayıtları için dosya yolu
const BACKUP_RECORDS_FILE = path.join(process.cwd(), 'backups', 'backup-records.json');

// Backup kayıtlarını yükler
export async function loadBackupRecords() {
  try {
    // backups klasörü yoksa oluştur
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Kayıt dosyası yoksa boş bir dizi döndür
    if (!fs.existsSync(BACKUP_RECORDS_FILE)) {
      return [];
    }

    // Dosyayı oku ve JSON olarak parse et
    const data = fs.readFileSync(BACKUP_RECORDS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Yedek kayıtları yüklenirken hata:', error);
    return []; // Hata durumunda boş dizi döndür
  }
}

// Backup kayıtlarını kaydeder
export async function saveBackupRecords(records) {
  try {
    // backups klasörü yoksa oluştur
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Kayıtları dosyaya yaz
    fs.writeFileSync(BACKUP_RECORDS_FILE, JSON.stringify(records, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Yedek kayıtları kaydedilirken hata:', error);
    return false;
  }
} 