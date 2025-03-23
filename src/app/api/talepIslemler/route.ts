import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Kullanıcı kontrolü
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    // URL parametrelerini al
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || '10');
    const offset = Number(searchParams.get('offset') || '0');
    const talepId = searchParams.get('talepId');

    // Query koşullarını oluştur
    const where: any = {};
    if (talepId) {
      where.talepId = talepId;
    }

    // Toplam kayıt sayısını al
    const total = await prisma.talepIslem.count({
      where,
    });

    // İşlemleri al
    const islemler = await prisma.talepIslem.findMany({
      where,
      include: {
        talep: {
          select: {
            id: true,
            baslik: true,
          },
        },
        yapanKullanici: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        olusturulmaTarihi: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({
      islemler,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error: any) {
    console.error('TalepIslemler listelerken hata:', error);
    return NextResponse.json(
      { error: 'İşlemler alınırken bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
} 