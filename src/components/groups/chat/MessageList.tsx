'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

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
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500 p-4">
        <p>Henüz mesaj yok. İlk mesajı siz gönderin!</p>
      </div>
    );
  }

  return (
    <div className="h-full space-y-4 overflow-y-auto p-4">
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
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
