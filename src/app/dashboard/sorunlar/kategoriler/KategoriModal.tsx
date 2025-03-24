"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Kategori {
  id: string;
  ad: string;
  aciklama: string | null;
}

interface KategoriModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kategoriId?: string;
  onSuccess?: () => void;
}

// Validation schema
const kategoriSchema = z.object({
  ad: z.string()
    .min(3, "Ad en az 3 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğĞüÜşŞıİöÖçÇ0-9\s-]+$/, "Sadece harf, rakam, boşluk ve - içerebilir"),
  
  aciklama: z.string()
    .max(200, "Açıklama en fazla 200 karakter olabilir")
    .optional()
    .nullable(),
});

export function KategoriModal({
  open,
  onOpenChange,
  kategoriId,
  onSuccess,
}: KategoriModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ad: "",
    aciklama: "",
  });
  const [errors, setErrors] = useState<{
    ad?: string;
    aciklama?: string;
  }>({});

  // Load kategori data if editing
  useEffect(() => {
    if (kategoriId && open) {
      loadKategori();
    } else {
      setFormData({ ad: "", aciklama: "" });
      setErrors({});
    }
  }, [kategoriId, open]);

  const loadKategori = async () => {
    try {
      const response = await fetch(`/api/sorunlar/kategoriler/${kategoriId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kategori yüklenirken bir hata oluştu");
      }

      setFormData({
        ad: data.ad,
        aciklama: data.aciklama || "",
      });
    } catch (error) {
      console.error("Kategori yüklenirken hata:", error);
      toast.error("Kategori yüklenirken bir hata oluştu");
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form data
      kategoriSchema.parse(formData);

      setLoading(true);

      const url = kategoriId
        ? `/api/sorunlar/kategoriler/${kategoriId}`
        : "/api/sorunlar/kategoriler";

      const response = await fetch(url, {
        method: kategoriId ? "PUT" : "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "İşlem sırasında bir hata oluştu");
      }

      toast.success(
        kategoriId
          ? "Kategori başarıyla güncellendi"
          : "Kategori başarıyla oluşturuldu"
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
            {kategoriId ? "Sorun Kategorisi Düzenle" : "Yeni Sorun Kategorisi"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="ad"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Kategori Adı
            </label>
            <Input
              id="ad"
              value={formData.ad}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, ad: e.target.value }))
              }
              className={errors.ad ? "border-red-500" : ""}
              disabled={loading}
            />
            {errors.ad && (
              <p className="text-sm text-red-500">{errors.ad}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="aciklama"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Açıklama
            </label>
            <Textarea
              id="aciklama"
              value={formData.aciklama}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, aciklama: e.target.value }))
              }
              className={errors.aciklama ? "border-red-500" : ""}
              disabled={loading}
            />
            {errors.aciklama && (
              <p className="text-sm text-red-500">{errors.aciklama}</p>
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