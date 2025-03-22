"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DurumTipi {
  id: string;
  kod: string;
  ad: string;
  renk: string;
}

interface DurumTipiModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  durumId?: string;
  onSuccess?: () => void;
}

// Validation schema
const durumSchema = z.object({
  kod: z.string()
    .min(3, "Kod en az 3 karakter olmalıdır")
    .max(20, "Kod en fazla 20 karakter olabilir")
    .regex(/^[A-Z0-9_]+$/, "Kod sadece büyük harf, rakam ve alt çizgi içerebilir"),
  
  ad: z.string()
    .min(3, "Ad en az 3 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir"),
  
  renk: z.string()
    .regex(/^#([0-9A-F]{6})$/i, "Geçerli bir HEX renk kodu olmalıdır (örn: #FF5733)"),
});

export function DurumTipiModal({
  open,
  onOpenChange,
  durumId,
  onSuccess,
}: DurumTipiModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    kod: "",
    ad: "",
    renk: "#3b82f6", // Varsayılan mavi renk
  });
  const [errors, setErrors] = useState<{
    kod?: string;
    ad?: string;
    renk?: string;
  }>({});

  // Load durum data if editing
  useEffect(() => {
    if (durumId && open) {
      loadDurum();
    } else {
      setFormData({ kod: "", ad: "", renk: "#3b82f6" });
      setErrors({});
    }
  }, [durumId, open]);

  const loadDurum = async () => {
    try {
      const response = await fetch(`/api/durum-tipleri/${durumId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Durum tipi yüklenirken bir hata oluştu");
      }

      setFormData({
        kod: data.kod,
        ad: data.ad,
        renk: data.renk,
      });
    } catch (error) {
      console.error("Durum tipi yüklenirken hata:", error);
      toast.error("Durum tipi yüklenirken bir hata oluştu");
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form data
      durumSchema.parse(formData);

      setLoading(true);

      const url = durumId
        ? `/api/durum-tipleri/${durumId}`
        : "/api/durum-tipleri";

      const response = await fetch(url, {
        method: durumId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "İşlem sırasında bir hata oluştu");
      }

      toast.success(
        durumId
          ? "Durum tipi başarıyla güncellendi"
          : "Durum tipi başarıyla oluşturuldu"
      );

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        console.error("Form gönderilirken hata:", error);
        toast.error(
          error instanceof Error ? error.message : "Bir hata oluştu"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {durumId ? "Durum Tipi Düzenle" : "Yeni Durum Tipi"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="kod"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Durum Kodu
            </label>
            <Input
              id="kod"
              value={formData.kod}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, kod: e.target.value.toUpperCase() }))
              }
              className={errors.kod ? "border-red-500" : ""}
              disabled={loading}
              placeholder="Örn: BEKLEMEDE"
            />
            {errors.kod && (
              <p className="text-sm text-red-500">{errors.kod}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="ad"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Durum Adı
            </label>
            <Input
              id="ad"
              value={formData.ad}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, ad: e.target.value }))
              }
              className={errors.ad ? "border-red-500" : ""}
              disabled={loading}
              placeholder="Örn: Beklemede"
            />
            {errors.ad && (
              <p className="text-sm text-red-500">{errors.ad}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="renk"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Renk
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="renk"
                type="color"
                value={formData.renk}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, renk: e.target.value }))
                }
                className="w-12 h-10 p-1"
                disabled={loading}
              />
              <Input
                value={formData.renk}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, renk: e.target.value }))
                }
                placeholder="#HEX kodu"
                className={errors.renk ? "border-red-500" : ""}
                disabled={loading}
              />
            </div>
            {errors.renk && (
              <p className="text-sm text-red-500">{errors.renk}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
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