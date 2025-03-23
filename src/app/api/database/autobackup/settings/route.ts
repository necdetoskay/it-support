import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { getUser } from '@/lib/auth';
import { z } from 'zod';

// Ayarlar dosyası yolu
const SETTINGS_FILE_PATH = path.join(process.cwd(), 'backups', 'autobackup_settings.json');

// Ayarlar dizini yoksa oluştur
const settingsDir = path.dirname(SETTINGS_FILE_PATH);
if (!fs.existsSync(settingsDir)) {
  fs.mkdirSync(settingsDir, { recursive: true });
}

// Otomatik yedekleme ayarlarını yükle
export function loadAutoBackupSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE_PATH)) {
      // Varsayılan ayarlar
      return {
        enabled: false,
        frequency: 'daily',
        time: '03:00',
        backupType: 'pg-backup',
        lastBackup: null,
        nextBackup: null,
      };
    }

    const settingsData = fs.readFileSync(SETTINGS_FILE_PATH, 'utf8');
    const settings = JSON.parse(settingsData);
    
    // Geçerli tipler: 'pg-backup' ve 'prisma-json'
    if (settings.backupType && 
        !['pg-backup', 'prisma-json'].includes(settings.backupType)) {
      settings.backupType = 'pg-backup';
    }
    
    return settings;
  } catch (error) {
    console.error('Otomatik yedekleme ayarları yüklenirken hata:', error);
    // Hata durumunda varsayılan ayarlar
    return {
      enabled: false,
      frequency: 'daily',
      time: '03:00',
      backupType: 'pg-backup',
      lastBackup: null,
      nextBackup: null,
    };
  }
}

// Otomatik yedekleme ayarlarını kaydet
export function saveAutoBackupSettings(settings: any) {
  try {
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Otomatik yedekleme ayarları kaydedilirken hata:', error);
    return false;
  }
}

// Ayarları almak için GET
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
    
    const settings = loadAutoBackupSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Otomatik yedekleme ayarları alınırken hata:', error);
    return NextResponse.json(
      { error: 'Ayarlar alınırken bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}

// Ayarları güncellemek için POST
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

    // Request body'i doğrulama
    const data = await request.json();
    
    // Zod şeması ile veri doğrulama
    const settingsSchema = z.object({
      enabled: z.boolean(),
      frequency: z.enum(['daily', 'weekly', 'monthly']),
      time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      backupType: z.enum(['pg-backup', 'prisma-json']).optional(),
      tables: z.array(z.string()).optional(),
    });
    
    try {
      settingsSchema.parse(data);
    } catch (validationError: any) {
      return NextResponse.json(
        { error: 'Geçersiz ayar verileri', details: validationError.errors },
        { status: 400 }
      );
    }
    
    // Yeni ayarları oluştur
    const backupType = data.backupType || 'pg-backup'; // Kullanıcının seçimine göre
    
    const settings = {
      enabled: data.enabled,
      frequency: data.frequency,
      time: data.time,
      backupType,
      lastBackup: null,
      nextBackup: null,
      updatedBy: user.id,
      updatedAt: new Date().toISOString(),
    };
    
    // Ayarları kaydet
    const success = saveAutoBackupSettings(settings);
    if (!success) {
      return NextResponse.json(
        { error: 'Ayarlar kaydedilirken bir hata oluştu' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Otomatik yedekleme ayarları güncellendi',
      settings,
    });
  } catch (error: any) {
    console.error('Otomatik yedekleme ayarları güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Ayarlar güncellenirken bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
} 