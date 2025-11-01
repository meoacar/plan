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
  userRole?: 'MEMBER' | 'MODERATOR' | 'LEADER' | 'ADMIN';
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
      userRole === 'ADMIN' || // Group admin
      userRole === 'MODERATOR' // Moderator
    );
  };

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Henüz mesaj yok</p>
          <p className="text-gray-400 text-sm mt-1">İlk mesajı siz gönderin! 💬</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.user.id === currentUserId;
        const messageDate = typeof message.createdAt === 'string' 
          ? new Date(message.createdAt) 
          : message.createdAt;

        return (
          <div
            key={message.id}
            className={`flex items-start gap-3 animate-fadeIn ${
              isOwnMessage ? 'flex-row-reverse' : ''
            }`}
          >
            {/* User Avatar - Modern */}
            <div className="flex-shrink-0">
              {message.user.image ? (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <Image
                    src={message.user.image}
                    alt={message.user.name || 'User'}
                    width={44}
                    height={44}
                    className="relative rounded-full ring-2 ring-white"
                  />
                </div>
              ) : (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold text-lg ring-2 ring-white shadow-lg">
                    {message.user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </div>
              )}
            </div>

            {/* Message Content - Modern Bubble */}
            <div
              className={`flex max-w-[75%] sm:max-w-[70%] flex-col ${
                isOwnMessage ? 'items-end' : 'items-start'
              }`}
            >
              <div className={`mb-1.5 flex items-center gap-2 text-xs ${
                isOwnMessage ? 'flex-row-reverse' : ''
              }`}>
                <span className={`font-semibold ${
                  isOwnMessage ? 'text-purple-600' : 'text-gray-700'
                }`}>
                  {isOwnMessage ? 'Sen' : message.user.name || 'Anonim'}
                </span>
                <span className="text-gray-400">
                  {formatDistanceToNow(messageDate, {
                    addSuffix: true,
                    locale: tr,
                  })}
                </span>
              </div>
              <div className={`flex items-start gap-2 ${
                isOwnMessage ? 'flex-row-reverse' : ''
              }`}>
                <div
                  className={`relative group rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                    isOwnMessage
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">
                    {message.content}
                  </p>
                </div>
                {canDeleteMessage(message) && (
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    disabled={deletingMessageId === message.id}
                    className="flex-shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
