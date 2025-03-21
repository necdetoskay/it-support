"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ITDropdown } from "@/components/ui/it-dropdown";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmanlar: Array<{ id: string; ad: string }>;
  kategoriler: Array<{ id: string; ad: string }>;
  selectedDepartman: string | null;
  selectedKategori: string | null;
  selectedDurum: string | null;
  selectedOncelik: string | null;
  onDepartmanChange: (id: string | null) => void;
  onKategoriChange: (id: string | null) => void;
  onDurumChange: (durum: string | null) => void;
  onOncelikChange: (oncelik: string | null) => void;
  onReset: () => void;
}

const durumOptions = [
  { value: "all", label: "Tüm Durumlar" },
  { value: "ACIK", label: "Açık" },
  { value: "ISLEMDE", label: "İşlemde" },
  { value: "KULLANICI_BEKLIYOR", label: "Kullanıcı Bekliyor" },
];

const oncelikOptions = [
  { value: "all", label: "Tüm Öncelikler" },
  { value: "DUSUK", label: "Düşük" },
  { value: "ORTA", label: "Orta" },
  { value: "YUKSEK", label: "Yüksek" },
  { value: "ACIL", label: "Acil" },
];

export function FilterDialog({
  open,
  onOpenChange,
  departmanlar,
  kategoriler,
  selectedDepartman,
  selectedKategori,
  selectedDurum,
  selectedOncelik,
  onDepartmanChange,
  onKategoriChange,
  onDurumChange,
  onOncelikChange,
  onReset,
}: FilterDialogProps) {
  // Aktif filtre sayısını hesapla
  const activeFilterCount = [
    selectedDepartman !== null,
    selectedKategori !== null,
    selectedDurum !== null,
    selectedOncelik !== null,
  ].filter(Boolean).length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filtreleme Seçenekleri</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="departman" className="text-sm font-medium mb-1">
                  Departman
                </label>
                <select
                  id="departman"
                  value={selectedDepartman || ''}
                  onChange={(e) => onDepartmanChange(e.target.value || null)}
                  className="rounded-md border border-input p-2 bg-background"
                >
                  <option value="">Tüm Departmanlar</option>
                  {departmanlar.map((departman) => (
                    <option key={departman.id} value={departman.id}>
                      {departman.ad}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label htmlFor="kategori" className="text-sm font-medium mb-1">
                  Kategori
                </label>
                <select
                  id="kategori"
                  value={selectedKategori || ''}
                  onChange={(e) => onKategoriChange(e.target.value || null)}
                  className="rounded-md border border-input p-2 bg-background"
                >
                  <option value="">Tüm Kategoriler</option>
                  {kategoriler.map((kategori) => (
                    <option key={kategori.id} value={kategori.id}>
                      {kategori.ad}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label htmlFor="durum" className="text-sm font-medium mb-1">
                  Durum
                </label>
                <select
                  id="durum"
                  value={selectedDurum || ''}
                  onChange={(e) => onDurumChange(e.target.value || null)}
                  className="rounded-md border border-input p-2 bg-background"
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="DEVAM_EDIYOR">Devam Ediyor</option>
                  <option value="TAMAMLANDI">Tamamlandı</option>
                  <option value="BEKLEMEDE">Beklemede</option>
                  <option value="IPTAL">İptal</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label htmlFor="oncelik" className="text-sm font-medium mb-1">
                  Öncelik
                </label>
                <select
                  id="oncelik"
                  value={selectedOncelik || ''}
                  onChange={(e) => onOncelikChange(e.target.value || null)}
                  className="rounded-md border border-input p-2 bg-background"
                >
                  <option value="">Tüm Öncelikler</option>
                  <option value="DUSUK">Düşük</option>
                  <option value="ORTA">Orta</option>
                  <option value="YUKSEK">Yüksek</option>
                  <option value="ACIL">Acil</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
            >
              Sıfırla
            </Button>
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Uygula
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 