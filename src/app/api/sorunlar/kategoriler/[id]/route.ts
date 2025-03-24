import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Validation schema
const kategoriSchema = z.object({
  ad: z.string().min(1, "Kategori adı zorunludur"),
  aciklama: z.string().optional(),
  ustKategoriId: z.string().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Yetkilendirme kontrolünü kaldırıyorum şimdilik
    /*
    if (!session) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası" },
        { status: 401 }
      );
    }
    */

    const kategori = await prisma.kategori.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            talepler: true,
          },
        },
      },
    });

    if (!kategori) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(kategori);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Kategori alınırken bir hata oluştu",
        detay: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası" },
        { status: 401 }
      );
    }

    const existingKategori = await prisma.kategori.findUnique({
      where: { id: params.id },
    });

    if (!existingKategori) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = kategoriSchema.parse(body);

    // Eğer kategori adı değiştiyse, mevcut böyle bir kategori var mı kontrol et
    if (validatedData.ad !== existingKategori.ad) {
      const nameExists = await prisma.kategori.findFirst({
        where: { ad: validatedData.ad },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: "Bu isimde bir kategori zaten mevcut" },
          { status: 400 }
        );
      }
    }

    const kategoriData = {
      ad: validatedData.ad,
      aciklama: validatedData.aciklama || null,
      ...(validatedData.ustKategoriId
        ? { ustKategoriId: validatedData.ustKategoriId }
        : {}),
    };

    const updatedKategori = await prisma.kategori.update({
      where: { id: params.id },
      data: kategoriData,
      include: {
        _count: {
          select: {
            talepler: true,
          },
        },
      },
    });

    return NextResponse.json(updatedKategori);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Kategori güncellenirken bir hata oluştu",
        detay: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası" },
        { status: 401 }
      );
    }

    const kategori = await prisma.kategori.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            talepler: true,
          },
        },
      },
    });

    if (!kategori) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    // İlişkili sorunlar varsa silme işlemini reddet
    if (kategori._count.talepler > 0) {
      return NextResponse.json(
        {
          error: "Bu kategoriye bağlı sorunlar bulunmaktadır, önce bunları silmelisiniz",
        },
        { status: 400 }
      );
    }

    await prisma.kategori.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Kategori silinirken bir hata oluştu",
        detay: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
} 