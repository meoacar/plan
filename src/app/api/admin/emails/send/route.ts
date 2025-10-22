import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { emailCampaignSchema } from '@/lib/validations'
import { logActivity } from '@/lib/activity-logger'

// POST /api/admin/emails/send - Email gönder
// Requirements: 5.1, 5.6, 5.10
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await request.json()

    // Validate input
    const validation = emailCampaignSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { subject, content, recipients } = validation.data

    // Create campaign
    const campaign = await prisma.emailCampaign.create({
      data: {
        subject,
        content,
        recipients,
        status: 'QUEUED',
        createdBy: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      type: 'EMAIL_SENT',
      targetId: campaign.id,
      targetType: 'EmailCampaign',
      description: `Email kampanyası oluşturuldu: ${subject} (${recipients})`,
      metadata: {
        subject,
        recipients,
        campaignId: campaign.id,
      },
      request,
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('Error creating email campaign:', error)
    return NextResponse.json(
      { error: 'Email kampanyası oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
