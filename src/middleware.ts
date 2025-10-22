import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware - Auth kontrolü
 * Requirements: 3.8
 * 
 * NOT: Bakım modu kontrolü layout.tsx'te yapılıyor
 * çünkü Edge Runtime'da Prisma desteklenmiyor
 */
export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Auth kontrolü - korumalı sayfalar için
  const protectedPaths = ["/submit", "/admin", "/profile"]
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtectedPath && !session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin sayfaları için admin kontrolü
  if (pathname.startsWith("/admin") && session?.user?.role !== "ADMIN") {
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
