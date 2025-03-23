"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Check, Monitor, Moon, Paintbrush, Palette, Sun, Grid3X3, LayoutList, Table2, Type } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/lib/theme";
import { colorPresets, ThemeColorPreset } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ArayuzTercihleri() {
  const { preferences, updatePreferences } = useTheme();
  
  // Renk paleti için geçici durum
  const [selectedColorPreset, setSelectedColorPreset] = useState(0);
  const [customColors, setCustomColors] = useState<ThemeColorPreset>(preferences.colorPreset);
  
  // Sayfa yüklendiğinde renk paleti seçimini mevcut tema ayarlarından belirle
  useEffect(() => {
    // Mevcut renk presetini bul
    const presetIndex = colorPresets.findIndex(preset => 
      preset.primary === preferences.colorPreset.primary &&
      preset.accent === preferences.colorPreset.accent &&
      preset.secondary === preferences.colorPreset.secondary
    );
    
    // Eğer eşleşen preset varsa, onu seç
    if (presetIndex !== -1) {
      setSelectedColorPreset(presetIndex);
    } else {
      // Yoksa özel renk olarak ayarla
      setSelectedColorPreset(-1);
    }
    
    // Mevcut renkleri özel renk alanlarına ayarla
    setCustomColors(preferences.colorPreset);
  }, [preferences.colorPreset]);

  // Tercih kaydetme işlemi
  const savePreferences = () => {
    // Renk presetini güncelle
    updatePreferences({
      colorPreset: customColors
    });
    toast.success("Arayüz tercihleri başarıyla kaydedildi.");
  };

  // Önizleme renk güncellemesi
  const handleColorPresetSelect = (index: number) => {
    setSelectedColorPreset(index);
    setCustomColors(colorPresets[index]);
  };

  // Özel renk güncellemesi
  const handleCustomColorChange = (key: keyof ThemeColorPreset, value: string) => {
    if (key === 'name') return; // İsmi değiştirmeyi engelle
    setCustomColors(prev => ({ ...prev, [key]: value }));
    setSelectedColorPreset(-1); // Özel renk moduna geç
  };

  // Tema Seçimi bölümü için doğrudan seçim işleyicisi
  const handleThemeChange = (value: string) => {
    // Tema değişikliğini hemen uygula
    updatePreferences({ theme: value as "light" | "dark" | "system" });
    
    // Kullanıcıya bildirim göster
    toast.success(`Tema başarıyla değiştirildi: ${value === 'light' ? 'Açık' : value === 'dark' ? 'Koyu' : 'Sistem'}`);
    
    // Tema değişikliğini doğrudan body'ye uygula (yedek mekanizma)
    if (value === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else if (value === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      const systemDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", systemDarkMode);
      document.documentElement.classList.toggle("light", !systemDarkMode);
    }
  };

  // Renk değişikliklerini anında uygulamak için yeni fonksiyon
  const applyColorPreset = (index: number) => {
    // Önce preset'i seç
    handleColorPresetSelect(index);
    
    // Sonra değişiklikleri anında uygula
    updatePreferences({
      colorPreset: colorPresets[index]
    });
    
    toast.success(`${colorPresets[index].name} renk paleti uygulandı`);
  };
  
  // Özel renkleri anında uygulamak için fonksiyon
  const applyCustomColor = (key: keyof ThemeColorPreset, value: string) => {
    const newColors = { ...customColors, [key]: value };
    
    // Renk değişikliğini anında uygula
    updatePreferences({
      colorPreset: newColors
    });
    
    // State'i de güncelle
    setCustomColors(newColors);
    setSelectedColorPreset(-1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Arayüz Tercihleri</h2>
        <Button onClick={savePreferences}>Tercihleri Kaydet</Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="appearance">Görünüm</TabsTrigger>
          <TabsTrigger value="layout">Düzen</TabsTrigger>
          <TabsTrigger value="colors">Renkler</TabsTrigger>
        </TabsList>

        {/* GENEL TAB */}
        <TabsContent value="general" className="space-y-4 pt-4">
          {/* Görünüm Tipi */}
          <Card>
            <CardHeader>
              <CardTitle>Görünüm Tipi</CardTitle>
              <CardDescription>Verilerin nasıl görüntüleneceğini seçin</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={preferences.viewType} 
                onValueChange={(value) => updatePreferences({ viewType: value as "table" | "list" | "grid" })} 
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem value="table" id="view-table" className="peer sr-only" />
                  <Label
                    htmlFor="view-table"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Table2 className="mb-3 h-6 w-6" />
                    Tablo Görünümü
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="list" id="view-list" className="peer sr-only" />
                  <Label
                    htmlFor="view-list"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <LayoutList className="mb-3 h-6 w-6" />
                    Liste Görünümü
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="grid" id="view-grid" className="peer sr-only" />
                  <Label
                    htmlFor="view-grid"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Grid3X3 className="mb-3 h-6 w-6" />
                    Kart Görünümü
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Sayfa Boyutu */}
          <Card>
            <CardHeader>
              <CardTitle>Sayfa Boyutu</CardTitle>
              <CardDescription>Sayfa başına gösterilecek öğe sayısı</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={preferences.pageSize.toString()} 
                onValueChange={(value) => updatePreferences({ pageSize: parseInt(value) })} 
                className="grid grid-cols-5 gap-4"
              >
                {[5, 10, 20, 50, 100].map((size) => (
                  <div key={size}>
                    <RadioGroupItem value={size.toString()} id={`page-size-${size}`} className="peer sr-only" />
                    <Label
                      htmlFor={`page-size-${size}`}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
          
          {/* Animasyon Hızı */}
          <Card>
            <CardHeader>
              <CardTitle>Animasyon Hızı</CardTitle>
              <CardDescription>Animasyonların tamamlanma süresi (ms)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <Label>Yavaş</Label>
                  <Label>{preferences.animationSpeed}ms</Label>
                  <Label>Hızlı</Label>
                </div>
                <Slider
                  min={100}
                  max={500}
                  step={50}
                  value={[preferences.animationSpeed]}
                  onValueChange={(value) => updatePreferences({ animationSpeed: value[0] })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GÖRÜNÜM TAB */}
        <TabsContent value="appearance" className="space-y-4 pt-4">
          {/* Tema Seçimi */}
          <Card>
            <CardHeader>
              <CardTitle>Tema</CardTitle>
              <CardDescription>Kullanıcı arayüzünüz için bir tema seçin</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={preferences.theme} 
                onValueChange={handleThemeChange}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
                  <Label
                    htmlFor="theme-light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Sun className="mb-3 h-6 w-6" />
                    Açık Tema
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
                  <Label
                    htmlFor="theme-dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Moon className="mb-3 h-6 w-6" />
                    Koyu Tema
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
                  <Label
                    htmlFor="theme-system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Monitor className="mb-3 h-6 w-6" />
                    Sistem Teması
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Yazı Tipi Boyutu */}
          <Card>
            <CardHeader>
              <CardTitle>Yazı Tipi Boyutu</CardTitle>
              <CardDescription>Arayüz yazı tipi boyutunu ayarlayın</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <Label>Küçük</Label>
                  <Label className="font-medium" style={{fontSize: `${preferences.fontSize}px`}}>{preferences.fontSize}px</Label>
                  <Label>Büyük</Label>
                </div>
                <Slider
                  min={12}
                  max={20}
                  step={1}
                  value={[preferences.fontSize]}
                  onValueChange={(value) => updatePreferences({ fontSize: value[0] })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Type className="h-4 w-4" />
                <span className="text-sm" style={{fontSize: `${preferences.fontSize}px`}}>Bu metin seçtiğiniz yazı tipi boyutunu gösterir.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DÜZEN TAB */}
        <TabsContent value="layout" className="space-y-4 pt-4">
          {/* Kompakt Mod */}
          <Card>
            <CardHeader>
              <CardTitle>Kompakt Mod</CardTitle>
              <CardDescription>Kullanıcı arayüzünün daha kompakt bir versiyonunu kullanın</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="compact-mode" className="flex-1">Kompakt mod etkinleştir</Label>
                <Switch
                  id="compact-mode"
                  checked={preferences.compactMode}
                  onCheckedChange={(checked) => updatePreferences({ compactMode: checked })}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Kompakt mod, arayüzdeki boşlukları azaltarak daha fazla içeriğin ekranda görünmesini sağlar.
              </p>
            </CardContent>
          </Card>

          {/* Filtreleri Göster */}
          <Card>
            <CardHeader>
              <CardTitle>Filtreleri Göster</CardTitle>
              <CardDescription>Arama ve filtreleme seçeneklerini özelleştirin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="show-filters" className="flex-1">Filtreleri göster</Label>
                <Switch
                  id="show-filters"
                  checked={preferences.showFilters}
                  onCheckedChange={(checked) => updatePreferences({ showFilters: checked })}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Bu seçenek kapatıldığında, arama ve filtreleme seçenekleri gizlenir ve gerektiğinde bir düğme ile açılabilir.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RENKLER TAB */}
        <TabsContent value="colors" className="space-y-4 pt-4">
          {/* Renk Paletleri */}
          <Card>
            <CardHeader>
              <CardTitle>Renk Paleti</CardTitle>
              <CardDescription>Arayüzün görünümünü değiştirmek için bir renk paleti seçin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {colorPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => applyColorPreset(index)}
                    className={cn(
                      "relative p-2 rounded-lg border border-border h-20 w-full transition-all",
                      selectedColorPreset === index && "ring-2 ring-primary"
                    )}
                  >
                    <div className="absolute inset-0 m-2 rounded overflow-hidden">
                      <div className="h-1/2" style={{ backgroundColor: preset.primary }}></div>
                      <div className="h-1/4" style={{ backgroundColor: preset.accent }}></div>
                      <div className="h-1/4" style={{ backgroundColor: preset.secondary }}></div>
                    </div>
                    <div className="absolute bottom-1 right-1">
                      {selectedColorPreset === index && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Özel Renkler */}
          <Card>
            <CardHeader>
              <CardTitle>Özel Renkler</CardTitle>
              <CardDescription>Kendi renk kombinasyonunuzu oluşturun</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color" className="flex items-center">
                    <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: customColors.primary }}></div>
                    Ana Renk
                  </Label>
                  <div className="flex">
                    <input
                      type="color"
                      id="primary-color"
                      value={customColors.primary}
                      onChange={(e) => applyCustomColor('primary', e.target.value)}
                      className="w-10 h-10 rounded-l-md cursor-pointer border-0"
                    />
                    <Input
                      type="text"
                      value={customColors.primary}
                      onChange={(e) => applyCustomColor('primary', e.target.value)}
                      className="flex-1 rounded-l-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent-color" className="flex items-center">
                    <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: customColors.accent }}></div>
                    Vurgu Rengi
                  </Label>
                  <div className="flex">
                    <input
                      type="color"
                      id="accent-color"
                      value={customColors.accent}
                      onChange={(e) => applyCustomColor('accent', e.target.value)}
                      className="w-10 h-10 rounded-l-md cursor-pointer border-0"
                    />
                    <Input
                      type="text"
                      value={customColors.accent}
                      onChange={(e) => applyCustomColor('accent', e.target.value)}
                      className="flex-1 rounded-l-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color" className="flex items-center">
                    <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: customColors.secondary }}></div>
                    İkincil Renk
                  </Label>
                  <div className="flex">
                    <input
                      type="color"
                      id="secondary-color"
                      value={customColors.secondary}
                      onChange={(e) => applyCustomColor('secondary', e.target.value)}
                      className="w-10 h-10 rounded-l-md cursor-pointer border-0"
                    />
                    <Input
                      type="text"
                      value={customColors.secondary}
                      onChange={(e) => applyCustomColor('secondary', e.target.value)}
                      className="flex-1 rounded-l-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="background-color" className="flex items-center">
                    <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: customColors.background }}></div>
                    Arka Plan Rengi
                  </Label>
                  <div className="flex">
                    <input
                      type="color"
                      id="background-color"
                      value={customColors.background}
                      onChange={(e) => applyCustomColor('background', e.target.value)}
                      className="w-10 h-10 rounded-l-md cursor-pointer border-0"
                    />
                    <Input
                      type="text"
                      value={customColors.background}
                      onChange={(e) => applyCustomColor('background', e.target.value)}
                      className="flex-1 rounded-l-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="p-3 border rounded-md w-full theme-transition">
                <div className="text-sm font-medium mb-2">Önizleme</div>
                <div className="grid grid-cols-4 gap-2" style={{ backgroundColor: customColors.background, padding: "12px", borderRadius: "6px" }}>
                  <Button variant="theme-primary" className="theme-primary">
                    Ana Renk
                  </Button>
                  <Button variant="theme-accent" className="theme-accent">
                    Vurgu
                  </Button>
                  <Button variant="theme-secondary" className="theme-secondary">
                    İkincil
                  </Button>
                  <Button variant="theme-outline" className="theme-border">
                    Kenarlık
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 