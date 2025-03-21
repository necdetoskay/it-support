export type TalepIslemTipi =
  | "INCELEME"      // İlk inceleme
  | "COZUM"         // Çözüm uygulandı
  | "GUNCELLEME"    // Durum güncellendi
  | "RED"           // Talep reddedildi
  | "BEKLEMEDE"     // İşlem beklemede
  | "TAMAMLANDI";   // İşlem tamamlandı

export type TalepDurum =
  | "DEVAM_EDIYOR"
  | "TAMAMLANDI"
  | "BEKLEMEDE"
  | "IPTAL";

export interface TalepIslem {
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
    email: string;
  };
  dosyalar: {
    id: string;
    ad: string;
    boyut: number;
    tip: string;
    url: string;
  }[];
}

export interface TalepDetay {
  id: string;
  baslik: string;
  islemler: TalepIslem[];
} 