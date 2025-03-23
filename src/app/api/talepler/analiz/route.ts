import { NextResponse } from "next/server";
import { talepMetniAnaliz, talepSecimleriniOgren } from "@/lib/talep-analiz";
import { departmanTani, personelTani } from "@/lib/turkce-entity-tanima";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { metin } = await request.json();
    
    if (!metin) {
      return NextResponse.json(
        { error: "Analiz edilecek metin gereklidir" },
        { status: 400 }
      );
    }
    
    // Metni analiz et
    const analiz = await talepMetniAnaliz(metin);
    
    // Yeni kayıt önerileri kontrolü
    const yeniKayitOner = {
      departman: null,
      kategori: null,
      personel: null
    };
    
    // Departman bulunamadıysa, gelişmiş tanıma yöntemini kullan
    if (!analiz.departmanId) {
      const tumDepartmanlar = await departmanTani(metin);
      
      // Eğer varlık tanıma sonuçları varsa ama eşik değeri düşükse bile öner
      if (tumDepartmanlar.length > 0 && tumDepartmanlar[0].benzerlikPuani < 0.4) {
        // Olası departman adını öner
        yeniKayitOner.departman = tumDepartmanlar[0].ad;
      } else {
        // Eski regex yöntemine geri dön
        const departmanPattern = /([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?: [A-ZÇĞİÖŞÜ][a-zçğıöşü]+)*) (?:departmanı|birimi|müdürlüğü|servisi)/i;
        const departmanEsleme = metin.match(departmanPattern);
        
        if (departmanEsleme && departmanEsleme[1]) {
          yeniKayitOner.departman = departmanEsleme[1].trim();
        }
      }
    }
    
    // Personel bulunamadıysa, gelişmiş tanıma yöntemini kullan
    if (!analiz.personelId) {
      const tumPersoneller = await personelTani(metin);
      
      // Eğer varlık tanıma sonuçları varsa ama eşik değeri düşükse bile öner
      if (tumPersoneller.length > 0 && tumPersoneller[0].benzerlikPuani < 0.4) {
        // Olası personel adını öner
        yeniKayitOner.personel = `${tumPersoneller[0].ad} ${tumPersoneller[0].soyad}`;
      } else {
        // Eski regex yöntemine geri dön
        const isimPattern = /([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)\s+([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)/g;
        const isimEslesmeler = [...metin.matchAll(isimPattern)];
        
        if (isimEslesmeler.length > 0) {
          yeniKayitOner.personel = isimEslesmeler[0][0].trim();
        }
      }
    }
    
    // Analiz sonuçlarını döndür
    return NextResponse.json({
      analiz,
      yeniKayitOner
    });
    
  } catch (error) {
    console.error("Talep metni analiz edilirken hata:", error);
    return NextResponse.json(
      { error: "Metin analizi sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Test amaçlı detaylı analiz endpoint'i
export async function GET(request: Request) {
  try {
    // URL'den metin parametresini al
    const { searchParams } = new URL(request.url);
    const metin = searchParams.get('metin');
    
    if (!metin) {
      return NextResponse.json(
        { error: "Analiz edilecek metin gereklidir (?metin=...)" },
        { status: 400 }
      );
    }
    
    // Tüm analiz sonuçlarını getir
    const [analiz, departmanlar, personeller] = await Promise.all([
      talepMetniAnaliz(metin),
      departmanTani(metin),
      personelTani(metin)
    ]);
    
    // Detaylı analiz sonuçlarını döndür
    return NextResponse.json({
      analiz,
      detayliSonuclar: {
        departmanlar,
        personeller
      }
    });
    
  } catch (error) {
    console.error("Detaylı analiz sırasında hata:", error);
    return NextResponse.json(
      { error: "Detaylı analiz sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Yeni kayıtları oluşturma API'si
export async function PUT(request: Request) {
  try {
    const { yeniKayitlar } = await request.json();
    const sonuc = {
      departman: null,
      kategori: null,
      personel: null
    };
    
    // Yeni departman oluştur
    if (yeniKayitlar.departman) {
      sonuc.departman = await prisma.departman.create({
        data: {
          ad: yeniKayitlar.departman,
          aciklama: `${yeniKayitlar.departman} departmanı otomatik oluşturuldu`
        }
      });
    }
    
    // Yeni kategori oluştur
    if (yeniKayitlar.kategori) {
      sonuc.kategori = await prisma.kategori.create({
        data: {
          ad: yeniKayitlar.kategori,
          aciklama: `${yeniKayitlar.kategori} kategorisi otomatik oluşturuldu`
        }
      });
    }
    
    // Yeni personel oluştur
    if (yeniKayitlar.personel && yeniKayitlar.departmanId) {
      // İsmi parçala
      const isimParcalari = yeniKayitlar.personel.split(" ");
      let ad = isimParcalari[0];
      let soyad = isimParcalari.length > 1 ? isimParcalari.slice(1).join(" ") : "";
      
      sonuc.personel = await prisma.personel.create({
        data: {
          ad,
          soyad,
          departmanId: yeniKayitlar.departmanId,
          telefon: "" // Varsayılan boş telefon
        }
      });
    }
    
    return NextResponse.json(sonuc);
    
  } catch (error) {
    console.error("Eksik kayıt oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Yeni kayıt oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Öğrenme sistemine veri gönderme API'si
export async function PATCH(request: Request) {
  try {
    const { talep, kullaniciSecimleri } = await request.json();
    
    if (!talep || !kullaniciSecimleri) {
      return NextResponse.json(
        { error: "Talep metni ve kullanıcı seçimleri gereklidir" },
        { status: 400 }
      );
    }
    
    // Öğrenme sistemine kaydet
    const sonuc = await talepSecimleriniOgren({
      ...kullaniciSecimleri,
      talep
    });
    
    return NextResponse.json(sonuc);
  } catch (error) {
    console.error("Öğrenme verisi kaydedilirken hata:", error);
    return NextResponse.json(
      { error: "Öğrenme verisi kaydedilirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 