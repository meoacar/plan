import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
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

    // Public klasörüne kaydet
    const publicDir = join(process.cwd(), "public")
    
    // Public klasörünün var olduğundan emin ol
    if (!existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true })
    }

    // Dosya uzantısını al
    const extension = file.name.split(".").pop() || "ico"
    
    // Timestamp ekle (cache bypass için)
    const timestamp = Date.now()
    
    // Favicon'u kaydet - hem favicon.ico hem de icon.ico
    const faviconPath = join(publicDir, "favicon.ico")
    const iconPath = join(publicDir, "icon.ico")
    
    // Her iki dosyayı da kaydet
    await writeFile(faviconPath, buffer)
    await writeFile(iconPath, buffer)

    console.log("Favicon başarıyla kaydedildi:", faviconPath)

    return NextResponse.json({ 
      url: "/favicon.ico",
      timestamp: timestamp,
      message: "Favicon başarıyla güncellendi. Değişikliklerin görünmesi için:\n1. Tarayıcı önbelleğini temizleyin (Ctrl+Shift+Delete)\n2. Sayfayı yenileyin (Ctrl+F5)\n3. Gerekirse tarayıcıyı kapatıp açın"
    })
  } catch (error) {
    console.error("Favicon yükleme hatası:", error)
    return NextResponse.json(
      { error: "Favicon yüklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
