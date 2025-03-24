"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Departman {
  id: string;
  ad: string;
}

interface Personel {
  id: string;
  ad: string;
  telefon: string;
  aktif: boolean;
  departman: {
    id: string;
    ad: string;
  };
}

interface PersonelModalProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  personel?: Personel | null;
  departmanlar: Departman[];
}

export function PersonelModal({
  open,
  onClose,
  personel,
  departmanlar,
}: PersonelModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ad: "",
    telefon: "",
    departmanId: "",
    aktif: true,
  });

  useEffect(() => {
    if (personel) {
      setFormData({
        ad: personel.ad,
        telefon: personel.telefon,
        departmanId: personel.departman.id,
        aktif: personel.aktif,
      });
    } else {
      setFormData({
        ad: "",
        telefon: "",
        departmanId: "",
        aktif: true,
      });
    }
  }, [personel]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!formData.ad || !formData.telefon || !formData.departmanId) {
        toast.error("Lütfen tüm alanları doldurun");
        return;
      }

      const url = personel
        ? `/api/personeller/${personel.id}`
        : "/api/personeller";
      const method = personel ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ad: formData.ad.trim(),
          telefon: formData.telefon.trim(),
          departmanId: formData.departmanId,
          aktif: formData.aktif,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Bir hata oluştu");
      }

      toast.success(
        personel ? "Personel güncellendi" : "Yeni personel oluşturuldu"
      );
      onClose(true);
    } catch (error) {
      console.error("Form gönderilirken hata:", error);
      toast.error(
        error instanceof Error ? error.message : "Bir hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {personel ? "Personeli Düzenle" : "Yeni Personel"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ad">Ad Soyad</Label>
            <Input
              id="ad"
              value={formData.ad}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, ad: e.target.value }))
              }
              placeholder="Ad Soyad giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefon">Telefon</Label>
            <Input
              id="telefon"
              value={formData.telefon}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, telefon: e.target.value }))
              }
              placeholder="Telefon numarası giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="departman">Departman</Label>
            <Select
              value={formData.departmanId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, departmanId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Departman seçin" />
              </SelectTrigger>
              <SelectContent>
                {departmanlar.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.ad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="aktif">Aktif</Label>
            <Switch
              id="aktif"
              checked={formData.aktif}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, aktif: checked }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose()}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Kaydediliyor..." : personel ? "Güncelle" : "Oluştur"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 