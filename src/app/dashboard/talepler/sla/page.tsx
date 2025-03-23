"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Search, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Component imports
import { SLAModal, SLAKurali, Kategori, slaFormSchema } from "./SLAModal";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { ViewOptions, ViewMode } from "./ViewOptions";
import { SLATable } from "./SLATable";
import { SLAList } from "./SLAList";
import { SLACard } from "./SLACard";

// Sayfalama türü
interface Pagination {
  toplamKayit: number;
  toplamSayfa: number;
  mevcutSayfa: number;
  limit: number;
}

export default function SLAKurallariSayfasi() {
  // State tanımları
  const [slaKurallari, setSlaKurallari] = useState<SLAKurali[]>([]);
  const [filtrelenmisKurallar, setFiltrelenmisKurallar] = useState<SLAKurali[]>([]);
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aramaMetni, setAramaMetni] = useState("");
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [seciliSLA, setSeciliSLA] = useState<SLAKurali | null>(null);
  const [silmeModalAcik, setSilmeModalAcik] = useState(false);
  const [hata, setHata] = useState("");
  const [gorunumModu, setGorunumModu] = useState<ViewMode>("table");
  
  // Sayfalama state'leri
  const [sayfa, setSayfa] = useState(1);
  const [sayfaBoyutu, setSayfaBoyutu] = useState(10);
  const [sayfalama, setSayfalama] = useState<Pagination | null>(null);

  // Veri çekme işlemleri
  const slaKurallariGetir = async () => {
    try {
      setYukleniyor(true);
      setHata("");
      
      // Sayfalama ve arama parametreleriyle API çağrısı yap
      const url = new URL("/api/sla", window.location.origin);
      url.searchParams.append("sayfalama", "true");
      url.searchParams.append("page", sayfa.toString());
      url.searchParams.append("limit", sayfaBoyutu.toString());
      
      if (aramaMetni) {
        url.searchParams.append("search", aramaMetni);
      }
      
      console.log("API isteği URL:", url.toString()); // API isteği URL'ini loglama
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("SLA kuralları getirilirken bir hata oluştu");
      }
      
      const result = await response.json();
      console.log("API yanıtı:", JSON.stringify(result, null, 2)); // API yanıtını daha detaylı loglama
      
      // API, sayfalama bilgisi ile birlikte geliyor mu kontrol et
      if (result.data && result.pagination) {
        console.log("Sayfalama bilgisi mevcut:", result.pagination);
        setSlaKurallari(result.data);
        setFiltrelenmisKurallar(result.data);
        setSayfalama(result.pagination);
      } else {
        // Eski API yanıt formatı
        console.log("Sayfalama bilgisi mevcut değil, ham veri kullanılıyor");
        setSlaKurallari(result);
        setFiltrelenmisKurallar(result);
        setSayfalama(null);
      }
    } catch (error) {
      console.error("SLA kuralları getirilemedi:", error);
      setHata("SLA kuralları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setYukleniyor(false);
    }
  };

  const kategorileriGetir = async () => {
    try {
      const response = await fetch("/api/kategoriler");
      
      if (!response.ok) {
        throw new Error("Kategoriler getirilirken bir hata oluştu");
      }
      
      const data = await response.json();
      setKategoriler(data);
    } catch (error) {
      console.error("Kategoriler getirilemedi:", error);
      toast.error("Kategoriler yüklenirken bir hata oluştu");
    }
  };

  // İlk yükleme için özel bir fonksiyon
  const ilkYukleme = async () => {
    try {
      setYukleniyor(true);
      await Promise.all([
        slaKurallariGetir(),
        kategorileriGetir()
      ]);
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
    } finally {
      setYukleniyor(false);
    }
  };

  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    ilkYukleme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sayfa, sayfa boyutu veya arama metni değiştiğinde verileri yeniden getir
  useEffect(() => {
    // İlk yükleme sırasında çalışmamasını sağla
    if (!yukleniyor) {
      slaKurallariGetir();
    }
  }, [sayfa, sayfaBoyutu, aramaMetni]);

  // SLA kuralı düzenleme
  const slaKuraliDuzenle = (sla: SLAKurali) => {
    setSeciliSLA(sla);
    setDuzenlemeModu(true);
    setModalAcik(true);
  };

  // SLA kuralı silmeye hazırla
  const silmeyeHazirla = (sla: SLAKurali) => {
    setSeciliSLA(sla);
    setSilmeModalAcik(true);
  };

  // Öncelik formatını görsel hale getir
  const oncelikFormati = (oncelik: string) => {
    const formatlar = {
      "DUSUK": { label: "Düşük", color: "bg-slate-100 text-slate-800" },
      "ORTA": { label: "Orta", color: "bg-yellow-100 text-yellow-800" },
      "YUKSEK": { label: "Yüksek", color: "bg-orange-100 text-orange-800" },
      "ACIL": { label: "Acil", color: "bg-red-100 text-red-800" },
    };
    
    const format = formatlar[oncelik as keyof typeof formatlar] || { label: oncelik, color: "bg-gray-100" };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${format.color}`}>
        {format.label}
      </span>
    );
  };

  // Sayfa değiştirme işlemi
  const sayfaDegistir = (yeniSayfa: number) => {
    setSayfa(yeniSayfa);
  };

  // Sayfa boyutunu değiştirme işlemi
  const sayfaBoyutuDegistir = (yeniBoyut: string) => {
    setSayfaBoyutu(Number(yeniBoyut));
    setSayfa(1); // Sayfa boyutu değişince ilk sayfaya dön
  };

  // Arama metni değişikliğinde ilk sayfaya dön
  const aramaMetniDegistir = (metin: string) => {
    setAramaMetni(metin);
    setSayfa(1); // Arama yapılınca ilk sayfaya dön
  };

  // Görünüm bileşenlerini oluştur
  const renderGorunum = () => {
    if (yukleniyor) {
      return (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (filtrelenmisKurallar.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          {aramaMetni 
            ? "Arama kriterlerine uygun SLA kuralı bulunamadı." 
            : "Henüz hiç SLA kuralı eklenmemiş."}
        </div>
      );
    }

    switch (gorunumModu) {
      case "table":
        return (
          <SLATable 
            slaKurallari={filtrelenmisKurallar} 
            oncelikFormati={oncelikFormati}
            onEdit={slaKuraliDuzenle}
            onDelete={silmeyeHazirla}
          />
        );
      case "list":
        return (
          <SLAList 
            slaKurallari={filtrelenmisKurallar} 
            oncelikFormati={oncelikFormati}
            onEdit={slaKuraliDuzenle}
            onDelete={silmeyeHazirla}
          />
        );
      case "card":
        return (
          <SLACard 
            slaKurallari={filtrelenmisKurallar} 
            oncelikFormati={oncelikFormati}
            onEdit={slaKuraliDuzenle}
            onDelete={silmeyeHazirla}
          />
        );
      default:
        return null;
    }
  };

  // Sayfalama kontrollerini render et
  const renderSayfalama = () => {
    // Sayfalama verisi yoksa bile varsayılan değerlerle göster
    const paginationData = sayfalama || {
      toplamKayit: filtrelenmisKurallar.length,
      toplamSayfa: Math.ceil(filtrelenmisKurallar.length / sayfaBoyutu) || 1,
      mevcutSayfa: sayfa,
      limit: sayfaBoyutu
    };

    console.log("Sayfalama verisi:", paginationData);
    
    // if (!sayfalama || sayfalama.toplamSayfa <= 1) {
    //   return null;
    // }

    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Sayfa başına:</span>
          <Select 
            value={sayfaBoyutu.toString()} 
            onValueChange={sayfaBoyutuDegistir}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Toplam {paginationData.toplamKayit} kayıt
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => sayfaDegistir(sayfa - 1)}
            disabled={sayfa === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-sm whitespace-nowrap">
            Sayfa {sayfa} / {paginationData.toplamSayfa}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => sayfaDegistir(sayfa + 1)}
            disabled={sayfa >= paginationData.toplamSayfa}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SLA Kuralları</h1>
        
        <Button onClick={() => {
          setDuzenlemeModu(false);
          setModalAcik(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Yeni SLA Kuralı
        </Button>
      </div>
      
      {hata && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{hata}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>SLA Kuralları Listesi</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="SLA kuralı ara..."
                  className="pl-8"
                  value={aramaMetni}
                  onChange={(e) => aramaMetniDegistir(e.target.value)}
                />
              </div>
              
              <ViewOptions 
                viewMode={gorunumModu} 
                onViewModeChange={setGorunumModu} 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderGorunum()}
          {renderSayfalama()}
        </CardContent>
      </Card>
      
      <SLAModal
        open={modalAcik}
        onOpenChange={setModalAcik}
        duzenlemeModu={duzenlemeModu}
        seciliSLA={seciliSLA}
        kategoriler={kategoriler}
        yenile={slaKurallariGetir}
      />
      
      <DeleteConfirmDialog
        open={silmeModalAcik}
        onOpenChange={setSilmeModalAcik}
        seciliSLA={seciliSLA}
        yenile={slaKurallariGetir}
        oncelikFormati={oncelikFormati}
      />
    </div>
  );
} 