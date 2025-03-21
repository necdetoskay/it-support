import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { TalepIslemTipi, TalepDurum } from '@prisma/client';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; islemId: string } }
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

    // Mevcut işlemin durumunu kontrol et
    const eskiIslem = await prisma.talepIslem.findUnique({
      where: {
        id: params.islemId,
      },
      select: {
        durum: true,
      }
    });

    // Önce mevcut dosyaları sil
    await prisma.talepIslemDosya.deleteMany({
      where: {
        islemId: params.islemId,
      },
    });

    // İşlemi güncelle ve yeni dosyaları ekle
    const islem = await prisma.talepIslem.update({
      where: {
        id: params.islemId,
      },
      data: {
        tip: tip as TalepIslemTipi,
        aciklama,
        durum: durum as TalepDurum,
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

    // Durum değişikliği kontrolü ve talep güncellemesi
    if (durum === "TAMAMLANDI" && eskiIslem?.durum !== "TAMAMLANDI") {
      // İşlem tamamlandı olarak güncellenmiş, talebi de tamamlandı olarak işaretle
      await prisma.talep.update({
        where: { id: params.id },
        data: {
          durum: "TAMAMLANDI",
          kapatilmaTarihi: new Date()
        }
      });
    } else if (durum === "DEVAM_EDIYOR" && eskiIslem?.durum === "TAMAMLANDI") {
      // Tamamlanmış işlem devam ediyor olarak güncellenmiş, talebi de devam ediyor olarak işaretle
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
    console.error('İşlem güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'İşlem güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; islemId: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Silinen işlemin durumunu kontrol et
    const silinecekIslem = await prisma.talepIslem.findUnique({
      where: {
        id: params.islemId,
      },
      select: {
        durum: true,
      }
    });

    // İşlemi sil (dosyalar cascade delete ile silinecek)
    await prisma.talepIslem.delete({
      where: {
        id: params.islemId,
      },
    });

    // Eğer silinen işlem "TAMAMLANDI" durumunda idiyse, talebin durumunu kontrol et
    if (silinecekIslem?.durum === "TAMAMLANDI") {
      // Diğer aktif TAMAMLANDI işlemleri var mı kontrol et
      const tamamlanmisIslemSayisi = await prisma.talepIslem.count({
        where: {
          talepId: params.id,
          durum: "TAMAMLANDI",
        },
      });

      // Eğer başka tamamlanmış işlem yoksa, talebi DEVAM_EDIYOR olarak işaretle
      if (tamamlanmisIslemSayisi === 0) {
        await prisma.talep.update({
          where: { id: params.id },
          data: {
            durum: "DEVAM_EDIYOR",
            kapatilmaTarihi: null
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('İşlem silme hatası:', error);
    return NextResponse.json(
      { error: 'İşlem silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 