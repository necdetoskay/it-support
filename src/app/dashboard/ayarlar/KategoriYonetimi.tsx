"use client";

import React from "react";
import { toast } from "sonner";
import DataTableTemplate from "@/components/templates/DataTableTemplate";
import { KategoriModalYeni } from "./KategoriModalYeni";

// Özel bir formatlayıcı yardımcı fonksiyon
const formatTalepSayisi = (count: any): string => {
  if (!count) return "0";
  if (typeof count === 'object' && count?.talepler !== undefined) {
    return String(count.talepler || "0");
  }
  if (typeof count === 'number') return count.toString();
  return "0";
};

interface Kategori {
  id: string;
  ad: string;
  aciklama: string | null;
  _count: {
    talepler: number;
  };
  formattedTalepSayisi?: string;
}

interface Sayfalama {
  toplamKayit: number;
  toplamSayfa: number;
  mevcutSayfa: number;
  limit: number;
}

export function KategoriYonetimi() {
  // State tanımları
  const [loading, setLoading] = React.useState(true);
  const [kategoriler, setKategoriler] = React.useState<Kategori[]>([]);
  const [sayfalama, setSayfalama] = React.useState<Sayfalama>({
    toplamKayit: 0,
    toplamSayfa: 0,
    mevcutSayfa: 1,
    limit: 10, // Sabit başlangıç değeri
  });
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedKategoriId, setSelectedKategoriId] = React.useState<string>();
  const [hata, setHata] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // İlk yükleme için ref
  const isFirstMount = React.useRef(true);
  
  // İlk yüklemede çalışacak effect
  React.useEffect(() => {
    const getInitialData = async () => {
      // localStorage'dan kayıtlı limit değerini al
      let initialLimit = 10;
      if (typeof window !== 'undefined') {
        const savedLimit = localStorage.getItem('ayarlar_kategori_limit');
        if (savedLimit) {
          const parsedLimit = parseInt(savedLimit, 10);
          if (!isNaN(parsedLimit) && parsedLimit > 0) {
            initialLimit = parsedLimit;
          }
        }
      }
      
      // State'i güncelle ve veriyi getir
      setSayfalama(prev => ({...prev, limit: initialLimit}));
      await getKategoriler("", 1, initialLimit);
    };
    
    getInitialData();
    isFirstMount.current = false;
  }, []);

  // Kategorileri getir
  const getKategoriler = async (search?: string, page: number = 1, limit: number = sayfalama.limit) => {
    try {
      setLoading(true);
      setHata(null);
      
      let url = "/api/kategoriler";
      const params = [];

      if (search) params.push(`arama=${encodeURIComponent(search)}`);
      if (page > 1) params.push(`sayfa=${page}`);
      if (limit !== 10) params.push(`limit=${limit}`);

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.hata || "Kategoriler getirilirken bir hata oluştu");
      }

      const data = await response.json();

      if (!data) {
        throw new Error("API'den veri alınamadı");
      }

      let formattedData: Kategori[] = [];
      let paginationData = {
        toplamKayit: 0,
        toplamSayfa: 0,
        mevcutSayfa: page,
        limit,
      };

      if (Array.isArray(data)) {
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
        formattedData = data.veriler.map((k: Kategori) => ({
          ...k,
          formattedTalepSayisi: formatTalepSayisi(k._count)
        }));
        
        if (data.sayfalama) {
          paginationData = {
            toplamKayit: data.sayfalama.toplamVeri || 0,
            toplamSayfa: data.sayfalama.toplamSayfa || 0, 
            mevcutSayfa: data.sayfalama.simdikiSayfa || page,
            limit: data.sayfalama.limit || limit,
          };
        }
      }

      setKategoriler(formattedData);
      setSayfalama(paginationData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Kategoriler getirilirken bir hata oluştu";
      toast.error(errorMessage);
      setHata(errorMessage);
      setKategoriler([]);
      setSayfalama(prev => ({
        ...prev,
        toplamKayit: 0,
        toplamSayfa: 0,
        mevcutSayfa: 1,
      }));
    } finally {
      setLoading(false);
    }
  };

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
      getKategoriler(searchTerm, sayfalama.mevcutSayfa, sayfalama.limit);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    getKategoriler(term, 1, sayfalama.limit);
  };

  const handlePageChange = (page: number) => {
    if (page === sayfalama.mevcutSayfa) return;
    getKategoriler(searchTerm, page, sayfalama.limit);
  };

  const handlePageSizeChange = (size: number) => {
    if (size === sayfalama.limit) return;
    
    // localStorage'a kaydet
    if (typeof window !== 'undefined') {
      localStorage.setItem('ayarlar_kategori_limit', size.toString());
    }
    
    // API çağrısı yap
    getKategoriler(searchTerm, 1, size);
  };

  return (
    <>
      {hata && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{hata}</p>
          <button 
            className="mt-2 px-3 py-1 bg-red-200 text-red-800 rounded" 
            onClick={() => getKategoriler(searchTerm, 1, sayfalama.limit)}
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
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
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
          if (!kategori) return false;
          if (!kategori._count) return false;
          return kategori._count.talepler === 0;
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
          getKategoriler(searchTerm, sayfalama.mevcutSayfa, sayfalama.limit);
          setModalOpen(false);
        }}
      />
    </>
  );
} 