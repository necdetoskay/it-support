"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TalepDurumGrafigi() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [veriler, setVeriler] = useState<{ durum: string; deger: number; renk: string }[]>([]);
  
  // API'den verileri getir
  useEffect(() => {
    async function verileriGetir() {
      try {
        // API isteği
        const res = await fetch('/api/dashboard/stats');
        if (!res.ok) {
          throw new Error('İstatistikler alınamadı');
        }
        
        const data = await res.json();
        
        if (data && data.talepDurumVerileri && Array.isArray(data.talepDurumVerileri)) {
          setVeriler(data.talepDurumVerileri);
        } else {
          console.error('Talep durum verileri bulunamadı', data);
          // Örnek veri oluştur
          setVeriler([
            { durum: "Beklemede", deger: 25, renk: "#f59e0b" },
            { durum: "Devam Ediyor", deger: 35, renk: "#3b82f6" },
            { durum: "Tamamlandı", deger: 30, renk: "#10b981" },
            { durum: "İptal", deger: 10, renk: "#ef4444" }
          ]);
        }
      } catch (error) {
        console.error("Veri yüklenirken hata:", error);
        // Hata durumunda örnek veri oluştur
        setVeriler([
          { durum: "Beklemede", deger: 25, renk: "#f59e0b" },
          { durum: "Devam Ediyor", deger: 35, renk: "#3b82f6" },
          { durum: "Tamamlandı", deger: 30, renk: "#10b981" },
          { durum: "İptal", deger: 10, renk: "#ef4444" }
        ]);
      } finally {
        setYukleniyor(false);
      }
    }
    
    verileriGetir();
  }, []);
  
  // Yükleniyor durumu
  if (yukleniyor) {
    return <Skeleton className="h-40 w-full" />;
  }
  
  // Veri yok
  if (!veriler.length) {
    return (
      <div className="h-40 flex items-center justify-center text-muted-foreground">
        Veri bulunamadı
      </div>
    );
  }
  
  // Toplam değer
  const toplamDeger = veriler.reduce((acc, curr) => acc + curr.deger, 0);
  
  // Grafik boyutları
  const genislik = 400;
  const yukseklik = 200;
  const merkez = { x: genislik / 2, y: yukseklik / 2 };
  const yaricap = Math.min(genislik, yukseklik) / 2.5;
  
  // SVG için gerekli ölçüler
  const baslangicAci = 0;
  const toplamAci = Math.PI * 2;
  
  // Dilim bilgilerini hesapla
  let mevcut_aci = baslangicAci;
  const dilimler = veriler.map(veri => {
    const dilimAci = (veri.deger / toplamDeger) * toplamAci;
    const baslangic = mevcut_aci;
    const bitis = mevcut_aci + dilimAci;
    
    // Dilimin orta noktasındaki açı (etiket için)
    const ortaAci = baslangic + dilimAci / 2;
    
    // Etiketler için koordinatlar
    const etiketMesafesi = yaricap * 1.3; // Merkeze olan mesafe
    const etiketX = merkez.x + Math.cos(ortaAci) * etiketMesafesi;
    const etiketY = merkez.y + Math.sin(ortaAci) * etiketMesafesi;
    
    // Dilimin başlangıç ve bitiş noktaları
    const baslangicX = merkez.x + Math.cos(baslangic) * yaricap;
    const baslangicY = merkez.y + Math.sin(baslangic) * yaricap;
    const bitisX = merkez.x + Math.cos(bitis) * yaricap;
    const bitisY = merkez.y + Math.sin(bitis) * yaricap;
    
    // Büyük ark flag (180 dereceden büyük mü?)
    const buyukArkFlag = dilimAci > Math.PI ? 1 : 0;
    
    // Path data
    const pathData = [
      `M ${merkez.x} ${merkez.y}`,
      `L ${baslangicX} ${baslangicY}`,
      `A ${yaricap} ${yaricap} 0 ${buyukArkFlag} 1 ${bitisX} ${bitisY}`,
      'Z'
    ].join(' ');
    
    mevcut_aci = bitis;
    
    return {
      ...veri,
      pathData,
      etiketX,
      etiketY,
      yuzde: Math.round((veri.deger / toplamDeger) * 100)
    };
  });
  
  return (
    <div className="flex justify-center items-center relative h-40">
      <svg width={genislik} height={yukseklik} viewBox={`0 0 ${genislik} ${yukseklik}`}>
        {/* Pasta dilimlerini çiz */}
        {dilimler.map((dilim, i) => (
          <path
            key={i}
            d={dilim.pathData}
            fill={dilim.renk}
            stroke="white"
            strokeWidth="1"
          />
        ))}
        
        {/* Etiketler */}
        {dilimler.map((dilim, i) => (
          <g key={`etiket-${i}`}>
            <text
              x={dilim.etiketX}
              y={dilim.etiketY}
              fontSize="12"
              textAnchor="middle"
              fill="#334155"
              fontWeight="bold"
            >
              {dilim.durum}
            </text>
            <text
              x={dilim.etiketX}
              y={dilim.etiketY + 15}
              fontSize="10"
              textAnchor="middle"
              fill="#64748b"
            >
              {dilim.yuzde}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
} 