import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Talep güncelleme şeması
const talepGuncellemeSchema = z.object({
  baslik: z.string().min(1, "Başlık zorunludur"),
  sorunDetay: z.string().min(1, "Sorun detayı zorunludur"),
  departmanId: z.string().min(1, "Departman seçimi zorunludur"),
  kategoriId: z.string().min(1, "Kategori seçimi zorunludur"),
  raporEdenId: z.string().min(1, "Rapor eden kişi seçimi zorunludur"),
  atananId: z.string().nullable(),
  oncelik: z.enum(["DUSUK", "ORTA", "YUKSEK", "ACIL"]),
  durum: z.enum(["DEVAM_EDIYOR", "TAMAMLANDI", "BEKLEMEDE", "IPTAL"]),
  sonTarih: z.string().nullable(),
  sorunEtiketleri: z.array(z.string()),
  cozumEtiketleri: z.array(z.string()),
});

// GET /api/talepler/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Talebi tüm gerekli ilişkilerle getir
    const talep = await prisma.talep.findUnique({
      where: { id: params.id },
      include: {
        departman: true,
        kategori: true,
        raporEden: true,
        atanan: true,
        sorunEtiketleri: true,
        cozumEtiketleri: true,
      },
    });

    if (!talep) {
      return NextResponse.json(
        { error: "Talep bulunamadı" },
        { status: 404 }
      );
    }

    // Eğer talep TAMAMLANDI durumunda ise, gerçekten tamamlanmış işlem var mı kontrol et
    if (talep.durum === "TAMAMLANDI") {
      // Tamamlanmış işlem sayısını kontrol et
      const tamamlanmisIslemSayisi = await prisma.talepIslem.count({
        where: {
          talepId: params.id,
          durum: "TAMAMLANDI",
        },
      });

      // Eğer tamamlanmış işlem yoksa, talebin durumunu güncelle
      if (tamamlanmisIslemSayisi === 0) {
        await prisma.talep.update({
          where: { id: params.id },
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

    return NextResponse.json(talep);
  } catch (error) {
    console.error("Talep detayı getirilirken hata:", error);
    return NextResponse.json(
      { error: "Talep detayı getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT /api/talepler/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    const body = talepGuncellemeSchema.parse(json);

    // Talebin var olup olmadığını kontrol et
    const mevcutTalep = await prisma.talep.findUnique({
      where: { id: params.id },
    });

    if (!mevcutTalep) {
      return NextResponse.json(
        { error: "Talep bulunamadı" },
        { status: 404 }
      );
    }

    // Talebi güncelle
    const guncelTalep = await prisma.talep.update({
      where: { id: params.id },
      data: {
        baslik: body.baslik,
        sorunDetay: body.sorunDetay,
        departmanId: body.departmanId,
        kategoriId: body.kategoriId,
        raporEdenId: body.raporEdenId,
        atananId: body.atananId,
        oncelik: body.oncelik,
        durum: body.durum,
        sonTarih: body.sonTarih,
        sorunEtiketleri: {
          set: body.sorunEtiketleri.map((id) => ({ id })),
        },
        cozumEtiketleri: {
          set: body.cozumEtiketleri.map((id) => ({ id })),
        },
      },
      include: {
        departman: true,
        kategori: true,
        raporEden: true,
        atanan: true,
        sorunEtiketleri: true,
        cozumEtiketleri: true,
      },
    });

    return NextResponse.json(guncelTalep);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Talep güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Talep güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE /api/talepler/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Talebin var olup olmadığını kontrol et
    const talep = await prisma.talep.findUnique({
      where: { id: params.id },
    });

    if (!talep) {
      return NextResponse.json(
        { error: "Talep bulunamadı" },
        { status: 404 }
      );
    }

    // Talebi sil
    await prisma.talep.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Talep başarıyla silindi" });
  } catch (error) {
    console.error("Talep silinirken hata:", error);
    return NextResponse.json(
      { error: "Talep silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 