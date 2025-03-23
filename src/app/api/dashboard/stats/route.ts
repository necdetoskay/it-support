import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TalepDurum, Oncelik } from '@prisma/client';

export async function GET() {
  try {
    // Durum bazlı talep sayılarını getir
    const statusCounts = {
      DEVAM_EDIYOR: await prisma.talep.count({ where: { durum: "DEVAM_EDIYOR" } }),
      TAMAMLANDI: await prisma.talep.count({ where: { durum: "TAMAMLANDI" } }),
      BEKLEMEDE: await prisma.talep.count({ where: { durum: "BEKLEMEDE" } }),
      IPTAL: await prisma.talep.count({ where: { durum: "IPTAL" } }),
      TOPLAM: await prisma.talep.count()
    };

    // Öncelik bazlı talep sayılarını getir
    const priorityCounts = {
      DUSUK: await prisma.talep.count({ where: { oncelik: "DUSUK" } }),
      ORTA: await prisma.talep.count({ where: { oncelik: "ORTA" } }),
      YUKSEK: await prisma.talep.count({ where: { oncelik: "YUKSEK" } }),
      ACIL: await prisma.talep.count({ where: { oncelik: "ACIL" } }),
    };

    // Departman bazlı talep sayılarını getir
    const departmentStats = await prisma.departman.findMany({
      select: {
        id: true,
        ad: true,
        _count: {
          select: {
            talepler: true
          }
        }
      },
      orderBy: {
        talepler: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Kategori bazlı talep sayılarını getir
    const categoryStats = await prisma.kategori.findMany({
      select: {
        id: true,
        ad: true,
        _count: {
          select: {
            talepler: true
          }
        }
      },
      orderBy: {
        talepler: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Son talepler
    const recentTickets = await prisma.talep.findMany({
      select: {
        id: true,
        baslik: true,
        durum: true,
        oncelik: true,
        olusturulmaTarihi: true,
        departman: {
          select: {
            ad: true
          }
        },
        kategori: {
          select: {
            ad: true
          }
        },
        raporEden: {
          select: {
            ad: true,
            soyad: true
          }
        },
        atanan: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        olusturulmaTarihi: 'desc'
      },
      take: 5
    });

    // Son işlemler
    const recentActivities = await prisma.talepIslem.findMany({
      select: {
        id: true,
        tip: true,
        aciklama: true,
        durum: true,
        olusturulmaTarihi: true,
        talep: {
          select: {
            id: true,
            baslik: true
          }
        },
        yapanKullanici: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        olusturulmaTarihi: 'desc'
      },
      take: 5
    });

    // Zaman bazlı istatistikler (son 7 gün)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    }).reverse();

    const timeSeriesData = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const created = await prisma.talep.count({
          where: {
            olusturulmaTarihi: {
              gte: date,
              lt: nextDay
            }
          }
        });

        const completed = await prisma.talep.count({
          where: {
            kapatilmaTarihi: {
              gte: date,
              lt: nextDay
            },
            durum: "TAMAMLANDI"
          }
        });

        return {
          date: date.toISOString().split('T')[0],
          created,
          completed
        };
      })
    );

    return NextResponse.json({
      statusCounts,
      priorityCounts,
      departmentStats,
      categoryStats,
      recentTickets,
      recentActivities,
      timeSeriesData
    });
  } catch (error) {
    console.error("Dashboard istatistikleri getirilirken hata:", error);
    return NextResponse.json(
      { error: "İstatistikler getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 