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
  LayoutPanelTop
} from "lucide-react";
import { ItemModal } from "./ItemModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  ad: string;
  aciklama: string | null;
  // İlişkili kayıt sayılarını ekleyin
  // ornek: personelSayisi: number;
  // ornek: talepSayisi: number;
}

interface Sayfalama {
  toplamKayit: number;
  toplamSayfa: number;
  mevcutSayfa: number;
  limit: number;
}

type GorunumTipi = "tablo" | "kart" | "liste";

export default function ItemListPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [modalAcik, setModalAcik] = useState(false);
  const [seciliItem, setSeciliItem] = useState<Item | undefined>();
  const [sayfalama, setSayfalama] = useState<Sayfalama>({
    toplamKayit: 0,
    toplamSayfa: 1,
    mevcutSayfa: 1,
    limit: Number(localStorage.getItem("itemSayfaLimit")) || 10,
  });
  const [aramaMetni, setAramaMetni] = useState("");
  const [gorunumTipi, setGorunumTipi] = useState<GorunumTipi>(
    (localStorage.getItem("itemGorunumTipi") as GorunumTipi) || "tablo"
  );

  const sayfaLimitiDegistir = (yeniLimit: string) => {
    const limit = Number(yeniLimit);
    localStorage.setItem("itemSayfaLimit", yeniLimit);
    setSayfalama(onceki => ({ ...onceki, limit, mevcutSayfa: 1 }));
  };

  const gorunumuDegistir = (tip: GorunumTipi) => {
    localStorage.setItem("itemGorunumTipi", tip);
    setGorunumTipi(tip);
  };

  const kayitlariGetir = async () => {
    try {
      const yanit = await fetch(
        `/api/items?sayfa=${sayfalama.mevcutSayfa}&limit=${sayfalama.limit}&arama=${aramaMetni}`
      );
      const veri = await yanit.json();

      if (!yanit.ok) {
        throw new Error(veri.error || "Veriler alınırken bir hata oluştu");
      }

      setItems(veri.items);
      setSayfalama(veri.sayfalama);
    } catch (hata) {
      console.error("Veriler alınırken hata:", hata);
      toast.error("Kayıtlar alınırken bir hata oluştu");
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    kayitlariGetir();
  }, [sayfalama.mevcutSayfa, sayfalama.limit, aramaMetni]);

  const modalAc = (item?: Item) => {
    setSeciliItem(item);
    setModalAcik(true);
  };

  const kayitSil = async (id: string) => {
    if (!window.confirm("Bu kaydı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const yanit = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      });

      if (!yanit.ok) {
        const hata = await yanit.json();
        throw new Error(hata.error || "Silme işlemi başarısız oldu");
      }

      toast.success("Kayıt başarıyla silindi");
      kayitlariGetir();
    } catch (hata) {
      console.error("Silme işlemi sırasında hata:", hata);
      toast.error(
        hata instanceof Error ? hata.message : "Silme işlemi sırasında bir hata oluştu"
      );
    }
  };

  const sayfaDegistir = (yeniSayfa: number) => {
    setSayfalama(onceki => ({ ...onceki, mevcutSayfa: yeniSayfa }));
  };

  const KartGorunumu = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 transition-all duration-200 hover:shadow-md hover:border-gray-200 relative group"
        >
          <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => modalAc(item)}
              className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => kayitSil(item.id)}
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{item.ad}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {item.aciklama || "Açıklama bulunmuyor"}
            </p>
          </div>
          {/* İlişkili kayıt sayılarını ekleyin */}
          {/* ornek:
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="bg-blue-50 p-1.5 rounded-md">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <span>{item.personelSayisi} Personel</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="bg-green-50 p-1.5 rounded-md">
              <MessageSquare className="w-4 h-4 text-green-600" />
            </div>
            <span>{item.talepSayisi} Talep</span>
          </div>
          */}
        </div>
      ))}
    </div>
  );

  const ListeGorunumu = () => (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between transition-all duration-200 hover:shadow-sm hover:border-gray-200 group"
        >
          <div className="flex items-center gap-8 flex-1">
            <div className="min-w-[200px]">
              <h3 className="font-medium text-gray-900">{item.ad}</h3>
            </div>
            <div className="flex-1 text-sm text-gray-600">
              {item.aciklama || "Açıklama bulunmuyor"}
            </div>
            {/* İlişkili kayıt sayılarını ekleyin */}
            {/* ornek:
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="bg-blue-50 p-1.5 rounded-md">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <span>{item.personelSayisi} Personel</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="bg-green-50 p-1.5 rounded-md">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                </div>
                <span>{item.talepSayisi} Talep</span>
              </div>
            </div>
            */}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => modalAc(item)}
              className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => kayitSil(item.id)}
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
      <div className="container mx-auto py-6 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Kayıt ara..."
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
                Yeni Kayıt
              </Button>
            </div>
          </div>
        </div>

        {yukleniyor ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="text-4xl mb-4">📂</div>
            <p className="text-lg font-medium mb-1">Kayıt Bulunamadı</p>
            <p className="text-sm">Arama kriterlerinize uygun kayıt bulunamadı.</p>
          </div>
        ) : (
          <>
            {gorunumTipi === "tablo" ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead>Ad</TableHead>
                      <TableHead>Açıklama</TableHead>
                      {/* İlişkili kayıt başlıklarını ekleyin */}
                      {/* ornek:
                      <TableHead className="text-center">Personel</TableHead>
                      <TableHead className="text-center">Talep</TableHead>
                      */}
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className="group">
                        <TableCell className="font-medium">{item.ad}</TableCell>
                        <TableCell className="text-gray-600">
                          {item.aciklama || "-"}
                        </TableCell>
                        {/* İlişkili kayıt hücrelerini ekleyin */}
                        {/* ornek:
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="bg-blue-50 p-1 rounded-md">
                              <Users className="w-3 h-3 text-blue-600" />
                            </div>
                            {item.personelSayisi}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="bg-green-50 p-1 rounded-md">
                              <MessageSquare className="w-3 h-3 text-green-600" />
                            </div>
                            {item.talepSayisi}
                          </div>
                        </TableCell>
                        */}
                        <TableCell>
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => modalAc(item)}
                              className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => kayitSil(item.id)}
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

            <div className="flex items-center justify-between">
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

        <ItemModal
          acik={modalAcik}
          kapatModal={() => setModalAcik(false)}
          item={seciliItem}
          yenile={kayitlariGetir}
        />
      </div>
    </div>
  );
} 