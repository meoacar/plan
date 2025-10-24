import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email adresi gerekli" },
        { status: 400 }
      )
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Güvenlik için kullanıcı bulunamasa bile başarılı mesaj göster
    if (!user) {
      return NextResponse.json({
        message: "Eğer bu email kayıtlıysa, şifre sıfırlama linki gönderildi",
      })
    }

    // Reset token oluştur
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 saat

    // Token'ı veritabanına kaydet
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Email gönderme işlemi (şimdilik konsola yazdır)
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
    console.log("Şifre sıfırlama linki:", resetUrl)

    // TODO: Gerçek email gönderme işlemi buraya eklenecek
    // await sendPasswordResetEmail(email, resetUrl)

    return NextResponse.json({
      message: "Şifre sıfırlama linki email adresinize gönderildi",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}
