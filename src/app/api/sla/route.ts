import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Oncelik } from "@prisma/client";

// Validasyon şeması
const slaSchema = z.object({
  kategoriId: z.string().min(1, "Kategori seçimi zorunludur"),
  oncelik: z.string().min(1, "Öncelik seçimi zorunludur"),
  yanitlamaSuresi: z.coerce.number().min(1, "En az 1 saat olmalıdır"),
  cozumSuresi: z.coerce.number().min(1, "En az 1 saat olmalıdır"),
});

export async function GET(request: NextRequest) {
  try {
    // URL parametrelerini al
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Toplam kayıt sayısını hesapla
    const totalCount = await prisma.sLAKural.count({
      where: {
        OR: [
          {
            kategori: {
              ad: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          }
        ]
      }
    });

    // Sayfalama ile SLA kurallarını getir
    const slaKurallari = await prisma.sLAKural.findMany({
      where: {
        OR: [
          {
            kategori: {
              ad: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      include: {
        kategori: {
          select: {
            ad: true
          }
        }
      },
      orderBy: {
        kategori: {
          ad: 'asc'
        }
      },
      skip,
      take: limit
    });

    // Sayfalama bilgilerini hazırla
    const pagination = {
      toplamKayit: totalCount,
      toplamSayfa: Math.ceil(totalCount / limit),
      mevcutSayfa: page,
      limit
    };

    console.log("SLA API: Sayfalama bilgileri", pagination);

    // Her zaman sayfalama bilgisiyle yanıt ver
    return NextResponse.json({
      data: slaKurallari,
      pagination
    });

    // // Tam yanıt için sayfalama bilgisini ekleyelim
    // if (searchParams.has('sayfalama') && searchParams.get('sayfalama') === 'true') {
    //   return NextResponse.json({
    //     data: slaKurallari,
    //     pagination
    //   });
    // }

    // // Sadece SLA kurallarını döndür
    // return NextResponse.json(slaKurallari);
  } catch (error) {
    console.error("SLA kuralları getirilirken hata:", error);
    return NextResponse.json(
      { error: "SLA kuralları getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // İsteği al ve doğrula
    const body = await request.json();
    const validationResult = slaSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { kategoriId, oncelik, yanitlamaSuresi, cozumSuresi } = validationResult.data;

    // Kategoriyi kontrol et
    const kategori = await prisma.kategori.findUnique({
      where: { id: kategoriId }
    });

    if (!kategori) {
      return NextResponse.json(
        { error: "Geçersiz kategori" },
        { status: 400 }
      );
    }

    // Zaten aynı kategori ve öncelik için kural var mı kontrol et
    const mevcutKural = await prisma.sLAKural.findFirst({
      where: {
        kategoriId,
        oncelik: oncelik as Oncelik,
      }
    });

    if (mevcutKural) {
      return NextResponse.json(
        { error: "Bu kategori ve öncelik için zaten bir SLA kuralı bulunmaktadır" },
        { status: 409 }
      );
    }

    // Yeni SLA kuralı oluştur
    const yeniSLAKurali = await prisma.sLAKural.create({
      data: {
        kategoriId,
        oncelik: oncelik as Oncelik,
        yanitlamaSuresi,
        cozumSuresi
      },
      include: {
        kategori: {
          select: {
            ad: true
          }
        }
      }
    });

    return NextResponse.json(yeniSLAKurali, { status: 201 });
  } catch (error) {
    console.error("SLA kuralı eklenirken hata:", error);
    return NextResponse.json(
      { error: "SLA kuralı eklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 