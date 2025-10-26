import { NextRequest, NextResponse } from "next/server"
import { Pool } from "@neondatabase/serverless"

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  
  try {
    const body = await req.json()
    const { emoji, label, userId } = body

    if (!emoji || !label || !userId) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 })
    }

    const { slug } = await context.params

    // Planı bul
    const planResult = await pool.query(
      'SELECT id, "userId" FROM "Plan" WHERE slug = $1',
      [slug]
    )

    if (planResult.rows.length === 0) {
      return NextResponse.json({ error: "Plan bulunamadı" }, { status: 404 })
    }

    const plan = planResult.rows[0]

    // Mevcut reaksiyonu kontrol et
    const existingResult = await pool.query(
      'SELECT id FROM "PlanReaction" WHERE "planId" = $1 AND "userId" = $2 AND emoji = $3',
      [plan.id, userId, emoji]
    )

    let action = "added"

    if (existingResult.rows.length > 0) {
      // Kaldır
      await pool.query(
        'DELETE FROM "PlanReaction" WHERE id = $1',
        [existingResult.rows[0].id]
      )
      action = "removed"
    } else {
      // Ekle
      await pool.query(
        'INSERT INTO "PlanReaction" (id, "planId", "userId", emoji, label, "createdAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())',
        [plan.id, userId, emoji, label]
      )
    }

    await pool.end()
    return NextResponse.json({ success: true, action })
  } catch (error: any) {
    console.error("Reaction error:", error)
    await pool.end()
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: 500 }
    )
  }
}
