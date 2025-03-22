"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TalepModal } from "./TalepModal";
import { formatDate } from "@/lib/utils";
import { ITDropdown } from "@/components/ui/it-dropdown";
import { FilterDialog } from "./FilterDialog";
import { TableIcon, ListIcon, LayoutGridIcon, Plus, Eye, ListTodo, Edit, Trash2, Filter } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TalepDuzenleModal from "./[id]/TalepDuzenleModal";
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

interface TalepIslem {
  id: string;
  tip: string;
  aciklama: string;
  durum: string;
  olusturulmaTarihi: string;
  yapanKullaniciId: string;
  yapanKullanici: {
    id: string;
    name: string;
  };
}

interface Talep {
  id: string;
  baslik: string;
  sorunDetay: string;
  departman: Departman;
  kategori: Kategori;
  raporEden: Personel;
  atanan: User | null;
  oncelik: "DUSUK" | "ORTA" | "YUKSEK" | "ACIL";
  durum: "DEVAM_EDIYOR" | "TAMAMLANDI" | "BEKLEMEDE" | "IPTAL";
  sonTarih: string | null;
  olusturulmaTarihi: string;
  guncellenmeTarihi: string;
  kapatilmaTarihi: string | null;
  sonIslem: TalepIslem | null;
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

// Görünüm tipleri
type ViewType = "table" | "list" | "grid";

// Aksiyon butonları komponenti
function ActionButtons({ talepId, onSuccess }: { talepId: string; onSuccess?: () => void }) {
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Silme işlemi
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/talepler/${talepId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Talep silinirken bir hata oluştu');
      }

      toast.success('Talep başarıyla silindi');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Talep silinirken hata:', error);
      toast.error('Talep silinirken bir hata oluştu');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/talepler/${talepId}`)}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Detayları Görüntüle</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/talepler/${talepId}/islemler`)}
            className="h-8 w-8"
          >
            <ListTodo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>İşlemleri Görüntüle</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditModalOpen(true)}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Düzenle</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteDialogOpen(true)}
            className="h-8 w-8 text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sil</p>
        </TooltipContent>
      </Tooltip>

      <TalepDuzenleModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        talepId={talepId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Talebi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu talebi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve talebe bağlı tüm işlemler ve dosyalar da silinecektir.
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

function ViewOptions({
  pageSize,
  onPageSizeChange,
  viewType,
  onViewTypeChange
}: {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  viewType: ViewType;
  onViewTypeChange: (type: ViewType) => void;
}): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="h-9 w-[120px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
      >
        <option value={10}>10 Kayıt</option>
        <option value={20}>20 Kayıt</option>
        <option value={50}>50 Kayıt</option>
        <option value={100}>100 Kayıt</option>
      </select>
      <div className="flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewType === "table" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewTypeChange("table")}
              className="h-8 w-8"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tablo Görünümü</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewType === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewTypeChange("list")}
              className="h-8 w-8"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Liste Görünümü</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewType === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewTypeChange("grid")}
              className="h-8 w-8"
            >
              <LayoutGridIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Grid Görünümü</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export default function TaleplerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [talepler, setTalepler] = useState<Talep[]>([]);
  const [departmanlar, setDepartmanlar] = useState<Departman[]>([]);
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [personeller, setPersoneller] = useState<Personel[]>([]);
  const [kullanicilar, setKullanicilar] = useState<User[]>([]);
  const [viewType, setViewType] = useState<ViewType>("table");
  const [modalOpen, setModalOpen] = useState(false);

  // Filtreler
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartman, setSelectedDepartman] = useState<string | null>(null);
  const [selectedKategori, setSelectedKategori] = useState<string | null>(null);
  const [selectedDurum, setSelectedDurum] = useState<string | null>(null);
  const [selectedOncelik, setSelectedOncelik] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(20);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Talepleri getir
  const getTalepler = async () => {
    setLoading(true);
    try {
      // Sorgu parametreleri oluştur
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("pageSize", pageSize.toString());
      
      if (searchTerm) params.append("search", searchTerm);
      if (selectedDepartman) params.append("departmanId", selectedDepartman);
      if (selectedKategori) params.append("kategoriId", selectedKategori);
      if (selectedDurum) params.append("durum", selectedDurum);
      if (selectedOncelik) params.append("oncelik", selectedOncelik);
      
      // API endpoint'ini çağır
      const response = await fetch(`/api/talepler?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const hataMetni = await response.text();
        console.error("API hatası:", hataMetni);
        throw new Error(`API hatası: ${response.status} ${hataMetni}`);
      }
      
      const data = await response.json();
      
      if (data && data.talepler) {
        // Her talep için son işlemi getir
        const taleplerWithIslemler = await Promise.all(
          data.talepler.map(async (talep: Talep) => {
            try {
              const islemResponse = await fetch(`/api/talepler/${talep.id}/islemler`, {
                cache: 'no-store'
              });
              
              if (islemResponse.ok) {
                const islemler = await islemResponse.json();
                // İşlemler varsa, en son işlemi ekle
                if (islemler && islemler.length > 0) {
                  return { 
                    ...talep, 
                    sonIslem: islemler[0] // ilk işlem en son işlemdir (desc sıralanmış)
                  };
                }
              }
              
              // İşlem yoksa veya hata varsa, sonIslem null olarak ekle
              return { ...talep, sonIslem: null };
            } catch (error) {
              console.error(`Talep ${talep.id} işlemleri getirilirken hata:`, error);
              return { ...talep, sonIslem: null };
            }
          })
        );
        
        setTalepler(taleplerWithIslemler);
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
      const response = await fetch("/api/departments");
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
      const response = await fetch("/api/categories");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kategoriler getirilirken bir hata oluştu");
      }

      // API doğrudan kategori dizisi döndürüyor
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

  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    getTalepler();
    getDepartmanlar();
    getKategoriler();
    getPersoneller();
    getKullanicilar();
  }, []);

  // Filtreleme değiştiğinde talepleri yeniden getir
  useEffect(() => {
    getTalepler();
  }, [searchTerm, selectedDepartman, selectedKategori, selectedDurum, selectedOncelik]);

  // Sayfa boyutu değişikliği
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
  };

  // Tablo görünümü
  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-4 text-left">Başlık</th>
            <th className="p-4 text-left">Rapor Eden</th>
            <th className="p-4 text-left">Atanan</th>
            <th className="p-4 text-left">Son Yapılan İşlem</th>
            <th className="p-4 text-left">Öncelik</th>
            <th className="p-4 text-left">Durum</th>
            <th className="p-4 text-left">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {talepler.map((talep, index) => (
            <tr
              key={talep.id}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="p-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">{talep.kategori.ad}</span>
                      <span className="font-medium">{talep.baslik}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Kategori: {talep.kategori.ad}</p>
                    <p>Başlık: {talep.baslik}</p>
                  </TooltipContent>
                </Tooltip>
              </td>
              <td className="p-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">{talep.departman.ad}</span>
                      <span className="font-medium">{talep.raporEden.ad}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Departman: {talep.departman.ad}</p>
                    <p>Rapor Eden: {talep.raporEden.ad}</p>
                  </TooltipContent>
                </Tooltip>
              </td>
              <td className="p-4">{talep.atanan?.name || "-"}</td>
              <td className="p-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col">
                      {talep.sonIslem ? (
                        <>
                          <span className="text-xs text-gray-500">
                            {formatDate(talep.sonIslem.olusturulmaTarihi)}
                          </span>
                          <span className="text-sm line-clamp-1">
                            {talep.sonIslem.aciklama}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {talep.sonIslem ? (
                      <>
                        <p>Tarih: {formatDate(talep.sonIslem.olusturulmaTarihi)}</p>
                        <p>İşlem: {talep.sonIslem.aciklama}</p>
                        <p>Yapan: {talep.sonIslem.yapanKullanici.name}</p>
                      </>
                    ) : (
                      <p>Henüz işlem yapılmadı</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </td>
              <td className="p-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className={oncelikRenkleri[talep.oncelik]}>
                      {talep.oncelik}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Öncelik: {talep.oncelik}</p>
                  </TooltipContent>
                </Tooltip>
              </td>
              <td className="p-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className={durumRenkleri[talep.durum]}>
                      {talep.durum}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Durum: {talep.durum}</p>
                  </TooltipContent>
                </Tooltip>
              </td>
              <td className="p-4">
                <ActionButtons talepId={talep.id} onSuccess={() => getTalepler()} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Liste görünümü
  const renderList = () => (
    <div className="space-y-4">
      {talepler.map((talep, index) => (
        <Card
          key={talep.id}
          className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  <span className="text-sm text-gray-500 block">{talep.kategori.ad}</span>
                  {talep.baslik}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">Rapor Eden</div>
                    <div>
                      <span className="text-sm text-gray-500 block">{talep.departman.ad}</span>
                      {talep.raporEden.ad}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Atanan</div>
                    <div>{talep.atanan?.name || "-"}</div>
                  </div>
                  <div>
                    <div className="font-medium">Öncelik</div>
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className={oncelikRenkleri[talep.oncelik]}>
                            {talep.oncelik}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Öncelik: {talep.oncelik}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Durum</div>
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className={durumRenkleri[talep.durum]}>
                            {talep.durum}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Durum: {talep.durum}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="font-medium">Son İşlem</div>
                    <div>
                      {talep.sonIslem ? (
                        <div className="text-sm">
                          <span className="text-gray-500">
                            {formatDate(talep.sonIslem.olusturulmaTarihi)}:
                          </span>{" "}
                          {talep.sonIslem.aciklama}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Henüz işlem yapılmadı</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <ActionButtons talepId={talep.id} onSuccess={() => getTalepler()} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Grid görünümü
  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {talepler.map((talep, index) => (
        <Card
          key={talep.id}
          className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
        >
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">
              <span className="text-xs text-gray-500 block">{talep.kategori.ad}</span>
              {talep.baslik}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{talep.sorunDetay}</p>
            <div className="space-y-3 mb-4">
              <div>
                <div className="font-medium">Rapor Eden</div>
                <div>
                  <span className="text-xs text-gray-500 block">{talep.departman.ad}</span>
                  {talep.raporEden.ad}
                </div>
              </div>
              <div>
                <div className="font-medium">Atanan</div>
                <div>{talep.atanan?.name || "-"}</div>
              </div>
              <div>
                <div className="font-medium">Son İşlem</div>
                <div>
                  {talep.sonIslem ? (
                    <div className="text-sm">
                      <span className="text-gray-500">
                        {formatDate(talep.sonIslem.olusturulmaTarihi)}:
                      </span>{" "}
                      <span className="line-clamp-1">{talep.sonIslem.aciklama}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Henüz işlem yapılmadı</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className={oncelikRenkleri[talep.oncelik]}>
                      {talep.oncelik}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Öncelik: {talep.oncelik}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className={durumRenkleri[talep.durum]}>
                      {talep.durum}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Durum: {talep.durum}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <ActionButtons talepId={talep.id} onSuccess={() => getTalepler()} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

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
                  onClick={() => setFilterDialogOpen(true)}
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
              onPageSizeChange={(size) => setPageSize(size)}
              viewType={viewType}
              onViewTypeChange={setViewType}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Talep
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Yeni Talep Oluştur</p>
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
            {viewType === "table" && renderTable()}
            {viewType === "list" && renderList()}
            {viewType === "grid" && renderGrid()}
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