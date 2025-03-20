import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Tüm cookie'leri temizle
    const cookieStore = cookies();
    cookieStore.delete('token');

    // Yönlendirme URL'ini oluştur
    const redirectUrl = new URL('/auth/login', 'http://localhost:3000');

    // Yanıtı oluştur ve cookie'yi temizle
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete('token');

    return response;
  } catch (error) {
    console.error('Çıkış yaparken hata:', error);
    return NextResponse.redirect(new URL('/auth/login', 'http://localhost:3000'));
  }
} 