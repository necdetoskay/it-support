import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔍 API çağrısı: /api/talepler/etiketleri/" + params.id);
    
    // Önce etiket tipini belirle (SORUN mu COZUM mu)
    const sorunEtiket = await prisma.sorunEtiket.findUnique({
      where: { id: params.id }
    });

    const cozumEtiket = await prisma.cozumEtiket.findUnique({
      where: { id: params.id }
    });

    let etiketTipi = null;
    if (sorunEtiket) {
      etiketTipi = "SORUN";
    } else if (cozumEtiket) {
      etiketTipi = "COZUM";
    } else {
      console.log("🔍 Etiket bulunamadı, ID:", params.id);
      return NextResponse.json({ error: "Etiket bulunamadı" }, { status: 404 });
    }

    console.log("🔍 Etiket tipi:", etiketTipi);

    // Etiket tipine göre ilişkili talepleri getir
    if (etiketTipi === "SORUN") {
      const talepler = await prisma.talep.findMany({
        where: {
          sorunEtiketleri: {
            some: {
              id: params.id
            }
          }
        },
        select: {
          id: true,
          baslik: true,
          durum: true,
          oncelik: true,
          olusturulmaTarihi: true,
          guncellenmeTarihi: true,
          sorunDetay: true,
          departman: {
            select: {
              id: true,
              ad: true
            }
          },
          kategori: {
            select: {
              id: true,
              ad: true
            }
          },
          raporEden: {
            select: {
              id: true,
              ad: true
            }
          },
          atanan: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          olusturulmaTarihi: 'desc'
        }
      });

      console.log("🔍 SORUN tipi için bulunan talepler:", talepler.length);
      return NextResponse.json({ talepler });
    } else {
      const talepler = await prisma.talep.findMany({
        where: {
          cozumEtiketleri: {
            some: {
              id: params.id
            }
          }
        },
        select: {
          id: true,
          baslik: true,
          durum: true,
          oncelik: true,
          olusturulmaTarihi: true,
          guncellenmeTarihi: true,
          sorunDetay: true,
          departman: {
            select: {
              id: true,
              ad: true
            }
          },
          kategori: {
            select: {
              id: true,
              ad: true
            }
          },
          raporEden: {
            select: {
              id: true,
              ad: true
            }
          },
          atanan: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          olusturulmaTarihi: 'desc'
        }
      });

      console.log("🔍 COZUM tipi için bulunan talepler:", talepler.length);
      return NextResponse.json({ talepler });
    }
  } catch (error) {
    console.error("🔍 Etiket talepleri alınırken hata:", error);
    return NextResponse.json(
      { error: "Etiket talepleri alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
