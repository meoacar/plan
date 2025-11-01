import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher-server';

// Pusher authentication endpoint for presence channels
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.text();
    const params = new URLSearchParams(body);
    const socketId = params.get('socket_id');
    const channelName = params.get('channel_name');

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // For presence channels, include user info
    if (channelName.startsWith('presence-')) {
      const presenceData = {
        user_id: session.user.id,
        user_info: {
          name: session.user.name,
          image: session.user.image,
        },
      };

      const authResponse = pusherServer.authorizeChannel(
        socketId,
        channelName,
        presenceData
      );

      return NextResponse.json(authResponse);
    }

    // For private channels
    const authResponse = pusherServer.authorizeChannel(
      socketId,
      channelName
    );

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
