import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validation schema
const kategoriSchema = z.object({
  ad: z.string().min(1, "Kategori adı zorunludur"),
  aciklama: z.string().optional(),
  ustKategoriId: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  try {
    console.log("Kategoriler API çağrıldı:", req.url);
    
    const url = new URL(req.url);
    const sayfa = parseInt(url.searchParams.get("sayfa") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    
    // Parametreleri loglama
    console.log("Kategoriler API parametreleri:", {
      sayfa,
      limit,
      aramaMetni: url.searchParams.get("arama") || "",
      withoutPagination: url.searchParams.get("withoutPagination") === "true",
      includeAnahtarKelimeler: url.searchParams.get("include") === "anahtar-kelimeler",
    });
    
    // Geçersiz veya çok büyük limit değerlerini engelle
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { hata: "Geçersiz limit değeri. Limit 1-100 arasında olmalıdır." },
        { status: 400 }
      );
    }
    
    // Geçersiz sayfa değerlerini engelle
    if (isNaN(sayfa) || sayfa < 1) {
      return NextResponse.json(
        { hata: "Geçersiz sayfa değeri. Sayfa 1 veya daha büyük olmalıdır." },
        { status: 400 }
      );
    }
    
    const aramaMetni = url.searchParams.get("arama") || "";
    const withoutPagination = url.searchParams.get("withoutPagination") === "true";
    const includeAnahtarKelimeler = url.searchParams.get("include") === "anahtar-kelimeler";
    
    // Arama filtreleri
    const where: any = {};
    
    if (aramaMetni) {
      where.OR = [
        { ad: { contains: aramaMetni, mode: "insensitive" } },
        { aciklama: { contains: aramaMetni, mode: "insensitive" } },
      ];
    }
    
    // Anahtar kelimeleri içerme kontrolü
    const include: any = {
      _count: {
        select: {
          talepler: true
        }
      }
    };
    
    if (includeAnahtarKelimeler) {
      include.kategoriAnahtarKelimeleri = {
        include: {
          anahtarKelime: true
        }
      };
    }
    
    try {
      if (withoutPagination) {
        // Tüm kategorileri getir (sayfalama olmadan)
        const tumKategoriler = await prisma.kategori.findMany({
          where,
          include,
          orderBy: { ad: "asc" },
        });
        
        console.log(`Kategoriler bulundu (sayfalama olmadan): ${tumKategoriler.length} kayıt`);
        return NextResponse.json(tumKategoriler);
      } else {
        // Sayfa sayısı hesapla
        const toplamKategori = await prisma.kategori.count({ where });
        const toplamSayfa = Math.ceil(toplamKategori / limit);
        
        // Kategorileri getir
        const kategoriler = await prisma.kategori.findMany({
          skip: (sayfa - 1) * limit,
          take: limit,
          where,
          include,
          orderBy: { ad: "asc" },
        });
        
        const response = {
          veriler: kategoriler,
          sayfalama: {
            toplamVeri: toplamKategori,
            toplamSayfa,
            simdikiSayfa: sayfa,
            limit,
          },
        };
        
        console.log(`Kategoriler bulundu (sayfalama ile): ${kategoriler.length} kayıt, Toplam: ${toplamKategori}, Sayfa: ${sayfa}/${toplamSayfa}`);
        return NextResponse.json(response);
      }
    } catch (dbError) {
      console.error("Veritabanı sorgusunda hata:", dbError);
      return NextResponse.json(
        { 
          hata: "Veritabanı sorgusu sırasında bir hata oluştu",
          detay: (dbError as Error).message 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Kategori listesi alınırken hata:", error);
    return NextResponse.json(
      { 
        hata: "Kategori listesi alınırken bir hata oluştu",
        detay: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Kategori oluşturma isteği:", body);

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

    // Veriyi Prisma'nın beklediği forma dönüştür
    const kategoriData = {
      ad: validatedData.ad,
      aciklama: validatedData.aciklama || null,
      ...(validatedData.ustKategoriId ? { ustKategoriId: validatedData.ustKategoriId } : {})
    };

    // Create new kategori
    const kategori = await db.kategori.create({
      data: kategoriData,
      include: {
        _count: {
          select: {
            talepler: true
          }
        }
      }
    });

    console.log("Yeni kategori oluşturuldu:", kategori.id);
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