/**
 * Türkçe karakter dönüşümleri için yardımcı fonksiyonlar
 */

/**
 * Türkçe metni küçük harfe dönüştürür
 * @param text Dönüştürülecek metin
 * @returns Küçük harfe dönüştürülmüş metin
 */
export function turkishToLower(text: string): string {
  if (!text) return "";
  
  return text
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .replace(/Ğ/g, "ğ")
    .replace(/Ü/g, "ü")
    .replace(/Ş/g, "ş")
    .replace(/Ö/g, "ö")
    .replace(/Ç/g, "ç")
    .toLowerCase();
}

/**
 * Türkçe metni büyük harfe dönüştürür
 * @param text Dönüştürülecek metin
 * @returns Büyük harfe dönüştürülmüş metin
 */
export function turkishToUpper(text: string): string {
  if (!text) return "";
  
  return text
    .replace(/i/g, "İ")
    .replace(/ı/g, "I")
    .replace(/ğ/g, "Ğ")
    .replace(/ü/g, "Ü")
    .replace(/ş/g, "Ş")
    .replace(/ö/g, "Ö")
    .replace(/ç/g, "Ç")
    .toUpperCase();
}

/**
 * Türkçe karakterleri ASCII karakterlere dönüştürür
 * @param text Dönüştürülecek metin
 * @returns ASCII karakterlere dönüştürülmüş metin
 */
export function turkishToAscii(text: string): string {
  if (!text) return "";
  
  return text
    .replace(/İ/g, "I")
    .replace(/ı/g, "i")
    .replace(/Ğ/g, "G")
    .replace(/ğ/g, "g")
    .replace(/Ü/g, "U")
    .replace(/ü/g, "u")
    .replace(/Ş/g, "S")
    .replace(/ş/g, "s")
    .replace(/Ö/g, "O")
    .replace(/ö/g, "o")
    .replace(/Ç/g, "C")
    .replace(/ç/g, "c");
} 