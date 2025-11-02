import { NextRequest, NextResponse } from 'next/server'
import { processEmailQueue } from '@/lib/email-queue'

// Cron job endpoint for processing email queue
// Requirements: 5.6
// This endpoint should be called by Vercel Cron Jobs every 5 minutes
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access (optional)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // If cron secret is set, require authorization
    // Otherwise allow access (for manual triggering from admin panel)
    if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await processEmailQueue()

    return NextResponse.json({
      success: true,
      processed: result.sent,
      failed: result.failed,
      message: `${result.sent} email gönderildi, ${result.failed} başarısız`,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Cron job failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
