import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validasyon şeması
const departmanSchema = z.object({
  ad: z.string()
    .min(3, "Departman adı en az 3 karakter olmalıdır")
    .max(50, "Departman adı en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğĞüÜşŞıİöÖçÇ0-9\s-]+$/, "Departman adı sadece harf, rakam, boşluk ve - içerebilir"),
  
  aciklama: z.string()
    .max(200, "Açıklama en fazla 200 karakter olabilir")
    .optional()
});

// GET - Tüm departmanları getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sayfa = Number(searchParams.get("sayfa")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const arama = searchParams.get("arama") || "";
    
    // Toplam kayıt sayısını al
    const toplamKayit = await prisma.departman.count({
      where: {
        OR: [
          { ad: { contains: arama, mode: 'insensitive' } },
          { aciklama: { contains: arama, mode: 'insensitive' } }
        ]
      }
    });

    const departments = await prisma.departman.findMany({
      where: {
        OR: [
          { ad: { contains: arama, mode: 'insensitive' } },
          { aciklama: { contains: arama, mode: 'insensitive' } }
        ]
      },
      include: {
        _count: {
          select: {
            personeller: true,
            sorunlar: true
          }
        }
      },
      skip: (sayfa - 1) * limit,
      take: limit,
      orderBy: { ad: 'asc' }
    });

    // API yanıtını istenen formata dönüştür
    const formattedDepartments = departments.map(dept => ({
      id: dept.id,
      ad: dept.ad,
      aciklama: dept.aciklama,
      personelSayisi: dept._count.personeller,
      talepSayisi: dept._count.sorunlar
    }));

    return NextResponse.json({
      departments: formattedDepartments,
      sayfalama: {
        toplamKayit,
        toplamSayfa: Math.ceil(toplamKayit / limit),
        mevcutSayfa: sayfa,
        limit
      }
    });
  } catch (error) {
    console.error("Departmanlar alınırken hata:", error);
    return NextResponse.json(
      { error: "Departmanlar alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST - Yeni departman oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Gelen veriyi doğrula
    const validatedData = departmanSchema.parse(body);

    // Departman adının benzersiz olduğunu kontrol et
    const existingDepartment = await prisma.departman.findFirst({
      where: { ad: validatedData.ad }
    });

    if (existingDepartment) {
      return NextResponse.json(
        { error: "Bu isimde bir departman zaten var" },
        { status: 400 }
      );
    }

    // Yeni departmanı oluştur
    const newDepartment = await prisma.departman.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            personeller: true,
            sorunlar: true
          }
        }
      }
    });

    // API yanıtını istenen formata dönüştür
    const formattedDepartment = {
      id: newDepartment.id,
      ad: newDepartment.ad,
      aciklama: newDepartment.aciklama,
      personelSayisi: newDepartment._count.personeller,
      talepSayisi: newDepartment._count.sorunlar
    };

    return NextResponse.json(formattedDepartment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Departman oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Departman oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 