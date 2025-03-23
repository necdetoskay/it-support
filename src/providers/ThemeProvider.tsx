"use client";

import { ReactNode, useEffect, useState } from "react";
import { 
  ThemeContext, 
  ThemePreferences, 
  defaultThemePreferences, 
  loadThemePreferences, 
  saveThemePreferences,
  applyThemeToDOM
} from "@/lib/theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Tema tercihlerini localStorage'dan yükle veya varsayılanları kullan
  const [preferences, setPreferences] = useState<ThemePreferences>(defaultThemePreferences);
  const [initialized, setInitialized] = useState(false);

  // Sayfa yüklendiğinde tercihleri localStorage'dan yükle
  useEffect(() => {
    // Varsayılan tema ayarlarını hemen uygula
    applyThemeToDOM(defaultThemePreferences);
    
    try {
      // Önce varsayılan temayı uygula ve sonra localStorage'daki değerleri kontrol et
      const loadedPreferences = loadThemePreferences();
      
      // localStorage'dan gelen verileri güvenli bir şekilde doğrula
      if (loadedPreferences && 
          typeof loadedPreferences === 'object' && 
          loadedPreferences.colorPreset && 
          loadedPreferences.theme) {
        
        setPreferences(loadedPreferences);
        
        // 100ms gecikme ile uygula (render sonrası DOM güncellemesi için)
        setTimeout(() => {
          applyThemeToDOM(loadedPreferences);
          console.log("Tema yüklendi ve uygulandı:", loadedPreferences);
        }, 100);
      } else {
        console.warn("Geçersiz tema verileri, varsayılanlar kullanılıyor");
        applyThemeToDOM(defaultThemePreferences);
      }
    } catch (e) {
      console.error("Tema tercihleri yüklenirken hata:", e);
      // Hata durumunda varsayılan temayla devam et
      applyThemeToDOM(defaultThemePreferences);
    }
    
    setInitialized(true);
  }, []);

  // Tercihleri güncelleme fonksiyonu
  const updatePreferences = (newPreferences: Partial<ThemePreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    
    try {
      saveThemePreferences(updatedPreferences);
      
      // Tema değişikliğini anında uygula ve console.log ile doğrula
      applyThemeToDOM(updatedPreferences);
      console.log("Tema güncellendi ve uygulandı:", updatedPreferences);
    } catch (e) {
      console.error("Tema güncellenirken hata:", e);
    }
  };

  // Sistem teması değişikliklerini dinle
  useEffect(() => {
    if (!initialized) return;
    
    // Sistem teması değiştiğinde kontrol et
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (preferences.theme === 'system') {
        applyThemeToDOM(preferences);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preferences, initialized]);

  // Tema tercihlerini güncellediğimizde CSS değişkenlerini güncelle
  useEffect(() => {
    if (initialized) {
      applyThemeToDOM(preferences);
    }
  }, [preferences, initialized]);

  return (
    <ThemeContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </ThemeContext.Provider>
  );
} 