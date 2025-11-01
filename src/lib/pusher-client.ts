import PusherClient from 'pusher-js';

// Client-side Pusher instance
let pusherClient: PusherClient | null = null;

export function getPusherClient() {
  if (!pusherClient) {
    pusherClient = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
        authEndpoint: '/api/pusher/auth',
      }
    );
  }
  return pusherClient;
}

// Helper to subscribe to a channel
export function subscribeToChannel(channelName: string) {
  const pusher = getPusherClient();
  return pusher.subscribe(channelName);
}

// Helper to unsubscribe from a channel
export function unsubscribeFromChannel(channelName: string) {
  const pusher = getPusherClient();
  pusher.unsubscribe(channelName);
}
