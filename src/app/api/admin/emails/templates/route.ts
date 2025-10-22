import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { emailTemplates } from '@/lib/email'

// GET /api/admin/emails/templates - Email şablonları
// Requirements: 5.8, 5.9
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    return NextResponse.json(emailTemplates)
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json(
      { error: 'Şablonlar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
