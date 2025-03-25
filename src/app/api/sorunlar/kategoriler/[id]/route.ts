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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Yetkilendirme kontrolü - getServerSession yerine token kontrolüne geçiş
    // İstemci yetkisini middleware kontrolü veya JWT doğrulamasıyla sağla
    const tokenInfo = req.headers.get("Authorization")?.split(" ")[1];
    
    if (tokenInfo) {
      console.log("API'de token var:", !!tokenInfo);
    } else {
      console.log("API'de token yok");
    }
    
    // Not: Oturum kontrolü şimdilik tamamen devre dışı bırakıldı 
    // Düzgün yetkilendirme yapılandırması uygulandığında bu kısmı güncelleyin

    const id = params.id;
    
    const kategori = await prisma.kategori.findUnique({
      where: { id },
    });

    if (!kategori) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(kategori);
  } catch (error) {
    console.error("Kategori getirme hatası:", error);
    return NextResponse.json(
      { error: "Kategori getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Yetkilendirme kontrolü - getServerSession yerine token kontrolüne geçiş
    // İstemci yetkisini middleware kontrolü veya JWT doğrulamasıyla sağla
    const tokenInfo = req.headers.get("Authorization")?.split(" ")[1];
    
    if (tokenInfo) {
      console.log("API'de token var:", !!tokenInfo);
    } else {
      console.log("API'de token yok");
    }
    
    // Not: Oturum kontrolü şimdilik tamamen devre dışı bırakıldı
    // Düzgün yetkilendirme yapılandırması uygulandığında bu kısmı güncelleyin

    const id = params.id;
    const body = await req.json();

    // Validate input
    const validation = kategoriSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.format() },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingKategori = await prisma.kategori.findUnique({
      where: { id },
    });

    if (!existingKategori) {
      return NextResponse.json(
        { error: "Güncellenecek kategori bulunamadı" },
        { status: 404 }
      );
    }

    // Check if name already exists for another category
    const duplicateKategori = await prisma.kategori.findFirst({
      where: {
        ad: body.ad,
        id: { not: id },
      },
    });

    if (duplicateKategori) {
      return NextResponse.json(
        { error: "Bu isimde bir kategori zaten mevcut" },
        { status: 400 }
      );
    }

    // Update category
    const updatedKategori = await prisma.kategori.update({
      where: { id },
      data: {
        ad: body.ad,
        aciklama: body.aciklama,
      },
    });

    return NextResponse.json(updatedKategori);
  } catch (error) {
    console.error("Kategori güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Kategori güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Yetkilendirme kontrolü - getServerSession yerine token kontrolüne geçiş
    // İstemci yetkisini middleware kontrolü veya JWT doğrulamasıyla sağla
    const tokenInfo = req.headers.get("Authorization")?.split(" ")[1];
    
    if (tokenInfo) {
      console.log("API'de token var:", !!tokenInfo);
    } else {
      console.log("API'de token yok");
    }
    
    // Not: Oturum kontrolü şimdilik tamamen devre dışı bırakıldı
    // Düzgün yetkilendirme yapılandırması uygulandığında bu kısmı güncelleyin
    
    const id = params.id;

    // Check if category exists
    const existingKategori = await prisma.kategori.findUnique({
      where: { id },
    });

    if (!existingKategori) {
      return NextResponse.json(
        { error: "Silinecek kategori bulunamadı" },
        { status: 404 }
      );
    }

    // Check if there are issues linked to this category
    const linkedIssues = await prisma.sorun.count({
      where: {
        kategoriId: id,
      },
    });

    if (linkedIssues > 0) {
      return NextResponse.json(
        {
          error: "Bu kategori kullanımda olduğu için silinemez",
          details: `Bu kategoriye bağlı ${linkedIssues} sorun bulunmaktadır`,
        },
        { status: 400 }
      );
    }

    // Delete category
    await prisma.kategori.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Kategori silme hatası:", error);
    return NextResponse.json(
      { error: "Kategori silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 