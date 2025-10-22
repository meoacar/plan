import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const plan = await prisma.plan.findUnique({
    where: { slug, status: 'APPROVED' },
    include: {
      user: { select: { name: true } },
      category: true,
      tags: { include: { tag: true } },
    },
  });

  if (!plan) {
    return NextResponse.json({ error: 'Plan bulunamadı' }, { status: 404 });
  }

  // Simple HTML to PDF conversion
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${plan.title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #16a34a; border-bottom: 3px solid #16a34a; padding-bottom: 10px; }
    h2 { color: #15803d; margin-top: 30px; }
    .meta { color: #666; margin: 20px 0; }
    .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
    .weight { font-size: 18px; font-weight: bold; color: #16a34a; }
  </style>
</head>
<body>
  <h1>${plan.title}</h1>
  <div class="meta">
    <p><strong>Yazar:</strong> ${plan.user.name || 'Anonim'}</p>
    <p><strong>Kategori:</strong> ${plan.category?.name || 'Genel'}</p>
    <p class="weight">Başlangıç: ${plan.startWeight} kg → Hedef: ${plan.goalWeight} kg</p>
    <p><strong>Süre:</strong> ${plan.durationText}</p>
  </div>

  <div class="section">
    <h2>🎯 Motivasyon</h2>
    <p>${plan.motivation}</p>
  </div>

  <div class="section">
    <h2>📋 Rutin</h2>
    <p>${plan.routine.replace(/\n/g, '<br>')}</p>
  </div>

  <div class="section">
    <h2>🥗 Diyet</h2>
    <p>${plan.diet.replace(/\n/g, '<br>')}</p>
  </div>

  <div class="section">
    <h2>💪 Egzersiz</h2>
    <p>${plan.exercise.replace(/\n/g, '<br>')}</p>
  </div>

  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
    <p>Zayıflama Planım - ${new Date().toLocaleDateString('tr-TR')}</p>
  </footer>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="${slug}.html"`,
    },
  });
}
