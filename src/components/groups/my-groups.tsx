'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, CheckCircle, XCircle, Users, Eye } from 'lucide-react';

interface MyGroup {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  _count: {
    members: number;
  };
}

export default function MyGroups({ userId }: { userId: string }) {
  const [groups, setGroups] = useState<MyGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyGroups();
  }, [userId]);

  const fetchMyGroups = async () => {
    try {
      const res = await fetch(`/api/groups?createdBy=${userId}`);
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Gruplar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return null;
  }

  const statusConfig = {
    PENDING: {
      icon: Clock,
      label: 'Onay Bekliyor',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
    },
    APPROVED: {
      icon: CheckCircle,
      label: 'Onaylandı',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    REJECTED: {
      icon: XCircle,
      label: 'Reddedildi',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Users className="w-6 h-6 text-purple-600" />
        Oluşturduğum Gruplar
      </h2>

      <div className="space-y-3">
        {groups.map((group) => {
          const config = statusConfig[group.status];
          const StatusIcon = config.icon;
          const isApproved = group.status === 'APPROVED';
          const isPending = group.status === 'PENDING';

          return (
            <Link
              key={group.id}
              href={isApproved ? `/groups/${group.slug}` : `/groups/pending/${group.id}`}
              className="block"
            >
              <div className="flex items-center gap-4 p-4 rounded-xl border-2 hover:border-purple-300 transition-all hover:shadow-md">
                {/* Group Image */}
                {group.imageUrl ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={group.imageUrl}
                      alt={group.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                )}

                {/* Group Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate mb-1">
                    {group.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                    {group.description}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-1 ${config.bg} ${config.border} border rounded-full text-xs font-medium ${config.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </span>

                    {/* Member Count */}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                        <Users className="w-3 h-3" />
                        {group._count.members} üye
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Icon */}
                <div className="flex-shrink-0">
                  {isPending ? (
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-yellow-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info for pending groups */}
      {groups.some(g => g.status === 'PENDING') && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Onay bekleyen gruplarınız admin tarafından inceleniyor. Onaylandığında bildirim alacaksınız.
          </p>
        </div>
      )}
    </div>
  );
}
