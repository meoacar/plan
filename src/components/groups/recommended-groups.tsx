import { auth } from '@/lib/auth';
import { getRecommendedGroups, getRecommendationReason } from '@/lib/group-recommendations';
import RecommendationCard from './recommendation-card';
import { Sparkles } from 'lucide-react';

interface RecommendedGroup {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  isPrivate: boolean;
  memberCount: number;
  matchScore: {
    total: number;
    goal: number;
    friends: number;
    activity: number;
    location: number;
  };
  reason: string;
}

async function getRecommendations(): Promise<RecommendedGroup[]> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return [];
    }

    // Doğrudan fonksiyonu çağır (server component)
    const recommendedGroups = await getRecommendedGroups(session.user.id, 6);

    // Her grup için öneri nedenini ekle
    const groupsWithReasons = recommendedGroups.map((group) => ({
      id: group.id,
      name: group.name,
      slug: group.slug,
      description: group.description || '',
      imageUrl: group.imageUrl || undefined,
      isPrivate: group.isPrivate,
      memberCount: group._count.members,
      matchScore: group.matchScore,
      reason: getRecommendationReason(group.matchScore),
    }));

    return groupsWithReasons;
  } catch (error) {
    console.error('Öneriler alınamadı:', error);
    return [];
  }
}

export default async function RecommendedGroups() {
  const recommendations = await getRecommendations();

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Senin İçin Önerilen Gruplar
          </h2>
          <p className="text-gray-600 text-sm">
            Hedeflerine ve ilgi alanlarına göre seçildi
          </p>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((group) => (
          <RecommendationCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}
