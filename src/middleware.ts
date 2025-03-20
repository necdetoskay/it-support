import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;
  
  // API rotaları için kontrolü atla
  if (path.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Dashboard erişimi için token gerekli
  if (path.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.nextUrl.origin));
    }
    return NextResponse.next();
  }

  // Auth sayfalarına yönlendirme (giriş yapılmışsa dashboard'a yönlendir)
  if (path.startsWith("/auth/")) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
    }
    return NextResponse.next();
  }

  // Ana sayfa yönlendirmesi
  if (path === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
    } else {
      return NextResponse.redirect(new URL("/auth/login", request.nextUrl.origin));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/auth/:path*",
    "/api/:path*",
  ],
}; 