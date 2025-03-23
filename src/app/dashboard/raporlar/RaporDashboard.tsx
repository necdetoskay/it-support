"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, RefreshCw, Save, Filter, Clock, User, FileBarChart, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import TalepDurumGrafigi from "./bilesenler/TalepDurumGrafigi";
import TalepTrendGrafigi from "./bilesenler/TalepTrendGrafigi";
import DepartmanPerformansGrafigi from "./bilesenler/DepartmanPerformansGrafigi";
import KategoriDagilimGrafigi from "./bilesenler/KategoriDagilimGrafigi";
import CozumSuresiGrafigi from "./bilesenler/CozumSuresiGrafigi";
import { RaporTipi, RAPOR_TIPLERI } from "./page";

interface RaporDashboardProps {
  raporDetayAc: (tip: RaporTipi) => void;
}

export default function RaporDashboard({ raporDetayAc }: RaporDashboardProps) {
  const [aktifSekme, setAktifSekme] = useState("genel");
  const [yukleniyor, setYukleniyor] = useState<boolean>(true);
  const [departmanlar, setDepartmanlar] = useState<{ id: string; ad: string }[]>([]);
  const [kategoriler, setKategoriler] = useState<{ id: string; ad: string }[]>([]);
  const [seciliDepartman, setSeciliDepartman] = useState<string>("");
  const [seciliKategori, setSeciliKategori] = useState<string>("");
  const [tarih, setTarih] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [filtrelerAcik, setFiltrelerAcik] = useState(false);

  // Verileri yükle
  useEffect(() => {
    const verileriYukle = async () => {
      try {
        setYukleniyor(true);
        
        // Departman ve kategorileri getir
        const [departmanlarRes, kategorilerRes] = await Promise.all([
          fetch('/api/departments'),
          fetch('/api/kategoriler')
        ]);
        
        if (!departmanlarRes.ok || !kategorilerRes.ok) {
          throw new Error("Veriler alınırken bir hata oluştu");
        }
        
        const depData = await departmanlarRes.json();
        const katData = await kategorilerRes.json();
        
        setDepartmanlar(depData.departments || []);
        setKategoriler(katData || []);
      } catch (error) {
        console.error("Veriler yüklenirken hata:", error);
      } finally {
        setYukleniyor(false);
      }
    };
    
    verileriYukle();
  }, []);

  // Raporları güncelle
  const raporlariGuncelle = () => {
    // Raporları güncelleme mantığı...
    console.log("Raporlar güncelleniyor...");
  };

  // Hızlı rapor öğesi oluştur
  const HizliRaporOgesi = ({ 
    tip, 
    baslik, 
    aciklama, 
    ikon 
  }: { 
    tip: RaporTipi; 
    baslik: string; 
    aciklama: string; 
    ikon: React.ReactNode 
  }) => {
    return (
      <Card 
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => raporDetayAc(tip)}
      >
        <CardContent className="p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-primary/10 p-2 rounded-full">
              {ikon}
            </div>
            <h3 className="font-medium text-sm">{baslik}</h3>
          </div>
          <p className="text-xs text-muted-foreground">{aciklama}</p>
        </CardContent>
      </Card>
    );
  };

  // Yükleme ekranını göster
  if (yukleniyor) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Tabs value={aktifSekme} onValueChange={setAktifSekme}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="genel">Genel Bakış</TabsTrigger>
            <TabsTrigger value="hizliRaporlar">Hızlı Raporlar</TabsTrigger>
            <TabsTrigger value="sonRaporlar">Son Raporlar</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setFiltrelerAcik(!filtrelerAcik)}>
              <Filter className="h-4 w-4 mr-1" />
              Filtreler
            </Button>
            
            <Button variant="outline" size="sm" onClick={raporlariGuncelle}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Yenile
            </Button>
          </div>
        </div>
        
        {filtrelerAcik && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <Label>Departman</Label>
              <Select value={seciliDepartman} onValueChange={setSeciliDepartman}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm departmanlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm departmanlar</SelectItem>
                  {departmanlar.map(dep => (
                    <SelectItem key={dep.id} value={dep.id}>{dep.ad}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={seciliKategori} onValueChange={setSeciliKategori}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm kategoriler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm kategoriler</SelectItem>
                  {kategoriler.map(kat => (
                    <SelectItem key={kat.id} value={kat.id}>{kat.ad}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tarih Aralığı</Label>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {tarih}
              </Button>
            </div>
            
            <div className="flex items-end">
              <Button className="w-full">Filtreleri Uygula</Button>
            </div>
          </div>
        )}
      
        <TabsContent value="genel" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <TalepDurumGrafigi />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <TalepTrendGrafigi />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <DepartmanPerformansGrafigi />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <CozumSuresiGrafigi />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <KategoriDagilimGrafigi />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hizliRaporlar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Hızlı rapor seçenekleri */}
            {Object.entries(RAPOR_TIPLERI).map(([key, value]) => (
              <HizliRaporOgesi 
                key={key}
                tip={key as RaporTipi}
                baslik={value.baslik}
                aciklama={value.aciklama}
                ikon={value.ikon}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="sonRaporlar">
          <div className="bg-muted/30 rounded-lg p-6 text-center">
            <p className="text-muted-foreground">Henüz kaydedilmiş rapor bulunmamaktadır.</p>
            <Button className="mt-4" onClick={() => raporDetayAc("talepler")}>
              İlk Raporu Oluştur
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Label bileşeni (yardımcı)
function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium mb-1.5">{children}</div>;
} 