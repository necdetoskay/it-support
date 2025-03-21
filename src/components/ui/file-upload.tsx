'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileIcon, ImageIcon, VideoIcon, X, Upload, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface FileUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxFiles?: number;
  onFilesSelected?: (files: File[]) => void;
  existingFiles?: { url: string; type: string }[];
}

interface LocalFile {
  file: File;
  preview: string;
}

export function FileUpload({ 
  value = [], 
  onChange, 
  maxFiles = 5,
  onFilesSelected,
  existingFiles = []
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileChange = async (files: FileList | null) => {
    if (!files?.length) return;

    const fileArray = Array.from(files);
    if (localFiles.length + fileArray.length > maxFiles) {
      setError(`En fazla ${maxFiles} dosya ekleyebilirsiniz`);
      return;
    }

    // Dosya tipi ve boyut kontrolü
    const invalidFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'video/mp4';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return !isValidType || !isValidSize;
    });

    if (invalidFiles.length > 0) {
      setError('Geçersiz dosya formatı veya boyutu. Sadece 10MB\'dan küçük JPEG, PNG, GIF, WEBP ve MP4 dosyaları ekleyebilirsiniz.');
      return;
    }

    // Dosyaları önizleme için hazırla
    const newLocalFiles = await Promise.all(
      fileArray.map(async (file) => ({
        file,
        preview: URL.createObjectURL(file)
      }))
    );

    setLocalFiles(prev => [...prev, ...newLocalFiles]);
    setError(null);

    if (onFilesSelected) {
      onFilesSelected(fileArray);
    }
  };

  const removeLocalFile = (index: number) => {
    setLocalFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
    setError(null);
  };

  const removeExistingFile = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    if (fileType.startsWith('video/')) {
      return <VideoIcon className="w-4 h-4" />;
    }
    return <FileIcon className="w-4 h-4" />;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handlePreview = (url: string) => {
    setPreviewImage(url);
  };

  return (
    <div className="space-y-4">
      {/* Mevcut Dosyalar */}
      {existingFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {existingFiles.map((file, index) => (
            <div
              key={`existing-${index}`}
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              {file.type.startsWith('image/') ? (
                <Image
                  src={file.url}
                  alt="Preview"
                  fill
                  className="object-cover cursor-pointer"
                  onClick={() => handlePreview(file.url)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  {getFileIcon(file.type)}
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => removeExistingFile(index)}
                  className="p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
                {file.type.startsWith('image/') && (
                  <button
                    type="button"
                    onClick={() => handlePreview(file.url)}
                    className="p-1 bg-blue-500 text-white rounded-full ml-2"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Yeni Seçilen Dosyalar */}
      {localFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {localFiles.map((file, index) => (
            <div
              key={`local-${index}`}
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              {file.file.type.startsWith('image/') ? (
                <Image
                  src={file.preview}
                  alt="Preview"
                  fill
                  className="object-cover cursor-pointer"
                  onClick={() => handlePreview(file.preview)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  {getFileIcon(file.file.type)}
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => removeLocalFile(index)}
                  className="p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
                {file.file.type.startsWith('image/') && (
                  <button
                    type="button"
                    onClick={() => handlePreview(file.preview)}
                    className="p-1 bg-blue-500 text-white rounded-full ml-2"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dosya Yükleme Alanı */}
      {(localFiles.length + (existingFiles?.length || 0)) < maxFiles && (
        <div
          className={cn(
            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors",
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
            "cursor-pointer"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 mb-2 text-gray-500" />
          <p className="text-sm text-gray-600">
            Dosyaları sürükleyip bırakın veya seçmek için tıklayın
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Desteklenen formatlar: JPEG, PNG, GIF, WEBP, MP4
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files)}
        accept="image/*,video/mp4"
        multiple
      />

      {/* Resim Önizleme Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0">
          {previewImage && (
            <div className="relative w-full aspect-auto">
              <Image
                src={previewImage}
                alt="Preview"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 