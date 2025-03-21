'use server';

import fs from 'node:fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Dosya tipi kontrolleri için sabitler
export const config = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_UPLOAD: 5,
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  ALLOWED_VIDEO_TYPES: [
    'video/mp4',
  ],
};

// Dosya adı oluşturma
export async function generateFileName(originalName: string): Promise<string> {
  const ext = path.extname(originalName);
  return `${uuidv4()}${ext}`;
}

// Dosya kaydetme
export async function saveFile(file: Buffer, originalName: string): Promise<string> {
  const fileName = await generateFileName(originalName);
  const filePath = path.join(process.cwd(), 'public', 'uploads', 'talep-islemler', fileName);
  
  // Dizinin var olduğundan emin ol
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, file, (err) => {
      if (err) reject(err);
      resolve(`/uploads/talep-islemler/${fileName}`);
    });
  });
} 