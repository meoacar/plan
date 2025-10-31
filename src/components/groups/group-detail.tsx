'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Trophy,
  Lock,
  UserPlus,
  UserMinus,
  Calendar,
  TrendingDown,
  Dumbbell,
  Apple,
  Heart,
  Crown,
  Shield,
  MessageCircle,
  Share2,
  Settings,
  Bell,
  BellOff,
  Sparkles,
} from 'lucide-react';

interface GroupMember {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Group {
  id: string;
  name: string;
  slug: string;
  description: string;
  goalType: string;
  imageUrl?: string;
  isPrivate: boolean;
  maxMembers?: number;
  status: string;
  members: GroupMember[];
  challenges: Challenge[];
  isMember: boolean;
  memberRole: string | null;
  _count: {
    members: number;
    challenges: number;
  };
}

interface GroupDetailProps {
  group: Group;
}

const goalTypeConfig = {
  'weight-loss': {
    label: 'Kilo Verme',
    icon: TrendingDown,
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    text: 'text-green-700',
  },
  fitness: {
    label: 'Fitness',
    icon: Dumbbell,
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  'healthy-eating': {
    label: 'Sağlıklı Beslenme',
    icon: Apple,
    color: 'from-orange-500 to-red-600',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
  },
  'muscle-gain': {
    label: 'Kas Kazanımı',
    icon: Heart,
    color: 'from-purple-500 to-pink-600',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
  },
};

export default function GroupDetail({ group }: GroupDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'about' | 'members' | 'challenges'>('about');

  const config = goalTypeConfig[group.goalType as keyof typeof goalTypeConfig] || goalTypeConfig['weight-loss'];
  const Icon = config.icon;

  const handleJoinGroup = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch(`/api/groups/${group.slug}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gruba katılma başarısız');
      }

      const data = await res.json();
      if (data.requiresApproval) {
        alert('Katılma isteğiniz gönderildi. Grup yöneticisi onayladıktan sonra üye olacaksınız.');
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Gruptan ayrılmak istediğinize emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch(`/api/groups/${group.slug}/join`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gruptan ayrılma başarısız');
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
        {group.imageUrl ? (
          <>
            <Image src={group.imageUrl} alt={group.name} fill className="object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-80`}>
            <Icon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 text-white/20" />
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`${config.bg} ${config.text} px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur-sm`}>
                    <Icon className="w-4 h-4" />
                    {config.label}
                  </span>
                  {group.isPrivate && (
                    <span className="bg-gray-900/80 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur-sm">
                      <Lock className="w-4 h-4" />
                      Özel Grup
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-3">{group.name}</h1>
                <div className="flex flex-wrap gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">{group._count.members} üye</span>
                    {group.maxMembers && <span className="text-white/60">/ {group.maxMembers}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="font-semibold">{group._count.challenges} challenge</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!group.isMember ? (
                  <button
                    onClick={handleJoinGroup}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-all disabled:opacity-50 shadow-xl"
                  >
                    <UserPlus className="w-5 h-5" />
                    {loading ? 'Katılınıyor...' : 'Gruba Katıl'}
                  </button>
                ) : (
                  <>
                    <button className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-full font-bold hover:bg-white/20 transition-all border border-white/20">
                      <Bell className="w-5 h-5" />
                    </button>
                    <button className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-full font-bold hover:bg-white/20 transition-all border border-white/20">
                      <Share2 className="w-5 h-5" />
                    </button>
                    {group.memberRole === 'ADMIN' && (
                      <button className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-full font-bold hover:bg-white/20 transition-all border border-white/20">
                        <Settings className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="container mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            {error}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: 'about', label: 'Hakkında', icon: Sparkles },
              { id: 'members', label: 'Üyeler', icon: Users },
              { id: 'challenges', label: 'Challenge\'lar', icon: Trophy },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TabIcon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'about' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Grup Hakkında
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">{group.description}</p>

                {group.isMember && (
                  <div className="mt-8 pt-8 border-t">
                    <button
                      onClick={handleLeaveGroup}
                      disabled={loading}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
                    >
                      <UserMinus className="w-5 h-5" />
                      {loading ? 'Ayrılınıyor...' : 'Gruptan Ayrıl'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-600" />
                  Üyeler ({group._count.members})
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {group.members.map((member) => (
                    <Link
                      key={member.id}
                      href={`/profile/${member.user.username || member.user.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
                          {member.user.image ? (
                            <Image src={member.user.image} alt={member.user.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                              {member.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        {member.role === 'ADMIN' && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {member.role === 'MODERATOR' && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                            <Shield className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                          {member.user.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {member.role === 'ADMIN' && '👑 Admin'}
                          {member.role === 'MODERATOR' && '🛡️ Moderatör'}
                          {member.role === 'MEMBER' && 'Üye'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'challenges' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Aktif Challenge'lar ({group._count.challenges})
                </h2>
                {group.challenges.length > 0 ? (
                  <div className="space-y-4">
                    {group.challenges.map((challenge) => (
                      <div
                        key={challenge.id}
                        className="border-2 border-gray-100 rounded-xl p-6 hover:border-purple-200 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-lg text-gray-900">{challenge.title}</h3>
                          {challenge.isActive && (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{challenge.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(challenge.startDate).toLocaleDateString('tr-TR')} -{' '}
                              {new Date(challenge.endDate).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Henüz aktif challenge bulunmuyor</p>
                    {group.memberRole === 'ADMIN' && (
                      <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all">
                        Challenge Oluştur
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4">İstatistikler</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Toplam Üye</span>
                  <span className="font-bold text-xl">{group._count.members}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Aktif Challenge</span>
                  <span className="font-bold text-xl">{group._count.challenges}</span>
                </div>
                {group.maxMembers && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Doluluk Oranı</span>
                      <span className="text-sm font-semibold">
                        {Math.round((group._count.members / group.maxMembers) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all"
                        style={{ width: `${(group._count.members / group.maxMembers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Members */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4">Son Katılanlar</h3>
              <div className="space-y-3">
                {group.members.slice(0, 5).map((member) => (
                  <Link
                    key={member.id}
                    href={`/profile/${member.user.username || member.user.id}`}
                    className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
                      {member.user.image ? (
                        <Image src={member.user.image} alt={member.user.name} width={40} height={40} className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{member.user.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(member.joinedAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
