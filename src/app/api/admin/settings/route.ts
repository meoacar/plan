import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { logActivity } from "@/lib/activity-logger"
import { siteSettingsSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { clearMaintenanceCache } from "@/lib/maintenance"
import { writeFile } from "fs/promises"
import { join } from "path"

/**
 * GET /api/admin/settings
 * Mevcut site ayarlarını getirir
 * Requirements: 3.6
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()

    // İlk ayar kaydını getir (tek kayıt olmalı)
    let settings = await prisma.siteSettings.findFirst({
      orderBy: { updatedAt: "desc" },
    })

    // Eğer ayar yoksa, varsayılan ayarları oluştur
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          siteTitle: "Zayıflama Planım",
          siteDescription: "Başarılı zayıflama hikayelerini keşfedin ve kendi planınızı paylaşın",
          maintenanceMode: false,
          updatedBy: session.user.id,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Oturum") || error.message.includes("admin yetkisi")) {
        return NextResponse.json(
          { error: error.message },
          { status: error.message.includes("Oturum") ? 401 : 403 }
        )
      }
    }
    console.error("Settings GET error:", error)
    return NextResponse.json(
      { error: "Ayarlar getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/settings
 * Site ayarlarını günceller
 * Requirements: 3.9
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await request.json()

    // Validasyon
    const validatedData = siteSettingsSchema.parse(body)

    // Mevcut ayarları bul
    const existingSettings = await prisma.siteSettings.findFirst({
      orderBy: { updatedAt: "desc" },
    })

    let updatedSettings

    if (existingSettings) {
      // Güncelle
      updatedSettings = await prisma.siteSettings.update({
        where: { id: existingSettings.id },
        data: {
          ...validatedData,
          updatedBy: session.user.id,
        },
      })
    } else {
      // Oluştur
      updatedSettings = await prisma.siteSettings.create({
        data: {
          ...validatedData,
          updatedBy: session.user.id,
        },
      })
    }

    // Activity log kaydet
    await logActivity({
      userId: session.user.id,
      type: "SETTINGS_UPDATED",
      description: `Site ayarları güncellendi`,
      targetId: updatedSettings.id,
      targetType: "SiteSettings",
      metadata: {
        changes: validatedData,
      },
      request,
    })

    // OAuth ayarlarını .env dosyasına yaz
    try {
      const envPath = join(process.cwd(), ".env")
      const envContent = await import("fs").then(fs => fs.promises.readFile(envPath, "utf-8"))
      
      let newEnvContent = envContent

      // Google OAuth ayarlarını güncelle
      if (updatedSettings.googleOAuthEnabled && updatedSettings.googleClientId && updatedSettings.googleClientSecret) {
        newEnvContent = updateEnvVariable(newEnvContent, "GOOGLE_CLIENT_ID", updatedSettings.googleClientId)
        newEnvContent = updateEnvVariable(newEnvContent, "GOOGLE_CLIENT_SECRET", updatedSettings.googleClientSecret)
      } else {
        newEnvContent = updateEnvVariable(newEnvContent, "GOOGLE_CLIENT_ID", "")
        newEnvContent = updateEnvVariable(newEnvContent, "GOOGLE_CLIENT_SECRET", "")
      }

      // Facebook OAuth ayarlarını güncelle
      if (updatedSettings.facebookOAuthEnabled && updatedSettings.facebookAppId && updatedSettings.facebookAppSecret) {
        newEnvContent = updateEnvVariable(newEnvContent, "FACEBOOK_APP_ID", updatedSettings.facebookAppId)
        newEnvContent = updateEnvVariable(newEnvContent, "FACEBOOK_APP_SECRET", updatedSettings.facebookAppSecret)
      } else {
        newEnvContent = updateEnvVariable(newEnvContent, "FACEBOOK_APP_ID", "")
        newEnvContent = updateEnvVariable(newEnvContent, "FACEBOOK_APP_SECRET", "")
      }

      await writeFile(envPath, newEnvContent, "utf-8")
    } catch (envError) {
      console.error("Error updating .env file:", envError)
      // .env güncellenemese bile devam et
    }

    // Cache'i temizle
    revalidatePath("/", "layout")
    revalidatePath("/admin/settings")
    clearMaintenanceCache() // Bakım modu cache'ini temizle

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: "Ayarlar başarıyla güncellendi. Değişikliklerin etkili olması için sunucuyu yeniden başlatın.",
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Oturum") || error.message.includes("admin yetkisi")) {
        return NextResponse.json(
          { error: error.message },
          { status: error.message.includes("Oturum") ? 401 : 403 }
        )
      }
    }

    // Zod validation hatası
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json(
        { error: "Geçersiz veri", issues: error.issues },
        { status: 400 }
      )
    }

    console.error("Settings PATCH error:", error)
    return NextResponse.json(
      { error: "Ayarlar güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// Helper function to update environment variables
function updateEnvVariable(content: string, key: string, value: string): string {
  const regex = new RegExp(`^${key}=.*$`, "m")
  const newLine = `${key}="${value}"`
  
  if (regex.test(content)) {
    return content.replace(regex, newLine)
  } else {
    return content + `\n${newLine}`
  }
}
