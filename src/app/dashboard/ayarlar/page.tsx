"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KullaniciRolleri } from "./KullaniciRolleri";
import { KategoriYonetimi } from "./KategoriYonetimi";
import { BildirimAyarlari } from "./BildirimAyarlari";
import { ArayuzTercihleri } from "./ArayuzTercihleri";
import { Settings, Users, Bell, Layers, Database, DatabaseIcon } from "lucide-react";
import VeritabaniYonetimi from "./VeritabaniYonetimi";
import { VeriYonetimi } from "./VeriYonetimi";

// SearchParams kullanan bileşen
export default function AyarlarPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams ? searchParams.get('tab') : null;
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    // URL'den sekme parametresini al, yoksa varsayılan olarak "kategoriler" kullan
    const tab = tabParam || 'kategoriler';
    setActiveTab(getCurrentTab(tab));
  }, [tabParam]);

  const getCurrentTab = (tab: string): string => {
    switch (tab) {
      case "kullanicilar":
        return "kullanicilar";
      case "bildirimler":
        return "bildirimler";
      case "arayuz":
        return "arayuz";
      case "veritabani":
        return "veritabani";
      case "veriyonetimi":
        return "veriyonetimi";
      default:
        return "kategoriler";
    }
  };

  return (
    <div className="w-full p-4 md:p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Ayarlar</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="arayuz" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Arayüz</span>
              </TabsTrigger>
              <TabsTrigger value="kullanicilar" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Kullanıcılar</span>
              </TabsTrigger>
              <TabsTrigger value="bildirimler" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Bildirimler</span>
              </TabsTrigger>
              <TabsTrigger value="kategoriler" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span>Kategoriler</span>
              </TabsTrigger>
              <TabsTrigger value="veritabani" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Veritabanı</span>
              </TabsTrigger>
              <TabsTrigger value="veriyonetimi" className="flex items-center gap-2">
                <DatabaseIcon className="h-4 w-4" />
                <span>Veri Yönetimi</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="arayuz">
              <ArayuzTercihleri />
            </TabsContent>
            
            <TabsContent value="kullanicilar">
              <KullaniciRolleri />
            </TabsContent>
            
            <TabsContent value="bildirimler">
              <BildirimAyarlari />
            </TabsContent>
            
            <TabsContent value="kategoriler">
              <KategoriYonetimi />
            </TabsContent>
            
            <TabsContent value="veritabani">
              <VeritabaniYonetimi />
            </TabsContent>

            <TabsContent value="veriyonetimi">
              <VeriYonetimi />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 