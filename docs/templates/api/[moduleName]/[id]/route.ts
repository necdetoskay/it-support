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

// GET - Tek bir kaydın detaylarını getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.MODEL_NAME.findUnique({
      where: { id: params.id },
      include: {
        // İlişkili kayıtları ekleyin
        // ornek: personeller: { where: { aktif: true } },
        // ornek: talepler: true,
        _count: {
          select: {
            // İlişkili kayıt sayılarını ekleyin
            // ornek: personeller: true,
            // ornek: talepler: true
          }
        }
      }
    });

    if (!item) {
      return NextResponse.json(
        { error: "Kayıt bulunamadı" },
        { status: 404 }
      );
    }

    // API yanıtını formatla
    const formattedItem = {
      id: item.id,
      ad: item.ad,
      aciklama: item.aciklama,
      // İlişkili kayıtları ve sayılarını ekleyin
      // ornek: personelSayisi: item._count.personeller,
      // ornek: talepSayisi: item._count.talepler,
      // ornek: personeller: item.personeller,
      // ornek: talepler: item.talepler
    };

    return NextResponse.json(formattedItem);
  } catch (error) {
    console.error("Kayıt detayı alınırken hata:", error);
    return NextResponse.json(
      { error: "Kayıt detayı alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT - Kaydı güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Gelen veriyi doğrula
    const validatedData = schema.parse(body);

    // Kaydın var olduğunu kontrol et
    const existingItem = await prisma.MODEL_NAME.findUnique({
      where: { id: params.id }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Kayıt bulunamadı" },
        { status: 404 }
      );
    }

    // Aynı isimde başka bir kayıt var mı kontrol et
    const duplicateItem = await prisma.MODEL_NAME.findFirst({
      where: {
        ad: validatedData.ad,
        id: { not: params.id }
      }
    });

    if (duplicateItem) {
      return NextResponse.json(
        { error: "Bu isimde bir kayıt zaten var" },
        { status: 400 }
      );
    }

    // Kaydı güncelle
    const updatedItem = await prisma.MODEL_NAME.update({
      where: { id: params.id },
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
      id: updatedItem.id,
      ad: updatedItem.ad,
      aciklama: updatedItem.aciklama,
      // İlişkili kayıt sayılarını ekleyin
      // ornek: personelSayisi: updatedItem._count.personeller,
      // ornek: talepSayisi: updatedItem._count.talepler
    };

    return NextResponse.json(formattedItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Kayıt güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Kayıt güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE - Kaydı sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Kaydın var olduğunu kontrol et
    const existingItem = await prisma.MODEL_NAME.findUnique({
      where: { id: params.id },
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

    if (!existingItem) {
      return NextResponse.json(
        { error: "Kayıt bulunamadı" },
        { status: 404 }
      );
    }

    // İlişkili kayıt kontrolü
    // ornek: if (existingItem._count.personeller > 0 || existingItem._count.talepler > 0) {
    //   return NextResponse.json(
    //     { error: "Bu kayıt silinemez çünkü bağlı kayıtlar var" },
    //     { status: 400 }
    //   );
    // }

    // Kaydı sil
    await prisma.MODEL_NAME.delete({
      where: { id: params.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Kayıt silinirken hata:", error);
    return NextResponse.json(
      { error: "Kayıt silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 