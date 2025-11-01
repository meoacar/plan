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
  initialMessages: Message[];
}

export function GroupChat({ groupId, groupSlug, currentUserId, initialMessages }: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [channel, setChannel] = useState<Channel | null>(null);

  // Initialize Pusher connection
  useEffect(() => {
    const pusher = getPusherClient();
    const presenceChannel = pusher.subscribe(`presence-group-${groupId}`) as Channel;

    // Handle new messages
    presenceChannel.bind('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
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
      presenceChannel.unbind_all();
      presenceChannel.unsubscribe();
    };
  }, [groupId]);

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
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [groupSlug]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    // Add emoji to message input
    // This would need to be implemented with a ref to the textarea
    handleSendMessage(emoji);
  }, [handleSendMessage]);

  return (
    <div className="flex h-[calc(100vh-200px)] sm:h-[calc(100vh-180px)] flex-col bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden">
      {/* Online Members */}
      <div className="flex-shrink-0">
        <OnlineMembers members={onlineMembers} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} currentUserId={currentUserId} />
      </div>

      {/* Input */}
      <div className="relative flex-shrink-0 border-t border-gray-200 bg-white">
        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 right-0 sm:left-auto sm:right-4 sm:w-80 mb-2">
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
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
