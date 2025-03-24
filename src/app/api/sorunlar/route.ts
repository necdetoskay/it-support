import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const arama = searchParams.get("arama");
    const durum = searchParams.get("durum");
    const oncelik = searchParams.get("oncelik");
    const kategori = searchParams.get("kategori");
    const departman = searchParams.get("departman");
    const atanan = searchParams.get("atanan");

    const where: any = {};

    if (arama) {
      where.OR = [
        { baslik: { contains: arama, mode: "insensitive" } },
        { aciklama: { contains: arama, mode: "insensitive" } },
      ];
    }

    if (durum) {
      where.durum = durum;
    }

    if (oncelik) {
      where.oncelik = oncelik;
    }

    if (kategori) {
      where.kategori = kategori;
    }

    if (departman) {
      where.departman = departman;
    }

    if (atanan) {
      where.atanan = atanan;
    }

    const sorunlar = await prisma.sorun.findMany({
      where,
      orderBy: {
        olusturmaTarihi: "desc",
      },
    });

    return NextResponse.json(sorunlar);
  } catch (error) {
    console.error("Hata:", error);
    return NextResponse.json(
      { error: "Sorunlar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const sorun = await prisma.sorun.create({
      data: {
        baslik,
        aciklama,
        durum,
        oncelik,
        kategori,
        departman,
        atanan,
        olusturan: session.user.email,
      },
    });

    return NextResponse.json(sorun);
  } catch (error) {
    console.error("Hata:", error);
    return NextResponse.json(
      { error: "Sorun oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
} 