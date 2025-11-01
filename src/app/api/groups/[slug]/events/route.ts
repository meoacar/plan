import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  return NextResponse.json({ message: 'Events endpoint - Coming soon' });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  return NextResponse.json({ message: 'Create event - Coming soon' });
}
