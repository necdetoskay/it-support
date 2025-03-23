/**
 * Türkçe Varlık Tanıma (Turkish Entity Recognition) Kütüphanesi
 * 
 * Bu kütüphane Türkçe metinlerde departman, personel gibi varlıkları tanımak için
 * geliştirilmiş fonksiyonlar içerir.
 */

import { turkishToLower } from "./turkce-karakter";
import { kelimeKokBul, metniKoklereAyir } from "./turkce-stemmer";
import { prisma } from "./prisma";

/**
 * Departman varlık tanıma sonucu
 */
export interface DepartmanTanima {
  id: string;
  ad: string;
  benzerlikPuani: number;
}

/**
 * Personel varlık tanıma sonucu
 */
export interface PersonelTanima {
  id: string;
  ad: string;
  soyad: string;
  tamAd: string;
  benzerlikPuani: number;
}

/**
 * Metinde departman isimlerini tanır
 * @param metin Analiz edilecek metin
 * @returns Tanınan departmanlar ve benzerlik puanları
 */
export async function departmanTani(metin: string): Promise<DepartmanTanima[]> {
  // Giriş metnindeki olası departman adlarını tanımlamak için metin parçalarını oluştur
  const metinKokleri = metniKoklereAyir(metin);
  const tumDepartmanlar = await prisma.departman.findMany();
  
  const sonuclar: DepartmanTanima[] = [];
  
  // Yaygın departman anahtar kelimeleri
  const departmanKeywords = [
    "departman", "birim", "bölüm", "müdürlük", "direktörlük", "daire", 
    "ofis", "insan", "kaynak", "kaynaklar", "yazılım", "bilgi", "işlem",
    "muhasebe", "satış", "pazarlama", "finans", "üretim", "yönetim", "destek",
    "lojistik", "satın", "alma", "ar-ge", "personel", "teknik", "servis",
    "operasyon", "kalite", "güvence", "it", "bt"
  ];
  
  // Metinde olası departman anahtar kelimelerinin varlığını kontrol et
  const departmanIlgiliKelimeler = metinKokleri.filter(kok => 
    departmanKeywords.some(keyword => 
      kok.includes(keyword) || keyword.includes(kok)
    )
  );
  
  // Her departman için metinde geçme olasılığını kontrol et
  for (const departman of tumDepartmanlar) {
    // Departman adını normalize et
    const departmanAdKokleri = metniKoklereAyir(departman.ad);
    
    // Metin ile departman adı arasında doğrudan tam eşleşme kontrolü
    const normalMetin = turkishToLower(metin).toLowerCase();
    const normalDepartmanAd = turkishToLower(departman.ad).toLowerCase();
    
    // Tam eşleşme var mı?
    const tamEslesme = normalMetin.includes(normalDepartmanAd);
    
    // Departman adının parçalarına bakalım (örn: "İnsan Kaynakları" -> "insan", "kaynak")
    const departmanKelimeParcalari = normalDepartmanAd.split(/\s+/);
    
    // Parça eşleşme puanı - her kelime için kontrol
    let parcaEslesmeSayisi = 0;
    departmanKelimeParcalari.forEach(parca => {
      if (parca.length >= 3 && normalMetin.includes(parca)) {
        parcaEslesmeSayisi++;
      }
    });
    
    const parcaEslesmePuani = departmanKelimeParcalari.length > 0 
      ? parcaEslesmeSayisi / departmanKelimeParcalari.length 
      : 0;
    
    // Kök bazlı benzerlik puanı
    let kokBazliBenzerlik = 0;
    if (departmanIlgiliKelimeler.length > 0 && departmanAdKokleri.length > 0) {
      // Her iki sette de ortak olan köklerin sayısını hesapla
      const ortakKokler = departmanAdKokleri.filter(kok => 
        departmanIlgiliKelimeler.some(metinKok => 
          metinKok === kok || metinKok.includes(kok) || kok.includes(metinKok)
        )
      ).length;
      
      kokBazliBenzerlik = ortakKokler / Math.max(departmanAdKokleri.length, 1);
    }
    
    // Toplam benzerlik puanını hesapla
    let benzerlikPuani = 0;
    
    if (tamEslesme) {
      benzerlikPuani = 1.0; // Tam eşleşme varsa maksimum puan
    } else {
      // Parça eşleşme ve kök bazlı benzerliği birleştir
      benzerlikPuani = (parcaEslesmePuani * 0.6) + (kokBazliBenzerlik * 0.4);
    }
    
    // Belirli bir eşiğin üzerindeki sonuçları ekle
    if (benzerlikPuani >= 0.1) {
      sonuclar.push({
        id: departman.id,
        ad: departman.ad,
        benzerlikPuani
      });
    }
  }
  
  // Sonuçları benzerlik puanına göre sırala
  return sonuclar.sort((a, b) => b.benzerlikPuani - a.benzerlikPuani);
}

/**
 * Metinde personel isimlerini tanır
 * @param metin Analiz edilecek metin
 * @returns Tanınan personel ve benzerlik puanları
 */
export async function personelTani(metin: string): Promise<PersonelTanima[]> {
  const tumPersoneller = await prisma.personel.findMany();
  const sonuclar: PersonelTanima[] = [];
  
  const normalMetin = turkishToLower(metin).toLowerCase();
  
  for (const personel of tumPersoneller) {
    const tamAd = `${personel.ad} ${personel.soyad}`.toLowerCase();
    const normalTamAd = turkishToLower(tamAd);
    
    // Tam ad eşleşmesi kontrolü
    const tamAdEslesme = normalMetin.includes(normalTamAd);
    
    // Ad veya soyad eşleşmesi kontrolü
    const normalAd = turkishToLower(personel.ad).toLowerCase();
    const normalSoyad = turkishToLower(personel.soyad).toLowerCase();
    
    const adEslesme = normalMetin.includes(normalAd);
    const soyadEslesme = normalMetin.includes(normalSoyad);
    
    let benzerlikPuani = 0;
    
    if (tamAdEslesme) {
      benzerlikPuani = 1.0; // Tam ad eşleşmesi varsa maksimum puan
    } else if (adEslesme && soyadEslesme) {
      benzerlikPuani = 0.9; // Ad ve soyad ayrı ayrı geçiyorsa yüksek puan
    } else if (adEslesme) {
      benzerlikPuani = 0.6; // Sadece ad geçiyorsa orta puan
    } else if (soyadEslesme) {
      benzerlikPuani = 0.5; // Sadece soyad geçiyorsa daha düşük puan
    }
    
    // Belirli bir eşiğin üzerindeki sonuçları ekle
    if (benzerlikPuani >= 0.1) {
      sonuclar.push({
        id: personel.id,
        ad: personel.ad,
        soyad: personel.soyad,
        tamAd,
        benzerlikPuani
      });
    }
  }
  
  // Sonuçları benzerlik puanına göre sırala
  return sonuclar.sort((a, b) => b.benzerlikPuani - a.benzerlikPuani);
}

/**
 * Metinden departman ve personelleri tanır
 * @param metin Analiz edilecek metin
 * @returns Tanınan departmanlar ve personeller
 */
export async function metinVarlikTani(metin: string): Promise<{
  departmanlar: DepartmanTanima[];
  personeller: PersonelTanima[];
}> {
  const [departmanlar, personeller] = await Promise.all([
    departmanTani(metin),
    personelTani(metin)
  ]);
  
  return {
    departmanlar,
    personeller
  };
} 