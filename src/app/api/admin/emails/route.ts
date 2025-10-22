import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { emailCampaignSchema } from '@/lib/validations'
import { logActivity } from '@/lib/activity-logger'

// GET /api/admin/emails - Kampanya listesi
// Requirements: 5.1, 5.7
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status') as 'DRAFT' | 'QUEUED' | 'SENDING' | 'SENT' | 'FAILED' | null
    const pageSize = 20

    const where = status ? { status } : {}

    const [campaigns, total] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.emailCampaign.count({ where }),
    ])

    return NextResponse.json({
      campaigns,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Error fetching email campaigns:', error)
    return NextResponse.json(
      { error: 'Kampanyalar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}


