import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { awardBadge } from '@/lib/gamification'

const subscribeSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const body = await req.json()
    const { email, name } = subscribeSchema.parse(body)

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    })

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kayıtlı' },
          { status: 400 }
        )
      }
      
      // Reactivate subscription
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: {
          isActive: true,
          name,
          unsubscribedAt: null,
        },
      })

      // Award badge and XP if user is logged in
      if (session?.user?.id) {
        await awardBadge(session.user.id, 'NEWSLETTER_SUBSCRIBER')
      }

      return NextResponse.json({
        message: 'Aboneliğiniz yeniden aktif edildi!',
        badgeAwarded: !!session?.user?.id,
      })
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        name,
      },
    })

    // Award badge and XP if user is logged in
    let badgeAwarded = false
    if (session?.user?.id) {
      try {
        await awardBadge(session.user.id, 'NEWSLETTER_SUBSCRIBER')
        badgeAwarded = true
      } catch (error) {
        console.error('Error awarding newsletter badge:', error)
      }
    }

    return NextResponse.json({
      message: 'E-bülten aboneliğiniz başarıyla oluşturuldu!',
      badgeAwarded,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Newsletter subscribe error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}
