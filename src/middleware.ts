import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Token kontrolü
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;
  
  // Auth sayfaları kontrolü - hem /login hem de /auth/login için
  const isAuthPage = 
    path.startsWith("/login") || 
    path.startsWith("/auth/login") || 
    path.startsWith("/register") || 
    path.startsWith("/auth/register");
    
  const isApiRoute = path.startsWith("/api/");

  // API rotaları için CORS ve auth kontrolü
  if (isApiRoute) {
    // API route yolunu logla
    console.log("API isteği:", { path, method: request.method });
    
    // Auth API'leri için auth kontrolü yapma
    if (path === "/api/auth/login" || 
        path === "/api/auth/register") {
      console.log("Auth API isteği: kontrolsüz geçiş");
      // CORS headerlarını ekle
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    // Diğer API rotaları için token kontrolü
    if (!token) {
      console.log("API isteği yetkilendirme hatası:", path);
      return NextResponse.json(
        { error: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    console.log("API isteği onaylandı:", path);
    return NextResponse.next();
  }

  // Debug loglama
  console.log(`Middleware: Path=${path}, Token=${!!token}, IsAuthPage=${isAuthPage}`);

  // Eğer token yoksa ve auth sayfasında değilsek login'e yönlendir
  if (!token && !isAuthPage) {
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