"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ITDropdown } from "@/components/ui/it-dropdown";
import { Label } from "@/components/ui/label";

// Tip tanımlamaları
interface Departman {
  id: string;
  ad: string;
}

interface Kategori {
  id: string;
  ad: string;
}

interface Personel {
  id: string;
  ad: string;
  departmanId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmanlar: Departman[];
  kategoriler: Kategori[];
  personeller: Personel[];
  kullanicilar: User[];
  onSuccess: () => void;
}

export function TalepModal({
  open,
  onOpenChange,
  departmanlar,
  kategoriler,
  personeller,
  kullanicilar,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    departmanId?: string;
    kategoriId?: string;
    raporEdenId?: string;
    baslik?: string;
    sorunDetay?: string;
  }>({});
  const [formData, setFormData] = useState({
    baslik: "",
    sorunDetay: "",
    departmanId: "",
    kategoriId: "",
    raporEdenId: "",
    atananId: "",
    oncelik: "ORTA",
    durum: "DEVAM_EDIYOR",
  });

  // Seçili departmana göre personelleri filtrele
  const filteredPersoneller = personeller.filter(
    (p) => formData.departmanId && p.departmanId === formData.departmanId
  );

  // Form verilerini temizle
  const resetForm = () => {
    setFormData({
      baslik: "",
      sorunDetay: "",
      departmanId: "",
      kategoriId: "",
      raporEdenId: "",
      atananId: "",
      oncelik: "ORTA",
      durum: "DEVAM_EDIYOR",
    });
    setErrors({});
  };

  // Departman değiştiğinde rapor eden personeli sıfırla
  const handleDepartmanChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      departmanId: value,
      raporEdenId: "" // Departman değişince personeli sıfırla
    }));
  };

  // Form validasyonu
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.departmanId) {
      newErrors.departmanId = "Departman seçimi zorunludur";
    }
    if (!formData.kategoriId) {
      newErrors.kategoriId = "Kategori seçimi zorunludur";
    }
    if (!formData.raporEdenId) {
      newErrors.raporEdenId = "Rapor eden personel seçimi zorunludur";
    }
    if (!formData.baslik.trim()) {
      newErrors.baslik = "Başlık alanı zorunludur";
    }
    if (!formData.sorunDetay.trim()) {
      newErrors.sorunDetay = "Sorun detayı alanı zorunludur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validasyonu
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/talepler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Talep oluşturulurken bir hata oluştu");
      }

      toast.success("Talep başarıyla oluşturuldu");
      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Talep oluşturulurken hata:", error);
      toast.error(error instanceof Error ? error.message : "Talep oluşturulurken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-6">
        <DialogHeader>
          <DialogTitle>Yeni Talep</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Üst Kısım - Dropdownlar */}
          <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
            {/* Birinci Satır - Departman, Kategori, Öncelik */}
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Departman</Label>
                <ITDropdown
                  value={formData.departmanId}
                  onChange={handleDepartmanChange}
                  placeholder="Departman seçin"
                  items={departmanlar.map((d) => ({ value: d.id, label: d.ad }))}
                  className="w-full"
                  error={!!errors.departmanId}
                />
                {errors.departmanId && (
                  <p className="text-sm text-red-500">{errors.departmanId}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Kategori</Label>
                <ITDropdown
                  value={formData.kategoriId}
                  onChange={(value: string) => handleSelectChange("kategoriId", value)}
                  placeholder="Kategori seçin"
                  items={kategoriler.map((k) => ({ value: k.id, label: k.ad }))}
                  className="w-full"
                  error={!!errors.kategoriId}
                />
                {errors.kategoriId && (
                  <p className="text-sm text-red-500">{errors.kategoriId}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium">Öncelik</Label>
                <ITDropdown
                  value={formData.oncelik}
                  onChange={(value: string) => handleSelectChange("oncelik", value)}
                  placeholder="Öncelik seçin"
                  items={[
                    { value: "DUSUK", label: "Düşük" },
                    { value: "ORTA", label: "Orta" },
                    { value: "YUKSEK", label: "Yüksek" },
                    { value: "ACIL", label: "Acil" },
                  ]}
                  className="w-full"
                />
              </div>
            </div>

            {/* İkinci Satır - Rapor Eden, Atanan */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rapor Eden</Label>
                <ITDropdown
                  value={formData.raporEdenId}
                  onChange={(value: string) => handleSelectChange("raporEdenId", value)}
                  placeholder="Personel seçin"
                  items={filteredPersoneller.map((p) => ({ value: p.id, label: p.ad }))}
                  disabled={!formData.departmanId}
                  className="w-full"
                  error={!!errors.raporEdenId}
                />
                {errors.raporEdenId && (
                  <p className="text-sm text-red-500">{errors.raporEdenId}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium">Atanan Kişi</Label>
                <ITDropdown
                  value={formData.atananId}
                  onChange={(value: string) => handleSelectChange("atananId", value)}
                  placeholder="Kullanıcı seçin"
                  items={kullanicilar.map((u) => ({ value: u.id, label: u.name }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Alt Kısım - Text Alanları */}
          <div className="space-y-6">
            {/* Başlık */}
            <div className="space-y-2">
              <Label className="text-sm font-medium" htmlFor="baslik">Başlık</Label>
              <Input
                id="baslik"
                placeholder="Talep başlığı giriniz"
                value={formData.baslik}
                onChange={handleChange}
                name="baslik"
                className={`w-full ${errors.baslik ? 'border-red-500' : ''}`}
              />
              {errors.baslik && (
                <p className="text-sm text-red-500">{errors.baslik}</p>
              )}
            </div>

            {/* Sorun Detayı */}
            <div className="space-y-2">
              <Label className="text-sm font-medium" htmlFor="sorunDetay">Sorun Detayı</Label>
              <Textarea
                id="sorunDetay"
                placeholder="Detaylı açıklama giriniz"
                value={formData.sorunDetay}
                onChange={handleChange}
                name="sorunDetay"
                rows={4}
                className={`w-full resize-none ${errors.sorunDetay ? 'border-red-500' : ''}`}
              />
              {errors.sorunDetay && (
                <p className="text-sm text-red-500">{errors.sorunDetay}</p>
              )}
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 