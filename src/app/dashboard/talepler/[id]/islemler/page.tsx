"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TalepIslemModal } from "./TalepIslemModal";
import { TalepIslemTipi, TalepDurum } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TalepIslem {
  id: string;
  tip: TalepIslemTipi;
  aciklama: string;
  durum: TalepDurum;
  olusturulmaTarihi: string;
  guncellenmeTarihi: string;
  talepId: string;
  yapanKullaniciId: string;
  yapanKullanici: {
    id: string;
    name: string;
  };
  dosyalar: { url: string }[];
}

// Sabit tanımlamaları
const ISLEM_TIPLERI = [
  { value: "INCELEME", label: "İnceleme" },
  { value: "COZUM", label: "Çözüm" },
  { value: "GUNCELLEME", label: "Güncelleme" },
  { value: "RED", label: "Red" },
  { value: "BEKLEMEDE", label: "Beklemede" },
  { value: "TAMAMLANDI", label: "Tamamlandı" }
] as const;

const DURUM_TIPLERI = [
  { value: "DEVAM_EDIYOR", label: "Devam Ediyor" },
  { value: "TAMAMLANDI", label: "Tamamlandı" },
  { value: "BEKLEMEDE", label: "Beklemede" },
  { value: "IPTAL", label: "İptal" }
] as const;

// Renk tanımlamaları
const islemTipiRenkleri: Record<TalepIslemTipi, string> = {
  INCELEME: "bg-blue-500 text-white",
  COZUM: "bg-green-500 text-white",
  GUNCELLEME: "bg-purple-500 text-white",
  RED: "bg-red-500 text-white",
  BEKLEMEDE: "bg-yellow-500 text-white",
  TAMAMLANDI: "bg-gray-500 text-white"
};

const durumRenkleri: Record<TalepDurum, string> = {
  DEVAM_EDIYOR: "bg-blue-500 text-white",
  TAMAMLANDI: "bg-green-500 text-white",
  BEKLEMEDE: "bg-yellow-500 text-white",
  IPTAL: "bg-red-500 text-white"
};

export default function TalepIslemlerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [islemler, setIslemler] = useState<TalepIslem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIslem, setSelectedIslem] = useState<TalepIslem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [kullanici, setKullanici] = useState<{ id: string; name: string } | null>(null);
  const [talepBaslik, setTalepBaslik] = useState<string>("");

  // Kullanıcı bilgisini al
  useEffect(() => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    console.log("Bulunan kullanıcı verisi:", userStr); // Debug log

    if (!userStr) {
      console.log("Kullanıcı verisi bulunamadı"); // Debug log
      return;
    }

    try {
      const user = JSON.parse(userStr);
      console.log("Parse edilen kullanıcı:", user); // Debug log
      
      if (!user || !user.id) {
        console.log("Geçersiz kullanıcı verisi"); // Debug log
        return;
      }

      setKullanici(user);
    } catch (error) {
      console.error("Kullanıcı verisi ayrıştırma hatası:", error);
    }
  }, []);

  // Talep başlığını getir
  const getTalepBaslik = async () => {
    try {
      const response = await fetch(`/api/talepler/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Talep detayı getirilirken bir hata oluştu");
      }

      setTalepBaslik(data.baslik);
    } catch (error) {
      console.error("Talep başlığı getirilirken hata:", error);
    }
  };

  // Sayfa yüklendiğinde talep başlığını getir
  useEffect(() => {
    getTalepBaslik();
  }, [params.id]);

  // Talep detayını getir
  const getTalepDetay = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/talepler/${params.id}/islemler`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Talep bulunamadı");
          router.push("/dashboard/talepler");
          return;
        }
        throw new Error(data.error || "İşlemler getirilirken bir hata oluştu");
      }

      setIslemler(data);
    } catch (error) {
      console.error("Talep detayı getirilirken hata:", error);
      toast.error("Talep detayı getirilirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde talep detayını getir
  useEffect(() => {
    getTalepDetay();
  }, [params.id]);

  // İşlem silme
  const handleDelete = async () => {
    try {
      if (!selectedIslem) return;

      const response = await fetch(`/api/talepler/${params.id}/islemler/${selectedIslem.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('İşlem silinirken bir hata oluştu');
      }

      toast.success('İşlem başarıyla silindi');
      getTalepDetay();
    } catch (error) {
      console.error('İşlem silinirken hata:', error);
      toast.error('İşlem silinirken bir hata oluştu');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedIslem(null);
    }
  };

  // İşlem düzenleme modalını aç
  const handleEdit = (islem: TalepIslem) => {
    setSelectedIslem(islem);
    setModalOpen(true);
  };

  // Boş durum bileşeni
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
      <div className="text-center space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Henüz İşlem Bulunmuyor</h3>
        <p className="text-sm text-gray-500">Bu talep için henüz hiç işlem eklenmemiş.</p>
        <Button 
          onClick={() => {
            setSelectedIslem(null);
            setModalOpen(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni İşlem Ekle
        </Button>
      </div>
    </div>
  );

  // İşlem listesi bileşeni
  const IslemListesi = () => (
    <div className="space-y-4">
      {islemler.map((islem) => (
        <div 
          key={islem.id} 
          className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow transition-all duration-200 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={cn("px-2 py-1", islemTipiRenkleri[islem.tip])}>
                {ISLEM_TIPLERI.find(t => t.value === islem.tip)?.label || islem.tip}
              </Badge>
              {islem.durum && (
                <Badge className={cn("px-2 py-1", durumRenkleri[islem.durum])}>
                  {DURUM_TIPLERI.find(d => d.value === islem.durum)?.label || islem.durum}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {new Date(islem.olusturulmaTarihi).toLocaleString()}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(islem)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedIslem(islem);
                  setDeleteDialogOpen(true);
                }}
                className="h-8 w-8 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 mt-2">{islem.aciklama}</p>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium text-gray-600">
              {islem.yapanKullanici?.name || "Bilinmeyen Kullanıcı"}
            </span>
          </div>

          {islem.dosyalar?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t">
              {islem.dosyalar.map((dosya, index) => (
                <a
                  key={index}
                  href={dosya.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors duration-150"
                >
                  <FileIcon className="w-3 h-3" />
                  {dosya.url.split('/').pop()}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-blue-200"></div>
            <p className="text-gray-500">İşlemler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Başlık ve Butonlar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/talepler/${params.id}`)}
          >
            ← Geri
          </Button>
          <h1 className="text-2xl font-bold">
            {talepBaslik || 'Yükleniyor...'}
          </h1>
        </div>
        <Button 
          onClick={() => {
            setSelectedIslem(null);
            setModalOpen(true);
          }} 
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni İşlem
        </Button>
      </div>

      {/* İçerik */}
      <div className="bg-gray-50 rounded-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : islemler.length === 0 ? <EmptyState /> : <IslemListesi />}
      </div>

      {/* İşlem Modalı */}
      <TalepIslemModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        talepId={params.id}
        kullaniciId={kullanici?.id || ""}
        islem={selectedIslem ? {
          id: selectedIslem.id,
          tip: selectedIslem.tip,
          aciklama: selectedIslem.aciklama,
          durum: selectedIslem.durum,
          dosyalar: selectedIslem.dosyalar
        } : undefined}
        onSuccess={() => {
          getTalepDetay();
          setModalOpen(false);
          setSelectedIslem(null);
        }}
      />

      {/* Silme Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İşlemi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlemi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 