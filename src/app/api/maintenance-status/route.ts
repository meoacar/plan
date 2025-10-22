import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/maintenance-status
 * Bakım modu durumunu döner
 */
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { maintenanceMode: true },
    })

    return NextResponse.json({
      maintenanceMode: settings?.maintenanceMode ?? false,
    })
  } catch (error) {
    console.error("Maintenance status error:", error)
    return NextResponse.json({ maintenanceMode: false })
  }
}

// Cache 5 saniye
export const revalidate = 5
