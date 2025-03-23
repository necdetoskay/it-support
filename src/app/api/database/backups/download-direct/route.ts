import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getUser } from '@/lib/auth';
import { loadBackupRecords } from '@/lib/backupUtils';

export async function GET(request: Request) {
  try {
    // Kullanıcı kontrolü
    const user = await getUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    // URL'den id parametresini al
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Geçersiz yedek ID' },
        { status: 400 }
      );
    }

    // Yedek kayıtlarını yükle
    const backupRecords = await loadBackupRecords();
    
    // ID'ye göre yedeği bul
    const backup = backupRecords.find(record => record.id === id);
    
    if (!backup) {
      // Yedek bulunamadı
      return NextResponse.json(
        { error: 'Belirtilen yedek kaydı bulunamadı' },
        { status: 404 }
      );
    }

    // Dosya yolunu oluştur
    const filePath = path.join(process.cwd(), 'backups', backup.fileName);
    
    // Dosyanın varlığını kontrol et
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Yedek dosyası bulunamadı' },
        { status: 404 }
      );
    }

    // Dosya içeriğini oku
    const fileBuffer = fs.readFileSync(filePath);
    
    // Dosya uzantısına göre content type belirle
    let contentType = 'application/octet-stream';
    if (backup.fileName.endsWith('.json')) {
      contentType = 'application/json';
    } else if (backup.fileName.endsWith('.sql')) {
      contentType = 'application/sql';
    }

    // HTTP yanıtı oluştur ve dosyayı indirme olarak gönder
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${backup.fileName}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    });
  } catch (error: any) {
    console.error('Dosya indirme hatası:', error);
    return NextResponse.json(
      { error: `Dosya indirilirken bir hata oluştu: ${error.message}` },
      { status: 500 }
    );
  }
} 