'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';
import { Send, Smile } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onToggleEmojiPicker?: () => void;
}

export function MessageInput({ onSendMessage, onToggleEmojiPicker }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 safe-area-bottom">
      <div className="flex items-end gap-3">
        {/* Emoji Picker Button */}
        {onToggleEmojiPicker && (
          <button
            type="button"
            onClick={onToggleEmojiPicker}
            className="group flex-shrink-0 rounded-xl p-3 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 text-yellow-600 hover:from-yellow-100 hover:to-orange-100 hover:border-yellow-300 hover:text-yellow-700 active:scale-95 transition-all duration-200 touch-manipulation min-h-[48px] min-w-[48px] flex items-center justify-center shadow-sm hover:shadow-md"
            aria-label="Emoji ekle"
          >
            <Smile className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:scale-110" />
          </button>
        )}

        {/* Message Input - Modern Design */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            className="w-full resize-none rounded-2xl border-2 border-gray-200 bg-white px-4 sm:px-5 py-3 text-sm sm:text-base focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all duration-200 min-h-[48px] placeholder:text-gray-400"
            rows={1}
            maxLength={1000}
            disabled={isSending}
          />
          {/* Character Count - Inside Input */}
          <div className="absolute bottom-2 right-3 text-xs text-gray-400 font-medium">
            {message.length}/1000
          </div>
        </div>

        {/* Send Button - Modern Gradient */}
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          className="group flex-shrink-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-3 text-white hover:from-purple-600 hover:to-pink-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 touch-manipulation min-h-[48px] min-w-[48px] flex items-center justify-center shadow-lg hover:shadow-xl disabled:shadow-sm"
          aria-label="Gönder"
        >
          {isSending ? (
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:translate-x-0.5" />
          )}
        </button>
      </div>
    </form>
  );
}
