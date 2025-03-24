import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Personel } from "@prisma/client";

// Validasyon şeması
const personelSchema = z.object({
  ad: z.string()
    .min(3, "Ad en az 3 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğĞüÜşŞıİöÖçÇ0-9\s-]+$/, "Ad sadece harf, rakam, boşluk ve - içerebilir"),
  departmanId: z.string()
    .min(1, "Departman seçilmelidir"),
  telefon: z.string()
    .min(1, "Telefon numarası zorunludur")
    .regex(/^[0-9]{3,10}$/, "Telefon numarası 3 ile 10 hane arasında olmalıdır"),
  aktif: z.boolean()
    .default(true)
});

// GET - Tüm personelleri getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const departmanId = searchParams.get('departman') || undefined;
    const status = searchParams.get('status');

    // Filtreleme koşullarını oluştur
    const where = {
      AND: [
        // Arama filtresi
        search ? {
          OR: [
            { ad: { contains: search, mode: 'insensitive' } },
            { telefon: { contains: search } }
          ]
        } : {},
        // Departman filtresi
        departmanId ? { departmanId } : {},
        // Durum filtresi
        status === 'active' ? { aktif: true } :
        status === 'inactive' ? { aktif: false } : {}
      ]
    };

    // Toplam kayıt sayısını al
    const total = await prisma.personel.count({ where });

    // Personelleri getir
    const personeller = await prisma.personel.findMany({
      where,
      include: {
        departman: true
      },
      orderBy: { ad: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // API yanıtını formatla
    const formattedPersoneller = personeller.map((personel: Personel & { departman: { id: string; ad: string } }) => ({
      id: personel.id,
      ad: personel.ad,
      telefon: personel.telefon,
      aktif: personel.aktif,
      departman: {
        id: personel.departman.id,
        ad: personel.departman.ad
      }
    }));

    return NextResponse.json({
      data: formattedPersoneller,
      totalRecords: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Personeller listelenirken hata:", error);
    return NextResponse.json(
      { error: "Personeller listelenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST - Yeni personel ekle
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Gelen veriyi doğrula
    const validatedData = personelSchema.parse(body);

    // Departmanın varlığını kontrol et
    const departman = await prisma.departman.findUnique({
      where: { id: validatedData.departmanId }
    });

    if (!departman) {
      return NextResponse.json(
        { error: "Seçilen departman bulunamadı" },
        { status: 400 }
      );
    }

    // Personeli oluştur
    const personel = await prisma.personel.create({
      data: validatedData,
      include: {
        departman: true
      }
    });

    // API yanıtını formatla
    const formattedPersonel = {
      id: personel.id,
      ad: personel.ad,
      telefon: personel.telefon,
      aktif: personel.aktif,
      departman: {
        id: personel.departman.id,
        ad: personel.departman.ad
      }
    };

    return NextResponse.json(formattedPersonel);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Personel eklenirken hata:", error);
    return NextResponse.json(
      { error: "Personel eklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 