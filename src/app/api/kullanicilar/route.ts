import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Validasyon şeması
const userSchema = z.object({
  name: z.string()
    .min(3, "Ad en az 3 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğĞüÜşŞıİöÖçÇ\s]+$/, "Ad sadece harflerden oluşmalıdır"),
  email: z.string()
    .email("Geçerli bir email adresi giriniz")
    .min(5, "Email en az 5 karakter olmalıdır")
    .max(50, "Email en fazla 50 karakter olabilir"),
  password: z.string()
    .min(6, "Şifre en az 6 karakter olmalıdır")
    .max(50, "Şifre en fazla 50 karakter olabilir"),
  role: z.string()
    .default("USER"),
  isApproved: z.boolean()
    .default(false)
});

// GET - Tüm kullanıcıları getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    // Filtreleme koşulları
    const where: Prisma.UserWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          { email: { contains: search, mode: 'insensitive' as Prisma.QueryMode } }
        ]
      }),
      ...(role && role !== "all" && { role }),
      ...(status && status !== "all" && { isApproved: status === "true" })
    };

    // Toplam kayıt sayısını al
    const total = await prisma.user.count({ where });

    // Kullanıcıları getir
    const users = await prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            atananTalepler: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' }
    });

    // API yanıtını formatla
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      createdAt: user.createdAt,
      talepSayisi: user._count.atananTalepler
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error("Kullanıcılar alınırken hata:", error);
    return NextResponse.json(
      { error: "Kullanıcılar alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST - Yeni kullanıcı oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Gelen veriyi doğrula
    const validatedData = userSchema.parse(body);

    // Email benzersizliğini kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanımda" },
        { status: 400 }
      );
    }

    // Yeni kullanıcıyı oluştur
    const newUser = await prisma.user.create({
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        createdAt: true,
        _count: {
          select: {
            atananTalepler: true
          }
        }
      }
    });

    // API yanıtını formatla
    const formattedUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isApproved: newUser.isApproved,
      createdAt: newUser.createdAt,
      talepSayisi: newUser._count.atananTalepler
    };

    return NextResponse.json(formattedUser, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Kullanıcı oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Kullanıcı oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 