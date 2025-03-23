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

// ID'ye göre yedek kaydını bulma
function findBackupById(backupId: string) {
  const records = loadBackupRecords();
  return records.find((record: any) => record.id === backupId);
}

export async function GET(request: Request) {
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
        { error: 'İndirilecek yedek ID belirtilmedi' },
        { status: 400 }
      );
    }

    // Yedek kaydını bul
    const backup = findBackupById(backupId);
    if (!backup) {
      return NextResponse.json(
        { error: 'Belirtilen ID ile yedek bulunamadı' },
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

    try {
      // Dosyayı oku
      const fileBuffer = fs.readFileSync(backup.filePath);
      
      // Dosya adını ve tipini belirle
      const fileName = backup.fileName;
      
      // Response başlıklarını ayarla
      const headers = new Headers();
      headers.append('Content-Disposition', `attachment; filename=${fileName}`);
      headers.append('Content-Type', 'application/octet-stream');
      
      // Dosyayı Response olarak döndür
      return new NextResponse(fileBuffer, {
        status: 200,
        headers
      });
    } catch (error) {
      console.error('Dosya okunurken hata:', error);
      return NextResponse.json(
        { error: 'Dosya okunurken bir hata oluştu' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Yedek indirme işlemi sırasında hata:', error);
    return NextResponse.json(
      { error: 'Yedek indirme işlemi sırasında bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
} 