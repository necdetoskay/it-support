import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma, Oncelik, TalepDurum } from "@prisma/client";

// Talep oluşturma şeması
const talepOlusturmaSchema = z.object({
  baslik: z.string().min(1, "Başlık zorunludur"),
  sorunDetay: z.string().min(1, "Sorun detayı zorunludur"),
  departmanId: z.string().min(1, "Departman seçimi zorunludur"),
  kategoriId: z.string().min(1, "Kategori seçimi zorunludur"),
  raporEdenId: z.string().min(1, "Rapor eden kişi seçimi zorunludur"),
  atananId: z.string().nullable(),
  oncelik: z.enum(["DUSUK", "ORTA", "YUKSEK", "ACIL"]),
  durum: z.enum(["DEVAM_EDIYOR", "TAMAMLANDI", "BEKLEMEDE", "IPTAL"]),
});

// GET /api/talepler
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const departmanId = searchParams.get("departmanId");
    const kategoriId = searchParams.get("kategoriId");
    const durum = searchParams.get("durum");
    const oncelik = searchParams.get("oncelik");

    // Filtreleme koşulları
    const where: Prisma.TalepWhereInput = {};

    // Arama filtresi
    if (search) {
      where.OR = [
        { baslik: { contains: search, mode: "insensitive" } },
        { sorunDetay: { contains: search, mode: "insensitive" } },
      ];
    }

    // Diğer filtreler
    if (departmanId) where.departmanId = departmanId;
    if (kategoriId) where.kategoriId = kategoriId;
    if (durum && Object.values(TalepDurum).includes(durum as TalepDurum)) {
      where.durum = durum as TalepDurum;
    }
    if (oncelik && Object.values(Oncelik).includes(oncelik as Oncelik)) {
      where.oncelik = oncelik as Oncelik;
    }

    // Talepleri getir
    const talepler = await prisma.talep.findMany({
      where,
      include: {
        departman: true,
        kategori: true,
        raporEden: true,
        atanan: true,
        sorunEtiketleri: true,
        cozumEtiketleri: true,
      },
      orderBy: {
        olusturulmaTarihi: "desc",
      },
    });

    // Durumları kontrol et ve gerekirse düzelt
    for (const talep of talepler) {
      if (talep.durum === "TAMAMLANDI") {
        // Tamamlanmış işlem sayısını kontrol et
        const tamamlanmisIslemSayisi = await prisma.talepIslem.count({
          where: {
            talepId: talep.id,
            durum: "TAMAMLANDI",
          },
        });

        // Eğer tamamlanmış işlem yoksa, talebin durumunu güncelle
        if (tamamlanmisIslemSayisi === 0) {
          await prisma.talep.update({
            where: { id: talep.id },
            data: {
              durum: "DEVAM_EDIYOR",
              kapatilmaTarihi: null
            }
          });

          // Yanıt vermeden önce talep nesnesini de güncelle
          talep.durum = "DEVAM_EDIYOR";
          talep.kapatilmaTarihi = null;
        }
      }
    }

    if (!talepler) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(talepler);
  } catch (error) {
    console.error("Talepler getirilirken hata:", error);
    return NextResponse.json(
      { error: "Talepler getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /api/talepler
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = talepOlusturmaSchema.parse(json);

    // Talebi oluştur
    const talep = await prisma.talep.create({
      data: {
        baslik: body.baslik,
        sorunDetay: body.sorunDetay,
        departmanId: body.departmanId,
        kategoriId: body.kategoriId,
        raporEdenId: body.raporEdenId,
        atananId: body.atananId || null,
        oncelik: body.oncelik,
        durum: body.durum,
      },
      include: {
        departman: true,
        kategori: true,
        raporEden: true,
        atanan: true,
      },
    });

    return NextResponse.json(talep);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Talep oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Talep oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 