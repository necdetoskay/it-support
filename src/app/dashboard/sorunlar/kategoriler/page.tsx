"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import DataTableTemplate from "@/components/templates/DataTableTemplate";
import { KategoriModal } from "./KategoriModal";

// Özel bir formatlayıcı yardımcı fonksiyon
const formatSorunSayisi = (count: any): string => {
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
  // Görüntüleme için formatlı sorun sayısı
  formattedSorunSayisi?: string;
}

export default function KategorilerPage() {
  const { data: session, status } = useSession();
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

  // Kategorileri getir
  const getKategoriler = async (search: string = "", page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      let url = `/api/sorunlar/kategoriler?sayfa=${page}&limit=${limit}`;
      if (search) {
        url += `&arama=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kategoriler yüklenirken bir hata oluştu");
      }

      const formattedData = data.data.map((kategori: Kategori) => ({
        ...kategori,
        formattedSorunSayisi: formatSorunSayisi(kategori._count),
      }));

      setKategoriler(formattedData);
      setSayfalama({
        toplamKayit: data.meta.toplamKayit,
        toplamSayfa: data.meta.toplamSayfa,
        mevcutSayfa: data.meta.mevcutSayfa,
        limit: data.meta.limit,
      });
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
      toast.error("Kategoriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // İlk yüklemede kategorileri getir
  useEffect(() => {
    if (status === "loading") return;
    getKategoriler();
  }, [status]);

  // Kategori silme
  const handleDelete = async (kategori: Kategori) => {
    try {
      const response = await fetch(`/api/sorunlar/kategoriler/${kategori.id}`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kategori silinirken bir hata oluştu");
      }

      toast.success("Kategori başarıyla silindi");
      getKategoriler("", sayfalama.mevcutSayfa, sayfalama.limit);
    } catch (error) {
      console.error("Kategori silinirken hata:", error);
      toast.error(error instanceof Error ? error.message : "Kategori silinirken bir hata oluştu");
    }
  };

  return (
    <>
      <DataTableTemplate<Kategori>
        title="Sorun Kategorileri"
        columns={[
          { header: "Kategori Adı", accessor: "ad" },
          { header: "Açıklama", accessor: "aciklama" },
          { 
            header: "Sorun Sayısı", 
            accessor: "formattedSorunSayisi",
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
          if (!kategori) return false;
          if (!kategori._count) return false;
          return kategori._count.talepler === 0;
        }}
        deleteModalTitle="Kategori Sil"
        deleteModalDescription="Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        storageKeyPrefix="sorunKategori"
      />

      <KategoriModal
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