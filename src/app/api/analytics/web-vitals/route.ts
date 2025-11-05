import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value, rating, delta, id, navigationType } = body;

    // Validation
    if (!name || value === undefined || !rating || !id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Web Vitals verisini kaydet
    await prisma.webVitals.create({
      data: {
        id: `wv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metricName: name,
        value: Math.round(value),
        rating,
        delta: Math.round(delta || 0),
        metricId: id,
        navigationType: navigationType || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        url: request.headers.get('referer') || 'unknown',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Web Vitals API error:', error);
    // Hata olsa bile 200 dön, client-side tracking'i engellemesin
    return NextResponse.json({ success: false, error: 'Failed to save metric' }, { status: 200 });
  }
}
