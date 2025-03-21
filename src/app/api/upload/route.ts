import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Sabitler
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'Geçerli bir dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Dosya boyutu 10MB'dan küçük olmalıdır` },
        { status: 400 }
      );
    }

    // MIME tip kontrolü
    const mimeType = file.type || 'application/octet-stream';
    const isAllowedType = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].includes(mimeType);

    if (!isAllowedType) {
      return NextResponse.json(
        { error: 'Desteklenmeyen dosya formatı. Sadece JPEG, PNG, GIF, WEBP ve MP4 dosyaları yükleyebilirsiniz.' },
        { status: 400 }
      );
    }

    // Dosyayı buffer'a çevir
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file instanceof File ? file.name : 'upload';

    // Benzersiz dosya adı oluştur
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = filename.split('.').pop() || '';
    const uniqueFileName = `${timestamp}-${randomString}.${extension}`;

    // Upload dizinini oluştur
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'talep-islemler');
    
    try {
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const filePath = join(uploadDir, uniqueFileName);
      await writeFile(filePath, buffer);

      return NextResponse.json({
        url: `/uploads/talep-islemler/${uniqueFileName}`
      });
    } catch (error) {
      console.error('Dosya kaydetme hatası:', error);
      return NextResponse.json(
        { error: 'Dosya kaydedilemedi' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    return NextResponse.json(
      { error: 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 