'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, MessageCircle, Users, Calendar, Trophy, BarChart3, BookOpen, Settings } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { useSwipe } from '@/hooks/use-swipe';
import { useState, useRef, useEffect } from 'react';

interface MobileGroupTabsProps {
  groupSlug: string;
  isAdmin?: boolean;
}

export function MobileGroupTabs({ groupSlug, isAdmin = false }: MobileGroupTabsProps) {
  const pathname = usePathname();
  const isMobile = useMobile(1024);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const tabs = [
    {
      href: `/groups/${groupSlug}`,
      icon: Home,
      label: 'Akış',
      exact: true,
    },
    {
      href: `/groups/${groupSlug}/chat`,
      icon: MessageCircle,
      label: 'Sohbet',
    },
    {
      href: `/groups/${groupSlug}/members`,
      icon: Users,
      label: 'Üyeler',
    },
    {
      href: `/groups/${groupSlug}/events`,
      icon: Calendar,
      label: 'Etkinlikler',
    },
    {
      href: `/groups/${groupSlug}/leaderboard`,
      icon: Trophy,
      label: 'Liderlik',
    },
    {
      href: `/groups/${groupSlug}/stats`,
      icon: BarChart3,
      label: 'İstatistikler',
    },
    {
      href: `/groups/${groupSlug}/resources`,
      icon: BookOpen,
      label: 'Kaynaklar',
    },
    ...(isAdmin
      ? [
          {
            href: `/groups/${groupSlug}/settings`,
            icon: Settings,
            label: 'Ayarlar',
          },
        ]
      : []),
  ];

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll);
      return () => scrollElement.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const swipeHandlers = useSwipe({
    onSwipeLeft: scrollRight,
    onSwipeRight: scrollLeft,
  });

  if (!isMobile) return null;

  return (
    <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-white to-transparent px-2 flex items-center"
            aria-label="Sola kaydır"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Tabs */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-2"
          {...swipeHandlers}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap font-medium text-sm transition-all touch-manipulation flex-shrink-0 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-white to-transparent px-2 flex items-center"
            aria-label="Sağa kaydır"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
