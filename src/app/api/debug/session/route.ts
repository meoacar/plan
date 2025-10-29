import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  
  return NextResponse.json({
    session: session ? {
      user: {
        id: session.user?.id,
        name: session.user?.name,
        email: session.user?.email,
        username: (session.user as any)?.username
      }
    } : null
  });
}
