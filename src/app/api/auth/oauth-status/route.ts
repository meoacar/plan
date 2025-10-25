import { NextResponse } from "next/server"

/**
 * GET /api/auth/oauth-status
 * OAuth provider'ların aktif olup olmadığını döner
 * Environment variable'lardan okur (edge runtime uyumlu)
 */
export async function GET() {
  try {
    return NextResponse.json({
      googleEnabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      facebookEnabled: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
    })
  } catch (error) {
    console.error("OAuth status error:", error)
    return NextResponse.json({
      googleEnabled: false,
      facebookEnabled: false,
    })
  }
}
