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

// GET - Tek bir personelin detaylarını getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const personel = await prisma.personel.findUnique({
      where: { id: params.id },
      include: {
        departman: true,
        raporEttigiTalepler: {
          include: {
            kategori: true,
            departman: true
          }
        },
        _count: {
          select: {
            raporEttigiTalepler: true
          }
        }
      }
    });

    if (!personel) {
      return NextResponse.json(
        { error: "Personel bulunamadı" },
        { status: 404 }
      );
    }

    // API yanıtını formatla
    const formattedPersonel = {
      id: personel.id,
      ad: personel.ad,
      telefon: personel.telefon,
      aktif: personel.aktif,
      departman: {
        id: personel.departman.id,
        ad: personel.departman.ad
      },
      talepSayisi: personel._count.raporEttigiTalepler,
      talepler: personel.raporEttigiTalepler.map(talep => ({
        id: talep.id,
        baslik: talep.baslik,
        durum: talep.durum,
        kategori: talep.kategori.ad,
        departman: talep.departman.ad
      }))
    };

    return NextResponse.json(formattedPersonel);
  } catch (error) {
    console.error("Personel detayı alınırken hata:", error);
    return NextResponse.json(
      { error: "Personel detayı alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT - Personel güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Gelen veriyi doğrula
    const validatedData = personelSchema.parse(body);

    // Personelin varlığını kontrol et
    const existingPersonel = await prisma.personel.findUnique({
      where: { id: params.id }
    });

    if (!existingPersonel) {
      return NextResponse.json(
        { error: "Güncellenecek personel bulunamadı" },
        { status: 404 }
      );
    }

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

    // Personeli güncelle
    const updatedPersonel = await prisma.personel.update({
      where: { id: params.id },
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
      id: updatedPersonel.id,
      ad: updatedPersonel.ad,
      telefon: updatedPersonel.telefon,
      aktif: updatedPersonel.aktif,
      departman: {
        id: updatedPersonel.departman.id,
        ad: updatedPersonel.departman.ad
      },
      talepSayisi: updatedPersonel._count.raporEttigiTalepler
    };

    return NextResponse.json(formattedPersonel);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Personel güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Personel güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE - Personel sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Personelin varlığını ve ilişkili kayıtlarını kontrol et
    const personel = await prisma.personel.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            raporEttigiTalepler: true
          }
        }
      }
    });

    if (!personel) {
      return NextResponse.json(
        { error: "Silinecek personel bulunamadı" },
        { status: 404 }
      );
    }

    // Personelin aktif talepleri varsa silmeyi engelle
    if (personel._count.raporEttigiTalepler > 0) {
      return NextResponse.json(
        { error: "Bu personele ait talepler olduğu için silinemez" },
        { status: 400 }
      );
    }

    // Personeli sil
    await prisma.personel.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { message: "Personel başarıyla silindi" }
    );
  } catch (error) {
    console.error("Personel silinirken hata:", error);
    return NextResponse.json(
      { error: "Personel silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 