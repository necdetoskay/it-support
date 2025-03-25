import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Schema for validation
const kategoriSchema = z.object({
  ad: z.string().min(2, { message: "Kategori adı en az 2 karakter olmalıdır" }),
  aciklama: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    // Yetkilendirme kontrolü - getServerSession yerine oturum kontrolüne geçiş
    // İstemci yetkisini middleware kontrolü veya JWT doğrulamasıyla sağla
    const tokenInfo = req.headers.get("Authorization")?.split(" ")[1];
    
    if (tokenInfo) {
      console.log("API'de token var:", !!tokenInfo);
    } else {
      console.log("API'de token yok");
    }
    
    // Not: Oturum kontrolü şimdilik tamamen devre dışı bırakıldı
    // Düzgün yetkilendirme yapılandırması uygulandığında bu kısmı güncelleyin

    const { searchParams } = new URL(req.url);
    const arama = searchParams.get("arama") || "";
    const sayfa = parseInt(searchParams.get("sayfa") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Validation
    if (sayfa < 1) {
      return NextResponse.json(
        { error: "Sayfa numarası 1'den küçük olamaz" },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Limit 1 ile 100 arasında olmalıdır" },
        { status: 400 }
      );
    }

    const skip = (sayfa - 1) * limit;

    // Base query
    const whereClause = arama
      ? {
          OR: [
            { ad: { contains: arama, mode: "insensitive" } },
            { aciklama: { contains: arama, mode: "insensitive" } },
          ],
        }
      : {};

    // Get categories with pagination
    const [kategoriler, toplamKayit] = await Promise.all([
      prisma.kategori.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { ad: "asc" },
        include: {
          _count: {
            select: {
              talepler: true,
            },
          },
        },
      }),
      prisma.kategori.count({ where: whereClause }),
    ]);

    // Format response
    const toplamSayfa = Math.ceil(toplamKayit / limit);
    const sonuc = kategoriler.map((kategori: any) => ({
      id: kategori.id,
      ad: kategori.ad,
      aciklama: kategori.aciklama,
      _count: {
        talepler: kategori._count?.talepler || 0
      },
      sorunSayisi: kategori._count?.talepler || 0,
    }));

    return NextResponse.json({
      data: sonuc,
      meta: {
        toplamKayit,
        toplamSayfa,
        mevcutSayfa: sayfa,
        limit,
      },
    });
  } catch (error) {
    console.error("Kategoriler getirme hatası:", error);
    return NextResponse.json(
      { error: "Kategoriler getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Yetkilendirme kontrolü - getServerSession yerine oturum kontrolüne geçiş
    // İstemci yetkisini middleware kontrolü veya JWT doğrulamasıyla sağla
    const tokenInfo = req.headers.get("Authorization")?.split(" ")[1];
    
    if (tokenInfo) {
      console.log("API'de token var:", !!tokenInfo);
    } else {
      console.log("API'de token yok");
    }
    
    // Not: Oturum kontrolü şimdilik tamamen devre dışı bırakıldı
    // Düzgün yetkilendirme yapılandırması uygulandığında bu kısmı güncelleyin

    const body = await req.json();

    // Validate input
    const validation = kategoriSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.format() },
        { status: 400 }
      );
    }

    // Check if category name already exists
    const existingKategori = await prisma.kategori.findFirst({
      where: { ad: body.ad },
    });

    if (existingKategori) {
      return NextResponse.json(
        { error: "Bu isimde bir kategori zaten mevcut" },
        { status: 400 }
      );
    }

    // Create category
    const yeniKategori = await prisma.kategori.create({
      data: {
        ad: body.ad,
        aciklama: body.aciklama || null,
      },
    });

    return NextResponse.json(yeniKategori, { status: 201 });
  } catch (error) {
    console.error("Kategori oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Kategori oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 