"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Talep {
  id: string;
  baslik: string;
  sorunDetay: string;
  departman: Departman;
  departmanId: string;
  kategori: Kategori;
  kategoriId: string;
  raporEden: Personel;
  raporEdenId: string;
  atanan: User | null;
  atananId: string | null;
  oncelik: "DUSUK" | "ORTA" | "YUKSEK" | "ACIL";
  durum: "DEVAM_EDIYOR" | "TAMAMLANDI" | "BEKLEMEDE" | "IPTAL";
  sonTarih: string | null;
  olusturulmaTarihi: string;
  guncellenmeTarihi: string;
  kapatilmaTarihi: string | null;
}

interface TalepDuzenleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  talepId: string;
}

export default function TalepDuzenleModal({ open, onOpenChange, talepId }: TalepDuzenleModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [talep, setTalep] = useState<Talep | null>(null);
  const [departmanlar, setDepartmanlar] = useState<Departman[]>([]);
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [personeller, setPersoneller] = useState<Personel[]>([]);
  const [kullanicilar, setKullanicilar] = useState<User[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    baslik: "",
    sorunDetay: "",
    departmanId: "",
    kategoriId: "",
    raporEdenId: "",
    atananId: "",
    oncelik: "",
    durum: "",
  });

  // Talep detayını getir
  const getTalepDetay = async () => {
    try {
      const response = await fetch(`/api/talepler/${talepId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Talep detayı getirilirken bir hata oluştu");
      }

      console.log("Gelen talep verisi:", data); // Debug için

      setTalep(data);
      setFormData({
        baslik: data.baslik || "",
        sorunDetay: data.sorunDetay || "",
        departmanId: data.departman?.id || "",
        kategoriId: data.kategori?.id || "",
        raporEdenId: data.raporEden?.id || "",
        atananId: data.atanan?.id || "",
        oncelik: data.oncelik || "ORTA",
        durum: data.durum || "DEVAM_EDIYOR",
      });
    } catch (error) {
      console.error("Talep detayı getirilirken hata:", error);
      toast.error("Talep detayı getirilirken bir hata oluştu");
    }
  };

  // Departmanları getir
  const getDepartmanlar = async () => {
    try {
      const response = await fetch("/api/departments");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Departmanlar getirilirken bir hata oluştu");
      }

      setDepartmanlar(data.departments);
    } catch (error) {
      console.error("Departmanlar getirilirken hata:", error);
      toast.error("Departmanlar getirilirken bir hata oluştu");
    }
  };

  // Kategorileri getir
  const getKategoriler = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kategoriler getirilirken bir hata oluştu");
      }

      setKategoriler(data);
    } catch (error) {
      console.error("Kategoriler getirilirken hata:", error);
      toast.error("Kategoriler getirilirken bir hata oluştu");
    }
  };

  // Personelleri getir
  const getPersoneller = async () => {
    try {
      const response = await fetch("/api/personeller");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Personeller getirilirken bir hata oluştu");
      }

      setPersoneller(data);
    } catch (error) {
      console.error("Personeller getirilirken hata:", error);
      toast.error("Personeller getirilirken bir hata oluştu");
    }
  };

  // Kullanıcıları getir
  const getKullanicilar = async () => {
    try {
      const response = await fetch("/api/kullanicilar");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kullanıcılar getirilirken bir hata oluştu");
      }

      setKullanicilar(data.users);
    } catch (error) {
      console.error("Kullanıcılar getirilirken hata:", error);
      toast.error("Kullanıcılar getirilirken bir hata oluştu");
    }
  };

  // Modal açıldığında verileri getir
  useEffect(() => {
    const fetchData = async () => {
      if (open) {
        setLoading(true);
        try {
          await Promise.all([
            getTalepDetay(),
            getDepartmanlar(),
            getKategoriler(),
            getPersoneller(),
            getKullanicilar(),
          ]);
        } catch (error) {
          console.error("Veriler getirilirken hata:", error);
          toast.error("Veriler getirilirken bir hata oluştu");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [open, talepId]);

  // Form değişikliklerini handle et
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Select değişikliklerini handle et
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Formu gönder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      const response = await fetch(`/api/talepler/${talepId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Talep güncellenirken bir hata oluştu");
      }

      toast.success("Talep başarıyla güncellendi");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Talep güncellenirken hata:", error);
      toast.error("Talep güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Talep #{talepId} Düzenle</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-4">Yükleniyor...</div>
        ) : !talep ? (
          <div className="text-center py-4">Talep bulunamadı</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Başlık</label>
                  <Input
                    name="baslik"
                    value={formData.baslik}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Sorun Detayı</label>
                  <Textarea
                    name="sorunDetay"
                    value={formData.sorunDetay}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Departman</label>
                  <Select
                    value={formData.departmanId}
                    onValueChange={(value) => handleSelectChange("departmanId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Departman seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmanlar.map((departman) => (
                        <SelectItem key={departman.id} value={departman.id}>
                          {departman.ad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Kategori</label>
                  <Select
                    value={formData.kategoriId}
                    onValueChange={(value) => handleSelectChange("kategoriId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {kategoriler.map((kategori) => (
                        <SelectItem key={kategori.id} value={kategori.id}>
                          {kategori.ad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Rapor Eden</label>
                  <Select
                    value={formData.raporEdenId}
                    onValueChange={(value) => handleSelectChange("raporEdenId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Rapor eden kişiyi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {personeller.map((personel) => (
                        <SelectItem key={personel.id} value={personel.id}>
                          {personel.ad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Atanan Kişi</label>
                  <Select
                    value={formData.atananId}
                    onValueChange={(value) => handleSelectChange("atananId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Atanan kişiyi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="empty" value=" ">Seçilmedi</SelectItem>
                      {kullanicilar.map((kullanici) => (
                        <SelectItem key={kullanici.id} value={kullanici.id}>
                          {kullanici.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Öncelik</label>
                  <Select
                    value={formData.oncelik}
                    onValueChange={(value) => handleSelectChange("oncelik", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Öncelik seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DUSUK">Düşük</SelectItem>
                      <SelectItem value="ORTA">Orta</SelectItem>
                      <SelectItem value="YUKSEK">Yüksek</SelectItem>
                      <SelectItem value="ACIL">Acil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Durum</label>
                  <Select
                    value={formData.durum}
                    onValueChange={(value) => handleSelectChange("durum", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEVAM_EDIYOR">Devam Ediyor</SelectItem>
                      <SelectItem value="TAMAMLANDI">Tamamlandı</SelectItem>
                      <SelectItem value="BEKLEMEDE">Beklemede</SelectItem>
                      <SelectItem value="IPTAL">İptal Edildi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 