import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Güvenli rotalar ve gereken roller tanımlanıyor
const AUTH_ROUTES = {
  // Dashboard rotaları
  "/dashboard": ["ADMIN", "USER", "MANAGER", "SUPPORT"], // Herkes görebilir
  "/dashboard/sorunlar": ["ADMIN", "USER", "MANAGER", "SUPPORT"],
  "/dashboard/sorunlar/kategoriler": ["ADMIN", "MANAGER"], // Sadece admin ve manager
  "/dashboard/kullanicilar": ["ADMIN"], // Sadece admin
  "/dashboard/raporlar": ["ADMIN", "MANAGER"], // Admin ve manager
  "/dashboard/ayarlar": ["ADMIN"], // Sadece admin
  "/dashboard/ayarlar/roller": ["ADMIN"], // Sadece admin
  "/dashboard/ayarlar/kullanicilar": ["ADMIN"], // Sadece admin
};

export async function middleware(request: NextRequest) {
  // NextAuth Secret
  const secret = process.env.NEXTAUTH_SECRET;
  
  // Mevcut yol bilgisi
  const path = request.nextUrl.pathname;
  const isApiRoute = path.startsWith("/api/");
  
  // Auth sayfaları kontrolü
  const isAuthPage = 
    path.startsWith("/login") || 
    path.startsWith("/auth/login") || 
    path.startsWith("/register") || 
    path.startsWith("/auth/register");
    
  // Herkese açık rotalar
  const isPublicRoute = 
    path.startsWith("/_next") ||
    path.startsWith("/favicon") || 
    path === "/";

  // JWT token alınıyor (hem cookie hem header'dan)
  const token = await getToken({ 
    req: request, 
    secret: secret,
    secureCookie: process.env.NODE_ENV === "production",
  });

  // Debug loglama
  console.log(`Middleware: Path=${path}, Token=${!!token}, IsAuthPage=${isAuthPage}, Role=${token?.role || "none"}`);

  // API rotaları için yetkilendirme
  if (isApiRoute) {
    // Auth API'leri için auth kontrolü yapma
    if (path === "/api/auth/login" || 
        path === "/api/auth/register" ||
        path.startsWith("/api/auth")) {
      console.log("Auth API isteği: kontrolsüz geçiş");
      return NextResponse.next();
    }

    // Diğer API rotaları için token kontrolü
    if (!token) {
      console.log("API isteği yetkilendirme hatası:", path);
      return NextResponse.json(
        { error: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    // API rotasına göre rol kontrolü yapılabilir
    if (path.startsWith("/api/kullanicilar") && token.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmuyor" },
        { status: 403 }
      );
    }
    
    // Roller API'si için rol kontrolü
    if (path.startsWith("/api/roller") && token.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmuyor" },
        { status: 403 }
      );
    }

    console.log("API isteği onaylandı:", path);
    return NextResponse.next();
  }

  // Eğer token yoksa ve auth sayfasında değilsek login'e yönlendir
  if (!token && !isAuthPage && !isPublicRoute) {
    console.log("Yetkilendirme gerekli, login sayfasına yönlendiriliyor");
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Eğer token varsa ve login sayfasındaysak dashboard'a yönlendir
  if (token && isAuthPage) {
    console.log("Zaten giriş yapılmış, dashboard'a yönlendiriliyor");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Rol tabanlı yetkilendirme - Belirli sayfalar için rol kontrolü
  if (token) {
    // Path'e özgü rol kontrolü
    const route = Object.keys(AUTH_ROUTES).find(route => path === route || path.startsWith(`${route}/`));
    
    if (route) {
      const allowedRoles = AUTH_ROUTES[route as keyof typeof AUTH_ROUTES];
      if (!allowedRoles.includes(token.role as string)) {
        console.log(`Yetkisiz erişim: ${token.role} rolü ${path} için yetkili değil`);
        // Kullanıcıya yetkisi olmadığını belirten sayfaya yönlendir
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Middleware'in çalışacağı path'leri belirt
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 