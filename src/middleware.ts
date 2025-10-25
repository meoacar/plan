import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * Middleware - Auth kontrolü
 * Requirements: 3.8
 * 
 * NOT: Bakım modu kontrolü layout.tsx'te yapılıyor
 * çünkü Edge Runtime'da Prisma desteklenmiyor
 * 
 * Edge Runtime uyumlu olması için getToken kullanıyoruz
 */
export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
    cookieName: process.env.NODE_ENV === "production" 
      ? "__Secure-authjs.session-token" 
      : "authjs.session-token"
  })
  
  const { pathname } = request.nextUrl



  // Auth kontrolü - korumalı sayfalar için
  const protectedPaths = ["/submit", "/admin", "/profile/edit"]
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin sayfaları için admin kontrolü
  if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
    console.log("Admin access denied - redirecting to home")
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - maintenance (maintenance page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|maintenance).*)",
  ],
}
