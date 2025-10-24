import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token ve şifre gerekli" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalı" },
        { status: 400 }
      )
    }

    // Token'ı kontrol et
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token'ın süresi dolmamış olmalı
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş token" },
        { status: 400 }
      )
    }

    // Şifreyi hashle
    const passwordHash = await bcrypt.hash(password, 10)

    // Şifreyi güncelle ve token'ı temizle
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({
      message: "Şifre başarıyla değiştirildi",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}
