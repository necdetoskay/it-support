"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function KategoriDagilimGrafigi() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [veriler, setVeriler] = useState<{ ad: string; deger: number; renk?: string }[]>([]);
  
  // Sabit renkler
  const renkler = ["#f97316", "#84cc16", "#0ea5e9", "#3b82f6", "#8b5cf6", "#ec4899"];
  
  // Verileri yükle
  useEffect(() => {
    async function verileriYukle() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        
        if (data.enCokTalepteBulunanKategoriler) {
          // API'den gelen verilere renkler ekle
          const renkliVeriler = data.enCokTalepteBulunanKategoriler.map((kategori: any, indeks: number) => ({
            ad: kategori.ad,
            deger: kategori.sayi,
            renk: renkler[indeks % renkler.length]
          }));
          
          setVeriler(renkliVeriler);
        }
        
        setYukleniyor(false);
      } catch (error) {
        console.error("Kategori dağılım verileri yüklenirken hata:", error);
        setYukleniyor(false);
      }
    }
    
    verileriYukle();
  }, []);
  
  if (yukleniyor) {
    return <Skeleton className="h-[180px] w-full rounded" />;
  }
  
  if (!veriler.length) {
    return <div className="h-[180px] flex items-center justify-center text-muted-foreground">Veri bulunamadı</div>;
  }
  
  // Grafik boyutları
  const genislik = 500;
  const yukseklik = 180;
  const kenarBosluk = { ust: 20, sag: 80, alt: 20, sol: 140 };
  
  // Çizim alanı
  const cizimGenislik = genislik - kenarBosluk.sol - kenarBosluk.sag;
  const cizimYukseklik = yukseklik - kenarBosluk.ust - kenarBosluk.alt;
  
  // Çubuk yüksekliği
  const cubukYuksekligi = Math.min(20, (cizimYukseklik / veriler.length) * 0.8);
  const cubukAraligi = (cizimYukseklik - (cubukYuksekligi * veriler.length)) / veriler.length;
  
  // Max değer
  const maxDeger = Math.max(...veriler.map(v => v.deger));
  
  // X ölçeklendirme
  const xOlcek = cizimGenislik / maxDeger;
  
  return (
    <div className="h-[180px] flex items-center justify-center">
      <svg width={genislik} height={yukseklik} viewBox={`0 0 ${genislik} ${yukseklik}`}>
        {/* Y ekseni çizgisi */}
        <line
          x1={kenarBosluk.sol}
          y1={kenarBosluk.ust - 10}
          x2={kenarBosluk.sol}
          y2={yukseklik - kenarBosluk.alt + 10}
          stroke="#e2e8f0"
          strokeWidth="1"
        />
        
        {/* Çubuklar ve etiketler */}
        {veriler.map((veri, indeks) => {
          const y = kenarBosluk.ust + indeks * (cubukYuksekligi + cubukAraligi) + cubukAraligi / 2;
          
          return (
            <g key={veri.ad}>
              {/* Kategori adı */}
              <text
                x={kenarBosluk.sol - 10}
                y={y + cubukYuksekligi / 2 + 3}
                fontSize="12"
                textAnchor="end"
                fontWeight="medium"
                fill="#334155"
              >
                {veri.ad}
              </text>
              
              {/* Arka plan çubuğu (referans için) */}
              <rect
                x={kenarBosluk.sol}
                y={y}
                width={cizimGenislik}
                height={cubukYuksekligi}
                fill="#f1f5f9"
                rx={cubukYuksekligi / 2}
              />
              
              {/* Değer çubuğu */}
              <rect
                x={kenarBosluk.sol}
                y={y}
                width={veri.deger * xOlcek}
                height={cubukYuksekligi}
                fill={veri.renk}
                rx={cubukYuksekligi / 2}
              />
              
              {/* Değer etiketi */}
              <text
                x={kenarBosluk.sol + veri.deger * xOlcek + 10}
                y={y + cubukYuksekligi / 2 + 4}
                fontSize="11"
                fontWeight="bold"
                fill="#334155"
              >
                {veri.deger}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
} 