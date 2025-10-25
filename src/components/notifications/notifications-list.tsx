'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Check, CheckCheck, Trash2, Loader2, UserPlus, Heart, MessageCircle, Award, X } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
  relatedId: string | null;
  metadata: any;
}

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  async function fetchNotifications() {
    try {
      setLoadingMore(page > 1);
      const response = await fetch(`/api/notifications?page=${page}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setNotifications(data.notifications);
        } else {
          setNotifications((prev) => [...prev, ...data.notifications]);
        }
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  async function markAllAsRead() {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  async function deleteNotification(id: string) {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  async function handleFollowRequest(followId: string, action: 'accept' | 'reject', notificationId: string) {
    try {
      const response = await fetch('/api/follow/request', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followId, action }),
      });

      if (response.ok) {
        // Bildirimi sil
        deleteNotification(notificationId);
      }
    } catch (error) {
      console.error('Failed to handle follow request:', error);
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'FOLLOW_REQUEST':
      case 'FOLLOW_ACCEPTED':
      case 'NEW_FOLLOWER':
        return <UserPlus className="w-5 h-5 text-purple-600" />;
      case 'PLAN_LIKE':
      case 'RECIPE_LIKE':
      case 'LIKE':
        return <Heart className="w-5 h-5 text-red-600" />;
      case 'PLAN_COMMENT':
      case 'RECIPE_COMMENT':
      case 'COMMENT':
      case 'COMMENT_REACTION':
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
      case 'BADGE_EARNED':
      case 'LEVEL_UP':
        return <Award className="w-5 h-5 text-yellow-600" />;
      default:
        return <Check className="w-5 h-5 text-gray-600" />;
    }
  }

  function loadMore() {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      {notifications.length > 0 && notifications.some((n) => !n.isRead) && (
        <div className="flex justify-end">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <CheckCheck className="h-4 w-4" />
            Tümünü okundu işaretle
          </button>
        </div>
      )}

      {/* Notifications */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Henüz bildiriminiz yok</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 hover:bg-gray-50 transition-colors ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  {notification.actionUrl ? (
                    <Link
                      href={notification.actionUrl}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification.id);
                        }
                      }}
                      className="block"
                    >
                      <p className="font-semibold text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-sm text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </p>
                    </Link>
                  ) : (
                    <>
                      <p className="font-semibold text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-sm text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </p>
                    </>
                  )}

                  {/* Takip isteği için özel butonlar */}
                  {notification.type === 'FOLLOW_REQUEST' && notification.relatedId && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleFollowRequest(notification.relatedId!, 'accept', notification.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Kabul Et
                      </button>
                      <button
                        onClick={() => handleFollowRequest(notification.relatedId!, 'reject', notification.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Reddet
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Okundu işaretle"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {page < totalPages && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Yükleniyor...
              </>
            ) : (
              'Daha Fazla Yükle'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
