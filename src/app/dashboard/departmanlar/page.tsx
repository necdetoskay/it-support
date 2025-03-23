"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  LayoutGrid, 
  LayoutList,
  Users,
  MessageSquare,
  LayoutPanelTop
} from "lucide-react";
import { DepartmanModal } from "./DepartmanModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

interface Departman {
  id: string;
  ad: string;
  aciklama: string | null;
  personelSayisi: number;
  talepSayisi: number;
}

interface Sayfalama {
  toplamKayit: number;
  toplamSayfa: number;
  mevcutSayfa: number;
  limit: number;
}

type GorunumTipi = "tablo" | "kart" | "liste";

// localStorage'a güvenli erişim için yardımcı fonksiyonlar
const getLocalStorageItem = (key: string, defaultValue: any): any => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key) || defaultValue;
  }
  return defaultValue;
};

const setLocalStorageItem = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

export default function DepartmanlarSayfasi() {
  const [departmanlar, setDepartmanlar] = useState<Departman[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [modalAcik, setModalAcik] = useState(false);
  const [seciliDepartman, setSeciliDepartman] = useState<Departman | undefined>();
  const [sayfalama, setSayfalama] = useState<Sayfalama>({
    toplamKayit: 0,
    toplamSayfa: 1,
    mevcutSayfa: 1,
    limit: 10,
  });
  const [aramaMetni, setAramaMetni] = useState("");
  const [gorunumTipi, setGorunumTipi] = useState<GorunumTipi>("tablo");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [departmanToDelete, setDepartmanToDelete] = useState<string | null>(null);

  // localStorage'dan tercihleri al
  useEffect(() => {
    const savedLimit = Number(getLocalStorageItem("departmanSayfaLimit", "10"));
    const savedView = getLocalStorageItem("departmanGorunumTipi", "tablo") as GorunumTipi;
    
    setSayfalama(prev => ({ ...prev, limit: savedLimit }));
    setGorunumTipi(savedView);
  }, []);

  const sayfaLimitiDegistir = (yeniLimit: string) => {
    const limit = Number(yeniLimit);
    setLocalStorageItem("departmanSayfaLimit", yeniLimit);
    setSayfalama(onceki => ({ ...onceki, limit, mevcutSayfa: 1 }));
  };

  const gorunumuDegistir = (tip: GorunumTipi) => {
    setLocalStorageItem("departmanGorunumTipi", tip);
    setGorunumTipi(tip);
  };

  const departmanlariGetir = async () => {
    try {
      const yanit = await fetch(
        `/api/departments?sayfa=${sayfalama.mevcutSayfa}&limit=${sayfalama.limit}&arama=${aramaMetni}`
      );
      const veri = await yanit.json();

      if (!yanit.ok) {
        throw new Error(veri.error || "Veriler alınırken bir hata oluştu");
      }

      setDepartmanlar(veri.departments);
      setSayfalama(veri.sayfalama);
    } catch (hata) {
      console.error("Veriler alınırken hata:", hata);
      toast.error("Departmanlar alınırken bir hata oluştu");
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    departmanlariGetir();
  }, [sayfalama.mevcutSayfa, sayfalama.limit, aramaMetni]);

  const modalAc = (departman?: Departman) => {
    setSeciliDepartman(departman);
    setModalAcik(true);
  };

  const handleEdit = (departman: Departman) => {
    console.log("Düzenlenecek departman:", departman); // Debug için
    setSeciliDepartman(departman); // Departman verisinin kopyasını oluştur
    setModalAcik(true);
  };

  const handleDelete = async (id: string) => {
    setDepartmanToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!departmanToDelete) return;

    try {
      const response = await fetch(`/api/departments/${departmanToDelete}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success("Departman başarıyla silindi");
      departmanlariGetir();
    } catch (error) {
      console.error("Departman silinirken hata:", error);
      toast.error(error instanceof Error ? error.message : "Departman silinirken bir hata oluştu");
    } finally {
      setDeleteModalOpen(false);
      setDepartmanToDelete(null);
    }
  };

  const sayfaDegistir = (yeniSayfa: number) => {
    setSayfalama(onceki => ({ ...onceki, mevcutSayfa: yeniSayfa }));
  };

  const KartGorunumu = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {departmanlar.map((departman) => (
        <div
          key={departman.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 transition-all duration-200 hover:shadow-md hover:border-gray-200 relative group"
        >
          <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(departman)}
              className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(departman.id)}
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{departman.ad}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {departman.aciklama || "Açıklama bulunmuyor"}
            </p>
          </div>
          <div className="flex gap-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="bg-blue-50 p-1.5 rounded-md">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <span>{departman.personelSayisi} Personel</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="bg-green-50 p-1.5 rounded-md">
                <MessageSquare className="w-4 h-4 text-green-600" />
              </div>
              <span>{departman.talepSayisi} Talep</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ListeGorunumu = () => (
    <div className="space-y-3">
      {departmanlar.map((departman) => (
        <div
          key={departman.id}
          className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between transition-all duration-200 hover:shadow-sm hover:border-gray-200 group"
        >
          <div className="flex items-center gap-8 flex-1">
            <div className="min-w-[200px]">
              <h3 className="font-medium text-gray-900">{departman.ad}</h3>
            </div>
            <div className="flex-1 text-sm text-gray-600">
              {departman.aciklama || "Açıklama bulunmuyor"}
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="bg-blue-50 p-1.5 rounded-md">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <span>{departman.personelSayisi} Personel</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="bg-green-50 p-1.5 rounded-md">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                </div>
                <span>{departman.talepSayisi} Talep</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 ml-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(departman)}
              className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(departman.id)}
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto py-8 space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Departman ara..."
                  value={aramaMetni}
                  onChange={(e) => setAramaMetni(e.target.value)}
                  className="w-[350px] pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={gorunumTipi === "tablo" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => gorunumuDegistir("tablo")}
                  className={cn(
                    "h-8 w-8",
                    gorunumTipi === "tablo" ? "text-white shadow-sm" : "text-gray-600"
                  )}
                >
                  <LayoutPanelTop className="w-4 h-4" />
                </Button>
                <Button
                  variant={gorunumTipi === "liste" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => gorunumuDegistir("liste")}
                  className={cn(
                    "h-8 w-8",
                    gorunumTipi === "liste" ? "text-white shadow-sm" : "text-gray-600"
                  )}
                >
                  <LayoutList className="w-4 h-4" />
                </Button>
                <Button
                  variant={gorunumTipi === "kart" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => gorunumuDegistir("kart")}
                  className={cn(
                    "h-8 w-8",
                    gorunumTipi === "kart" ? "text-white shadow-sm" : "text-gray-600"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
              <Select
                value={sayfalama.limit.toString()}
                onValueChange={sayfaLimitiDegistir}
              >
                <SelectTrigger className="w-[130px] bg-white">
                  <SelectValue placeholder="Kayıt sayısı" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="5">5 Kayıt</SelectItem>
                  <SelectItem value="10">10 Kayıt</SelectItem>
                  <SelectItem value="25">25 Kayıt</SelectItem>
                  <SelectItem value="50">50 Kayıt</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => modalAc()} className="gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Yeni Departman
              </Button>
            </div>
          </div>
        </div>

        {yukleniyor ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : departmanlar.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="text-4xl mb-4">📂</div>
            <p className="text-lg font-medium mb-1">Kayıt Bulunamadı</p>
            <p className="text-sm">Arama kriterlerinize uygun departman bulunamadı.</p>
          </div>
        ) : (
          <>
            {gorunumTipi === "tablo" ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead>Departman Adı</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead className="text-center">Personel</TableHead>
                      <TableHead className="text-center">Talep</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmanlar.map((departman) => (
                      <TableRow key={departman.id} className="group">
                        <TableCell className="font-medium">{departman.ad}</TableCell>
                        <TableCell className="text-gray-600">
                          {departman.aciklama || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="bg-blue-50 p-1 rounded-md">
                              <Users className="w-3 h-3 text-blue-600" />
                            </div>
                            {departman.personelSayisi}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="bg-green-50 p-1 rounded-md">
                              <MessageSquare className="w-3 h-3 text-green-600" />
                            </div>
                            {departman.talepSayisi}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(departman)}
                              className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(departman.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : gorunumTipi === "liste" ? (
              <ListeGorunumu />
            ) : (
              <KartGorunumu />
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-3 flex justify-between items-center">
              <div className="text-sm text-gray-600 px-2">
                Toplam {sayfalama.toplamKayit} kayıt
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sayfalama.mevcutSayfa === 1}
                  onClick={() => sayfaDegistir(sayfalama.mevcutSayfa - 1)}
                >
                  Önceki
                </Button>
                {Array.from({ length: sayfalama.toplamSayfa }, (_, i) => i + 1).map(
                  (sayfa) => (
                    <Button
                      key={sayfa}
                      variant={sayfa === sayfalama.mevcutSayfa ? "default" : "outline"}
                      size="sm"
                      onClick={() => sayfaDegistir(sayfa)}
                      className={cn(
                        sayfa === sayfalama.mevcutSayfa && "shadow-sm"
                      )}
                    >
                      {sayfa}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sayfalama.mevcutSayfa === sayfalama.toplamSayfa}
                  onClick={() => sayfaDegistir(sayfalama.mevcutSayfa + 1)}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          </>
        )}

        <DepartmanModal
          open={modalAcik}
          onClose={(refresh) => {
            setModalAcik(false);
            if (refresh) {
              departmanlariGetir();
            }
          }}
          departman={seciliDepartman}
        />

        <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Departmanı Sil</AlertDialogTitle>
              <AlertDialogDescription>
                Bu departmanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
                Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
} 