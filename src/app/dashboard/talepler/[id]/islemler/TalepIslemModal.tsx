"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { TalepIslemTipi, TalepDurum } from "@prisma/client";
import { ITDropdown } from "@/components/ui/it-dropdown";
import { FileUpload } from "@/components/ui/file-upload";

interface TalepIslemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  talepId: string;
  kullaniciId: string;
  islem?: {
    id: string;
    tip: TalepIslemTipi;
    aciklama: string;
    durum: TalepDurum;
    dosyalar: { url: string }[];
  };
}

export function TalepIslemModal({
  open,
  onOpenChange,
  onSuccess,
  talepId,
  kullaniciId,
  islem,
}: TalepIslemModalProps) {
  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState<TalepIslemTipi>(islem?.tip || "INCELEME");
  const [aciklama, setAciklama] = useState(islem?.aciklama || "");
  const [durum, setDurum] = useState<TalepDurum>(islem?.durum || "DEVAM_EDIYOR");
  const [dosyaUrls, setDosyaUrls] = useState<string[]>(
    islem?.dosyalar?.map((d) => d.url) || []
  );
  const [localFiles, setLocalFiles] = useState<File[]>([]);

  const islemTipleri = [
    { value: "INCELEME", label: "İnceleme" },
    { value: "COZUM", label: "Çözüm" },
    { value: "GUNCELLEME", label: "Güncelleme" },
    { value: "RED", label: "Red" },
    { value: "BEKLEMEDE", label: "Beklemede" },
    { value: "TAMAMLANDI", label: "Tamamlandı" }
  ] as const;

  const durumTipleri = [
    { value: "DEVAM_EDIYOR", label: "Devam Ediyor" },
    { value: "TAMAMLANDI", label: "Tamamlandı" },
    { value: "BEKLEMEDE", label: "Beklemede" },
    { value: "IPTAL", label: "İptal" }
  ] as const;

  useEffect(() => {
    if (islem) {
      setTip(islem.tip);
      setAciklama(islem.aciklama);
      setDurum(islem.durum);
      setDosyaUrls(islem.dosyalar?.map((d) => d.url) || []);
      setLocalFiles([]);
    } else {
      setTip("INCELEME");
      setAciklama("");
      setDurum("DEVAM_EDIYOR");
      setDosyaUrls([]);
      setLocalFiles([]);
    }
  }, [islem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Önce yeni dosyaları yükle
      const uploadPromises = localFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Dosya yüklenirken bir hata oluştu');
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const allDosyaUrls = [...dosyaUrls, ...uploadedUrls];

      // İşlemi kaydet
      const response = await fetch(
        `/api/talepler/${talepId}/islemler${islem ? `/${islem.id}` : ''}`,
        {
          method: islem ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tip,
            aciklama,
            durum,
            dosyaUrls: allDosyaUrls,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('İşlem kaydedilirken bir hata oluştu');
      }

      toast.success(
        islem ? 'İşlem güncellendi' : 'İşlem kaydedildi'
      );
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('İşlem kaydetme hatası:', error);
      toast.error(error instanceof Error ? error.message : 'İşlem kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {islem ? 'İşlemi Düzenle' : 'Yeni İşlem'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tip">İşlem Tipi</Label>
            <ITDropdown
              items={islemTipleri}
              value={tip}
              onChange={(value) => setTip(value as TalepIslemTipi)}
              placeholder="İşlem tipi seçin"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="durum">Durum</Label>
            <ITDropdown
              items={durumTipleri}
              value={durum}
              onChange={(value) => setDurum(value as TalepDurum)}
              placeholder="Durum seçin"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aciklama">Açıklama</Label>
            <Textarea
              id="aciklama"
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Dosyalar</Label>
            <FileUpload
              value={dosyaUrls}
              onChange={setDosyaUrls}
              maxFiles={5}
              onFilesSelected={(files) => setLocalFiles(prev => [...prev, ...files])}
              existingFiles={islem?.dosyalar?.map(d => ({
                url: d.url,
                type: d.url.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'image/jpeg'
              })) || []}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Kaydediliyor...' : islem ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 