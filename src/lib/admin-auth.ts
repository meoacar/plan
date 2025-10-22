import { auth } from "./auth"
import { NextResponse } from "next/server"

/**
 * Admin yetkisi kontrolü yapar
 * Tüm admin API route'larında kullanılır
 * Requirements: Tüm modüller için gerekli
 */
export async function requireAdmin() {
  const session = await auth()

  if (!session || !session.user) {
    throw new Error("Oturum açmanız gerekiyor")
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Bu işlem için admin yetkisi gerekiyor")
  }

  return session
}

/**
 * API route'ları için admin kontrolü ve hata yönetimi
 */
export async function withAdminAuth(
  handler: (session: any, request: Request) => Promise<Response>
) {
  return async (request: Request) => {
    try {
      const session = await requireAdmin()
      return await handler(session, request)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Oturum")) {
          return NextResponse.json(
            { error: error.message },
            { status: 401 }
          )
        }
        if (error.message.includes("admin yetkisi")) {
          return NextResponse.json(
            { error: error.message },
            { status: 403 }
          )
        }
      }
      return NextResponse.json(
        { error: "Bir hata oluştu" },
        { status: 500 }
      )
    }
  }
}
