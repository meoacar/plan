'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Users,
  Lock,
  Globe,
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  Settings,
  Share2,
  Bell,
  BellOff,
  TrendingDown,
  Dumbbell,
  Apple,
  Heart,
  Sparkles,
  BarChart3,
  MessageCircle,
  Trophy,
  Calendar,
  Clock,
  UserCheck,
} from 'lucide-react';

interface GroupHeaderProps {
  group: {
    id: string;
    name: string;
    slug: string;
    description: string;
    goalType: string;
    imageUrl?: string | null;
    isPrivate: boolean;
    maxMembers?: number | null;
    isMember: boolean;
    memberRole: string | null;
    hasPendingRequest?: boolean;
    _count: {
      members: number;
      challenges: number;
    };
  };
}

const goalTypeConfig = {
  'weight-loss': {
    label: 'Kilo Verme',
    icon: TrendingDown,
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  fitness: {
    label: 'Fitness',
    icon: Dumbbell,
    gradient: 'from-blue-500 via-cyan-500 to-sky-500',
    badge: 'bg-blue-100 text-blue-700',
  },
  'healthy-eating': {
    label: 'Sağlıklı Beslenme',
    icon: Apple,
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    badge: 'bg-orange-100 text-orange-700',
  },
  'muscle-gain': {
    label: 'Kas Kazanımı',
    icon: Heart,
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    badge: 'bg-purple-100 text-purple-700',
  },
};

export function ModernGroupHeader({ group }: GroupHeaderProps) {
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isMember, setIsMember] = useState(group.isMember);
  const [hasPendingRequest, setHasPendingRequest] = useState(group.hasPendingRequest || false);

  const config = goalTypeConfig[group.goalType as keyof typeof goalTypeConfig] || goalTypeConfig['weight-loss'];
  const GoalIcon = config.icon;

  const handleJoinGroup = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${group.slug}/join`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gruba katılma başarısız');
      }

      const data = await res.json();
      if (data.requiresApproval) {
        setHasPendingRequest(true);
        alert('Katılma isteğiniz gönderildi. Grup yöneticisi onayladığında bildirim alacaksınız.');
      } else {
        setIsMember(true);
        window.location.reload();
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Gruptan ayrılmak istediğinize emin misiniz?')) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${group.slug}/join`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Gruptan ayrılma başarısız');

      setIsMember(false);
      window.location.reload();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/groups/${group.slug}`;
    if (navigator.share) {
      await navigator.share({
        title: group.name,
        text: group.description,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link kopyalandı!');
    }
  };

  return (
    <div className="relative">
      {/* Hero Section with Gradient */}
      <div className={`relative h-64 sm:h-80 bg-gradient-to-br ${config.gradient} overflow-hidden`}>
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Group Image */}
        {group.imageUrl && (
          <div className="absolute inset-0">
            <Image
              src={group.imageUrl}
              alt={group.name}
              fill
              className="object-cover opacity-20"
              unoptimized
            />
          </div>
        )}

        {/* Content */}
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-6">
          <div className="flex items-end gap-4">
            {/* Group Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white/20 backdrop-blur-md border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden relative">
                {group.imageUrl ? (
                  <Image
                    src={group.imageUrl}
                    alt={group.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <GoalIcon className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                )}
              </div>
              {group.memberRole === 'ADMIN' && (
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <Crown className="w-5 h-5 text-yellow-900" />
                </div>
              )}
            </div>

            {/* Group Info */}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.badge}`}>
                  <GoalIcon className="w-3.5 h-3.5" />
                  {config.label}
                </span>
                {group.isPrivate && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                    <Lock className="w-3 h-3" />
                    Özel
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {group.name}
              </h1>
              <div className="flex items-center gap-4 text-white/90 text-sm">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {group._count.members} üye
                </span>
                {group._count.challenges > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" />
                    {group._count.challenges} challenge
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              {isMember ? (
                <>
                  <button
                    onClick={handleLeaveGroup}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <UserMinus className="w-4 h-4" />
                    <span className="hidden sm:inline">Gruptan Ayrıl</span>
                  </button>
                  {group.memberRole === 'ADMIN' && (
                    <Link
                      href={`/groups/${group.slug}/settings`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Ayarlar</span>
                    </Link>
                  )}
                </>
              ) : hasPendingRequest ? (
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium border-2 border-yellow-300">
                  <Clock className="w-4 h-4 animate-pulse" />
                  Onay Bekleniyor
                </div>
              ) : (
                <button
                  onClick={handleJoinGroup}
                  disabled={loading}
                  className={`inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r ${config.gradient} text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50`}
                >
                  <UserPlus className="w-4 h-4" />
                  Gruba Katıl
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isMember && (
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={notificationsEnabled ? 'Bildirimleri Kapat' : 'Bildirimleri Aç'}
                >
                  {notificationsEnabled ? (
                    <Bell className="w-5 h-5 text-gray-600" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              )}
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Paylaş"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
            <Link
              href={`/groups/${group.slug}`}
              className="px-4 py-3 text-sm font-medium border-b-2 border-primary-500 text-primary-600 whitespace-nowrap"
            >
              Akış
            </Link>
            {isMember && (
              <>
                <Link
                  href={`/groups/${group.slug}/chat`}
                  className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 whitespace-nowrap transition-colors"
                >
                  <MessageCircle className="w-4 h-4 inline mr-1.5" />
                  Sohbet
                </Link>
                <Link
                  href={`/groups/${group.slug}/leaderboard`}
                  className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 whitespace-nowrap transition-colors"
                >
                  <Trophy className="w-4 h-4 inline mr-1.5" />
                  Liderlik
                </Link>
                <Link
                  href={`/groups/${group.slug}/members`}
                  className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 whitespace-nowrap transition-colors"
                >
                  <UserCheck className="w-4 h-4 inline mr-1.5" />
                  Üyeler
                </Link>
                <Link
                  href={`/groups/${group.slug}/events`}
                  className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 whitespace-nowrap transition-colors"
                >
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  Etkinlikler
                </Link>
                <Link
                  href={`/groups/${group.slug}/stats`}
                  className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 whitespace-nowrap transition-colors"
                >
                  <BarChart3 className="w-4 h-4 inline mr-1.5" />
                  İstatistikler
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description Section */}
      {group.description && (
        <div className="bg-gradient-to-b from-gray-50 to-white border-b">
          <div className="container mx-auto px-4 py-6">
            <p className="text-gray-700 leading-relaxed max-w-3xl">
              {group.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
