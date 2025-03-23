import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Oncelik } from "@prisma/client";

// Validasyon şeması
const slaSchema = z.object({
  kategoriId: z.string().min(1, "Kategori seçimi zorunludur"),
  oncelik: z.string().min(1, "Öncelik seçimi zorunludur"),
  yanitlamaSuresi: z.coerce.number().min(1, "En az 1 saat olmalıdır"),
  cozumSuresi: z.coerce.number().min(1, "En az 1 saat olmalıdır"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // SLA kuralını getir
    const slaKurali = await prisma.sLAKural.findUnique({
      where: { id },
      include: {
        kategori: {
          select: {
            ad: true
          }
        }
      }
    });

    if (!slaKurali) {
      return NextResponse.json(
        { error: "SLA kuralı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(slaKurali);
  } catch (error) {
    console.error("SLA kuralı getirilirken hata:", error);
    return NextResponse.json(
      { error: "SLA kuralı getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // SLA kuralının var olup olmadığını kontrol et
    const mevcutSLA = await prisma.sLAKural.findUnique({
      where: { id }
    });

    if (!mevcutSLA) {
      return NextResponse.json(
        { error: "Güncellenecek SLA kuralı bulunamadı" },
        { status: 404 }
      );
    }

    // İsteği al ve doğrula
    const body = await request.json();
    const validationResult = slaSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { kategoriId, oncelik, yanitlamaSuresi, cozumSuresi } = validationResult.data;

    // Kategoriyi kontrol et
    const kategori = await prisma.kategori.findUnique({
      where: { id: kategoriId }
    });

    if (!kategori) {
      return NextResponse.json(
        { error: "Geçersiz kategori" },
        { status: 400 }
      );
    }

    // Aynı kategori ve öncelik için zaten başka bir kural var mı kontrol et
    const mevcutKural = await prisma.sLAKural.findFirst({
      where: {
        kategoriId,
        oncelik: oncelik as Oncelik,
        id: { not: id }
      }
    });

    if (mevcutKural) {
      return NextResponse.json(
        { error: "Bu kategori ve öncelik için zaten bir SLA kuralı bulunmaktadır" },
        { status: 409 }
      );
    }

    // SLA kuralını güncelle
    const guncellenenSLA = await prisma.sLAKural.update({
      where: { id },
      data: {
        kategoriId,
        oncelik: oncelik as Oncelik,
        yanitlamaSuresi,
        cozumSuresi
      },
      include: {
        kategori: {
          select: {
            ad: true
          }
        }
      }
    });

    return NextResponse.json(guncellenenSLA);
  } catch (error) {
    console.error("SLA kuralı güncellenirken hata:", error);
    return NextResponse.json(
      { error: "SLA kuralı güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // SLA kuralının var olup olmadığını kontrol et
    const mevcutSLA = await prisma.sLAKural.findUnique({
      where: { id }
    });

    if (!mevcutSLA) {
      return NextResponse.json(
        { error: "Silinecek SLA kuralı bulunamadı" },
        { status: 404 }
      );
    }

    // SLA kuralının ilişkili kayıtları olup olmadığını kontrol edebiliriz
    // Bu örnekte, taleplerin SLA kuralıyla ilişkisi yoksa gerek yok

    // SLA kuralını sil
    await prisma.sLAKural.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "SLA kuralı başarıyla silindi" }
    );
  } catch (error) {
    console.error("SLA kuralı silinirken hata:", error);
    return NextResponse.json(
      { error: "SLA kuralı silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 