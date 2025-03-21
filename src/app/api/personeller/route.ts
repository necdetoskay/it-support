import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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
    const personeller = await prisma.personel.findMany({
      include: {
        departman: true
      },
      orderBy: { ad: 'asc' }
    });

    // API yanıtını formatla
    const formattedPersoneller = personeller.map(personel => ({
      id: personel.id,
      ad: personel.ad,
      departmanId: personel.departmanId,
      departman: {
        id: personel.departman.id,
        ad: personel.departman.ad
      }
    }));

    return NextResponse.json(formattedPersoneller);
  } catch (error) {
    console.error("Personeller listelenirken hata:", error);
    return NextResponse.json(
      { error: "Personeller listelenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST - Yeni personel oluştur
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

    // Yeni personeli oluştur
    const newPersonel = await prisma.personel.create({
      data: validatedData,
      include: {
        departman: true,
        _count: {
          select: {
            raporEttigiTalepler: true
          }
        }
      }
    });

    // API yanıtını formatla
    const formattedPersonel = {
      id: newPersonel.id,
      ad: newPersonel.ad,
      telefon: newPersonel.telefon,
      aktif: newPersonel.aktif,
      departman: {
        id: newPersonel.departman.id,
        ad: newPersonel.departman.ad
      },
      talepSayisi: newPersonel._count.raporEttigiTalepler
    };

    return NextResponse.json(formattedPersonel, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Personel oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Personel oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 