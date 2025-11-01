'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Users, Trophy, TrendingDown, Activity, MessageSquare, Heart, Lock, Loader2, ChevronRight } from 'lucide-react';
import PreviewActivity from './preview-activity';
import PreviewPosts from './preview-posts';
import PreviewTestimonials from './preview-testimonials';
import CategoryBadge from './category-badge';

interface GroupPreviewModalProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
}

interface PreviewData {
  group: {
    id: string;
    name: string;
    slug: string;
    description: string;
    goalType: string;
    imageUrl: string | null;
    isPrivate: boolean;
    level: string | null;
    gender: string | null;
    ageGroup: string | null;
    createdAt: string;
    memberCount: number;
    challengeCount: number;
  };
  recentActivities: any[];
  popularPosts: any[];
  memberTestimonials: any[];
  stats: {
    totalMembers: number;
    activeMembers: number;
    totalWeightLoss: number;
    avgWeightLoss: number;
    totalPosts: number;
    totalMessages: number;
    activeRate: number;
  };
}

const goalTypeConfig = {
  'weight-loss': { label: 'Kilo Verme', color: 'from-green-500 to-emerald-600' },
  'fitness': { label: 'Fitness', color: 'from-blue-500 to-cyan-600' },
  'healthy-eating': { label: 'Sağlıklı Beslenme', color: 'from-orange-500 to-red-600' },
  'muscle-gain': { label: 'Kas Kazanımı', color: 'from-purple-500 to-pink-600' },
};

export default function GroupPreviewModal({ slug, isOpen, onClose }: GroupPreviewModalProps) {
  const router = useRouter();
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activity' | 'posts' | 'testimonials'>('activity');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (isOpen && slug) {
      fetchPreviewData();
    }
  }, [isOpen, slug]);

  const fetchPreviewData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${slug}/preview`);
      if (res.ok) {
        const previewData = await res.json();
        setData(previewData);
      }
    } catch (error) {
      console.error('Önizleme yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!data) return;
    
    setIsJoining(true);
    try {
      const res = await fetch(`/api/groups/${slug}/join`, {
        method: 'POST',
      });

      if (res.ok) {
        // Gruba katıldı, grup sayfasına yönlendir
        router.push(`/groups/${slug}`);
      } else {
        const error = await res.json();
        alert(error.error || 'Gruba katılırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Katılma hatası:', error);
      alert('Bir hata oluştu');
    } finally {
      setIsJoining(false);
    }
  };

  const handleViewGroup = () => {
    router.push(`/groups/${slug}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative">
          {loading ? (
            <div className="h-48 bg-gray-200 animate-pulse"></div>
          ) : data ? (
            <>
              {/* Cover Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                {data.group.imageUrl ? (
                  <Image
                    src={data.group.imageUrl}
                    alt={data.group.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${goalTypeConfig[data.group.goalType as keyof typeof goalTypeConfig]?.color || 'from-purple-500 to-pink-500'}`}></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>

                {/* Private Badge */}
                {data.group.isPrivate && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-gray-900/80 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                      <Lock className="w-3 h-3" />
                      Özel Grup
                    </span>
                  </div>
                )}

                {/* Group Info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {data.group.name}
                  </h2>
                  <p className="text-white/90 text-sm line-clamp-2">
                    {data.group.description}
                  </p>
                </div>
              </div>

              {/* Category Badges */}
              {(data.group.level || data.group.gender || data.group.ageGroup) && (
                <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap gap-2">
                  {data.group.level && (
                    <CategoryBadge type="level" value={data.group.level} size="sm" />
                  )}
                  {data.group.gender && (
                    <CategoryBadge type="gender" value={data.group.gender} size="sm" />
                  )}
                  {data.group.ageGroup && (
                    <CategoryBadge type="ageGroup" value={data.group.ageGroup} size="sm" />
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : data ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{data.stats.totalMembers}</div>
                  <div className="text-xs text-gray-600">Üye</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{data.stats.activeMembers}</div>
                  <div className="text-xs text-gray-600">Aktif Üye</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{data.stats.totalPosts}</div>
                  <div className="text-xs text-gray-600">Paylaşım</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full mx-auto mb-2">
                    <TrendingDown className="w-6 h-6 text-pink-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {data.stats.totalWeightLoss.toFixed(1)} kg
                  </div>
                  <div className="text-xs text-gray-600">Toplam Kilo</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex gap-1 px-6">
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`px-4 py-3 font-semibold text-sm transition-colors relative ${
                      activeTab === 'activity'
                        ? 'text-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Son Aktiviteler
                    {activeTab === 'activity' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`px-4 py-3 font-semibold text-sm transition-colors relative ${
                      activeTab === 'posts'
                        ? 'text-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Popüler Gönderiler
                    {activeTab === 'posts' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('testimonials')}
                    className={`px-4 py-3 font-semibold text-sm transition-colors relative ${
                      activeTab === 'testimonials'
                        ? 'text-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Üye Yorumları
                    {activeTab === 'testimonials' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'activity' && (
                  <PreviewActivity activities={data.recentActivities} />
                )}
                {activeTab === 'posts' && (
                  <PreviewPosts posts={data.popularPosts} />
                )}
                {activeTab === 'testimonials' && (
                  <PreviewTestimonials testimonials={data.memberTestimonials} />
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Önizleme yüklenemedi
            </div>
          )}
        </div>

        {/* Footer */}
        {data && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={handleViewGroup}
                className="flex-1 px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-full font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                Detaylı İncele
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleJoinGroup}
                disabled={isJoining}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Katılınıyor...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Gruba Katıl
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
