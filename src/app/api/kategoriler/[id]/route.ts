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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const kategori = await db.kategori.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            talepler: true
          }
        }
      }
    });

    if (!kategori) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(kategori);
  } catch (error) {
    console.error("Kategori getirilirken hata:", error);
    return NextResponse.json(
      { error: "Kategori getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = kategoriSchema.parse(body);

    // Check if kategori exists
    const existingKategori = await db.kategori.findUnique({
      where: { id: params.id }
    });

    if (!existingKategori) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    // Check if name is already taken by another kategori
    const duplicateKategori = await db.kategori.findFirst({
      where: {
        AND: [
          { ad: validatedData.ad },
          { id: { not: params.id } }
        ]
      }
    });

    if (duplicateKategori) {
      return NextResponse.json(
        { error: "Bu isimde bir kategori zaten mevcut" },
        { status: 400 }
      );
    }

    // Update kategori
    const updatedKategori = await db.kategori.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        _count: {
          select: {
            talepler: true
          }
        }
      }
    });

    return NextResponse.json(updatedKategori);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Kategori güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Kategori güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if kategori exists and has any related records
    const kategori = await db.kategori.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            talepler: true,
            other_Kategori: true
          }
        }
      }
    });

    if (!kategori) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    // Check if kategori has any related records
    if (kategori._count.talepler > 0) {
      return NextResponse.json(
        { error: "Bu kategoriye bağlı talepler olduğu için silinemez" },
        { status: 400 }
      );
    }

    if (kategori._count.other_Kategori > 0) {
      return NextResponse.json(
        { error: "Bu kategoriye bağlı alt kategoriler olduğu için silinemez" },
        { status: 400 }
      );
    }

    // Delete kategori
    await db.kategori.delete({
      where: { id: params.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Kategori silinirken hata:", error);
    return NextResponse.json(
      { error: "Kategori silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 