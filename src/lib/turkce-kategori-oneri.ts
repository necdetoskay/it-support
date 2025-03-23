import { turkishToLower } from "./turkce-karakter";
import { prisma } from "@/lib/prisma";
import { Kategori } from "@prisma/client";

// Türkçe için özel karakterleri normalize et - basit iç versiyon
function metniNormallestirBasic(metin: string): string {
  return metin
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
}

// Türkçe stopword listesi (çıkarılacak yaygın kelimeler)
const stopWords = [
  "ve", "veya", "ile", "için", "bu", "bir", "da", "de", "mi", "gibi", 
  "ama", "fakat", "ancak", "çünkü", "dolayı", "tarafından", "sonra", "önce",
  "kadar", "var", "yok", "olan", "olarak", "üzere", "şekilde", "şekil",
  "merhaba", "iyi", "günler", "rica", "ederim", "ediyorum", "lütfen"
];

// Metinden anahtar kelimeleri çıkarır
export function anahtarKelimeleriCikar(metin: string): string[] {
  // Boş ise boş dizi döndür
  if (!metin || metin.trim() === "") return [];

  // Özel karakterleri temizleyerek kelimelere ayır
  const kelimeler = turkishToLower(metin)
    .replace(/[^\wıiğüşöçİĞÜŞÖÇ]/g, " ")
    .split(/\s+/)
    .filter((kelime) => kelime.length > 2); // 2 karakterden uzun kelimeleri al

  // Tekrar eden kelimeleri çıkar ve dizi olarak döndür
  return Array.from(new Set(kelimeler));
}

// İki kelime kümesi arasındaki benzerliği hesaplar (Jaccard benzerliği)
export function benzerlikHesapla(set1: string[], set2: string[]): number {
  if (set1.length === 0 || set2.length === 0) return 0;

  // Kesişim sayısını bul
  const kesisim = set1.filter((item) => set2.includes(item));

  // Birleşim sayısını hesapla
  const birlesim = Array.from(new Set([...set1, ...set2])).length;

  // Jaccard benzerlik katsayısı: Kesişim / Birleşim
  return kesisim.length / birlesim;
}

// Metne en uygun kategoriyi öner
export async function kategoriOner(
  baslik: string,
  aciklama: string
): Promise<{ kategori: Kategori | null; benzerlik: number }> {
  try {
    // Metinlerdeki anahtar kelimeleri çıkar
    const metinKelimeleri = [
      ...anahtarKelimeleriCikar(baslik),
      ...anahtarKelimeleriCikar(aciklama),
    ];

    // Eğer metin boşsa veya anahtar kelimeler çıkarılamadıysa null döndür
    if (metinKelimeleri.length === 0) {
      return { kategori: null, benzerlik: 0 };
    }

    // Tüm kategorileri ve anahtar kelimelerini getir
    const kategoriler = await prisma.kategori.findMany({
      include: {
        kategoriAnahtarKelimeleri: {
          include: {
            anahtarKelime: true,
          },
        },
      },
    });

    let enYuksekBenzerlik = 0;
    let enUygunKategori: Kategori | null = null;

    // Her kategori için benzerlik hesapla
    for (const kategori of kategoriler) {
      const kategoriKelimeleri = kategori.kategoriAnahtarKelimeleri.map(
        (item) => item.anahtarKelime.kelime
      );

      // Kategori adını ve açıklamasını da anahtar kelime olarak ekle
      if (kategori.ad) {
        kategoriKelimeleri.push(...anahtarKelimeleriCikar(kategori.ad));
      }
      if (kategori.aciklama) {
        kategoriKelimeleri.push(...anahtarKelimeleriCikar(kategori.aciklama));
      }

      // Tekrar eden kelimeleri çıkar
      const benzersizKategoriKelimeleri = Array.from(new Set(kategoriKelimeleri));

      // Benzerlik hesapla
      const benzerlik = benzerlikHesapla(metinKelimeleri, benzersizKategoriKelimeleri);

      // Daha yüksek benzerlik varsa güncelle
      if (benzerlik > enYuksekBenzerlik) {
        enYuksekBenzerlik = benzerlik;
        enUygunKategori = kategori;
      }
    }

    return {
      kategori: enUygunKategori,
      benzerlik: enYuksekBenzerlik,
    };
  } catch (error) {
    console.error("Kategori önerme hatası:", error);
    return { kategori: null, benzerlik: 0 };
  }
}

// Türkçe teknik terimler için özel anahtar kelime eşleştirme
export async function teknikTerimEslestir(metin: string) {
  // BT alanında sık kullanılan terimleri kategorilerle eşleştir
  const teknikTerimler: Record<string, string[]> = {
    "donanim": ["bilgisayar", "monitör", "monitor", "yazıcı", "printer", "tarayıcı", "scanner", "fare", "mouse", "klavye", "keyboard", "ekran", "projektor", "projeksiyon", "donanim", "cihaz", "pc", "laptop"],
    "yazilim": ["program", "uygulama", "windows", "excel", "word", "powerpoint", "outlook", "office", "yazılım", "software", "program", "güncelleme", "update", "lisans", "license"],
    "ag": ["internet", "wifi", "bağlantı", "baglanti", "ağ", "ag", "network", "erişim", "erisim", "server", "sunucu", "router", "modem", "ip", "dns", "web", "site", "sayfa", "page"],
    "email": ["eposta", "e-posta", "mail", "e-mail", "outlook", "gmail", "yahoo", "hotmail", "posta", "mesaj", "kutus"],
    "guvenlik": ["şifre", "sifre", "parola", "password", "güvenlik", "guvenlik", "security", "erişim", "erisim", "izin", "yetki", "virus", "virüs", "malware", "spam", "hack", "korsanlik"]
  };
  
  const normalMetin = metniNormallestir(metin);
  const eslesmeSkoru: Record<string, number> = {};
  
  // Her kategori için eşleşme sayısını hesapla
  Object.entries(teknikTerimler).forEach(([kategori, terimler]) => {
    eslesmeSkoru[kategori] = 0;
    
    terimler.forEach(terim => {
      const normalTerim = metniNormallestirBasic(terim);
      if (normalMetin.includes(normalTerim)) {
        eslesmeSkoru[kategori] += 1;
      }
    });
  });
  
  // Eşleşme skoru 0'dan büyük olan kategorileri döndür
  const eslesmeler = Object.entries(eslesmeSkoru)
    .filter(([_, skor]) => skor > 0)
    .map(([kategori, skor]) => ({ kategori, skor }))
    .sort((a, b) => b.skor - a.skor);
  
  return eslesmeler;
}

// Ana kategori öneri fonksiyonu - hibrit yaklaşım
export async function hibridKategoriOner(baslik: string, sorunDetay: string) {
  try {
    const talepMetni = `${baslik} ${sorunDetay}`;
    
    // 1. Teknik terim eşleştirme (doğrudan eşleşme)
    const teknikEslesmeler = await teknikTerimEslestir(talepMetni);
    
    // 2. Genel benzerlik analizi
    const benzerlikSonuclari = await kategoriOner(baslik, sorunDetay);
    
    // 3. Kategori IDlerini getir
    const kategoriKodlari = await prisma.kategori.findMany({
      select: {
        id: true,
        ad: true
      }
    });
    
    // 4. Teknik eşleşme bulunduysa öncelikle onu kullan
    if (teknikEslesmeler.length > 0) {
      const sonuclar = [];
      
      for (const esleme of teknikEslesmeler) {
        // Eşleşen kategoriye ait ID'yi bul
        const bulunanKategori = kategoriKodlari.find(k => 
          metniNormallestirBasic(k.ad).includes(esleme.kategori)
        );
        
        if (bulunanKategori) {
          sonuclar.push({
            id: bulunanKategori.id,
            ad: bulunanKategori.ad,
            skor: esleme.skor * 20 // Teknik eşleşmelere daha yüksek ağırlık ver
          });
        }
      }
      
      // Teknik eşleşme sonuçları varsa, benzerlik sonuçlarıyla birleştir
      if (sonuclar.length > 0) {
        // Benzersiz sonuçlar için ID'leri kullan
        const eslesmisIDler = sonuclar.map(s => s.id);
        
        // Henüz eşleşmemiş benzerlik sonuçlarını ekle
        if (benzerlikSonuclari.kategori) {
          if (!eslesmisIDler.includes(benzerlikSonuclari.kategori.id)) {
            sonuclar.push({
              id: benzerlikSonuclari.kategori.id,
              ad: benzerlikSonuclari.kategori.ad,
              skor: benzerlikSonuclari.benzerlik * 100
            });
          }
        }
        
        // Tüm sonuçları birleştir ve en iyi 3'ünü al
        return sonuclar
          .sort((a, b) => b.skor - a.skor)
          .slice(0, 3)
          .map(s => s.id);
      }
    }
    
    // Teknik eşleşme yoksa, benzerlik sonuçlarını kullan
    if (benzerlikSonuclari.kategori) {
      return [benzerlikSonuclari.kategori.id];
    }
    
    return [];
    
  } catch (error) {
    console.error("Hibrit kategori önerisi oluşturulurken hata:", error);
    return [];
  }
}

// Metinden anahtar kelimeler çıkar - eğitim için
export function metindenAnahtarKelimelerCikar(metin: string): string[] {
  const normalMetin = metniNormallestir(metin);
  
  // Kelimeler ayır
  const tumKelimeler = normalMetin.split(/\s+/).filter(k => k.length > 2);
  
  // Stopwords kelimelerini çıkar
  const filtrelenmisKelimeler = tumKelimeler.filter(k => !stopWords.includes(k));
  
  // Kelime frekanslarını say
  const kelimeFrekansları: Record<string, number> = {};
  filtrelenmisKelimeler.forEach(kelime => {
    kelimeFrekansları[kelime] = (kelimeFrekansları[kelime] || 0) + 1;
  });
  
  // En sık tekrarlanan 10 kelimeyi bul
  return Object.entries(kelimeFrekansları)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([kelime]) => kelime);
}

/**
 * Metni basit bir şekilde analiz ederek uygun kategorileri önerir
 * @param metin Analiz edilecek talep metni
 * @param kategoriler Mevcut kategoriler listesi
 * @returns Önerilen kategori ID'lerinin listesi
 */
export async function oneriKategoriGetir(
  metin: string, 
  kategoriler: Array<{ id: string; ad: string }>
): Promise<string[]> {
  // Metni normalize et ve anahtar kelimelere ayır
  const normalizeMetin = turkishToLower(metin).toLowerCase();
  
  // Kategori eşleştirme puanları
  const kategoriPuanlari = new Map<string, number>();
  
  // Her kategori için bir eşleştirme puanı başlat
  kategoriler.forEach(kategori => {
    kategoriPuanlari.set(kategori.id, 0);
  });
  
  // Donanım ile ilgili anahtar kelimeler
  const donanim = [
    "bilgisayar", "monitör", "monitor", "ekran", "fare", "mouse", 
    "klavye", "keyboard", "yazıcı", "printer", "tarayıcı", "scanner",
    "donanım", "cihaz", "laptop", "pc", "masaüstü", "dizüstü", "tablet",
    "projeksiyon", "projektor", "kablo", "bağlantı", "bozuldu", "arızalı",
    "çalışmıyor", "açılmıyor", "kapanmıyor", "yanıt vermiyor"
  ];
  
  // Yazılım ile ilgili anahtar kelimeler
  const yazilim = [
    "program", "uygulama", "yazılım", "software", "windows", "office", 
    "excel", "word", "powerpoint", "outlook", "teams", "zoom", "lisans", 
    "güncelleme", "update", "yükleme", "kurulum", "install", "hata",
    "error", "bug", "çöküyor", "donuyor", "kasıyor", "yavaş", "virüs",
    "antivirus", "güvenlik", "security"
  ];
  
  // Ağ ile ilgili anahtar kelimeler
  const ag = [
    "internet", "wifi", "bağlantı", "connection", "ağ", "network", 
    "kablosuz", "wireless", "ethernet", "modem", "router", "erişim",
    "access", "ip", "dns", "sunucu", "server", "web", "site", "mail",
    "e-posta", "email", "bağlanamıyor", "kopuyor", "yavaş", "ping"
  ];
  
  // Sistem ile ilgili anahtar kelimeler
  const sistem = [
    "sistem", "system", "yetki", "izin", "permission", "access", "hesap",
    "account", "şifre", "password", "parola", "login", "giriş", "çıkış",
    "logout", "yedek", "backup", "veritabanı", "database", "sunucu",
    "server", "domain", "active directory", "grup", "group", "policy"
  ];
  
  // Metni anahtar kelimelere göre analiz et
  donanim.forEach(keyword => {
    if (normalizeMetin.includes(keyword)) {
      const kategori = kategoriler.find(k => k.ad.toLowerCase().includes("donanım"));
      if (kategori) {
        const mevcutPuan = kategoriPuanlari.get(kategori.id) || 0;
        kategoriPuanlari.set(kategori.id, mevcutPuan + 1);
      }
    }
  });
  
  yazilim.forEach(keyword => {
    if (normalizeMetin.includes(keyword)) {
      const kategori = kategoriler.find(k => k.ad.toLowerCase().includes("yazılım"));
      if (kategori) {
        const mevcutPuan = kategoriPuanlari.get(kategori.id) || 0;
        kategoriPuanlari.set(kategori.id, mevcutPuan + 1);
      }
    }
  });
  
  ag.forEach(keyword => {
    if (normalizeMetin.includes(keyword)) {
      const kategori = kategoriler.find(k => k.ad.toLowerCase().includes("ağ"));
      if (kategori) {
        const mevcutPuan = kategoriPuanlari.get(kategori.id) || 0;
        kategoriPuanlari.set(kategori.id, mevcutPuan + 1);
      }
    }
  });
  
  sistem.forEach(keyword => {
    if (normalizeMetin.includes(keyword)) {
      const kategori = kategoriler.find(k => k.ad.toLowerCase().includes("sistem"));
      if (kategori) {
        const mevcutPuan = kategoriPuanlari.get(kategori.id) || 0;
        kategoriPuanlari.set(kategori.id, mevcutPuan + 1);
      }
    }
  });
  
  // Puanlara göre sırala ve en yüksek 3 kategoriyi döndür
  const siraliKategoriler = Array.from(kategoriPuanlari.entries())
    .sort((a, b) => b[1] - a[1])
    .filter(([_, puan]) => puan > 0)
    .map(([id, _]) => id)
    .slice(0, 3);
  
  // En az bir eşleşme yoksa en çok kullanılan kategoriyi öner
  if (siraliKategoriler.length === 0) {
    return kategoriler.length > 0 ? [kategoriler[0].id] : [];
  }
  
  return siraliKategoriler;
}

/**
 * Türkçe metni normalize eder
 * Bu fonksiyon gelecekte daha kapsamlı işlevler için genişletilebilir
 */
export function metniNormallestir(metin: string): string {
  if (!metin) return "";
  
  return metin
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9]/g, ' ')
    .replace(/\s+/g, ' ');
} 