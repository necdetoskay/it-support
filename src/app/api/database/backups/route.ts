import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import * as fs from 'fs';
import * as path from 'path';

// Yedek dosyaları için dizin
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const BACKUP_RECORDS_FILE = path.join(BACKUP_DIR, 'backup_records.json');

// Dizin yoksa oluştur
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

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

    // Yedek kayıtlarını yükle
    const backups = loadBackupRecords();

    // Her bir yedek için dosyanın hala var olup olmadığını kontrol et
    const validatedBackups = backups.map(backup => {
      const exists = fs.existsSync(backup.filePath);
      return {
        ...backup,
        fileExists: exists,
      };
    });

    return NextResponse.json({
      success: true,
      backups: validatedBackups,
    });
  } catch (error: any) {
    console.error('Yedek listesi alınırken hata:', error);
    return NextResponse.json(
      { error: 'Yedek listesi alınırken bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
} 