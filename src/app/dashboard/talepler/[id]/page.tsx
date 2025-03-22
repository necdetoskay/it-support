"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import TalepDuzenleModal from "./TalepDuzenleModal";
import { FileIcon, Edit, Trash2, Plus, Eye, Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

interface Talep {
  id: string;
  baslik: string;
  aciklama: string;
  sorunDetay: string;
  departman: Departman;
  kategori: Kategori;
  raporEden: Personel;
  atanan: User | null;
  oncelik: "DUSUK" | "ORTA" | "YUKSEK" | "ACIL";
  durum: "ACIK" | "ISLEMDE" | "KULLANICI_BEKLIYOR";
  sonTarih: string | null;
  olusturulmaTarihi: string;
  guncellenmeTarihi: string;
  kapatilmaTarihi: string | null;
  cozum: string | null;
}

// Durum renkleri
const durumRenkleri: Record<string, string> = {
  DEVAM_EDIYOR: "bg-blue-500",
  TAMAMLANDI: "bg-green-500",
  BEKLEMEDE: "bg-yellow-500",
  IPTAL: "bg-red-500",
  // Eski durum tipleri için uyumluluk
  ACIK: "bg-blue-500",
  ISLEMDE: "bg-yellow-500",
  KULLANICI_BEKLIYOR: "bg-green-500",
};

// Öncelik renkleri
const oncelikRenkleri = {
  DUSUK: "bg-gray-500",
  ORTA: "bg-blue-500",
  YUKSEK: "bg-yellow-500",
  ACIL: "bg-red-500",
} as const;

export default function TalepDetayPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [talep, setTalep] = useState<Talep | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Talep detayını getir
  const getTalepDetay = async () => {
    try {
      setLoading(true);
      console.log(`⭐️ Talep detay API çağrısı: /api/talepler/${params.id}`);
      
      const response = await fetch(`/api/talepler/${params.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        cache: 'no-store'
      });
      
      console.log(`⭐️ Talep API yanıt durumu: ${response.status}`);
      
      // API yanıt verilerini al, hata olsa bile
      const responseText = await response.text();
      
      // Geçerli JSON mu?
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("⭐️ Talep API yanıt veri:", data);
      } catch (jsonError) {
        console.error("⭐️ JSON parse hatası:", jsonError);
        throw new Error(`API geçersiz JSON döndürdü: ${responseText}`);
      }
      
      if (!response.ok) {
        throw new Error(data.error || `Hata kodu: ${response.status}. Talep detayı getirilirken bir hata oluştu`);
      }

      setTalep(data);
    } catch (error) {
      console.error("⭐️ Talep detayı getirilirken hata:", error);
      toast.error("Talep detayı getirilirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde talep detayını getir
  useEffect(() => {
    getTalepDetay();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  if (!talep) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Talep bulunamadı</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-6 space-y-6">
        {/* Üst Bilgi */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/talepler")}
              >
                ← Geri
              </Button>
              <h2 className="text-lg font-semibold text-gray-500">TAL-{talep.id}</h2>
            </div>
            <h1 className="text-3xl font-bold">{talep.baslik}</h1>
            <div className="flex items-center gap-3">
              <Badge className={durumRenkleri[talep.durum]}>
                {talep.durum}
              </Badge>
              <Badge className={oncelikRenkleri[talep.oncelik]}>
                {talep.oncelik}
              </Badge>
              <span className="text-sm text-gray-500">
                Oluşturulma: {formatDate(talep.olusturulmaTarihi)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={() => setEditModalOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Talebi Düzenle</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Talebi Sil</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Talep Bilgileri */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Panel - Temel Bilgiler */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Talep Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Temel Bilgiler ve Atama Bilgileri Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Temel Bilgiler */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Temel Bilgiler</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Departman</span>
                      <p>{talep.departman.ad}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Kategori</span>
                      <p>{talep.kategori.ad}</p>
                    </div>
                    {talep.sonTarih && (
                      <div>
                        <span className="text-sm text-gray-500">Son Tarih</span>
                        <p>{formatDate(talep.sonTarih)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Atama Bilgileri */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Atama Bilgileri</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Rapor Eden</span>
                      <p>{talep.raporEden.ad}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Atanan</span>
                      <p>{talep.atanan?.name || "-"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Son Güncelleme</span>
                      <p>{formatDate(talep.guncellenmeTarihi)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Açıklama */}
              <div className="space-y-2">
                <h3 className="font-semibold">Açıklama</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{talep.aciklama}</p>
              </div>

              {/* Sorun Detayı */}
              <div className="space-y-2">
                <h3 className="font-semibold">Sorun Detayı</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{talep.sorunDetay}</p>
              </div>

              {/* Çözüm */}
              {talep.cozum && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Çözüm</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{talep.cozum}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sağ Panel - Ekler ve Hızlı İşlemler */}
          <div className="space-y-6">
            {/* Ekler */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">Ekler</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ekle
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg group">
                    <div className="flex items-center gap-2">
                      <FileIcon className="h-4 w-4 text-blue-500" />
                      <span>ornek-dosya.pdf</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hızlı İşlemler */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni İşlem Ekle
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Rapor İndir
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* İşlem Geçmişi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>İşlem Geçmişi</CardTitle>
            <Button onClick={() => router.push(`/dashboard/talepler/${params.id}/islemler`)}>
              Tüm İşlemleri Görüntüle
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Örnek İşlem Kaydı */}
              <div className="border-l-2 border-blue-500 pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Durum Değişikliği</Badge>
                    <span className="text-sm text-gray-500">13.03.2024 14:30</span>
                  </div>
                  <span className="text-sm font-medium">Mehmet Öz</span>
                </div>
                <p className="text-gray-700">
                  Durum güncellendi: Açık → İşlemde
                </p>
                <p className="text-gray-600">
                  Yazıcı incelemeye alındı. Parça değişimi gerekebilir.
                </p>
              </div>

              <div className="border-l-2 border-gray-500 pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Atama</Badge>
                    <span className="text-sm text-gray-500">12.03.2024 16:45</span>
                  </div>
                  <span className="text-sm font-medium">Sistem</span>
                </div>
                <p className="text-gray-700">
                  Talep atandı: Mehmet Öz
                </p>
              </div>

              <div className="border-l-2 border-green-500 pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Oluşturma</Badge>
                    <span className="text-sm text-gray-500">12.03.2024 15:30</span>
                  </div>
                  <span className="text-sm font-medium">Ahmet Yılmaz</span>
                </div>
                <p className="text-gray-700">
                  Talep oluşturuldu
                </p>
                <div className="flex items-center gap-2">
                  <FileIcon className="h-4 w-4" />
                  <span className="text-sm text-gray-600">2 adet dosya eklendi</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Düzenleme modalı */}
        <TalepDuzenleModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          talepId={params.id}
        />
      </div>
    </TooltipProvider>
  );
} 