import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const kategoriSchema = z.object({
  ad: z.string().min(1, "Kategori adı zorunludur"),
  aciklama: z.string().optional(),
  ustKategoriId: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sayfa = parseInt(url.searchParams.get("sayfa") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { hata: "Geçersiz limit değeri. Limit 1-100 arasında olmalıdır." },
        { status: 400 }
      );
    }
    
    if (isNaN(sayfa) || sayfa < 1) {
      return NextResponse.json(
        { hata: "Geçersiz sayfa değeri. Sayfa 1 veya daha büyük olmalıdır." },
        { status: 400 }
      );
    }
    
    const aramaMetni = url.searchParams.get("arama") || "";
    const withoutPagination = url.searchParams.get("withoutPagination") === "true";
    
    const where = aramaMetni ? {
      OR: [
        { ad: { contains: aramaMetni, mode: "insensitive" } },
        { aciklama: { contains: aramaMetni, mode: "insensitive" } },
      ]
    } : {};
    
    try {
      if (withoutPagination) {
        const tumKategoriler = await prisma.kategori.findMany({
          where,
          include: {
            _count: {
              select: {
                talepler: true
              }
            }
          },
          orderBy: { ad: "asc" },
        });
        
        return NextResponse.json(tumKategoriler);
      } else {
        const [toplamKategori, kategoriler] = await Promise.all([
          prisma.kategori.count({ where }),
          prisma.kategori.findMany({
            skip: (sayfa - 1) * limit,
            take: limit,
            where,
            include: {
              _count: {
                select: {
                  talepler: true
                }
              }
            },
            orderBy: { ad: "asc" },
          })
        ]);
        
        const toplamSayfa = Math.ceil(toplamKategori / limit);
        
        return NextResponse.json({
          veriler: kategoriler,
          sayfalama: {
            toplamVeri: toplamKategori,
            toplamSayfa,
            simdikiSayfa: sayfa,
            limit,
          },
        });
      }
    } catch (dbError) {
      return NextResponse.json(
        { 
          hata: "Veritabanı sorgusu sırasında bir hata oluştu",
          detay: dbError instanceof Error ? dbError.message : "Bilinmeyen hata"
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { 
        hata: "Kategori listesi alınırken bir hata oluştu",
        detay: error instanceof Error ? error.message : "Bilinmeyen hata"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = kategoriSchema.parse(body);

    const existingKategori = await prisma.kategori.findFirst({
      where: { ad: validatedData.ad }
    });

    if (existingKategori) {
      return NextResponse.json(
        { hata: "Bu isimde bir kategori zaten mevcut" },
        { status: 400 }
      );
    }

    const kategoriData = {
      ad: validatedData.ad,
      aciklama: validatedData.aciklama || null,
      ...(validatedData.ustKategoriId ? { ustKategoriId: validatedData.ustKategoriId } : {})
    };

    const kategori = await prisma.kategori.create({
      data: kategoriData,
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
        { hata: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        hata: "Kategori oluşturulurken bir hata oluştu",
        detay: error instanceof Error ? error.message : "Bilinmeyen hata"
      },
      { status: 500 }
    );
  }
} 