"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function YeniSorunPage() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);
  const [formData, setFormData] = useState({
    baslik: "",
    aciklama: "",
    durum: "acik",
    oncelik: "normal",
    kategori: "",
    departman: "",
    atanan: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setYukleniyor(true);
      const response = await fetch("/api/sorunlar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Sorun oluşturulurken hata oluştu");
      }

      toast.success("Sorun başarıyla oluşturuldu");
      router.push("/dashboard/sorunlar");
    } catch (error) {
      console.error("Hata:", error);
      toast.error("Sorun oluşturulurken hata oluştu");
    } finally {
      setYukleniyor(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Yeni Sorun</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/sorunlar")}
        >
          İptal
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Başlık</label>
            <Input
              name="baslik"
              value={formData.baslik}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Açıklama</label>
            <Textarea
              name="aciklama"
              value={formData.aciklama}
              onChange={handleChange}
              required
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Durum</label>
              <Select
                value={formData.durum}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, durum: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acik">Açık</SelectItem>
                  <SelectItem value="beklemede">Beklemede</SelectItem>
                  <SelectItem value="cozuldu">Çözüldü</SelectItem>
                  <SelectItem value="kapandi">Kapandı</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Öncelik</label>
              <Select
                value={formData.oncelik}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, oncelik: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dusuk">Düşük</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="yuksek">Yüksek</SelectItem>
                  <SelectItem value="acil">Acil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Kategori</label>
              <Select
                value={formData.kategori}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, kategori: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="donanim">Donanım</SelectItem>
                  <SelectItem value="yazilim">Yazılım</SelectItem>
                  <SelectItem value="ag">Ağ</SelectItem>
                  <SelectItem value="diger">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Departman</label>
              <Select
                value={formData.departman}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, departman: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Departman seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="muhasebe">Muhasebe</SelectItem>
                  <SelectItem value="insanKaynaklari">İnsan Kaynakları</SelectItem>
                  <SelectItem value="satis">Satış</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Atanan</label>
              <Select
                value={formData.atanan}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, atanan: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kişi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ahmet">Ahmet Yılmaz</SelectItem>
                  <SelectItem value="mehmet">Mehmet Demir</SelectItem>
                  <SelectItem value="ayse">Ayşe Kaya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/sorunlar")}
          >
            İptal
          </Button>
          <Button type="submit" disabled={yukleniyor}>
            {yukleniyor ? "Oluşturuluyor..." : "Oluştur"}
          </Button>
        </div>
      </form>
    </div>
  );
} 