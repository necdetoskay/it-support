import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format, subMonths, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tipParam = url.searchParams.get("tip") || "talepler";
    const tarihAraligiParam = url.searchParams.get("tarihAraligi") || "son30gun";
    const departmanIdParam = url.searchParams.get("departmanId") || "";
    const kategoriIdParam = url.searchParams.get("kategoriId") || "";

    // Tarih aralığını hesapla
    const bugun = new Date();
    let baslangicTarihi: Date;
    let bitisTarihi = endOfDay(bugun);

    switch (tarihAraligiParam) {
      case "bugun":
        baslangicTarihi = startOfDay(bugun);
        break;
      case "son7gun":
        baslangicTarihi = subDays(startOfDay(bugun), 6);
        break;
      case "son30gun":
        baslangicTarihi = subDays(startOfDay(bugun), 29);
        break;
      case "son3ay":
        baslangicTarihi = subMonths(startOfDay(bugun), 3);
        break;
      case "tumzamanlar":
        baslangicTarihi = new Date(2020, 0, 1); // Varsayılan başlangıç
        break;
      default:
        baslangicTarihi = subDays(startOfDay(bugun), 29); // Varsayılan son 30 gün
    }

    // Filtre koşullarını oluştur
    const where: any = {
      olusturulmaTarihi: {
        gte: baslangicTarihi,
        lte: bitisTarihi
      }
    };

    if (departmanIdParam) {
      where.departmanId = departmanIdParam;
    }

    if (kategoriIdParam) {
      where.kategoriId = kategoriIdParam;
    }

    // Tüm talepleri getir
    const talepler = await prisma.talep.findMany({
      where,
      include: {
        kategori: true,
        departman: true,
        raporEden: true,
        atanan: true,
        islemler: {
          orderBy: {
            olusturulmaTarihi: 'desc'
          },
          include: {
            olusturan: true
          }
        }
      },
      orderBy: {
        olusturulmaTarihi: 'desc'
      }
    });

    // Talep durumlarına göre sayılar
    const talepDurumVerileri = [
      { durum: "Beklemede", deger: talepler.filter(t => t.durum === "BEKLEMEDE").length, renk: "#f59e0b" },
      { durum: "Devam Ediyor", deger: talepler.filter(t => t.durum === "DEVAM_EDIYOR").length, renk: "#3b82f6" },
      { durum: "Tamamlandı", deger: talepler.filter(t => t.durum === "TAMAMLANDI").length, renk: "#10b981" },
      { durum: "İptal", deger: talepler.filter(t => t.durum === "IPTAL").length, renk: "#ef4444" }
    ];

    // Önceliğe göre sayılar
    const talepOncelikVerileri = [
      { oncelik: "Acil", deger: talepler.filter(t => t.oncelik === "ACIL").length, renk: "#ef4444" },
      { oncelik: "Yüksek", deger: talepler.filter(t => t.oncelik === "YUKSEK").length, renk: "#f59e0b" },
      { oncelik: "Orta", deger: talepler.filter(t => t.oncelik === "ORTA").length, renk: "#3b82f6" },
      { oncelik: "Düşük", deger: talepler.filter(t => t.oncelik === "DUSUK").length, renk: "#10b981" }
    ];

    // Kategori dağılımı hesaplama
    const kategoriDagilim = talepler.reduce((acc, talep) => {
      const kategoriAd = talep.kategori?.ad || "Tanımsız";
      if (!acc[kategoriAd]) {
        acc[kategoriAd] = {
          ad: kategoriAd,
          deger: 0,
          renk: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
        };
      }
      acc[kategoriAd].deger += 1;
      return acc;
    }, {} as Record<string, { ad: string; deger: number; renk: string }>);

    // Departman performansı hesaplama
    const departmanPerformans = talepler.reduce((acc, talep) => {
      const departmanAd = talep.departman?.ad || "Tanımsız";
      if (!acc[departmanAd]) {
        acc[departmanAd] = {
          ad: departmanAd,
          toplamTalep: 0,
          tamamlanan: 0,
          bekleyen: 0,
          iptal: 0,
          ortalamaCozumSuresi: 0, // Saat cinsinden
          slaUyumu: 0 // Yüzde olarak
        };
      }

      acc[departmanAd].toplamTalep += 1;

      if (talep.durum === "TAMAMLANDI") {
        acc[departmanAd].tamamlanan += 1;
        
        // Çözüm süresi hesaplama
        if (talep.kapatilmaTarihi) {
          const cozumSuresi = (new Date(talep.kapatilmaTarihi).getTime() - 
            new Date(talep.olusturulmaTarihi).getTime()) / (1000 * 60 * 60); // Saat cinsinden
          
          acc[departmanAd].ortalamaCozumSuresi = 
            (acc[departmanAd].ortalamaCozumSuresi * (acc[departmanAd].tamamlanan - 1) + cozumSuresi) / 
            acc[departmanAd].tamamlanan;
          
          // 24 saat içinde çözüldü mü? (SLA uyumu)
          const slaUyumlu = cozumSuresi <= 24;
          acc[departmanAd].slaUyumu = 
            (acc[departmanAd].slaUyumu * (acc[departmanAd].tamamlanan - 1) + (slaUyumlu ? 100 : 0)) / 
            acc[departmanAd].tamamlanan;
        }
      } else if (talep.durum === "BEKLEMEDE") {
        acc[departmanAd].bekleyen += 1;
      } else if (talep.durum === "IPTAL") {
        acc[departmanAd].iptal += 1;
      }

      return acc;
    }, {} as Record<string, {
      ad: string;
      toplamTalep: number;
      tamamlanan: number;
      bekleyen: number;
      iptal: number;
      ortalamaCozumSuresi: number;
      slaUyumu: number;
    }>);

    // Talep trendi hesaplama - son 30 günün her günü için
    const talepTrendi = Array.from({ length: 30 }, (_, i) => {
      const tarih = subDays(bugun, 29 - i);
      const formattedDate = format(tarih, "yyyy-MM-dd");
      const gunTalepler = talepler.filter(t => 
        format(new Date(t.olusturulmaTarihi), "yyyy-MM-dd") === formattedDate
      );
      
      return {
        gun: format(tarih, "dd"), // Sadece gün
        deger: gunTalepler.length,
        tarih: formattedDate
      };
    });

    // Aylık çözüm süreleri hesaplama
    const aylikCozumSureleri = Array.from({ length: 6 }, (_, i) => {
      const ay = subMonths(bugun, 5 - i);
      const ayBaslangic = startOfMonth(ay);
      const ayBitis = endOfMonth(ay);
      
      const ayTalepler = talepler.filter(t => 
        t.durum === "TAMAMLANDI" && 
        t.kapatilmaTarihi && 
        new Date(t.kapatilmaTarihi) >= ayBaslangic && 
        new Date(t.kapatilmaTarihi) <= ayBitis
      );
      
      let toplamSaat = 0;
      ayTalepler.forEach(talep => {
        if (talep.kapatilmaTarihi) {
          toplamSaat += (new Date(talep.kapatilmaTarihi).getTime() - 
            new Date(talep.olusturulmaTarihi).getTime()) / (1000 * 60 * 60);
        }
      });
      
      const ortalamaSaat = ayTalepler.length > 0 ? toplamSaat / ayTalepler.length : 0;
      
      return {
        ay: format(ay, "MMM", { locale: tr }),
        ortalamaSaat: parseFloat(ortalamaSaat.toFixed(1)),
        talepSayisi: ayTalepler.length
      };
    });

    // Personel performansı (sadece atanmış ve tamamlanmış talepleri olan personeller için)
    const atananPersoneller = await prisma.kullanici.findMany({
      where: {
        atananTalepler: {
          some: {
            durum: "TAMAMLANDI",
            kapatilmaTarihi: {
              not: null
            }
          }
        }
      },
      include: {
        atananTalepler: {
          where: {
            durum: "TAMAMLANDI",
            kapatilmaTarihi: {
              not: null
            },
            olusturulmaTarihi: {
              gte: baslangicTarihi,
              lte: bitisTarihi
            }
          }
        }
      }
    });
    
    const personelPerformans = atananPersoneller.map(personel => {
      const tamamlananTalepler = personel.atananTalepler.filter(t => 
        t.durum === "TAMAMLANDI" && t.kapatilmaTarihi
      );
      
      let toplamCozumSuresi = 0;
      let slaUyumluTalepSayisi = 0;
      
      tamamlananTalepler.forEach(talep => {
        if (talep.kapatilmaTarihi) {
          const cozumSuresi = (new Date(talep.kapatilmaTarihi).getTime() - 
            new Date(talep.olusturulmaTarihi).getTime()) / (1000 * 60 * 60);
          
          toplamCozumSuresi += cozumSuresi;
          
          // 24 saat içinde çözüldü mü?
          if (cozumSuresi <= 24) {
            slaUyumluTalepSayisi++;
          }
        }
      });
      
      const ortalamaCozumSuresi = tamamlananTalepler.length > 0 
        ? toplamCozumSuresi / tamamlananTalepler.length 
        : 0;
      
      const slaUyumOrani = tamamlananTalepler.length > 0 
        ? (slaUyumluTalepSayisi / tamamlananTalepler.length) * 100 
        : 0;
      
      return {
        id: personel.id,
        ad: personel.ad,
        tamamlananTalepSayisi: tamamlananTalepler.length,
        ortalamaCozumSuresi: parseFloat(ortalamaCozumSuresi.toFixed(1)),
        slaUyumOrani: parseFloat(slaUyumOrani.toFixed(1))
      };
    }).filter(p => p.tamamlananTalepSayisi > 0) // Sadece çözülmüş talebi olanları göster
     .sort((a, b) => b.tamamlananTalepSayisi - a.tamamlananTalepSayisi); // Tamamlanan talep sayısına göre sırala

    // Rapor tipine göre uygun veriyi döndür
    let raporVerisi = {};

    switch (tipParam) {
      case "talepler":
        raporVerisi = {
          talepSayisi: talepler.length,
          talepDurumVerileri,
          talepOncelikVerileri,
          kategoriDagilim: Object.values(kategoriDagilim),
          talepTrendi
        };
        break;
      case "performans":
        raporVerisi = {
          departmanPerformans: Object.values(departmanPerformans),
          personelPerformans,
          aylikCozumSureleri
        };
        break;
      case "departmanlar":
        raporVerisi = {
          departmanPerformans: Object.values(departmanPerformans)
        };
        break;
      case "sla_analizi":
        raporVerisi = {
          departmanPerformans: Object.values(departmanPerformans).map(dp => ({
            ad: dp.ad,
            slaUyumu: dp.slaUyumu,
            toplamTalep: dp.toplamTalep,
            tamamlanan: dp.tamamlanan
          })),
          personelPerformans: personelPerformans.map(pp => ({
            ad: pp.ad,
            slaUyumOrani: pp.slaUyumOrani,
            tamamlananTalepSayisi: pp.tamamlananTalepSayisi
          }))
        };
        break;
      case "cozum_suresi":
        raporVerisi = {
          aylikCozumSureleri,
          departmanPerformans: Object.values(departmanPerformans).map(dp => ({
            ad: dp.ad,
            ortalamaCozumSuresi: dp.ortalamaCozumSuresi,
            tamamlanan: dp.tamamlanan
          }))
        };
        break;
      case "kullanici_performans":
        raporVerisi = {
          personelPerformans
        };
        break;
      default:
        raporVerisi = {
          talepDurumVerileri,
          talepOncelikVerileri,
          kategoriDagilim: Object.values(kategoriDagilim),
          talepTrendi
        };
    }

    return NextResponse.json({
      basari: true,
      veriler: raporVerisi,
      metaVeriler: {
        toplam: talepler.length,
        tarihAraligi: tarihAraligiParam,
        baslangicTarihi: format(baslangicTarihi, "yyyy-MM-dd"),
        bitisTarihi: format(bitisTarihi, "yyyy-MM-dd")
      }
    });
  } catch (error) {
    console.error("Rapor verileri alınırken hata:", error);
    return NextResponse.json(
      { 
        basari: false, 
        hata: "Rapor verileri alınırken bir hata oluştu",
        detay: error instanceof Error ? error.message : "Bilinmeyen hata"
      },
      { status: 500 }
    );
  }
} 