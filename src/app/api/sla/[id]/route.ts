import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// Validasyon şeması
const slaSchema = z.object({
  kategoriId: z.string().min(1, "Kategori seçimi zorunludur"),
  oncelik: z.string().min(1, "Öncelik seçimi zorunludur"),
  yanitlamaSuresi: z.coerce.number().min(1, "En az 1 saat olmalıdır"),
  cozumSuresi: z.coerce.number().min(1, "En az 1 saat olmalıdır"),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Token kontrolü
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json(
        { error: "Kimlik doğrulama başarısız" },
        { status: 401 }
      );
    }

    const id = params.id;
    
    // Mock veri olarak SLA kuralını döndürelim
    const mockSla = {
      id: id,
      kategoriId: "1",
      oncelik: "YUKSEK",
      yanitlamaSuresi: 2,
      cozumSuresi: 8,
      kategori: {
        ad: "Donanım"
      }
    };
    
    return NextResponse.json(mockSla);
  } catch (error) {
    console.error("SLA kuralı getirilemedi:", error);
    return NextResponse.json(
      { error: "SLA kuralı getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Token kontrolü
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json(
        { error: "Kimlik doğrulama başarısız" },
        { status: 401 }
      );
    }

    const id = params.id;
    const data = await req.json();

    // Mock güncelleme işlemi
    console.log(`SLA kuralı güncellendi (mock), ID: ${id}`, data);
    
    return NextResponse.json({
      ...data,
      id: id,
      kategori: {
        ad: "Donanım"
      }
    });
  } catch (error) {
    console.error("SLA kuralı güncellenemedi:", error);
    return NextResponse.json(
      { error: "SLA kuralı güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Token kontrolü
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json(
        { error: "Kimlik doğrulama başarısız" },
        { status: 401 }
      );
    }

    const id = params.id;

    // Mock silme işlemi
    console.log(`SLA kuralı silindi (mock), ID: ${id}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SLA kuralı silinemedi:", error);
    return NextResponse.json(
      { error: "SLA kuralı silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 