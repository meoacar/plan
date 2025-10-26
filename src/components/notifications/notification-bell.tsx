'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // İlk yükleme - fallback olarak API'den al
    fetchUnreadCount();

    // SSE bağlantısı kur
    connectToSSE();

    return () => {
      // Cleanup - SSE bağlantısını kapat
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
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
      // EventSource oluştur
      const eventSource = new EventSource('/api/notifications/stream');
      eventSourceRef.current = eventSource;

      // Mesaj geldiğinde
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'count') {
            // Okunmamış sayısını güncelle
            setUnreadCount(data.count);
            setLoading(false);
          } else if (data.type === 'new') {
            // Yeni bildirim geldi - animasyon tetikle
            setHasNewNotification(true);
            
            // Animasyonu 2 saniye sonra kaldır
            setTimeout(() => {
              setHasNewNotification(false);
            }, 2000);

            // Tarayıcı bildirimi göster (izin varsa)
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(data.notification.title, {
                body: data.notification.message,
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png',
              });
            }
          }
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      // Hata durumunda
      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        eventSource.close();

        // 5 saniye sonra yeniden bağlan
        setTimeout(() => {
          if (eventSourceRef.current === eventSource) {
            connectToSSE();
          }
        }, 5000);
      };

      // Bağlantı açıldığında
      eventSource.onopen = () => {
        console.log('SSE connection opened');
      };
    } catch (error) {
      console.error('Failed to connect to SSE:', error);
      // Fallback: polling kullan
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }

  return (
    <Link
      href="/bildirimler"
      className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
  );
}
