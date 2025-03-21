import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema
const kategoriSchema = z.object({
  ad: z.string()
    .min(3, "Ad en az 3 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğĞüÜşŞıİöÖçÇ0-9\s-]+$/, "Sadece harf, rakam, boşluk ve - içerebilir"),
  
  aciklama: z.string()
    .max(200, "Açıklama en fazla 200 karakter olabilir")
    .optional()
    .nullable(),

  ustKategoriId: z.string()
    .optional()
    .nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const offset = (page - 1) * limit;

    // Base query
    let query = db.kategori.findMany({
      where: search ? {
        OR: [
          { ad: { contains: search, mode: "insensitive" } },
          { aciklama: { contains: search, mode: "insensitive" } }
        ]
      } : undefined,
      orderBy: { ad: "asc" },
      skip: offset,
      take: limit,
      include: {
        _count: {
          select: {
            talepler: true
          }
        }
      }
    });

    // Count query
    let countQuery = db.kategori.count({
      where: search ? {
        OR: [
          { ad: { contains: search, mode: "insensitive" } },
          { aciklama: { contains: search, mode: "insensitive" } }
        ]
      } : undefined,
    });

    // Execute both queries concurrently
    const [kategoriler, total] = await Promise.all([query, countQuery]);

    return NextResponse.json({
      kategoriler,
      sayfalama: {
        toplamKayit: total,
        toplamSayfa: Math.ceil(total / limit),
        mevcutSayfa: page,
        limit,
      }
    });
  } catch (error) {
    console.error("Kategoriler getirilirken hata:", error);
    return NextResponse.json(
      { error: "Kategoriler getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = kategoriSchema.parse(body);

    // Check if kategori already exists
    const existingKategori = await db.kategori.findFirst({
      where: { ad: validatedData.ad }
    });

    if (existingKategori) {
      return NextResponse.json(
        { error: "Bu isimde bir kategori zaten mevcut" },
        { status: 400 }
      );
    }

    // Create new kategori
    const kategori = await db.kategori.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            talepler: true
          }
        }
      }
    });

    return NextResponse.json(kategori, { status: 201 });
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