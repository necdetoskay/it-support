import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kayıtlı" },
        { status: 400 }
      );
    }

    // Şifreyi hashleme
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluşturma
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "Kullanıcı başarıyla oluşturuldu", user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return NextResponse.json(
      { error: "Kayıt işlemi sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
} 