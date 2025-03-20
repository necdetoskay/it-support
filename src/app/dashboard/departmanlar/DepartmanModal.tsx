import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Departman {
  id: string;
  ad: string;
  aciklama: string | null;
  personelSayisi: number;
  talepSayisi: number;
}

interface Props {
  acik: boolean;
  kapatModal: () => void;
  departman?: Departman;
  yenile: () => void;
}

export default function DepartmanModal({ acik, kapatModal, departman, yenile }: Props) {
  const [ad, setAd] = useState(departman?.ad || "");
  const [aciklama, setAciklama] = useState(departman?.aciklama || "");
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setYukleniyor(true);

    try {
      const yanit = await fetch(
        departman ? `/api/departments/${departman.id}` : "/api/departments",
        {
          method: departman ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ad, aciklama }),
        }
      );

      const veri = await yanit.json();

      if (!yanit.ok) {
        throw new Error(veri.error || "Bir hata oluştu");
      }

      toast.success(
        departman
          ? "Departman başarıyla güncellendi"
          : "Departman başarıyla oluşturuldu"
      );

      kapatModal();
      yenile();
    } catch (hata) {
      console.error("Form gönderilirken hata:", hata);
      toast.error(hata instanceof Error ? hata.message : "Bir hata oluştu");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <Dialog open={acik} onOpenChange={kapatModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {departman ? "Departmanı Düzenle" : "Yeni Departman"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="ad" className="text-sm font-medium">
              Departman Adı
            </label>
            <Input
              id="ad"
              value={ad}
              onChange={(e) => setAd(e.target.value)}
              required
              minLength={3}
              maxLength={50}
              pattern="^[a-zA-ZğĞüÜşŞıİöÖçÇ0-9\s-]+$"
              title="Sadece harf, rakam, boşluk ve - karakterleri kullanılabilir"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="aciklama" className="text-sm font-medium">
              Açıklama
            </label>
            <Textarea
              id="aciklama"
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={kapatModal}
              disabled={yukleniyor}
            >
              İptal
            </Button>
            <Button type="submit" disabled={yukleniyor}>
              {yukleniyor ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 