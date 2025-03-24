// Tip tanımlamaları
export interface Departman {
  id: string;
  ad: string;
}

export interface Kategori {
  id: string;
  ad: string;
}

export interface Personel {
  id: string;
  ad: string;
  departmanId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TalepIslem {
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

export interface Talep {
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

// Görünüm tipleri
export type ViewType = "table" | "list" | "grid";

// Renk sabitleri
export const durumRenkleri: Record<string, string> = {
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
export const oncelikRenkleri = {
  DUSUK: "bg-gray-500",
  ORTA: "bg-blue-500",
  YUKSEK: "bg-yellow-500",
  ACIL: "bg-red-500",
} as const; 