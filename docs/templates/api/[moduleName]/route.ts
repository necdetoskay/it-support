import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validasyon şeması
const schema = z.object({
  ad: z.string()
    .min(3, "Ad en az 3 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğĞüÜşŞıİöÖçÇ0-9\s-]+$/, "Ad sadece harf, rakam, boşluk ve - içerebilir"),
  
  aciklama: z.string()
    .max(200, "Açıklama en fazla 200 karakter olabilir")
    .optional()
});

// GET - Tüm kayıtları getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sayfa = Number(searchParams.get("sayfa")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const arama = searchParams.get("arama") || "";
    
    // Toplam kayıt sayısını al
    const toplamKayit = await prisma.MODEL_NAME.count({
      where: {
        OR: [
          { ad: { contains: arama, mode: 'insensitive' } },
          { aciklama: { contains: arama, mode: 'insensitive' } }
        ]
      }
    });

    const items = await prisma.MODEL_NAME.findMany({
      where: {
        OR: [
          { ad: { contains: arama, mode: 'insensitive' } },
          { aciklama: { contains: arama, mode: 'insensitive' } }
        ]
      },
      include: {
        _count: {
          select: {
            // İlişkili kayıt sayılarını ekleyin
            // ornek: personeller: true,
            // ornek: talepler: true
          }
        }
      },
      skip: (sayfa - 1) * limit,
      take: limit,
      orderBy: { ad: 'asc' }
    });

    // API yanıtını formatla
    const formattedItems = items.map(item => ({
      id: item.id,
      ad: item.ad,
      aciklama: item.aciklama,
      // İlişkili kayıt sayılarını ekleyin
      // ornek: personelSayisi: item._count.personeller,
      // ornek: talepSayisi: item._count.talepler
    }));

    return NextResponse.json({
      items: formattedItems,
      sayfalama: {
        toplamKayit,
        toplamSayfa: Math.ceil(toplamKayit / limit),
        mevcutSayfa: sayfa,
        limit
      }
    });
  } catch (error) {
    console.error("Kayıtlar alınırken hata:", error);
    return NextResponse.json(
      { error: "Kayıtlar alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST - Yeni kayıt oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Gelen veriyi doğrula
    const validatedData = schema.parse(body);

    // Benzersizlik kontrolü
    const existingItem = await prisma.MODEL_NAME.findFirst({
      where: { ad: validatedData.ad }
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Bu isimde bir kayıt zaten var" },
        { status: 400 }
      );
    }

    // Yeni kayıt oluştur
    const newItem = await prisma.MODEL_NAME.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            // İlişkili kayıt sayılarını ekleyin
            // ornek: personeller: true,
            // ornek: talepler: true
          }
        }
      }
    });

    // API yanıtını formatla
    const formattedItem = {
      id: newItem.id,
      ad: newItem.ad,
      aciklama: newItem.aciklama,
      // İlişkili kayıt sayılarını ekleyin
      // ornek: personelSayisi: newItem._count.personeller,
      // ornek: talepSayisi: newItem._count.talepler
    };

    return NextResponse.json(formattedItem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Kayıt oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Kayıt oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 