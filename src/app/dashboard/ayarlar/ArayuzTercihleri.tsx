"use client";

import React, { useState } from "react";
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

// Renk presetleri
const colorPresets = [
  { name: "Varsayılan", primary: "#0284c7", accent: "#0ea5e9", secondary: "#64748b", background: "#ffffff" },
  { name: "Koyu Mavi", primary: "#1e40af", accent: "#3b82f6", secondary: "#334155", background: "#f8fafc" },
  { name: "Yeşil", primary: "#059669", accent: "#10b981", secondary: "#475569", background: "#f8fafc" },
  { name: "Mor", primary: "#7c3aed", accent: "#8b5cf6", secondary: "#4b5563", background: "#ffffff" },
  { name: "Turuncu", primary: "#ea580c", accent: "#f97316", secondary: "#525252", background: "#fafafa" },
];

export function ArayuzTercihleri() {
  // Durum değişkenleri
  const [viewType, setViewType] = useState<"table" | "list" | "grid">("table");
  const [pageSize, setPageSize] = useState<number>(10);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [fontSize, setFontSize] = useState<number>(16);
  const [animationSpeed, setAnimationSpeed] = useState<number>(300);
  const [compactMode, setCompactMode] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [selectedColorPreset, setSelectedColorPreset] = useState<number>(0);
  const [customColors, setCustomColors] = useState(colorPresets[0]);
  
  // Tercih kaydetme işlemi
  const savePreferences = () => {
    // API çağrısı veya localStorage'a kaydetme işlemleri burada yapılabilir
    toast.success("Arayüz tercihleri başarıyla kaydedildi.");
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
                value={viewType} 
                onValueChange={(value) => setViewType(value as "table" | "list" | "grid")} 
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
                value={pageSize.toString()} 
                onValueChange={(value) => setPageSize(parseInt(value))} 
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
                  <Label>{animationSpeed}ms</Label>
                  <Label>Hızlı</Label>
                </div>
                <Slider
                  min={100}
                  max={500}
                  step={50}
                  value={[animationSpeed]}
                  onValueChange={(value) => setAnimationSpeed(value[0])}
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
                value={theme} 
                onValueChange={(value) => setTheme(value as "light" | "dark" | "system")} 
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
                  <Label className="font-medium" style={{fontSize: `${fontSize}px`}}>{fontSize}px</Label>
                  <Label>Büyük</Label>
                </div>
                <Slider
                  min={12}
                  max={20}
                  step={1}
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Type className="h-4 w-4" />
                <span className="text-sm" style={{fontSize: `${fontSize}px`}}>Bu metin seçtiğiniz yazı tipi boyutunu gösterir.</span>
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
                  checked={compactMode}
                  onCheckedChange={setCompactMode}
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
                  checked={showFilters}
                  onCheckedChange={setShowFilters}
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
              <CardDescription>Kullanıcı arayüzü için bir renk paleti seçin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {colorPresets.map((preset, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-md p-3 border-2 flex flex-col items-center justify-center ${
                      selectedColorPreset === index ? "border-primary" : "border-muted"
                    }`}
                    onClick={() => {
                      setSelectedColorPreset(index);
                      setCustomColors(preset);
                    }}
                  >
                    <div className="flex space-x-2 mb-2">
                      <div className="h-5 w-5 rounded-full" style={{ backgroundColor: preset.primary }}></div>
                      <div className="h-5 w-5 rounded-full" style={{ backgroundColor: preset.accent }}></div>
                      <div className="h-5 w-5 rounded-full" style={{ backgroundColor: preset.secondary }}></div>
                    </div>
                    <span className="text-sm font-medium">{preset.name}</span>
                    {selectedColorPreset === index && (
                      <Check className="h-4 w-4 text-primary mt-1" />
                    )}
                  </div>
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
                      onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                      className="w-10 h-10 rounded-l-md cursor-pointer border-0"
                    />
                    <Input
                      type="text"
                      value={customColors.primary}
                      onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
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
                      onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                      className="w-10 h-10 rounded-l-md cursor-pointer border-0"
                    />
                    <Input
                      type="text"
                      value={customColors.accent}
                      onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
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
                      onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                      className="w-10 h-10 rounded-l-md cursor-pointer border-0"
                    />
                    <Input
                      type="text"
                      value={customColors.secondary}
                      onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
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
                      onChange={(e) => setCustomColors({ ...customColors, background: e.target.value })}
                      className="w-10 h-10 rounded-l-md cursor-pointer border-0"
                    />
                    <Input
                      type="text"
                      value={customColors.background}
                      onChange={(e) => setCustomColors({ ...customColors, background: e.target.value })}
                      className="flex-1 rounded-l-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="p-3 border rounded-md w-full">
                <div className="text-sm font-medium mb-2">Önizleme</div>
                <div className="grid grid-cols-4 gap-2" style={{ backgroundColor: customColors.background, padding: "12px", borderRadius: "6px" }}>
                  <Button style={{ backgroundColor: customColors.primary, color: "white" }}>
                    Ana Renk
                  </Button>
                  <Button style={{ backgroundColor: customColors.accent, color: "white" }}>
                    Vurgu
                  </Button>
                  <Button style={{ backgroundColor: customColors.secondary, color: "white" }}>
                    İkincil
                  </Button>
                  <Button variant="outline" style={{ borderColor: customColors.primary, color: customColors.primary }}>
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