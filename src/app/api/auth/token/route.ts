import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

// JWT secret anahtarı
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  try {
    // Kullanıcının oturum bilgisini al
    const session = await getServerSession(authOptions);
    
    // Oturum yoksa hata döndür
    if (!session || !session.user) {
      return NextResponse.json({ error: "Yetkilendirilmemiş erişim" }, { status: 401 });
    }
    
    // Verilmiş bir token var mı kontrol et
    const cookieStore = cookies();
    const existingToken = cookieStore.get('token')?.value;
    
    if (existingToken) {
      // Mevcut bir token varsa doğrudan onu döndür
      return NextResponse.json({ token: existingToken });
    }
    
    // Yeni bir JWT token oluştur
    const token = await new SignJWT({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("12h") // 12 saat geçerli olacak
      .sign(new TextEncoder().encode(JWT_SECRET));
    
    // Token'ı çerezlere kaydet (isteğe bağlı)
    const response = NextResponse.json({ token });
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 12, // 12 saat (saniye cinsinden)
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Token oluşturma hatası:', error);
    return NextResponse.json(
      { error: "Token oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 