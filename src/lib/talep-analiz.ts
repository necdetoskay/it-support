import { prisma } from "@/lib/prisma";
import { anahtarKelimeleriCikar, metindenAnahtarKelimelerCikar } from "@/lib/turkce-kategori-oneri";
import { metniKoklereAyir, kokBazliBenzerlikHesapla } from "@/lib/turkce-stemmer";
import { departmanTani, personelTani, metinVarlikTani } from "@/lib/turkce-entity-tanima";
import { turkishToLower } from "@/lib/turkce-karakter";
import type { KategoriWithKelimeler, DepartmanWithKelimeler, PersonelWithKelimeler } from "@/types/prisma-extensions";

// Talep analizi sonuç tipi
export type TalepAnalizi = {
  departmanId: string | null;
  kategoriId: string | null;
  personelId: string | null;
  onerilenKategoriIdleri: string[];
  onerilenDepartmanIdleri: string[];
  onerilenPersonelIdleri: string[];
  benzerlikPuanlari: {
    kategori: Record<string, number>;
    departman: Record<string, number>;
    personel: Record<string, number>;
  };
  tespit: {
    departmanlar: { id: string; ad: string; benzerlikPuani: number }[];
    personeller: { id: string; tamAd: string; benzerlikPuani: number }[];
  };
}

/**
 * Metin içindeki anahtar kelimeleri çıkaran gelişmiş fonksiyon
 * @param metin Analiz edilecek metin
 * @returns Anahtar kelimeler dizisi
 */
export function anahtarKelimeCikar(metin: string): string[] {
  if (!metin) return [];
  
  // Türkçe karakterleri de içerecek şekilde kelimeleri ayır
  const kelimeler = turkishToLower(metin)
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
    .split(/\s+/)
    .filter(kelime => kelime.length >= 2); // En az 2 karakterli kelimeleri al
  
  // Kök analizi ile kökleri bul
  const kokler = kelimeler.map(kelime => {
    if (kelime.length <= 3) return kelime; // Kısa kelimeleri olduğu gibi bırak
    return metniKoklereAyir(kelime);
  }).flat();
  
  // Tekrarlayan kelimeleri çıkar
  const birlesikKelimeler = [...kelimeler, ...kokler];
  return Array.from(new Set(birlesikKelimeler));
}

/**
 * Talep metnini analiz ederek kategori, departman ve sorumlu personel önerileri oluşturur
 * @param metin Analiz edilecek talep metni
 * @returns Analiz sonuçları
 */
export async function talepMetniAnaliz(metin: string): Promise<TalepAnalizi> {
  // Metin içindeki anahtar kelimeleri çıkar
  const metinAnahtarKelimeleri = anahtarKelimeCikar(metin);
  
  // Varlık tanıma ile departman ve personelleri bul
  const varliklar = await metinVarlikTani(metin);
  
  // Tüm kategorileri ve anahtar kelimelerini getir
  const tumKategoriler = await prisma.kategori.findMany({
    include: {
      kelimeKategoriIliskiler: {
        include: {
          kelime: true
        }
      }
    }
  }) as unknown as KategoriWithKelimeler[];
  
  // Tüm departmanları ve anahtar kelimelerini getir
  const tumDepartmanlar = await prisma.departman.findMany({
    include: {
      kelimeDepartmanIliskiler: {
        include: {
          kelime: true
        }
      }
    }
  }) as unknown as DepartmanWithKelimeler[];
  
  // Tüm personelleri ve anahtar kelimelerini getir
  const tumPersoneller = await prisma.personel.findMany({
    include: {
      kelimePersonelIliskiler: {
        include: {
          kelime: true
        }
      }
    }
  }) as unknown as PersonelWithKelimeler[];
  
  // Kategorilerin benzerlik puanları
  const kategoriBenzerlikleri: Record<string, number> = {};
  
  // Her kategori için benzerlik hesapla
  for (const kategori of tumKategoriler) {
    const kategoriKelimeleri = kategori.kelimeKategoriIliskiler.map(iliski => 
      iliski.kelime.kelime
    );
    
    // Genişletilmiş benzerlik hesaplama
    const benzerlikPuani = hesaplaGelismisJaccardBenzerligi(
      metinAnahtarKelimeleri,
      kategoriKelimeleri
    );
    
    kategoriBenzerlikleri[kategori.id] = benzerlikPuani;
  }
  
  // Departmanların benzerlik puanları
  const departmanBenzerlikleri: Record<string, number> = {};
  
  // Her departman için benzerlik hesapla
  for (const departman of tumDepartmanlar) {
    const departmanKelimeleri = departman.kelimeDepartmanIliskiler.map(iliski => 
      iliski.kelime.kelime
    );
    
    // Temel benzerlik hesapla
    let benzerlikPuani = hesaplaGelismisJaccardBenzerligi(
      metinAnahtarKelimeleri,
      departmanKelimeleri
    );
    
    // Varlık tanıma sonuçlarını entegre et
    const tanima = varliklar.departmanlar.find(d => d.id === departman.id);
    if (tanima) {
      // Varlık tanıma sonucunu ağırlıklı olarak hesaba kat
      benzerlikPuani = (benzerlikPuani * 0.3) + (tanima.benzerlikPuani * 0.7);
    }
    
    departmanBenzerlikleri[departman.id] = benzerlikPuani;
  }
  
  // Personellerin benzerlik puanları
  const personelBenzerlikleri: Record<string, number> = {};
  
  // Her personel için benzerlik hesapla
  for (const personel of tumPersoneller) {
    const personelKelimeleri = personel.kelimePersonelIliskiler.map(iliski => 
      iliski.kelime.kelime
    );
    
    // Temel benzerlik hesapla
    let benzerlikPuani = hesaplaGelismisJaccardBenzerligi(
      metinAnahtarKelimeleri,
      personelKelimeleri
    );
    
    // Varlık tanıma sonuçlarını entegre et
    const tanima = varliklar.personeller.find(p => p.id === personel.id);
    if (tanima) {
      // Varlık tanıma sonucunu ağırlıklı olarak hesaba kat
      benzerlikPuani = (benzerlikPuani * 0.3) + (tanima.benzerlikPuani * 0.7);
    }
    
    personelBenzerlikleri[personel.id] = benzerlikPuani;
  }
  
  // En yüksek puanlı kategori, departman ve personeli bul
  let enYuksekKategoriId: string | null = null;
  let enYuksekKategoriPuan = 0;
  
  let enYuksekDepartmanId: string | null = null;
  let enYuksekDepartmanPuan = 0;
  
  let enYuksekPersonelId: string | null = null;
  let enYuksekPersonelPuan = 0;
  
  // En yüksek puanlı kategoriyi bul
  Object.entries(kategoriBenzerlikleri).forEach(([id, puan]) => {
    if (puan > enYuksekKategoriPuan) {
      enYuksekKategoriPuan = puan;
      enYuksekKategoriId = id;
    }
  });
  
  // En yüksek puanlı departmanı bul
  Object.entries(departmanBenzerlikleri).forEach(([id, puan]) => {
    if (puan > enYuksekDepartmanPuan) {
      enYuksekDepartmanPuan = puan;
      enYuksekDepartmanId = id;
    }
  });
  
  // En yüksek puanlı personeli bul
  Object.entries(personelBenzerlikleri).forEach(([id, puan]) => {
    if (puan > enYuksekPersonelPuan) {
      enYuksekPersonelPuan = puan;
      enYuksekPersonelId = id;
    }
  });
  
  // Eşik değerlerini düşürelim (daha fazla öneri için)
  const KATEGORI_ESIK_DEGERI = 0.08; // %8 benzerlik eşiği
  const DEPARTMAN_ESIK_DEGERI = 0.08; // %8 benzerlik eşiği
  const PERSONEL_ESIK_DEGERI = 0.10; // %10 benzerlik eşiği
  
  if (enYuksekKategoriPuan < KATEGORI_ESIK_DEGERI) {
    enYuksekKategoriId = null;
  }
  
  if (enYuksekDepartmanPuan < DEPARTMAN_ESIK_DEGERI) {
    enYuksekDepartmanId = null;
  }
  
  if (enYuksekPersonelPuan < PERSONEL_ESIK_DEGERI) {
    enYuksekPersonelId = null;
  }
  
  // En yüksek puanlı 3 kategoriyi bul
  const onerilenKategoriIdleri = Object.entries(kategoriBenzerlikleri)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .filter(([_, puan]) => puan >= 0.05) // En az %5 benzerlik olanları göster
    .map(([id, _]) => id);
  
  // En yüksek puanlı 3 departmanı bul
  const onerilenDepartmanIdleri = Object.entries(departmanBenzerlikleri)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .filter(([_, puan]) => puan >= 0.05)
    .map(([id, _]) => id);
  
  // En yüksek puanlı 3 personeli bul
  const onerilenPersonelIdleri = Object.entries(personelBenzerlikleri)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .filter(([_, puan]) => puan >= 0.05)
    .map(([id, _]) => id);
  
  // Sonuçları döndür
  return {
    departmanId: enYuksekDepartmanId,
    kategoriId: enYuksekKategoriId,
    personelId: enYuksekPersonelId,
    onerilenKategoriIdleri,
    onerilenDepartmanIdleri,
    onerilenPersonelIdleri,
    benzerlikPuanlari: {
      kategori: kategoriBenzerlikleri,
      departman: departmanBenzerlikleri,
      personel: personelBenzerlikleri
    },
    tespit: {
      departmanlar: varliklar.departmanlar.map(d => ({
        id: d.id,
        ad: d.ad,
        benzerlikPuani: d.benzerlikPuani
      })),
      personeller: varliklar.personeller.map(p => ({
        id: p.id,
        tamAd: p.tamAd,
        benzerlikPuani: p.benzerlikPuani
      }))
    }
  };
}

/**
 * İki kelime seti arasındaki gelişmiş Jaccard benzerliğini hesaplar
 * Normal Jaccard benzerliğine ek olarak kısmi kelime eşleşmelerini de dikkate alır
 * @param set1 Birinci kelime seti
 * @param set2 İkinci kelime seti
 * @returns 0-1 arası benzerlik puanı (1: tamamen aynı, 0: hiç benzerlik yok)
 */
function hesaplaGelismisJaccardBenzerligi(set1: string[], set2: string[]): number {
  if (set1.length === 0 || set2.length === 0) return 0;
  
  // Kelimeleri köklere indirgeyerek kesişim sayısını arttır
  const kokSet1 = set1.map(kelime => kelime.toLowerCase());
  const kokSet2 = set2.map(kelime => kelime.toLowerCase());
  
  // Tamamen aynı olan kelimeler
  const tamKesisim = kokSet1.filter(kelime => kokSet2.includes(kelime)).length;
  
  // Kısmi eşleşen kelimeler (bir kelime diğerini içeriyorsa)
  let kismiKesisim = 0;
  for (const kelime1 of kokSet1) {
    for (const kelime2 of kokSet2) {
      // Kendisi zaten kesişim kümesindeyse atla
      if (kelime1 === kelime2) continue;
      
      // Kısmi eşleşme kontrolü (minimum 3 karakter eşleşmesi gerekiyor)
      if (
        (kelime1.length >= 3 && kelime2.length >= 3) &&
        (kelime1.includes(kelime2) || kelime2.includes(kelime1))
      ) {
        kismiKesisim += 0.5; // Kısmi eşleşmelere tam eşleşmeden daha düşük değer ver
        break; // Her kelime için bir kez say
      }
    }
  }
  
  // Toplam ağırlıklı kesişim
  const agirlikliKesisim = tamKesisim + kismiKesisim;
  
  // Birleşim sayısı (tekrarsız toplam eleman sayısı)
  const birlesim = Array.from(new Set([...kokSet1, ...kokSet2])).length;
  
  // Jaccard benzerliği hesapla
  return agirlikliKesisim / birlesim;
}

// Kullanıcının seçimlerini dikkate alarak öğrenme yapan tip
export type KullaniciSecimleri = {
  kategoriId?: string;
  departmanId?: string;
  personelId?: string;
  talep: string;
}

// Öğrenme sonuçları
export type OgrenmeSonuclari = {
  kategori: boolean;
  departman: boolean;
  personel: boolean;
  kelimeler: number;
}

/**
 * Kullanıcının yaptığı seçimleri öğrenir ve kelime-kategori ilişkilerini günceller
 * @param kullaniciSecimleri Kullanıcının seçtiği kategori, departman ve personel bilgileri
 * @returns Öğrenme işlemi sonuçları
 */
export async function talepSecimleriniOgren(kullaniciSecimleri: KullaniciSecimleri): Promise<OgrenmeSonuclari> {
  const sonuclar: OgrenmeSonuclari = {
    kategori: false,
    departman: false,
    personel: false,
    kelimeler: 0
  };
  
  // Talep metninden anahtar kelimeleri çıkar
  const anahtarKelimeler = metindenAnahtarKelimelerCikar(kullaniciSecimleri.talep);
  
  // Kategori için anahtar kelimeleri kaydet
  if (kullaniciSecimleri.kategoriId) {
    for (const kelime of anahtarKelimeler) {
      // Kelimeyi bul veya oluştur
      let mevcutKelime = await prisma.kelime.findFirst({
        where: { kelime }
      });
      
      if (!mevcutKelime) {
        mevcutKelime = await prisma.kelime.create({
          data: { kelime }
        });
        sonuclar.kelimeler++;
      }
      
      // Kategori-kelime ilişkisini bul
      const mevcutIliski = await prisma.kelimeKategoriIliski.findFirst({
        where: {
          kelimeId: mevcutKelime.id,
          kategoriId: kullaniciSecimleri.kategoriId
        }
      });
      
      // İlişki yoksa oluştur, varsa ağırlığı artır
      if (!mevcutIliski) {
        await prisma.kelimeKategoriIliski.create({
          data: {
            kelimeId: mevcutKelime.id,
            kategoriId: kullaniciSecimleri.kategoriId,
            agirlik: 1
          }
        });
        sonuclar.kategori = true;
      } else {
        await prisma.kelimeKategoriIliski.update({
          where: { id: mevcutIliski.id },
          data: { agirlik: mevcutIliski.agirlik + 1 }
        });
        sonuclar.kategori = true;
      }
    }
  }
  
  // Departman için anahtar kelimeleri kaydet
  if (kullaniciSecimleri.departmanId) {
    for (const kelime of anahtarKelimeler) {
      // Kelimeyi bul veya oluştur
      let mevcutKelime = await prisma.kelime.findFirst({
        where: { kelime }
      });
      
      if (!mevcutKelime) {
        mevcutKelime = await prisma.kelime.create({
          data: { kelime }
        });
        sonuclar.kelimeler++;
      }
      
      // Departman-kelime ilişkisini bul
      const mevcutIliski = await prisma.kelimeDepartmanIliski.findFirst({
        where: {
          kelimeId: mevcutKelime.id,
          departmanId: kullaniciSecimleri.departmanId
        }
      });
      
      // İlişki yoksa oluştur, varsa ağırlığı artır
      if (!mevcutIliski) {
        await prisma.kelimeDepartmanIliski.create({
          data: {
            kelimeId: mevcutKelime.id,
            departmanId: kullaniciSecimleri.departmanId,
            agirlik: 1
          }
        });
        sonuclar.departman = true;
      } else {
        await prisma.kelimeDepartmanIliski.update({
          where: { id: mevcutIliski.id },
          data: { agirlik: mevcutIliski.agirlik + 1 }
        });
        sonuclar.departman = true;
      }
    }
  }
  
  // Personel için anahtar kelimeleri kaydet
  if (kullaniciSecimleri.personelId) {
    for (const kelime of anahtarKelimeler) {
      // Kelimeyi bul veya oluştur
      let mevcutKelime = await prisma.kelime.findFirst({
        where: { kelime }
      });
      
      if (!mevcutKelime) {
        mevcutKelime = await prisma.kelime.create({
          data: { kelime }
        });
        sonuclar.kelimeler++;
      }
      
      // Personel-kelime ilişkisini bul
      const mevcutIliski = await prisma.kelimePersonelIliski.findFirst({
        where: {
          kelimeId: mevcutKelime.id,
          personelId: kullaniciSecimleri.personelId
        }
      });
      
      // İlişki yoksa oluştur, varsa ağırlığı artır
      if (!mevcutIliski) {
        await prisma.kelimePersonelIliski.create({
          data: {
            kelimeId: mevcutKelime.id,
            personelId: kullaniciSecimleri.personelId,
            agirlik: 1
          }
        });
        sonuclar.personel = true;
      } else {
        await prisma.kelimePersonelIliski.update({
          where: { id: mevcutIliski.id },
          data: { agirlik: mevcutIliski.agirlik + 1 }
        });
        sonuclar.personel = true;
      }
    }
  }
  
  return sonuclar;
} 