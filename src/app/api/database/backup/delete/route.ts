import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import * as fs from 'fs';
import * as path from 'path';

// Yedek dosyaları için dizin
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

// Yedek kayıtlarını kaydetme
function saveBackupRecords(records: any[]) {
  try {
    fs.writeFileSync(BACKUP_RECORDS_FILE, JSON.stringify(records, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Yedek kayıtları kaydedilirken hata:', error);
    return false;
  }
}

export async function DELETE(request: Request) {
  try {
    // Yetkilendirme kontrolü
    const user = await getUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    // URL'den ID parametresini alma
    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get('id');

    if (!backupId) {
      return NextResponse.json(
        { error: 'Silinecek yedek ID belirtilmedi' },
        { status: 400 }
      );
    }

    // Tüm yedek kayıtlarını yükleme
    const records = loadBackupRecords();
    
    // Silinecek yedeği bulma
    const backupIndex = records.findIndex((record: any) => record.id === backupId);
    
    if (backupIndex === -1) {
      return NextResponse.json(
        { error: 'Belirtilen ID ile yedek bulunamadı' },
        { status: 404 }
      );
    }

    const backup = records[backupIndex];
    
    // Yedek dosyasını silme
    if (fs.existsSync(backup.filePath)) {
      fs.unlinkSync(backup.filePath);
    }

    // Kaydı listeden çıkarma
    records.splice(backupIndex, 1);
    
    // Güncellenmiş kayıtları kaydetme
    saveBackupRecords(records);

    return NextResponse.json({
      success: true,
      message: 'Yedek dosyası başarıyla silindi',
      deletedBackup: backup
    });
  } catch (error: any) {
    console.error('Yedek silme işlemi sırasında hata:', error);
    return NextResponse.json(
      { error: 'Yedek silme işlemi sırasında bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
} 