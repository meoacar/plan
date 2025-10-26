import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeFile, mkdir, copyFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      )
    }

    // Admin kontrolü
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "Dosya bulunamadı" },
        { status: 400 }
      )
    }

    // Dosya boyutu kontrolü (1MB)
    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Dosya boyutu 1MB'dan küçük olmalıdır" },
        { status: 400 }
      )
    }

    // Dosya tipi kontrolü - favicon için ico, png veya svg
    const allowedTypes = ["image/x-icon", "image/vnd.microsoft.icon", "image/png", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Sadece .ico, .png veya .svg dosyaları yüklenebilir" },
        { status: 400 }
      )
    }

    // Dosyayı buffer'a çevir
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // App klasörüne kaydet (Next.js 13+ için)
    const appDir = join(process.cwd(), "src", "app")
    const faviconPath = join(appDir, "favicon.ico")

    // Dosyayı kaydet
    await writeFile(faviconPath, buffer)

    // Ayrıca public klasörüne de kopyala (eski tarayıcılar için)
    const publicFaviconPath = join(process.cwd(), "public", "favicon.ico")
    await copyFile(faviconPath, publicFaviconPath)

    return NextResponse.json({ 
      url: "/favicon.ico",
      message: "Favicon başarıyla güncellendi. Değişikliklerin görünmesi için tarayıcı önbelleğini temizlemeniz gerekebilir."
    })
  } catch (error) {
    console.error("Favicon yükleme hatası:", error)
    return NextResponse.json(
      { error: "Favicon yüklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
