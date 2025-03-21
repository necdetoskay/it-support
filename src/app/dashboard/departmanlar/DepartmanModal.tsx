import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  departman?: {
    id: string;
    ad: string;
    aciklama?: string | null;
    personelSayisi?: number;
    talepSayisi?: number;
  };
}

interface FormErrors {
  ad?: string;
  aciklama?: string;
}

export function DepartmanModal({ open, onClose, departman }: Props) {
  const [ad, setAd] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      if (departman) {
        setAd(departman.ad);
        setAciklama(departman.aciklama || "");
      } else {
        setAd("");
        setAciklama("");
      }
      setErrors({});
    }
  }, [departman, open]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!ad.trim()) {
      newErrors.ad = "Departman adı boş olamaz";
      isValid = false;
    } else if (ad.trim().length < 3) {
      newErrors.ad = "Departman adı en az 3 karakter olmalıdır";
      isValid = false;
    } else if (ad.trim().length > 50) {
      newErrors.ad = "Departman adı en fazla 50 karakter olabilir";
      isValid = false;
    } else if (!/^[a-zA-ZğĞüÜşŞıİöÖçÇ0-9\s-]+$/.test(ad.trim())) {
      newErrors.ad = "Departman adı sadece harf, rakam, boşluk ve - içerebilir";
      isValid = false;
    }

    if (aciklama.trim().length > 200) {
      newErrors.aciklama = "Açıklama en fazla 200 karakter olabilir";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const url = departman
        ? `/api/departments/${departman.id}`
        : "/api/departments";
      const method = departman ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          ad: ad.trim(),
          aciklama: aciklama.trim() || null 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success(
        departman
          ? "Departman başarıyla güncellendi"
          : "Departman başarıyla oluşturuldu"
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

  const handleAdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAd(e.target.value);
    if (errors.ad) {
      setErrors(prev => ({ ...prev, ad: undefined }));
    }
  };

  const handleAciklamaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAciklama(e.target.value);
    if (errors.aciklama) {
      setErrors(prev => ({ ...prev, aciklama: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {departman ? "Departman Düzenle" : "Yeni Departman"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ad">Departman Adı</Label>
            <Input
              id="ad"
              placeholder="Departman adı giriniz"
              value={ad}
              onChange={handleAdChange}
              className={errors.ad ? "border-red-500" : ""}
              required
              minLength={3}
              maxLength={50}
              pattern="^[a-zA-ZğĞüÜşŞıİöÖçÇ0-9\s-]+$"
              title="Departman adı sadece harf, rakam, boşluk ve - içerebilir"
            />
            {errors.ad && (
              <p className="text-sm text-red-500">{errors.ad}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="aciklama">Açıklama</Label>
            <Textarea
              id="aciklama"
              placeholder="Departman açıklaması giriniz"
              value={aciklama}
              onChange={handleAciklamaChange}
              className={errors.aciklama ? "border-red-500" : ""}
              maxLength={200}
            />
            {errors.aciklama && (
              <p className="text-sm text-red-500">{errors.aciklama}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onClose()}
                    disabled={loading}
                  >
                    İptal
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Değişiklikleri İptal Et</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Kaydediliyor..." : (departman ? "Güncelle" : "Oluştur")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{departman ? "Departmanı Güncelle" : "Yeni Departman Oluştur"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 