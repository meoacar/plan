import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { readFile } from "fs/promises"
import path from "path"

/**
 * GET /api/admin/maintenance/backup/download/[filename]
 * Yedek dosyasını indirir
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    await requireAdmin()

    const { filename } = await params

    // Güvenlik: sadece backup dosyalarına izin ver
    if (!filename.startsWith("backup-") || !filename.endsWith(".json")) {
      return NextResponse.json(
        { error: "Geçersiz dosya adı" },
        { status: 400 }
      )
    }

    const filePath = path.join(process.cwd(), "backups", filename)
    const fileContent = await readFile(filePath, "utf-8")

    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Backup indirme hatası:", error)
    if (error instanceof Error && error.message.includes("ENOENT")) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })
    }
    return NextResponse.json(
      { error: "Dosya indirilemedi" },
      { status: 500 }
    )
  }
}
