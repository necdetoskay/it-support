import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Token kontrolü
  const token = request.cookies.get("token")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");

  // API rotaları için CORS ve auth kontrolü
  if (isApiRoute) {
    // Auth API'leri için auth kontrolü yapma
    if (request.nextUrl.pathname === "/api/auth/login" || 
        request.nextUrl.pathname === "/api/auth/register") {
      return NextResponse.next();
    }

    // Diğer API rotaları için token kontrolü
    if (!token) {
      return NextResponse.json(
        { error: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // Eğer token yoksa ve auth sayfasında değilsek login'e yönlendir
  if (!token && !isAuthPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Eğer token varsa ve login sayfasındaysak dashboard'a yönlendir
  if (token && isAuthPage) {
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