"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileBarChart, FileLineChart, Download, FileSpreadsheet, Printer, Save, 
  RefreshCw, Filter, Calendar, ChevronDown 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, subDays, subMonths } from "date-fns";
import { tr } from "date-fns/locale";
import TalepDurumGrafigi from "./bilesenler/TalepDurumGrafigi";
import TalepTrendGrafigi from "./bilesenler/TalepTrendGrafigi";
import DepartmanPerformansGrafigi from "./bilesenler/DepartmanPerformansGrafigi";
import KategoriDagilimGrafigi from "./bilesenler/KategoriDagilimGrafigi";
import CozumSuresiGrafigi from "./bilesenler/CozumSuresiGrafigi";
import { RaporTipi, RAPOR_TIPLERI } from "./page";

interface RaporDetayProps {
  tip: RaporTipi;
}

export default function RaporDetay({ tip }: RaporDetayProps) {
  const [gorunum, setGorunum] = useState<"grafik" | "tablo">("grafik");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [altTip, setAltTip] = useState<string>("");
  const [filtreler, setFiltreler] = useState({
    tarihAraligi: "son30gun",
    departman: "tumu",
    kategori: "tumu",
    durum: "tumu",
    personel: "tumu"
  });
  const [rapor, setRapor] = useState<any>(null);
  const [tarihAraligi, setTarihAraligi] = useState<string>("son30gun");
  const [departmanId, setDepartmanId] = useState<string>("");
  const [departmanlar, setDepartmanlar] = useState<any[]>([]);
  
  // Rapor tipine göre alt tipleri belirleme
  const altTipler: Record<RaporTipi, Array<{id: string, ad: string}>> = {
    talepler: [
      { id: "talep-durumu", ad: "Talep Durumu Dağılımı" },
      { id: "cozum-suresi", ad: "Çözüm Süresi Analizi" },
      { id: "kategori-dagilimi", ad: "Kategori Dağılımı" },
      { id: "oncelik-dagilimi", ad: "Öncelik Dağılımı" },
      { id: "talep-trendi", ad: "Talep Trendi" }
    ],
    performans: [
      { id: "personel-performansi", ad: "Personel Performansı" },
      { id: "sla-uyumu", ad: "SLA Uyumu" },
      { id: "cozum-ortalamalari", ad: "Çözüm Ortalamaları" },
      { id: "performans-trendi", ad: "Performans Trendi" }
    ],
    departmanlar: [
      { id: "departman-karsilastirma", ad: "Departman Karşılaştırma" },
      { id: "departman-talep-dagilimi", ad: "Departman Talep Dağılımı" },
      { id: "departman-sla", ad: "Departman SLA Analizi" }
    ],
    sla_analizi: [
      { id: "sla-genel-analiz", ad: "Genel SLA Analizi" },
      { id: "sla-departman", ad: "Departman SLA Analizi" },
      { id: "sla-trend", ad: "SLA Trend Analizi" }
    ],
    cozum_suresi: [
      { id: "cozum-departman", ad: "Departman Bazlı Çözüm Süreleri" },
      { id: "cozum-kategori", ad: "Kategori Bazlı Çözüm Süreleri" },
      { id: "cozum-trend", ad: "Çözüm Süresi Trendi" }
    ],
    kullanici_performans: [
      { id: "kullanici-genel", ad: "Genel Kullanıcı Performansı" },
      { id: "kullanici-cozum", ad: "Çözüm Süreleri" },
      { id: "kullanici-sla", ad: "SLA Uyum Analizi" }
    ]
  };
  
  // Metinsel tarih aralığı
  const tarihAraliklari = {
    "bugun": "Bugün",
    "son7gun": "Son 7 Gün",
    "son30gun": "Son 30 Gün",
    "son3ay": "Son 3 Ay",
    "tumu": "Tüm Zamanlar"
  };
  
  // Tarih aralığını hesapla
  const hesaplaTarihAraligi = () => {
    const bugun = new Date();
    let baslangicTarihi = new Date();
    
    switch (tarihAraligi) {
      case "bugun":
        baslangicTarihi = new Date(bugun);
        baslangicTarihi.setHours(0, 0, 0, 0);
        break;
      case "son7gun":
        baslangicTarihi = subDays(bugun, 7);
        break;
      case "son30gun":
        baslangicTarihi = subDays(bugun, 30);
        break;
      case "son3ay":
        baslangicTarihi = subMonths(bugun, 3);
        break;
      case "tumu":
        baslangicTarihi = new Date(2000, 0, 1); // Pratik olarak "tüm zamanlar"
        break;
    }
    
    return {
      baslangic: format(baslangicTarihi, "yyyy-MM-dd"),
      bitis: format(bugun, "yyyy-MM-dd")
    };
  };
  
  const tarihVerisi = hesaplaTarihAraligi();
  
  // Rapor başlığını ve açıklamasını belirle
  const raporBilgisi = RAPOR_TIPLERI[tip] || RAPOR_TIPLERI.talepler;
  
  // Departmanları getir
  useEffect(() => {
    const departmanlariGetir = async () => {
      try {
        const response = await fetch("/api/departments");
        if (!response.ok) {
          throw new Error("Departmanlar getirilemedi");
        }
        const data = await response.json();
        setDepartmanlar(Array.isArray(data.departments) ? data.departments : []);
      } catch (error) {
        console.error("Departmanlar yüklenirken hata:", error);
      }
    };
    
    departmanlariGetir();
  }, []);
  
  // Rapor verilerini yükle
  useEffect(() => {
    const raporuYukle = async () => {
      setYukleniyor(true);
      
      try {
        // Burada gerçek API çağrısı yapılacak
        // Örnek: fetch(`/api/raporlar/${tip}?baslangic=${tarihVerisi.baslangic}&bitis=${tarihVerisi.bitis}&departmanId=${departmanId}`)
        
        // Şimdilik yükleme simülasyonu
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test verisi
        setRapor({
          tip,
          olusturulmaTarihi: new Date().toISOString(),
          tarihAraligi,
          departmanId
        });
      } catch (error) {
        console.error("Rapor verileri yüklenirken hata:", error);
      } finally {
        setYukleniyor(false);
      }
    };
    
    raporuYukle();
  }, [tip, tarihAraligi, departmanId]);
  
  // Başlangıçta ilk alt tipi seç
  useEffect(() => {
    if (altTipler[tip].length > 0) {
      setAltTip(altTipler[tip][0].id);
    }
    
    // Yükleniyor durumunu simüle et
    setTimeout(() => {
      setYukleniyor(false);
    }, 1000);
  }, [tip]);
  
  // Raporu yükleme fonksiyonu
  const raporuYukle = () => {
    setYukleniyor(true);
    
    // API çağrısı burada yapılabilir
    
    setTimeout(() => {
      setYukleniyor(false);
    }, 800);
  };
  
  // Başlık oluşturma
  const baslikOlustur = () => {
    let baslik = "";
    
    switch (tip) {
      case "talepler":
        baslik = "Talep Raporları";
        break;
      case "performans":
        baslik = "Performans Raporları";
        break;
      case "departmanlar":
        baslik = "Departman Raporları";
        break;
      case "sla_analizi":
        baslik = "SLA Uyum Analizi";
        break;
      case "cozum_suresi":
        baslik = "Çözüm Süresi Analizi";
        break;
      case "kullanici_performans":
        baslik = "Kullanıcı Performans Analizi";
        break;
      default:
        baslik = "Rapor";
        break;
    }
    
    const seciliAltTip = altTipler[tip].find(t => t.id === altTip);
    if (seciliAltTip) {
      baslik += " - " + seciliAltTip.ad;
    }
    
    return baslik;
  };
  
  // Alt tip seçici oluşturma
  const altTipSeciciOlustur = () => {
    return (
      <div className="w-full max-w-xl">
        <Select value={altTip} onValueChange={setAltTip}>
          <SelectTrigger>
            <SelectValue placeholder="Rapor Tipi" />
          </SelectTrigger>
          <SelectContent>
            {altTipler[tip].map((altTip) => (
              <SelectItem key={altTip.id} value={altTip.id}>
                {altTip.ad}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };
  
  // Farklı rapor tipleri için farklı içerikler
  const renderRaporIcerigi = () => {
    if (yukleniyor) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[250px]" />
          <Skeleton className="h-[250px]" />
          <Skeleton className="h-[250px]" />
          <Skeleton className="h-[250px]" />
        </div>
      );
    }
    
    switch (tip) {
      case "talepler":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Talep Durumu</CardTitle>
                  <CardDescription>Taleplerin mevcut durumlarına göre dağılımı</CardDescription>
                </CardHeader>
                <CardContent>
                  <TalepDurumGrafigi />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Talep Eğilimi</CardTitle>
                  <CardDescription>Zaman içindeki talep sayısı değişimi</CardDescription>
                </CardHeader>
                <CardContent>
                  <TalepTrendGrafigi />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Kategori Dağılımı</CardTitle>
                <CardDescription>En çok talep alan kategoriler</CardDescription>
              </CardHeader>
              <CardContent>
                <KategoriDagilimGrafigi />
              </CardContent>
            </Card>
          </div>
        );
      
      case "performans":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Departman Performansı</CardTitle>
                  <CardDescription>Departmanların SLA uyum oranları</CardDescription>
                </CardHeader>
                <CardContent>
                  <DepartmanPerformansGrafigi />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Çözüm Süresi Trendi</CardTitle>
                  <CardDescription>Aylara göre ortalama çözüm süreleri</CardDescription>
                </CardHeader>
                <CardContent>
                  <CozumSuresiGrafigi />
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case "departmanlar":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Departman Bazlı Talep Dağılımı</CardTitle>
                <CardDescription>Departmanlara göre talep sayıları ve çözüm oranları</CardDescription>
              </CardHeader>
              <CardContent>
                <DepartmanPerformansGrafigi />
              </CardContent>
            </Card>
          </div>
        );
        
      case "sla_analizi":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">SLA Uyum Analizi</CardTitle>
                <CardDescription>SLA kurallarına uyum ve istisna analizleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-20 text-center text-muted-foreground">
                  SLA analiz grafikleri burada görüntülenecek
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case "cozum_suresi":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Çözüm Süresi Analizi</CardTitle>
                <CardDescription>Talep türlerine ve önceliklere göre çözüm süreleri</CardDescription>
              </CardHeader>
              <CardContent>
                <CozumSuresiGrafigi />
              </CardContent>
            </Card>
          </div>
        );
          
      case "kullanici_performans":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Kullanıcı Performansı</CardTitle>
                <CardDescription>Kullanıcı bazlı çözüm süreleri ve talep istatistikleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-20 text-center text-muted-foreground">
                  Kullanıcı performans grafikleri burada görüntülenecek
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return (
          <div className="py-10 text-center text-muted-foreground">
            Bu rapor tipi için içerik bulunamadı.
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">
            {raporBilgisi.baslik}
          </h2>
          <p className="text-muted-foreground">
            {raporBilgisi.aciklama}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                {tarihAraliklari[tarihAraligi as keyof typeof tarihAraliklari]}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(tarihAraliklari).map(([key, label]) => (
                <DropdownMenuItem 
                  key={key}
                  onClick={() => setTarihAraligi(key)}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {tip === "departmanlar" && (
            <Select value={departmanId} onValueChange={setDepartmanId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tüm departmanlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tüm departmanlar</SelectItem>
                {departmanlar.map(dep => (
                  <SelectItem key={dep.id} value={dep.id}>{dep.ad}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Button variant="outline" size="sm" onClick={() => setYukleniyor(true)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        </div>
      </div>
      
      <div className="p-1 bg-muted/40 rounded-lg">
        <div className="text-sm text-muted-foreground p-2">
          <span className="font-medium">Tarih Aralığı:</span> {format(new Date(tarihVerisi.baslangic), "d MMMM yyyy", { locale: tr })} - {format(new Date(tarihVerisi.bitis), "d MMMM yyyy", { locale: tr })}
        </div>
      </div>
      
      {renderRaporIcerigi()}
      
      <Card>
        <CardFooter className="flex justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            Rapor oluşturulma tarihi: {yukleniyor ? "Yükleniyor..." : format(new Date(), "d MMMM yyyy HH:mm", { locale: tr })}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Yazdır
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              İndir
            </Button>
            
            <Button variant="default" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Kaydet
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 