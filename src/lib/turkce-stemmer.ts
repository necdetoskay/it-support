/**
 * Türkçe Kök Analizi (Turkish Stemming) Kütüphanesi
 * 
 * Bu kütüphane Türkçe kelimelerin köklerini bulma işlemi için basit bir implementasyon sunar.
 * Türkçe'de yaygın ekleri kaldırarak kelimelerin temel formlarını bulmayı hedefler.
 */

// Türkçe'de yaygın kullanılan çekim ekleri
const ekler = [
  // İsim çekim ekleri
  "ler", "lar", // Çoğul ekleri
  "in", "ın", "un", "ün", // İlgi eki (Genitif)
  "i", "ı", "u", "ü", // Belirtme eki (Akuzatif)
  "e", "a", // Yönelme eki (Datif)
  "de", "da", "te", "ta", // Bulunma eki (Lokatif)
  "den", "dan", "ten", "tan", // Ayrılma eki (Ablatif)
  "le", "la", "ile", "yla", "yle", // Vasıta eki (Enstrümantal)
  
  // İyelik ekleri
  "im", "ım", "um", "üm", // Tekil 1. şahıs
  "in", "ın", "un", "ün", // Tekil 2. şahıs
  "i", "ı", "u", "ü", "si", "sı", "su", "sü", // Tekil 3. şahıs
  "imiz", "ımız", "umuz", "ümüz", // Çoğul 1. şahıs
  "iniz", "ınız", "unuz", "ünüz", // Çoğul 2. şahıs
  "leri", "ları", // Çoğul 3. şahıs
  
  // Fiil çekim ekleri
  "di", "dı", "du", "dü", "ti", "tı", "tu", "tü", // Geçmiş zaman
  "miş", "mış", "muş", "müş", // Duyulan geçmiş zaman
  "yor", // Şimdiki zaman
  "ecek", "acak", // Gelecek zaman
  "er", "ar", "ir", "ır", "ur", "ür", // Geniş zaman
  "meli", "malı", // Gereklilik kipi
  "se", "sa", // Dilek-şart kipi
  
  // Fiilden isim yapım ekleri
  "mek", "mak", // Mastar eki
  "me", "ma", // İş/eylem ismi
  "en", "an", // Sıfat fiil/ortaç
  "dik", "dık", "duk", "dük", "tik", "tık", "tuk", "tük", // İsim fiil
  
  // Yapım ekleri
  "li", "lı", "lu", "lü", // Sahiplik belirten sıfat
  "siz", "sız", "suz", "süz", // Yokluk belirten sıfat
  "ci", "cı", "cu", "cü", "çi", "çı", "çu", "çü", // Meslek/uğraş
  "lik", "lık", "luk", "lük", // Soyut isim
];

/**
 * Verilen kelimenin olası kökünü bulur
 * @param kelime Kökü bulunacak kelime
 * @returns Kelimenin olası kökü
 */
export function kelimeKokBul(kelime: string): string {
  if (!kelime || kelime.length <= 3) return kelime;
  
  let kok = kelime.toLowerCase();
  
  // Eğer kelime 3 harften kısaysa, kök olarak kabul et
  if (kok.length <= 3) return kok;
  
  // Ekleri kontrol et ve çıkar
  for (const ek of ekler) {
    if (kok.length > ek.length + 2 && kok.endsWith(ek)) {
      kok = kok.slice(0, -ek.length);
      break; // Bir ek çıkardıktan sonra dur (basit bir algoritma için)
    }
  }
  
  return kok;
}

/**
 * Bir cümledeki tüm kelimeleri köklere ayırır
 * @param metin Köklere ayrılacak metin
 * @returns Her kelimenin kökünden oluşan dizi
 */
export function metniKoklereAyir(metin: string): string[] {
  if (!metin) return [];
  
  const kelimeler = metin.toLowerCase()
    .replace(/[^\wıiğüşöçİĞÜŞÖÇ]/g, " ")
    .split(/\s+/)
    .filter(kelime => kelime.length >= 3);
  
  return kelimeler.map(kelime => kelimeKokBul(kelime));
}

/**
 * İki kelime kümesi arasında kök bazlı benzerlik hesaplar
 * @param set1 Birinci kelime kümesi
 * @param set2 İkinci kelime kümesi
 * @returns Benzerlik oranı (0-1 arası)
 */
export function kokBazliBenzerlikHesapla(set1: string[], set2: string[]): number {
  if (!set1.length || !set2.length) return 0;
  
  // Kelimeleri köklere ayır
  const kokSet1 = set1.map(kelime => kelimeKokBul(kelime));
  const kokSet2 = set2.map(kelime => kelimeKokBul(kelime));
  
  // Kesişim sayısı
  const kesisim = kokSet1.filter(kok => 
    kokSet2.some(k2 => k2 === kok || k2.includes(kok) || kok.includes(k2))
  ).length;
  
  // Birleşim sayısı
  const birlesim = new Set([...kokSet1, ...kokSet2]).size;
  
  // Jaccard benzerliği hesapla
  return birlesim > 0 ? kesisim / birlesim : 0;
}

/**
 * İki metin arasındaki benzerliği hesaplar
 * @param metin1 Birinci metin
 * @param metin2 İkinci metin
 * @returns Benzerlik puanı (0-1 arası)
 */
export function metinBenzerligiHesapla(metin1: string, metin2: string): number {
  const kokler1 = metniKoklereAyir(metin1);
  const kokler2 = metniKoklereAyir(metin2);
  
  return kokBazliBenzerlikHesapla(kokler1, kokler2);
} 