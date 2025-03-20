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

// GET - Tek bir departmanın detaylarını getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const department = await prisma.departman.findUnique({
      where: { id: params.id },
      include: {
        personeller: {
          where: { aktif: true }
        },
        talepler: true,
        _count: {
          select: {
            personeller: true,
            talepler: true
          }
        }
      }
    });

    if (!department) {
      return NextResponse.json(
        { error: "Departman bulunamadı" },
        { status: 404 }
      );
    }

    // API yanıtını istenen formata dönüştür
    const formattedDepartment = {
      id: department.id,
      ad: department.ad,
      aciklama: department.aciklama,
      personelSayisi: department._count.personeller,
      talepSayisi: department._count.talepler,
      personeller: department.personeller,
      talepler: department.talepler
    };

    return NextResponse.json(formattedDepartment);
  } catch (error) {
    console.error("Departman detayı alınırken hata:", error);
    return NextResponse.json(
      { error: "Departman detayı alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT - Departmanı güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Gelen veriyi doğrula
    const validatedData = departmanSchema.parse(body);

    // Departmanın var olduğunu kontrol et
    const existingDepartment = await prisma.departman.findUnique({
      where: { id: params.id }
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: "Departman bulunamadı" },
        { status: 404 }
      );
    }

    // Aynı isimde başka bir departman var mı kontrol et
    const duplicateDepartment = await prisma.departman.findFirst({
      where: {
        ad: validatedData.ad,
        id: { not: params.id }
      }
    });

    if (duplicateDepartment) {
      return NextResponse.json(
        { error: "Bu isimde bir departman zaten var" },
        { status: 400 }
      );
    }

    // Departmanı güncelle
    const updatedDepartment = await prisma.departman.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        _count: {
          select: {
            personeller: true,
            talepler: true
          }
        }
      }
    });

    // API yanıtını istenen formata dönüştür
    const formattedDepartment = {
      id: updatedDepartment.id,
      ad: updatedDepartment.ad,
      aciklama: updatedDepartment.aciklama,
      personelSayisi: updatedDepartment._count.personeller,
      talepSayisi: updatedDepartment._count.talepler
    };

    return NextResponse.json(formattedDepartment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Departman güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Departman güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE - Departmanı sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Departmanın var olduğunu kontrol et
    const existingDepartment = await prisma.departman.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            personeller: true,
            talepler: true
          }
        }
      }
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: "Departman bulunamadı" },
        { status: 404 }
      );
    }

    // Departmana bağlı personel veya talep varsa silmeyi engelle
    if (existingDepartment._count.personeller > 0 || existingDepartment._count.talepler > 0) {
      return NextResponse.json(
        { error: "Bu departman silinemez çünkü bağlı personel veya talepler var" },
        { status: 400 }
      );
    }

    // Departmanı sil
    await prisma.departman.delete({
      where: { id: params.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Departman silinirken hata:", error);
    return NextResponse.json(
      { error: "Departman silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 