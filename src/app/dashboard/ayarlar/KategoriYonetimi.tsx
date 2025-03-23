"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import DataTableTemplate from "@/components/templates/DataTableTemplate";
import { KategoriModalYeni } from "./KategoriModalYeni";

// Özel bir formatlayıcı yardımcı fonksiyon oluşturuyorum
const formatTalepSayisi = (count: any): string => {
  if (!count) return "0";
  if (typeof count.talepler === "number") return count.talepler.toString();
  return String(count || "0");
};

interface Kategori {
  id: string;
  ad: string;
  aciklama: string | null;
  _count: {
    talepler: number;
  };
  // Görüntüleme için formatlı talep sayısı ekledim
  formattedTalepSayisi?: string;
}

export function KategoriYonetimi() {
  const [loading, setLoading] = useState(true);
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [sayfalama, setSayfalama] = useState({
    toplamKayit: 0,
    toplamSayfa: 0,
    mevcutSayfa: 1,
    limit: 10,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKategoriId, setSelectedKategoriId] = useState<string>();
  const [hata, setHata] = useState<string | null>(null);

  // Kategorileri getir
  const getKategoriler = async (search?: string, page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setHata(null);
      
      let url = "/api/kategoriler";
      const params = [];

      // API parametrelerini düzeltme
      if (search) params.push(`arama=${encodeURIComponent(search)}`);
      if (page > 1) params.push(`sayfa=${page}`);
      if (limit !== 10) params.push(`limit=${limit}`);

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      console.log("Kategori API isteği:", url);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API yanıt hatası:", errorData);
        throw new Error(errorData.hata || "Kategoriler getirilirken bir hata oluştu");
      }

      const data = await response.json();
      console.log("Kategori API yanıtı:", data);

      // API yanıt yapısını kontrol et
      if (!data) {
        throw new Error("API'den veri alınamadı");
      }

      // Verilerin doğru formatta olup olmadığını kontrol et
      let formattedData: Kategori[] = [];
      let paginationData = {
        toplamKayit: 0,
        toplamSayfa: 0,
        mevcutSayfa: 1,
        limit: 10,
      };

      // API yanıt yapısına göre verileri formatlama
      if (Array.isArray(data)) {
        // Direkt dizi döndüyse (withoutPagination=true durumu)
        console.log("Diziye dönüştürülmüş veri:", data);
        formattedData = data.map((k: Kategori) => ({
          ...k,
          formattedTalepSayisi: formatTalepSayisi(k._count)
        }));
        
        paginationData = {
          toplamKayit: data.length,
          toplamSayfa: 1,
          mevcutSayfa: 1,
          limit: data.length
        };
      } else if (data.veriler && Array.isArray(data.veriler)) {
        // Sayfalama ile dizi döndüyse
        console.log("Sayfalama ve veri:", data.veriler, data.sayfalama);
        formattedData = data.veriler.map((k: Kategori) => ({
          ...k,
          formattedTalepSayisi: formatTalepSayisi(k._count)
        }));
        
        if (data.sayfalama) {
          paginationData = {
            toplamKayit: data.sayfalama.toplamVeri || 0,
            toplamSayfa: data.sayfalama.toplamSayfa || 0, 
            mevcutSayfa: data.sayfalama.simdikiSayfa || 1,
            limit: data.sayfalama.limit || 10,
          };
        }
      } else {
        console.error("Beklenmeyen API yanıt formatı:", data);
        throw new Error("Beklenmeyen API yanıt formatı");
      }

      setKategoriler(formattedData);
      setSayfalama(paginationData);
    } catch (error) {
      console.error("Kategoriler getirilirken hata:", error);
      const errorMessage = error instanceof Error ? error.message : "Kategoriler getirilirken bir hata oluştu";
      toast.error(errorMessage);
      setHata(errorMessage);
      setKategoriler([]);
      // Hata durumunda sayfalama bilgilerini sıfırla
      setSayfalama({
        toplamKayit: 0,
        toplamSayfa: 0,
        mevcutSayfa: 1,
        limit: 10,
      });
    } finally {
      setLoading(false);
    }
  };

  // İlk yüklemede kategorileri getir
  useEffect(() => {
    getKategoriler();
  }, []);

  // Kategori silme
  const handleDelete = async (kategori: Kategori) => {
    try {
      const response = await fetch(`/api/kategoriler/${kategori.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.hata || "Kategori silinirken bir hata oluştu");
      }

      toast.success("Kategori başarıyla silindi");
      getKategoriler("", sayfalama.mevcutSayfa, sayfalama.limit);
    } catch (error) {
      console.error("Kategori silinirken hata:", error);
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    }
  };

  return (
    <>
      {hata && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{hata}</p>
          <button 
            className="mt-2 px-3 py-1 bg-red-200 text-red-800 rounded" 
            onClick={() => getKategoriler()}
          >
            Yeniden Dene
          </button>
        </div>
      )}
      
      <DataTableTemplate<Kategori>
        title="Kategoriler"
        columns={[
          { header: "Kategori Adı", accessor: "ad" },
          { header: "Açıklama", accessor: "aciklama" },
          { 
            header: "Talep Sayısı", 
            accessor: "formattedTalepSayisi",
            className: "text-center"
          },
        ]}
        data={kategoriler}
        loading={loading}
        pagination={{
          totalItems: sayfalama.toplamKayit,
          totalPages: sayfalama.toplamSayfa,
          currentPage: sayfalama.mevcutSayfa,
          pageSize: sayfalama.limit,
        }}
        searchPlaceholder="Kategorilerde ara..."
        onSearch={(term) => getKategoriler(term, 1, sayfalama.limit)}
        onPageChange={(page) => getKategoriler("", page, sayfalama.limit)}
        onPageSizeChange={(size) => getKategoriler("", 1, size)}
        onAdd={() => {
          setSelectedKategoriId(undefined);
          setModalOpen(true);
        }}
        onEdit={(kategori) => {
          setSelectedKategoriId(kategori.id);
          setModalOpen(true);
        }}
        onDelete={handleDelete}
        canDelete={(kategori) => {
          return !kategori._count || !kategori._count.talepler || kategori._count.talepler === 0;
        }}
        deleteModalTitle="Kategori Sil"
        deleteModalDescription="Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        storageKeyPrefix="ayarlar_kategori"
      />

      <KategoriModalYeni
        open={modalOpen}
        onOpenChange={setModalOpen}
        kategoriId={selectedKategoriId}
        onSuccess={() => {
          getKategoriler("", sayfalama.mevcutSayfa, sayfalama.limit);
          setModalOpen(false);
        }}
      />
    </>
  );
} 