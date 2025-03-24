"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TalepModal } from "./TalepModal";
import { FilterDialog } from "./FilterDialog";
import { Plus, Filter, FileText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

// Tipler için import
import { 
  Departman, 
  Kategori, 
  Talep, 
  User, 
  Personel, 
  ViewType 
} from "./types";

// Bileşen importları
import { ViewOptions } from "./components/ViewOptions";
import { TableView, ListView, GridView } from "./components/TalepViews";

// LocalStorage yardımcı fonksiyonları (sayfa dışında tanımlandı)
function getStorageValue(key: string, defaultValue: any) {
  if (typeof window === "undefined") return defaultValue;
  
  try {
    const saved = localStorage.getItem(`talepler_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`localStorage'dan okuma hatası: ${error}`);
    return defaultValue;
  }
}

function setStorageValue(key: string, value: any) {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(`talepler_${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(`localStorage'a yazma hatası: ${error}`);
  }
}

export default function TaleplerPage() {
  const router = useRouter();
  const [ilkYukleme, setIlkYukleme] = useState(true);
  const [loading, setLoading] = useState(true);
  const [talepler, setTalepler] = useState<Talep[]>([]);
  const [departmanlar, setDepartmanlar] = useState<Departman[]>([]);
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [personeller, setPersoneller] = useState<Personel[]>([]);
  const [kullanicilar, setKullanicilar] = useState<User[]>([]);
  
  // localStorage'dan ilk değerleri al
  const [viewType, setViewType] = useState<ViewType>(() => 
    getStorageValue('viewType', 'table') as ViewType
  );
  
  // localStorage'dan pageSize değerini al
  const [pageSize, setPageSize] = useState(() => 
    getStorageValue('pageSize', 20)
  );
  
  const [modalOpen, setModalOpen] = useState(false);

  // Filtreler
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartman, setSelectedDepartman] = useState<string | null>(null);
  const [selectedKategori, setSelectedKategori] = useState<string | null>(null);
  const [selectedDurum, setSelectedDurum] = useState<string | null>(null);
  const [selectedOncelik, setSelectedOncelik] = useState<string | null>(null);
  
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Sayfa boyutunu değiştir
  const handlePageSizeChange = (newSize: number) => {
    if (newSize === pageSize) return; // Değişiklik yoksa işlem yapma
    setPageSize(newSize);
    setStorageValue('pageSize', newSize);
  };

  // Görünüm tipini değiştir
  const handleViewTypeChange = (newType: ViewType) => {
    if (newType === viewType) return; // Değişiklik yoksa işlem yapma
    setViewType(newType);
    setStorageValue('viewType', newType);
  };

  // Talepleri getir - ana veri yükleme fonksiyonu
  const getTalepler = async () => {
    if (ilkYukleme) setIlkYukleme(false);
    setLoading(true);
    
    try {
      // Sorgu parametreleri oluştur
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("pageSize", pageSize.toString());
      params.append("includeIslemler", "true"); // Son işlemleri de dahil et
      
      if (searchTerm) params.append("search", searchTerm);
      if (selectedDepartman) params.append("departmanId", selectedDepartman);
      if (selectedKategori) params.append("kategoriId", selectedKategori);
      if (selectedDurum) params.append("durum", selectedDurum);
      if (selectedOncelik) params.append("oncelik", selectedOncelik);
      
      console.log("API isteği yapılıyor:", `/api/talepler?${params.toString()}`);
      
      // API endpoint'ini çağır
      const response = await fetch(`/api/talepler?${params.toString()}`, {
        cache: 'no-store', // Her zaman yeni veri çek
      });
      
      if (!response.ok) {
        const hataMetni = await response.text();
        console.error("API hatası:", hataMetni);
        throw new Error(`API hatası: ${response.status} ${hataMetni}`);
      }
      
      const data = await response.json();
      
      if (data && data.talepler) {
        setTalepler(data.talepler);
      } else {
        setTalepler([]);
        console.warn("API beklenmeyen veri döndürdü:", data);
      }
    } catch (hata) {
      console.error("Talepler getirilirken hata:", hata);
      setTalepler([]);
      toast.error("Talepler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Departmanları getir
  const getDepartmanlar = async () => {
    try {
      const response = await fetch("/api/departments", {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Departmanlar getirilirken bir hata oluştu"
        );
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
      const response = await fetch("/api/categories", {
        cache: 'no-store',
      });
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
      const response = await fetch("/api/personeller", {
        cache: 'no-store',
      });
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
      const response = await fetch("/api/kullanicilar", {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Kullanıcılar getirilirken bir hata oluştu"
        );
      }

      setKullanicilar(data.users);
    } catch (error) {
      console.error("Kullanıcılar getirilirken hata:", error);
      toast.error("Kullanıcılar getirilirken bir hata oluştu");
    }
  };

  // Sayfa ilk yüklendiğinde veri çekme
  useEffect(() => {
    // Sadece ilk yüklemede verileri getir
    if (ilkYukleme) {
      getTalepler();
      // Diğer verileri de getir
      getDepartmanlar();
      getKategoriler();
      getPersoneller();
      getKullanicilar();
    }
  }, [ilkYukleme]);

  // Searchterm değişince veri yenile
  useEffect(() => {
    if (!ilkYukleme) {
      const timer = setTimeout(() => {
        getTalepler();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  // Filtreler değişince veri yenile 
  useEffect(() => {
    if (!ilkYukleme) {
      getTalepler();
    }
  }, [selectedDepartman, selectedKategori, selectedDurum, selectedOncelik, pageSize]);

  // Modal açma fonksiyonu
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  // Filtre diyaloğunu açma fonksiyonu
  const handleOpenFilterDialog = () => {
    setFilterDialogOpen(true);
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto py-6 space-y-6">
        {/* Filtreler */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Taleplerde ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleOpenFilterDialog}
                  className="relative h-9 px-3"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtreler
                  {(selectedDepartman || selectedKategori || selectedDurum || selectedOncelik) && (
                    <span className="absolute -right-1 -top-1 flex h-3 w-3">
                      <span className="animate-none absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filtreleri Göster</p>
              </TooltipContent>
            </Tooltip>
            <FilterDialog
              open={filterDialogOpen}
              onOpenChange={setFilterDialogOpen}
              departmanlar={departmanlar}
              kategoriler={kategoriler}
              selectedDepartman={selectedDepartman}
              selectedKategori={selectedKategori}
              selectedDurum={selectedDurum}
              selectedOncelik={selectedOncelik}
              onDepartmanChange={setSelectedDepartman}
              onKategoriChange={setSelectedKategori}
              onDurumChange={setSelectedDurum}
              onOncelikChange={setSelectedOncelik}
              onReset={() => {
                setSelectedDepartman(null);
                setSelectedKategori(null);
                setSelectedDurum(null);
                setSelectedOncelik(null);
              }}
            />
            <ViewOptions
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              viewType={viewType}
              onViewTypeChange={handleViewTypeChange}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleOpenModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Talep
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Yeni Talep Oluştur</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" asChild>
                  <Link href="/talep/olustur">
                    <FileText className="w-4 h-4 mr-2" />
                    Ayrıntılı Form
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Analiz Özellikli Ayrıntılı Form</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Talepler */}
        {loading ? (
          <div className="text-center">Yükleniyor...</div>
        ) : talepler.length === 0 ? (
          <div className="text-center">Talep bulunamadı</div>
        ) : (
          <>
            {viewType === "table" && <TableView talepler={talepler} onRefresh={getTalepler} />}
            {viewType === "list" && <ListView talepler={talepler} onRefresh={getTalepler} />}
            {viewType === "grid" && <GridView talepler={talepler} onRefresh={getTalepler} />}
          </>
        )}

        {/* Yeni Talep Modal */}
        <TalepModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          departmanlar={departmanlar}
          kategoriler={kategoriler}
          personeller={personeller}
          kullanicilar={kullanicilar}
          onSuccess={() => {
            getTalepler();
            setModalOpen(false);
          }}
        />
      </div>
    </TooltipProvider>
  );
} 