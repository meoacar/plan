import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const subscribeSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
})

export async function POST(req: NextRequest) {
  try {
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

      return NextResponse.json({
        message: 'Aboneliğiniz yeniden aktif edildi!',
      })
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        name,
      },
    })

    return NextResponse.json({
      message: 'E-bülten aboneliğiniz başarıyla oluşturuldu!',
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
