"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  personel?: {
    id: string;
    ad: string;
    telefon: string;
    aktif: boolean;
    departman: {
      id: string;
      ad: string;
    };
  };
  departmanlar: {
    id: string;
    ad: string;
  }[];
}

export function PersonelModal({ open, onClose, personel, departmanlar }: Props) {
  const [ad, setAd] = useState("");
  const [telefon, setTelefon] = useState("");
  const [departmanId, setDepartmanId] = useState("");
  const [aktif, setAktif] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ departman?: string }>({});

  useEffect(() => {
    if (personel) {
      setAd(personel.ad);
      setTelefon(personel.telefon);
      setDepartmanId(personel.departman.id);
      setAktif(personel.aktif);
      setErrors({});
    } else {
      setAd("");
      setTelefon("");
      setDepartmanId("");
      setAktif(true);
      setErrors({});
    }
  }, [personel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validasyonu
    if (!ad.trim() || ad.trim().length < 3) {
      toast.error("Ad en az 3 karakter olmalıdır");
      return;
    }

    if (!telefon.trim() || !/^\d{3,10}$/.test(telefon.trim())) {
      toast.error("Telefon numarası 3 ile 10 hane arasında olmalıdır");
      return;
    }

    if (!departmanId) {
      setErrors(prev => ({ ...prev, departman: "Lütfen bir departman seçiniz" }));
      return;
    }

    setLoading(true);
    try {
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
          ad: ad.trim(),
          telefon: telefon.trim(),
          departmanId,
          aktif,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success(
        personel
          ? "Personel başarıyla güncellendi"
          : "Personel başarıyla oluşturuldu"
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

  const handleTelefonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setTelefon(value);
  };

  const handleDepartmanChange = (value: string) => {
    setDepartmanId(value);
    setErrors(prev => ({ ...prev, departman: undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {personel ? "Personel Düzenle" : "Yeni Personel"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ad">Ad Soyad</Label>
            <Input
              id="ad"
              placeholder="Ad soyad giriniz"
              value={ad}
              onChange={(e) => setAd(e.target.value)}
              required
              minLength={3}
              maxLength={50}
              pattern="^[a-zA-ZğĞüÜşŞıİöÖçÇ\s]+$"
              title="Ad soyad sadece harflerden oluşmalıdır"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefon">Telefon</Label>
            <Input
              id="telefon"
              placeholder="XXX...XXXX"
              value={telefon}
              onChange={handleTelefonChange}
              required
              pattern="^\d{3,10}$"
              title="Telefon numarası 3 ile 10 hane arasında olmalıdır"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="departman">Departman</Label>
            <Select 
              value={departmanId} 
              onValueChange={handleDepartmanChange}
            >
              <SelectTrigger id="departman" className={errors.departman ? "border-red-500" : ""}>
                <SelectValue placeholder="Departman seçiniz" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {departmanlar.map((dept) => (
                  <SelectItem 
                    key={dept.id} 
                    value={dept.id}
                    className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                  >
                    {dept.ad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.departman && (
              <p className="text-sm text-red-500">{errors.departman}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="aktif"
              checked={aktif}
              onCheckedChange={setAktif}
            />
            <Label htmlFor="aktif">Aktif</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : (personel ? "Güncelle" : "Oluştur")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 