import { prisma } from "@/lib/prisma"

/**
 * Bakım modu durumunu kontrol eder
 * Cache ile performans optimizasyonu
 */
let maintenanceCache: { value: boolean; timestamp: number } | null = null
const CACHE_TTL = 10000 // 10 saniye

export async function isMaintenanceMode(): Promise<boolean> {
  try {
    // Cache kontrolü
    if (maintenanceCache && Date.now() - maintenanceCache.timestamp < CACHE_TTL) {
      return maintenanceCache.value
    }

    // Veritabanından çek
    const settings = await prisma.siteSettings.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { maintenanceMode: true },
    })

    const isMaintenanceActive = settings?.maintenanceMode ?? false

    // Cache'e kaydet
    maintenanceCache = {
      value: isMaintenanceActive,
      timestamp: Date.now(),
    }

    return isMaintenanceActive
  } catch (error) {
    console.error("Maintenance check error:", error)
    return false
  }
}

/**
 * Cache'i temizler (ayarlar güncellendiğinde kullanılır)
 */
export function clearMaintenanceCache() {
  maintenanceCache = null
}
