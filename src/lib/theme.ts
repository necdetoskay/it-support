import { createContext, useContext, useState, useEffect } from "react";

// Tema ayarları için tip tanımları
export type ThemeColorPreset = {
  name: string;
  primary: string;
  accent: string;
  secondary: string;
  background: string;
};

export type ViewType = "table" | "list" | "grid";

export type ThemePreferences = {
  viewType: ViewType;
  pageSize: number;
  theme: "light" | "dark" | "system";
  fontSize: number;
  animationSpeed: number;
  compactMode: boolean;
  showFilters: boolean;
  colorPreset: ThemeColorPreset;
};

// Renk presetleri
export const colorPresets: ThemeColorPreset[] = [
  { name: "Varsayılan", primary: "#0284c7", accent: "#0ea5e9", secondary: "#64748b", background: "#ffffff" },
  { name: "Koyu Mavi", primary: "#1e40af", accent: "#3b82f6", secondary: "#334155", background: "#f8fafc" },
  { name: "Yeşil", primary: "#059669", accent: "#10b981", secondary: "#475569", background: "#f8fafc" },
  { name: "Mor", primary: "#7c3aed", accent: "#8b5cf6", secondary: "#4b5563", background: "#ffffff" },
  { name: "Turuncu", primary: "#ea580c", accent: "#f97316", secondary: "#525252", background: "#fafafa" },
];

// Varsayılan tema tercihleri
export const defaultThemePreferences: ThemePreferences = {
  viewType: "table",
  pageSize: 10,
  theme: "light",
  fontSize: 16,
  animationSpeed: 300,
  compactMode: false,
  showFilters: true,
  colorPreset: colorPresets[0],
};

// Tema tercihlerini localStorage'a kaydetme - Server-side render güvenliği eklendi
export const saveThemePreferences = (preferences: ThemePreferences) => {
  if (typeof window === "undefined") return; // Server-side'da çalışırsa, işlemi atla

  try {
    localStorage.setItem("themePreferences", JSON.stringify(preferences));
  } catch (e) {
    console.error("Tema tercihleri kaydedilirken hata:", e);
  }
};

// Tema tercihlerini localStorage'dan yükleme - Server-side render güvenliği eklendi
export const loadThemePreferences = (): ThemePreferences => {
  if (typeof window === "undefined") return defaultThemePreferences; // Server-side'da varsayılanları döndür

  try {
    const saved = localStorage.getItem("themePreferences");
    if (saved) {
      return JSON.parse(saved) as ThemePreferences;
    }
  } catch (e) {
    console.error("Tema tercihleri yüklenirken hata:", e);
  }
  
  return defaultThemePreferences;
};

// CSS değişkenlerini güncelleme - Server-side render güvenliği eklendi
export const applyThemeToDOM = (preferences: ThemePreferences) => {
  if (typeof document === "undefined") return; // Server-side'da çalışırsa, işlemi atla
  
  try {
    const root = document.documentElement;
    
    // Tema değişkenlerini root style olarak ayarla
    const primaryColor = preferences.colorPreset.primary;
    const accentColor = preferences.colorPreset.accent;
    const secondaryColor = preferences.colorPreset.secondary;
    const backgroundColor = preferences.colorPreset.background;
    
    // Renkleri CSS değişkenlerine uygula - string literal olarak ayarla
    root.style.setProperty("--color-primary", primaryColor);
    root.style.setProperty("--color-accent", accentColor);
    root.style.setProperty("--color-secondary", secondaryColor);
    root.style.setProperty("--color-background", backgroundColor);
    
    // Tailwind CSS değişkenlerini de güncelle
    updateThemeColorValues(primaryColor, accentColor, secondaryColor, backgroundColor);
    
    // Diğer tercihleri CSS değişkenlerine uygula
    root.style.setProperty("--font-size-base", `${preferences.fontSize}px`);
    root.style.setProperty("--animation-speed", `${preferences.animationSpeed}ms`);
    
    // Tema sınıfını güncelle - html elementine doğrudan uygula
    if (preferences.theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      document.body.dataset.theme = "dark";
    } else if (preferences.theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
      document.body.dataset.theme = "light";
    } else {
      // Sistem teması için tarayıcı tercihini kontrol et
      if (typeof window !== "undefined") {
        const systemDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (systemDarkMode) {
          root.classList.add("dark");
          root.classList.remove("light");
          document.body.dataset.theme = "dark";
        } else {
          root.classList.add("light");
          root.classList.remove("dark");
          document.body.dataset.theme = "light";
        }
      }
    }
    
    // Kompakt mod için sınıf ekle veya çıkar
    if (preferences.compactMode) {
      root.classList.add("compact");
    } else {
      root.classList.remove("compact");
    }
    
    // Uygulanan tema değişikliğini göstermek için consola log yaz
    console.log("Tema uygulandı:", {
      theme: preferences.theme,
      colors: preferences.colorPreset,
      fontSize: preferences.fontSize,
      animationSpeed: preferences.animationSpeed,
      compactMode: preferences.compactMode
    });
  } catch (e) {
    console.error("Tema DOM'a uygulanırken hata:", e);
  }
};

// Tailwind CSS değişkenlerini güncelleyen yardımcı fonksiyon
const updateThemeColorValues = (primary: string, accent: string, secondary: string, background: string) => {
  if (typeof document === "undefined") return;
  
  try {
    const root = document.documentElement;
    
    // Tailwind tarafından kullanılan CSS değişkenlerini güncelle
    root.style.setProperty("--bg-theme-primary", primary);
    root.style.setProperty("--bg-theme-accent", accent);
    root.style.setProperty("--bg-theme-secondary", secondary);
    root.style.setProperty("--bg-theme-background", background);
    
    root.style.setProperty("--text-theme-primary", primary);
    root.style.setProperty("--text-theme-accent", accent);
    root.style.setProperty("--text-theme-secondary", secondary);
    
    root.style.setProperty("--border-theme-primary", primary);
    root.style.setProperty("--border-theme-accent", accent);
    root.style.setProperty("--border-theme-secondary", secondary);
    
    // Butonlara ve diğer tema sınıfı kullananlara doğrudan stil ekle
    const styleId = "dynamic-theme-styles";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    // CSS değişkenlerini !important ile geçersiz kıl
    styleElement.textContent = `
      .theme-primary { 
        background-color: ${primary} !important; 
        color: white !important;
      }
      .theme-accent { 
        background-color: ${accent} !important;
        color: white !important; 
      }
      .theme-secondary { 
        background-color: ${secondary} !important;
        color: white !important;
      }
      .theme-border { 
        border-color: ${primary} !important;
        color: ${primary} !important;
      }
      
      /* Tailwind ile kullanım için */
      .bg-theme-primary { background-color: ${primary} !important; }
      .bg-theme-accent { background-color: ${accent} !important; }
      .bg-theme-secondary { background-color: ${secondary} !important; }
      .bg-theme-background { background-color: ${background} !important; }
      
      .text-theme-primary { color: ${primary} !important; }
      .text-theme-accent { color: ${accent} !important; }
      .text-theme-secondary { color: ${secondary} !important; }
      
      .border-theme-primary { border-color: ${primary} !important; }
      .border-theme-accent { border-color: ${accent} !important; }
      .border-theme-secondary { border-color: ${secondary} !important; }
    `;
  } catch (e) {
    console.error("Tema renk değerleri güncellenirken hata:", e);
  }
};

// Tema Context API
type ThemeContextType = {
  preferences: ThemePreferences;
  updatePreferences: (newPreferences: Partial<ThemePreferences>) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  preferences: defaultThemePreferences,
  updatePreferences: () => {},
});

export const useTheme = () => useContext(ThemeContext); 