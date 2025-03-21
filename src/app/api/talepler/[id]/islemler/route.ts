import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { TalepIslemTipi, TalepDurum } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const islemler = await prisma.talepIslem.findMany({
      where: {
        talepId: params.id,
      },
      include: {
        yapanKullanici: {
          select: {
            id: true,
            name: true,
          },
        },
        dosyalar: {
          select: {
            dosyaYolu: true,
          },
        },
      },
      orderBy: {
        olusturulmaTarihi: 'desc',
      },
    });

    // Response için dosya alanlarını dönüştür
    const formattedIslemler = islemler.map((islem) => ({
      ...islem,
      dosyalar: islem.dosyalar.map((dosya) => ({
        url: dosya.dosyaYolu,
      })),
    }));

    return NextResponse.json(formattedIslemler);
  } catch (error) {
    console.error('İşlemler getirme hatası:', error);
    return NextResponse.json(
      { error: 'İşlemler getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { tip, aciklama, durum, dosyaUrls } = await request.json();

    // İşlemi oluştur
    const islem = await prisma.talepIslem.create({
      data: {
        tip: tip as TalepIslemTipi,
        aciklama,
        durum: durum as TalepDurum,
        talepId: params.id,
        yapanKullaniciId: user.id,
        dosyalar: {
          create: dosyaUrls.map((url: string) => ({
            dosyaAdi: url.split('/').pop() || '',
            dosyaYolu: url,
            dosyaBoyutu: 0,
            dosyaTipi: url.split('.').pop() || '',
          })),
        },
      },
      include: {
        yapanKullanici: {
          select: {
            id: true,
            name: true,
          },
        },
        dosyalar: {
          select: {
            dosyaYolu: true,
          },
        },
      },
    });

    // İşlem tamamlandıysa talebi de tamamlandı olarak işaretleyelim
    if (durum === "TAMAMLANDI") {
      await prisma.talep.update({
        where: { id: params.id },
        data: {
          durum: "TAMAMLANDI",
          kapatilmaTarihi: new Date()
        }
      });
    } 
    // İşlem devam ediyorsa ve diğer durumlarda talebi açık olarak işaretleyelim
    else if (durum === "DEVAM_EDIYOR") {
      await prisma.talep.update({
        where: { id: params.id },
        data: {
          durum: "DEVAM_EDIYOR",
          kapatilmaTarihi: null
        }
      });
    }

    // Response için dosya alanlarını dönüştür
    const formattedIslem = {
      ...islem,
      dosyalar: islem.dosyalar.map((dosya) => ({
        url: dosya.dosyaYolu,
      })),
    };

    return NextResponse.json(formattedIslem);
  } catch (error) {
    console.error('İşlem oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'İşlem oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 