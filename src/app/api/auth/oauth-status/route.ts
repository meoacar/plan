import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/auth/oauth-status
 * OAuth provider'ların aktif olup olmadığını döner
 */
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      orderBy: { updatedAt: "desc" },
      select: {
        googleOAuthEnabled: true,
        facebookOAuthEnabled: true,
      },
    })

    return NextResponse.json({
      googleEnabled: settings?.googleOAuthEnabled || false,
      facebookEnabled: settings?.facebookOAuthEnabled || false,
    })
  } catch (error) {
    console.error("OAuth status error:", error)
    return NextResponse.json({
      googleEnabled: false,
      facebookEnabled: false,
    })
  }
}
