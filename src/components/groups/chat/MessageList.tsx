'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';

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

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  userRole?: 'MEMBER' | 'MODERATOR' | 'LEADER';
  groupSlug: string;
  onMessageDeleted?: (messageId: string) => void;
}

export function MessageList({ messages, currentUserId, userRole = 'MEMBER', groupSlug, onMessageDeleted }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      return;
    }

    setDeletingMessageId(messageId);
    try {
      const response = await fetch(`/api/groups/${groupSlug}/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      onMessageDeleted?.(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Mesaj silinirken bir hata oluştu');
    } finally {
      setDeletingMessageId(null);
    }
  };

  const canDeleteMessage = (message: Message) => {
    return (
      message.user.id === currentUserId || // Own message
      userRole === 'LEADER' || // Group leader
      userRole === 'MODERATOR' // Moderator
    );
  };

  if (messages.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#6b7280', padding: '1rem' }}>
        <p>Henüz mesaj yok. İlk mesajı siz gönderin!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {messages.map((message) => {
        const isOwnMessage = message.user.id === currentUserId;
        const messageDate = typeof message.createdAt === 'string' 
          ? new Date(message.createdAt) 
          : message.createdAt;

        return (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              isOwnMessage ? 'flex-row-reverse' : ''
            }`}
          >
            {/* User Avatar */}
            <div className="flex-shrink-0">
              {message.user.image ? (
                <Image
                  src={message.user.image}
                  alt={message.user.name || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white font-semibold">
                  {message.user.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            {/* Message Content */}
            <div
              className={`flex max-w-[70%] flex-col ${
                isOwnMessage ? 'items-end' : 'items-start'
              }`}
            >
              <div className="mb-1 flex items-center gap-2 text-xs text-gray-600">
                <span className="font-medium">
                  {isOwnMessage ? 'Sen' : message.user.name || 'Anonim'}
                </span>
                <span>
                  {formatDistanceToNow(messageDate, {
                    addSuffix: true,
                    locale: tr,
                  })}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
                {canDeleteMessage(message) && (
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    disabled={deletingMessageId === message.id}
                    className={`flex-shrink-0 rounded-lg p-1.5 transition-colors ${
                      isOwnMessage
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-red-600 hover:bg-red-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Mesajı sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
