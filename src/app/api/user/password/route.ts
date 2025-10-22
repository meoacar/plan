import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// PUT - Şifre değiştir
export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Tüm alanları doldurun" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Yeni şifre en az 6 karakter olmalıdır" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        passwordHash: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: "Google ile giriş yaptığınız için şifre değiştiremezsiniz" }, { status: 400 })
    }

    // Mevcut şifreyi kontrol et
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)

    if (!isValid) {
      return NextResponse.json({ error: "Mevcut şifre hatalı" }, { status: 400 })
    }

    // Yeni şifreyi hashle
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Şifreyi güncelle
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
      },
    })

    return NextResponse.json({ message: "Şifre başarıyla değiştirildi" })
  } catch (error) {
    console.error("Şifre değiştirme hatası:", error)
    return NextResponse.json({ error: "Şifre değiştirilemedi" }, { status: 500 })
  }
}
