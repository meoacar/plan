import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value, rating, delta, id, navigationType } = body;

    // Web Vitals verisini kaydet
    await prisma.webVitals.create({
      data: {
        metricName: name,
        value: Math.round(value),
        rating,
        delta: Math.round(delta),
        metricId: id,
        navigationType,
        userAgent: request.headers.get('user-agent') || 'unknown',
        url: request.headers.get('referer') || 'unknown',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Web Vitals API error:', error);
    return NextResponse.json({ error: 'Failed to save metric' }, { status: 500 });
  }
}
