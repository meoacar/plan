'use client';

import { useEffect, useState, useCallback } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { EmojiPicker } from './EmojiPicker';
import { OnlineMembers } from './OnlineMembers';
import { getPusherClient } from '@/lib/pusher-client';
import type { Channel } from 'pusher-js';

interface Message {
  id: string;
  content: string;
  messageType: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
  };
}

interface OnlineMember {
  id: string;
  user_info: {
    name: string | null;
    image: string | null;
  };
}

interface GroupChatProps {
  groupId: string;
  groupSlug: string;
  currentUserId: string;
  userRole?: 'MEMBER' | 'MODERATOR' | 'LEADER' | 'ADMIN';
  initialMessages: Message[];
}

export function GroupChat({ groupId, groupSlug, currentUserId, userRole = 'MEMBER', initialMessages }: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [usePusher, setUsePusher] = useState(true);

  // Fetch new messages (fallback when Pusher is not available)
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/groups/${groupSlug}/messages`);
      if (response.ok) {
        const newMessages = await response.json();
        setMessages(newMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [groupSlug]);

  // Initialize Pusher connection
  useEffect(() => {
    // Check if Pusher is configured
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
      console.log('Pusher not configured, using polling instead');
      setUsePusher(false);
      return;
    }

    let presenceChannel: Channel | null = null;

    try {
      const pusher = getPusherClient();
      presenceChannel = pusher.subscribe(`presence-group-${groupId}`) as Channel;

      // Handle subscription errors
      presenceChannel.bind('pusher:subscription_error', (error: any) => {
        console.error('Pusher subscription error:', error);
        setUsePusher(false);
      });

      // Handle new messages
      presenceChannel.bind('new-message', (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      // Handle message deletion
      presenceChannel.bind('message-deleted', (data: { messageId: string }) => {
        setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
      });

      // Handle presence (online members)
      presenceChannel.bind('pusher:subscription_succeeded', (members: any) => {
        const membersList: OnlineMember[] = [];
        members.each((member: OnlineMember) => {
          membersList.push(member);
        });
        setOnlineMembers(membersList);
      });

      presenceChannel.bind('pusher:member_added', (member: OnlineMember) => {
        setOnlineMembers((prev) => [...prev, member]);
      });

      presenceChannel.bind('pusher:member_removed', (member: OnlineMember) => {
        setOnlineMembers((prev) => prev.filter((m) => m.id !== member.id));
      });

      setChannel(presenceChannel);

      // Cleanup
      return () => {
        if (presenceChannel) {
          presenceChannel.unbind_all();
          presenceChannel.unsubscribe();
        }
      };
    } catch (error) {
      console.error('Pusher connection error:', error);
      setUsePusher(false);
      // Fallback to polling
      if (presenceChannel) {
        try {
          presenceChannel.unbind_all();
          presenceChannel.unsubscribe();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }, [groupId]);

  // Polling fallback when Pusher is not available
  useEffect(() => {
    if (!usePusher) {
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [usePusher, fetchMessages]);

  const handleSendMessage = useCallback(async (content: string) => {
    try {
      const response = await fetch(`/api/groups/${groupSlug}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          messageType: 'TEXT',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to send message:', errorData);
        throw new Error(errorData.error || 'Failed to send message');
      }

      const newMessage = await response.json();
      
      // If not using Pusher, manually add message to list
      if (!usePusher) {
        setMessages((prev) => {
          // Check if message already exists
          if (prev.some(m => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [groupSlug, usePusher]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    // Add emoji to message input
    // This would need to be implemented with a ref to the textarea
    handleSendMessage(emoji);
  }, [handleSendMessage]);

  const handleMessageDeleted = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100/50 overflow-hidden">
      {/* Online Members - Modern Header */}
      {onlineMembers.length > 0 && (
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
          <OnlineMembers members={onlineMembers} />
        </div>
      )}

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        <MessageList 
          messages={messages} 
          currentUserId={currentUserId}
          userRole={userRole}
          groupSlug={groupSlug}
          onMessageDeleted={handleMessageDeleted}
        />
      </div>

      {/* Input Area - Modern Sticky Bottom */}
      <div className="flex-shrink-0 relative bg-white/90 backdrop-blur-xl border-t border-gray-200/50 shadow-lg">
        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 right-0 mb-2 z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          </div>
        )}
        <MessageInput
          onSendMessage={handleSendMessage}
          onToggleEmojiPicker={() => setShowEmojiPicker(!showEmojiPicker)}
        />
      </div>
    </div>
  );
}
