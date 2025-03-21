import { config } from '@/app/api/_lib/upload.server';

type AllowedMimeType = string;

// Dosya tipi kontrolü
export function isAllowedFileType(file: File): boolean {
  const allowedTypes: AllowedMimeType[] = [
    ...config.ALLOWED_IMAGE_TYPES,
    ...config.ALLOWED_VIDEO_TYPES
  ];
  return allowedTypes.includes(file.type);
}

// Dosya boyutu kontrolü
export function isAllowedFileSize(file: File): boolean {
  return file.size <= config.MAX_FILE_SIZE;
}

// Dosya validasyonu
export function validateFiles(files: File[]): { 
  isValid: boolean; 
  error?: string;
} {
  if (files.length > config.MAX_FILES_PER_UPLOAD) {
    return {
      isValid: false,
      error: `En fazla ${config.MAX_FILES_PER_UPLOAD} dosya yükleyebilirsiniz.`
    };
  }

  for (const file of files) {
    if (!isAllowedFileType(file)) {
      return {
        isValid: false,
        error: 'Sadece resim (JPEG, PNG, GIF, WEBP) ve video (MP4) dosyaları yükleyebilirsiniz.'
      };
    }

    if (!isAllowedFileSize(file)) {
      return {
        isValid: false,
        error: `Dosya boyutu ${config.MAX_FILE_SIZE / (1024 * 1024)}MB'dan küçük olmalıdır.`
      };
    }
  }

  return { isValid: true };
}

export function generateUniqueFileName(originalName: string) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
} 