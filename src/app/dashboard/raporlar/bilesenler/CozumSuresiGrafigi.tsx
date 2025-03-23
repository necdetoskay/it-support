"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CozumSuresiGrafigi() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [veriler, setVeriler] = useState<{
    aylar: string[];
    ortalamaSureler: number[];
  }>({ aylar: [], ortalamaSureler: [] });
  
  // Verileri yükle
  useEffect(() => {
    async function verileriYukle() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        
        if (data.aylikCozumSureleri && data.aylikCozumSureleri.length > 0) {
          // Ayları ve ortalama süreleri ayır
          const aylar = data.aylikCozumSureleri.map((item: any) => item.ay);
          const ortalamaSureler = data.aylikCozumSureleri.map((item: any) => 
            parseFloat(item.ortalamaSure.toFixed(1))
          );
          
          setVeriler({ aylar, ortalamaSureler });
        }
        
        setYukleniyor(false);
      } catch (error) {
        console.error("Çözüm süresi verileri yüklenirken hata:", error);
        setYukleniyor(false);
      }
    }
    
    verileriYukle();
  }, []);
  
  if (yukleniyor) {
    return <Skeleton className="h-[200px] w-full rounded" />;
  }
  
  if (!veriler.aylar.length) {
    return <div className="h-[200px] flex items-center justify-center text-muted-foreground">Veri bulunamadı</div>;
  }

  // Grafik boyutları
  const genislik = 600;
  const yukseklik = 200;
  const kenarBosluk = { ust: 30, sag: 20, alt: 40, sol: 50 };
  
  // Çizim alanı
  const cizimGenislik = genislik - kenarBosluk.sol - kenarBosluk.sag;
  const cizimYukseklik = yukseklik - kenarBosluk.ust - kenarBosluk.alt;
  
  // Y ekseni ölçeği
  const maxDeger = Math.max(...veriler.ortalamaSureler) * 1.2; // %20 fazla alan
  const yOlcek = cizimYukseklik / maxDeger;
  
  // X ekseni ölçeği
  const xAraligi = cizimGenislik / (veriler.aylar.length - 1);
  
  // Çizgi için path oluştur
  let pathD = "";
  veriler.ortalamaSureler.forEach((deger, indeks) => {
    const x = kenarBosluk.sol + indeks * xAraligi;
    const y = yukseklik - kenarBosluk.alt - (deger * yOlcek);
    
    if (indeks === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
    }
  });
  
  return (
    <div className="h-[200px] w-full relative">
      <svg width={genislik} height={yukseklik} viewBox={`0 0 ${genislik} ${yukseklik}`}>
        {/* Izgara çizgileri */}
        {[0, 0.25, 0.5, 0.75, 1].map((oran) => {
          const y = kenarBosluk.ust + cizimYukseklik * (1 - oran);
          const deger = (maxDeger * oran).toFixed(1);
          
          return (
            <g key={oran}>
              <line
                x1={kenarBosluk.sol}
                y1={y}
                x2={genislik - kenarBosluk.sag}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray={oran > 0 ? "3,3" : "0"}
              />
              <text x={kenarBosluk.sol - 10} y={y + 4} fontSize="10" textAnchor="end" fill="#64748b">
                {deger}s
              </text>
            </g>
          );
        })}
        
        {/* X ekseni (aylar) */}
        {veriler.aylar.map((ay, indeks) => {
          const x = kenarBosluk.sol + indeks * xAraligi;
          
          return (
            <g key={ay}>
              <line
                x1={x}
                y1={yukseklik - kenarBosluk.alt}
                x2={x}
                y2={yukseklik - kenarBosluk.alt + 5}
                stroke="#94a3b8"
                strokeWidth="1"
              />
              <text
                x={x}
                y={yukseklik - kenarBosluk.alt + 20}
                fontSize="10"
                textAnchor="middle"
                fill="#64748b"
              >
                {ay}
              </text>
            </g>
          );
        })}
        
        {/* Grafik başlığı */}
        <text
          x={genislik / 2}
          y={15}
          fontSize="12"
          textAnchor="middle"
          fontWeight="bold"
          fill="#334155"
        >
          Aylık Ortalama Çözüm Süresi (saniye)
        </text>
        
        {/* Çizgi */}
        <path
          d={pathD}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Veri noktaları */}
        {veriler.ortalamaSureler.map((deger, indeks) => {
          const x = kenarBosluk.sol + indeks * xAraligi;
          const y = yukseklik - kenarBosluk.alt - (deger * yOlcek);
          
          return (
            <g key={`point-${indeks}`}>
              <circle cx={x} cy={y} r="4" fill="white" stroke="#0ea5e9" strokeWidth="2" />
              <text
                x={x}
                y={y - 10}
                fontSize="10"
                textAnchor="middle"
                fontWeight="bold"
                fill="#334155"
              >
                {deger}s
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
} 