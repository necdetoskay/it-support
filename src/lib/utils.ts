import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow as formatDistanceToNowOriginal } from "date-fns"
import { tr } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistanceToNow(date: Date): string {
  return formatDistanceToNowOriginal(date, { locale: tr })
}

export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

/**
 * LocalStorage'dan veri almak için güvenli bir yöntem
 */
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    
    // Token değerlerini direkt döndür, JSON parse etme
    if (key === 'token') return item as unknown as T;
    
    // Diğer değerler için JSON.parse
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error getting localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * LocalStorage'a veri kaydetmek için güvenli bir yöntem
 */
export function setLocalStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // Token değerleri için direkt kaydet
    if (key === 'token' && typeof value === 'string') {
      localStorage.setItem(key, value);
      return;
    }
    
    // Diğer değerler için JSON.stringify
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

/**
 * Kullanıcı kimlik doğrulama verilerini temizler
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // Tüm kimlik doğrulama verilerini temizle
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    
    // Cookie'yi temizle
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
  } catch (error) {
    console.error("Kimlik doğrulama verileri temizlenirken hata:", error);
  }
}
