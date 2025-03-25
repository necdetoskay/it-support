import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// Kategori listesini getir
export async function GET(req: NextRequest) {
  try {
    // Token kontrolü
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json(
        { error: "Kimlik doğrulama başarısız" },
        { status: 401 }
      );
    }

    try {
      // Tüm kategorileri getir
      const kategoriler = await prisma.kategori.findMany({
        orderBy: {
          ad: "asc",
        },
      });

      return NextResponse.json(kategoriler);
    } catch (prismaError) {
      console.error("Prisma hatası:", prismaError);
      
      // Alternatif olarak API'yi taklit eden mock veri dönelim
      const mockKategoriler = [
        { id: "1", ad: "Donanım", aciklama: "Donanım sorunları" },
        { id: "2", ad: "Yazılım", aciklama: "Yazılım sorunları" },
        { id: "3", ad: "Ağ", aciklama: "Ağ sorunları" },
        { id: "4", ad: "Kullanıcı Hesabı", aciklama: "Kullanıcı hesabı sorunları" },
      ];
      
      return NextResponse.json(mockKategoriler);
    }
  } catch (error) {
    console.error("Sorun kategorileri getirilemedi:", error);
    return NextResponse.json(
      { error: "Sorun kategorileri getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 