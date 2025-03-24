import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validasyon şeması
const userUpdateSchema = z.object({
  name: z.string()
    .min(3, "Ad en az 3 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğĞüÜşŞıİöÖçÇ\s]+$/, "Ad sadece harflerden oluşmalıdır"),
  email: z.string()
    .email("Geçerli bir email adresi giriniz")
    .min(5, "Email en az 5 karakter olmalıdır")
    .max(50, "Email en fazla 50 karakter olabilir"),
  role: z.string(),
  isApproved: z.boolean(),
  departmanId: z.string().nullable().optional()
});

// GET - Tek bir kullanıcının detaylarını getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        departman: true,
        _count: {
          select: {
            atananSorunlar: true,
            bildirilenSorunlar: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // API yanıtını formatla
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      departman: user.departman ? {
        id: user.departman.id,
        ad: user.departman.ad
      } : null,
      createdAt: user.createdAt,
      atananTalepSayisi: user._count.atananSorunlar,
      bildirilenTalepSayisi: user._count.bildirilenSorunlar
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Kullanıcı detayı alınırken hata:", error);
    return NextResponse.json(
      { error: "Kullanıcı detayı alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT - Kullanıcı güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Gelen veriyi doğrula
    const validatedData = userUpdateSchema.parse(body);

    // Kullanıcının varlığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Güncellenecek kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Email benzersizliğini kontrol et (eğer email değiştiyse)
    if (validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Bu email adresi zaten kullanımda" },
          { status: 400 }
        );
      }
    }

    // Departman kontrolü
    if (validatedData.departmanId) {
      const departman = await prisma.departman.findUnique({
        where: { id: validatedData.departmanId }
      });

      if (!departman) {
        return NextResponse.json(
          { error: "Seçilen departman bulunamadı" },
          { status: 400 }
        );
      }
    }

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        isApproved: validatedData.isApproved,
        departmanId: validatedData.departmanId
      },
      include: {
        departman: true,
        _count: {
          select: {
            atananSorunlar: true,
            bildirilenSorunlar: true
          }
        }
      }
    });

    // API yanıtını formatla
    const formattedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isApproved: updatedUser.isApproved,
      departman: updatedUser.departman ? {
        id: updatedUser.departman.id,
        ad: updatedUser.departman.ad
      } : null,
      createdAt: updatedUser.createdAt,
      atananTalepSayisi: updatedUser._count.atananSorunlar,
      bildirilenTalepSayisi: updatedUser._count.bildirilenSorunlar
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Kullanıcı güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Kullanıcı güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE - Kullanıcı sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Kullanıcının varlığını ve ilişkili kayıtlarını kontrol et
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            atananSorunlar: true,
            bildirilenSorunlar: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Silinecek kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Kullanıcının aktif talepleri varsa silmeyi engelle
    if (user._count.atananSorunlar > 0 || user._count.bildirilenSorunlar > 0) {
      return NextResponse.json(
        { error: "Bu kullanıcıya ait talepler olduğu için silinemez" },
        { status: 400 }
      );
    }

    // Kullanıcıyı sil
    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { message: "Kullanıcı başarıyla silindi" }
    );
  } catch (error) {
    console.error("Kullanıcı silinirken hata:", error);
    return NextResponse.json(
      { error: "Kullanıcı silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 