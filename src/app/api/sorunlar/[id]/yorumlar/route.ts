import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const yorumSchema = z.object({
  icerik: z.string().min(1, "Yorum içeriği boş olamaz"),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }

    const yorumlar = await prisma.sorunYorum.findMany({
      where: {
        sorunId: params.id,
      },
      orderBy: {
        olusturmaTarihi: "desc",
      },
    });

    return NextResponse.json(yorumlar);
  } catch (error) {
    console.error("Hata:", error);
    return NextResponse.json(
      { error: "Yorumlar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = yorumSchema.parse(body);

    const yorum = await prisma.sorunYorum.create({
      data: {
        icerik: validatedData.icerik,
        sorunId: params.id,
        olusturan: session.user.email,
      },
    });

    return NextResponse.json(yorum);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Hata:", error);
    return NextResponse.json(
      { error: "Yorum eklenirken hata oluştu" },
      { status: 500 }
    );
  }
} 