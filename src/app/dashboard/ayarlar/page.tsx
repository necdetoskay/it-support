"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KategoriYonetimi } from "./KategoriYonetimi";
import { KullaniciRolleri } from "./KullaniciRolleri";
import { BildirimAyarlari } from "./BildirimAyarlari";
import { ArayuzTercihleri } from "./ArayuzTercihleri";
import { Settings, Users, Bell, Layers } from "lucide-react";

export default function AyarlarPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  
  const getDefaultTab = () => {
    switch (tabParam) {
      case "kategoriler":
        return "kategoriler";
      case "kullanicilar":
        return "kullanicilar";
      case "bildirimler":
        return "bildirimler";
      case "arayuz":
        return "arayuz";
      default:
        return "kategoriler";
    }
  };
  
  const [activeTab, setActiveTab] = useState(getDefaultTab());
  
  // URL parametresi değiştiğinde sekmeyi güncelle
  useEffect(() => {
    setActiveTab(getDefaultTab());
  }, [tabParam]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Sistem Ayarları</h1>
      
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="kategoriler" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span>Kategori Yönetimi</span>
              </TabsTrigger>
              <TabsTrigger value="kullanicilar" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Kullanıcı Rolleri</span>
              </TabsTrigger>
              <TabsTrigger value="bildirimler" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Bildirim Ayarları</span>
              </TabsTrigger>
              <TabsTrigger value="arayuz" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Arayüz Tercihleri</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="kategoriler">
              <KategoriYonetimi />
            </TabsContent>
            
            <TabsContent value="kullanicilar">
              <KullaniciRolleri />
            </TabsContent>
            
            <TabsContent value="bildirimler">
              <BildirimAyarlari />
            </TabsContent>
            
            <TabsContent value="arayuz">
              <ArayuzTercihleri />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 