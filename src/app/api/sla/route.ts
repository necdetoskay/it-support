import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// SLA kurallarını getir
export async function GET(req: NextRequest) {
  try {
    // Token kontrolü
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json(
        { error: "Kimlik doğrulama başarısız" },
        { status: 401 }
      );
    }

    // URL parametrelerini al
    const { searchParams } = new URL(req.url);
    const sayfalama = searchParams.get("sayfalama") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");

    console.log("Arama parametreleri:", { sayfalama, page, limit, search });

    // Mock SLA kuralları
    const mockSlaKurallari = [
      {
        id: "1",
        kategoriId: "1",
        oncelik: "DUSUK",
        yanitlamaSuresi: 8,
        cozumSuresi: 24,
        kategori: { ad: "Donanım" }
      },
      {
        id: "2",
        kategoriId: "2",
        oncelik: "ORTA",
        yanitlamaSuresi: 4,
        cozumSuresi: 16,
        kategori: { ad: "Yazılım" }
      },
      {
        id: "3", 
        kategoriId: "3",
        oncelik: "YUKSEK",
        yanitlamaSuresi: 2,
        cozumSuresi: 8,
        kategori: { ad: "Ağ" }
      },
      {
        id: "4",
        kategoriId: "4",
        oncelik: "ACIL",
        yanitlamaSuresi: 1,
        cozumSuresi: 4,
        kategori: { ad: "Kullanıcı Hesabı" }
      }
    ];

    // Arama filtresi uygula
    let filtrelenmisKurallar = mockSlaKurallari;
    if (search) {
      const searchLower = search.toLowerCase();
      filtrelenmisKurallar = mockSlaKurallari.filter(kural => 
        kural.kategori.ad.toLowerCase().includes(searchLower) ||
        kural.oncelik.toLowerCase().includes(searchLower)
      );
    }

    // Sayfalama yanıtı oluştur
    if (sayfalama) {
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = filtrelenmisKurallar.slice(start, end);
      
      return NextResponse.json({
        data: paginatedData,
        pagination: {
          toplamKayit: filtrelenmisKurallar.length,
          toplamSayfa: Math.ceil(filtrelenmisKurallar.length / limit),
          mevcutSayfa: page,
          limit: limit
        }
      });
    }

    // Sayfalama olmadan tüm verileri döndür
    return NextResponse.json(filtrelenmisKurallar);
  } catch (error) {
    console.error("SLA kuralları getirilemedi:", error);
    return NextResponse.json(
      { error: "SLA kuralları getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Yeni SLA kuralı ekle
export async function POST(req: NextRequest) {
  try {
    // Token kontrolü
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json(
        { error: "Kimlik doğrulama başarısız" },
        { status: 401 }
      );
    }

    const data = await req.json();
    console.log("Yeni SLA kuralı eklendi (mock):", data);

    // Mock ekleme yanıtı
    return NextResponse.json({
      id: "new-" + Date.now(),
      ...data,
      kategori: {
        ad: "Mock Kategori"
      }
    });
  } catch (error) {
    console.error("SLA kuralı eklenemedi:", error);
    return NextResponse.json(
      { error: "SLA kuralı eklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 