"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TalepDurumGrafigi() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [veriler, setVeriler] = useState<{ durum: string; deger: number; renk: string }[]>([]);
  
  // Verileri yükle
  useEffect(() => {
    async function verileriYukle() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        
        if (data.talepDurumVerileri) {
          setVeriler(data.talepDurumVerileri);
        }
        
        setYukleniyor(false);
      } catch (error) {
        console.error("Talep durum verileri yüklenirken hata:", error);
        setYukleniyor(false);
      }
    }
    
    verileriYukle();
  }, []);
  
  if (yukleniyor) {
    return <Skeleton className="h-[100px] w-full rounded" />;
  }
  
  if (!veriler.length) {
    return <div className="h-[100px] flex items-center justify-center text-muted-foreground">Veri bulunamadı</div>;
  }

  // Merkez ve yarıçap belirle
  const merkez = { x: 50, y: 50 };
  const yaricap = 40;
  
  // Toplam değer
  const toplam = veriler.reduce((acc, veri) => acc + veri.deger, 0);
  
  // Yay başlangıç açıları
  let baslangicAcisi = 0;
  
  // Her durum için yayları oluştur
  const yaylar = veriler.map((veri, indeks) => {
    // Bu durumun yüzdesi ve açısı
    const yuzde = toplam === 0 ? 0 : (veri.deger / toplam) * 100;
    const aciDegeri = toplam === 0 ? 0 : (veri.deger / toplam) * 360;
    
    // Yay oluşturma
    const bitisAcisi = baslangicAcisi + aciDegeri;
    
    // Açıları radyana çevir
    const baslangicRadyan = (baslangicAcisi - 90) * (Math.PI / 180);
    const bitisRadyan = (bitisAcisi - 90) * (Math.PI / 180);
    
    // Yay özelliklerini belirleme
    const buyukYay = aciDegeri > 180 ? 1 : 0;
    
    // Yay noktalarını hesapla
    const x1 = merkez.x + yaricap * Math.cos(baslangicRadyan);
    const y1 = merkez.y + yaricap * Math.sin(baslangicRadyan);
    const x2 = merkez.x + yaricap * Math.cos(bitisRadyan);
    const y2 = merkez.y + yaricap * Math.sin(bitisRadyan);
    
    // Yay çizimi için komut oluştur
    const yayKomutu = `M ${merkez.x},${merkez.y} L ${x1},${y1} A ${yaricap},${yaricap} 0 ${buyukYay} 1 ${x2},${y2} Z`;
    
    // Etiket için açı
    const etiketAcisi = baslangicAcisi + (aciDegeri / 2) - 90;
    const etiketRadyan = etiketAcisi * (Math.PI / 180);
    const etiketMesafe = yaricap * 0.6;
    const etiketX = merkez.x + etiketMesafe * Math.cos(etiketRadyan);
    const etiketY = merkez.y + etiketMesafe * Math.sin(etiketRadyan);
    
    // Bir sonraki başlangıç açısını güncelle
    baslangicAcisi = bitisAcisi;
    
    return {
      yol: yayKomutu,
      renk: veri.renk,
      durum: veri.durum,
      deger: veri.deger,
      yuzde: yuzde.toFixed(1),
      etiketX,
      etiketY
    };
  });
  
  // Pasta grafik gösterimi
  return (
    <div className="h-[100px] flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {/* Dilimler */}
        {yaylar.map((yay, indeks) => (
          <path 
            key={indeks} 
            d={yay.yol} 
            fill={yay.renk}
            className="hover:opacity-80 cursor-pointer transition-opacity"
          />
        ))}
      </svg>
      
      {/* Açıklama (Legend) */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mt-2">
        {veriler.map((veri, indeks) => (
          <div key={indeks} className="flex items-center">
            <div 
              className="w-2 h-2 rounded-full mr-1" 
              style={{ backgroundColor: veri.renk }}
            />
            <span>{veri.durum}: </span>
            <span className="font-medium ml-1">
              {veri.deger} ({toplam > 0 ? ((veri.deger / toplam) * 100).toFixed(0) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 