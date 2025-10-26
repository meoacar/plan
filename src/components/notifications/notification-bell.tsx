'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // İlk yükleme - fallback olarak API'den al
    fetchUnreadCount();

    // SSE bağlantısı kur
    connectToSSE();

    return () => {
      // Cleanup - SSE bağlantısını kapat
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  async function fetchUnreadCount() {
    try {
      const response = await fetch('/api/notifications/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    } finally {
      setLoading(false);
    }
  }

  function connectToSSE() {
    try {
      console.log('[SSE] Connecting...');
      
      // Önceki bağlantıyı kapat
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // EventSource oluştur
      const eventSource = new EventSource('/api/notifications/stream');
      eventSourceRef.current = eventSource;

      // Bağlantı açıldığında
      eventSource.onopen = () => {
        console.log('[SSE] Connected');
        setIsConnected(true);
        setLoading(false);
      };

      // Mesaj geldiğinde
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[SSE] Message received:', data);

          if (data.type === 'count') {
            // Okunmamış sayısını güncelle
            setUnreadCount(data.count);
          } else if (data.type === 'new') {
            // Yeni bildirim geldi
            console.log('[SSE] New notification:', data.notification);
            
            // Animasyon tetikle
            setHasNewNotification(true);
            setTimeout(() => setHasNewNotification(false), 2000);

            // Tarayıcı bildirimi göster (izin varsa)
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(data.notification.title, {
                  body: data.notification.message,
                  icon: '/icon-192x192.png',
                  badge: '/badge-72x72.png',
                  tag: 'notification-' + data.notification.id,
                });
              } catch (error) {
                console.error('[Notification] Error:', error);
              }
            }
          }
        } catch (error) {
          console.error('[SSE] Failed to parse message:', error);
        }
      };

      // Hata durumunda
      eventSource.onerror = (error) => {
        console.error('[SSE] Error:', error);
        setIsConnected(false);
        eventSource.close();

        // 5 saniye sonra yeniden bağlan
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[SSE] Reconnecting...');
          connectToSSE();
        }, 5000);
      };
    } catch (error) {
      console.error('[SSE] Failed to connect:', error);
      setIsConnected(false);
      
      // Fallback: 30 saniyede bir polling
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }

  return (
    <div className="relative">
      <Link
        href="/bildirimler"
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
        title="Bildirimler"
      >
        <Bell 
          className={`w-5 h-5 text-gray-700 transition-all ${
            hasNewNotification ? 'animate-bounce text-red-500' : ''
          }`} 
        />
        {!loading && unreadCount > 0 && (
          <span 
            className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg transition-all ${
              hasNewNotification ? 'animate-ping' : 'animate-pulse'
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
      
      {/* Debug indicator - sadece development'ta göster */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -bottom-1 -right-1">
          <div 
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={isConnected ? 'SSE Connected' : 'SSE Disconnected'}
          />
        </div>
      )}
    </div>
  );
}
