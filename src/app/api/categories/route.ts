import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validasyon şeması
const kategoriSchema = z.object({
  ad: z.string()
    .min(3, "Kategori adı en az 3 karakter olmalıdır")
    .max(50, "Kategori adı en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğĞüÜşŞıİöÖçÇ0-9\s-]+$/, "Kategori adı sadece harf, rakam, boşluk ve - içerebilir"),  
 
  aciklama: z.string()
    .max(200, "Açıklama en fazla 200 karakter olabilir")
    .optional()
});

// GET - Tüm kategorileri getir
export async function GET(request: Request) {
  try {
    const categories = await prisma.kategori.findMany({
      orderBy: { ad: 'asc' }
    });

    // API yanıtını istenen formata dönüştür
    const formattedCategories = categories.map(cat => ({
      id: cat.id, 
      ad: cat.ad,   
      aciklama: cat.aciklama
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error("Kategoriler alınırken hata:", error);
    return NextResponse.json(
      { error: "Kategoriler alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST - Yeni kategori oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Gelen veriyi doğrula
    const validatedData = kategoriSchema.parse(body);

    // Kategori adının benzersiz olduğunu kontrol et
    const existingCategory = await prisma.kategori.findFirst({
      where: {
        OR: [
          { ad: validatedData.ad }
        ]
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: existingCategory.ad === validatedData.ad ? 
          "Bu isimde bir kategori zaten var" : "Bu kategori zaten var" },
        { status: 400 }
      );
    }

    // Yeni kategoriyi oluştur
    const newCategory = await prisma.kategori.create({
      data: {
        ad: validatedData.ad,
        aciklama: validatedData.aciklama
      }
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Kategori oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Kategori oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 