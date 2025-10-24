import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { subscribeToPush } from '@/lib/push-notifications';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscription } = body;

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription object required' },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent') || undefined;

    const result = await subscribeToPush(session.user.id, subscription, userAgent);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to push notifications' },
      { status: 500 }
    );
  }
}
