import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET() {
  try {
    // Yetkilendirme kontrolü
    const user = await getUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    // Prisma ile veritabanı meta bilgisini sorgulama
    // Bu sorgu özel bir Prisma sorgusu olup veritabanı tablolarını getiriyor
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name`;

    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Veritabanı tabloları getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Veritabanı tabloları getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 