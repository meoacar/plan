'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Users, Bell, User, Menu, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMobile } from '@/hooks/use-mobile';
import { useSession } from 'next-auth/react';

interface MobileBottomNavProps {
  isAuthenticated: boolean;
  unreadCount?: number;
}

export function MobileBottomNav({ isAuthenticated, unreadCount = 0 }: MobileBottomNavProps) {
  const pathname = usePathname();
  const isMobile = useMobile(768);
  const [showMenu, setShowMenu] = useState(false);
  const { data: session } = useSession();
  const [activeQuestCount, setActiveQuestCount] = useState(0);

  // Aktif görev sayısını getir
  useEffect(() => {
    if (isAuthenticated && session?.user?.id) {
      fetch('/api/quests')
        .then(res => res.json())
        .then(data => {
          const allQuests = [...(data.daily || []), ...(data.weekly || []), ...(data.special || [])];
          const activeCount = allQuests.filter((q: any) => !q.completed).length;
          setActiveQuestCount(activeCount);
        })
        .catch(err => console.error('Görevler alınamadı:', err));
    }
  }, [isAuthenticated, session?.user?.id]);

  // Sadece mobilde göster
  if (!isMobile) return null;

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Ana Sayfa',
      active: pathname === '/',
    },
    ...(isAuthenticated
      ? [
          {
            href: '/gamification?tab=quests',
            icon: Target,
            label: 'Görevler',
            active: pathname === '/gamification',
            badge: activeQuestCount,
          },
        ]
      : []),
    {
      href: '/groups',
      icon: Users,
      label: 'Gruplar',
      active: pathname.startsWith('/groups'),
    },
    ...(isAuthenticated
      ? [
          {
            href: '/bildirimler',
            icon: Bell,
            label: 'Bildirimler',
            active: pathname === '/bildirimler',
            badge: unreadCount,
          },
          {
            href: '/profile',
            icon: User,
            label: 'Profil',
            active: pathname.startsWith('/profile'),
          },
        ]
      : []),
    {
      href: '#',
      icon: Menu,
      label: 'Menü',
      active: false,
      onClick: () => setShowMenu(!showMenu),
    },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-40 md:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.active;

            if (item.onClick) {
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={`flex flex-col items-center justify-center flex-1 h-full touch-manipulation transition-colors ${
                    isActive
                      ? 'text-purple-600'
                      : 'text-gray-600 hover:text-purple-600 active:text-purple-700'
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full touch-manipulation transition-colors ${
                  isActive
                    ? 'text-purple-600'
                    : 'text-gray-600 hover:text-purple-600 active:text-purple-700'
                }`}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Menu Overlay */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowMenu(false)}
          />
          <div className="fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[70vh] overflow-y-auto safe-area-bottom md:hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Menü</h3>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                {isAuthenticated && (
                  <>
                    {/* Görevler - Özel Vurgu */}
                    <Link
                      href="/gamification?tab=quests"
                      onClick={() => setShowMenu(false)}
                      className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <Target className="w-6 h-6" />
                        <div className="flex-1">
                          <div className="font-bold">Görevler</div>
                          <div className="text-xs opacity-90">
                            {activeQuestCount > 0 ? `${activeQuestCount} aktif görev` : 'Görevlerini kontrol et'}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </>
                )}
                
                <Link
                  href="/submit"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">➕</span>
                  <span className="font-medium">Plan Ekle</span>
                </Link>
                <Link
                  href="/recipes"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">🍽️</span>
                  <span className="font-medium">Tarifler</span>
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">✍️</span>
                  <span className="font-medium">Blog</span>
                </Link>
                {isAuthenticated && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link
                      href="/analytics"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xl">📊</span>
                      <span className="font-medium">İlerleme Takibi</span>
                    </Link>
                    <Link
                      href="/gamification"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xl">🏆</span>
                      <span className="font-medium">Rozetler</span>
                    </Link>
                    <Link
                      href="/shop"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xl">🛍️</span>
                      <span className="font-medium">Mağaza</span>
                    </Link>
                    <Link
                      href="/games"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xl">🎮</span>
                      <span className="font-medium">Mini Oyunlar</span>
                    </Link>
                    <Link
                      href="/ayarlar"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xl">⚙️</span>
                      <span className="font-medium">Ayarlar</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}
