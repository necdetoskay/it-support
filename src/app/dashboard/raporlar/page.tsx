"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, BarChart3, Clock, Calendar, TrendingUp } from "lucide-react";
import RaporDashboard from "./RaporDashboard";
import RaporDetay from "./RaporDetay";
import RaporOlustur from "./RaporOlustur";

// Rapor tipleri
export type RaporTipi = 
  | "talepler" 
  | "performans" 
  | "departmanlar" 
  | "sla_analizi" 
  | "cozum_suresi" 
  | "kullanici_performans";

// Rapor tipi bilgileri
export const RAPOR_TIPLERI = {
  talepler: {
    baslik: "Talep Raporu",
    aciklama: "Taleplerin durumu ve dağılımı hakkında rapor",
    ikon: <FileText className="h-4 w-4" />
  },
  performans: {
    baslik: "Genel Performans Raporu",
    aciklama: "Sistem genelinde performans metrikleri",
    ikon: <TrendingUp className="h-4 w-4" />
  },
  departmanlar: {
    baslik: "Departman Bazlı Rapor",
    aciklama: "Departman bazında talep ve performans analizi",
    ikon: <BarChart3 className="h-4 w-4" />
  },
  sla_analizi: {
    baslik: "SLA Uyum Analizi",
    aciklama: "SLA kurallarına uyum ve istisna raporları",
    ikon: <Clock className="h-4 w-4" />
  },
  cozum_suresi: {
    baslik: "Çözüm Süresi Analizi",
    aciklama: "Talepler için ortalama yanıtlama ve çözüm süreleri analizi",
    ikon: <Clock className="h-4 w-4" />
  },
  kullanici_performans: {
    baslik: "Kullanıcı Performans Analizi",
    aciklama: "Destek personelinin performans metrikleri",
    ikon: <BarChart3 className="h-4 w-4" />
  }
};

export default function RaporlarPage() {
  const [aktifSekme, setAktifSekme] = useState<"dashboard" | "detay" | "olustur">("dashboard");
  const [secilenRaporTipi, setSecilenRaporTipi] = useState<RaporTipi>("talepler");
  
  // Detay raporu açma işlevi
  const raporDetayAc = (tip: RaporTipi) => {
    setSecilenRaporTipi(tip);
    setAktifSekme("detay");
  };
  
  // Yeni rapor oluşturma işlevi
  const yeniRaporOlustur = () => {
    setAktifSekme("olustur");
  };
  
  // Ana gösterge paneline dönme işlevi
  const anaSayfayaDon = () => {
    setAktifSekme("dashboard");
  };
  
  return (
    <div className="h-full flex flex-col space-y-4 p-4 pt-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Raporlar</h1>
          <p className="text-muted-foreground">
            Sistem performansını ve talep istatistiklerini görüntüleyin
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {aktifSekme !== "dashboard" && (
            <Button variant="outline" onClick={anaSayfayaDon}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Gösterge Paneli
            </Button>
          )}
          
          <Button onClick={yeniRaporOlustur}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Rapor
          </Button>
        </div>
      </div>
      
      <Card className="flex-1 overflow-hidden">
        {aktifSekme === "dashboard" && (
          <RaporDashboard raporDetayAc={raporDetayAc} />
        )}
        
        {aktifSekme === "detay" && (
          <RaporDetay tip={secilenRaporTipi} />
        )}
        
        {aktifSekme === "olustur" && (
          <RaporOlustur anaSayfayaDon={anaSayfayaDon} />
        )}
      </Card>
    </div>
  );
} 