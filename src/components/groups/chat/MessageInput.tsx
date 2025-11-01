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
    <form onSubmit={handleSubmit} className="bg-white p-3 sm:p-4 safe-area-bottom">
      <div className="flex items-end gap-2">
        {/* Emoji Picker Button */}
        {onToggleEmojiPicker && (
          <button
            type="button"
            onClick={onToggleEmojiPicker}
            className="flex-shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 active:bg-gray-200 hover:text-gray-700 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Emoji ekle"
          >
            <Smile className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}

        {/* Message Input */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mesajınızı yazın..."
          className="flex-1 resize-none rounded-lg border border-gray-300 px-3 sm:px-4 py-2 text-sm sm:text-base focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 min-h-[44px]"
          rows={1}
          maxLength={1000}
          disabled={isSending}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          className="flex-shrink-0 rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 active:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Gönder"
        >
          <Send className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>
      
      {/* Character Count */}
      <div className="mt-1 text-right text-xs text-gray-500">
        {message.length}/1000
      </div>
    </form>
  );
}
