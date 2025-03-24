import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }

    const sorun = await prisma.sorun.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!sorun) {
      return NextResponse.json(
        { error: "Sorun bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(sorun);
  } catch (error) {
    console.error("Hata:", error);
    return NextResponse.json(
      { error: "Sorun detayı yüklenirken hata oluştu" },
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
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }

    const body = await request.json();
    const {
      baslik,
      aciklama,
      durum,
      oncelik,
      kategori,
      departman,
      atanan,
    } = body;

    const sorun = await prisma.sorun.update({
      where: {
        id: params.id,
      },
      data: {
        baslik,
        aciklama,
        durum,
        oncelik,
        kategori,
        departman,
        atanan,
      },
    });

    return NextResponse.json(sorun);
  } catch (error) {
    console.error("Hata:", error);
    return NextResponse.json(
      { error: "Sorun güncellenirken hata oluştu" },
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
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }

    await prisma.sorun.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Sorun başarıyla silindi" });
  } catch (error) {
    console.error("Hata:", error);
    return NextResponse.json(
      { error: "Sorun silinirken hata oluştu" },
      { status: 500 }
    );
  }
} 