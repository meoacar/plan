'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MemberActions } from './member-actions';

interface MemberCardProps {
  member: {
    id: string;
    role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
    joinedAt: Date;
    user: {
      id: string;
      name: string | null;
      image: string | null;
      username: string | null;
      bio: string | null;
      startWeight: number | null;
      goalWeight: number | null;
      level: number;
      streak: number;
    };
  };
  groupId: string;
  currentUserId: string;
  currentUserRole: 'ADMIN' | 'MODERATOR' | 'MEMBER';
}

export function MemberCard({
  member,
  groupId,
  currentUserId,
  currentUserRole,
}: MemberCardProps) {
  const [isRemoved, setIsRemoved] = useState(false);

  if (isRemoved) {
    return null;
  }

  const roleLabels = {
    ADMIN: 'Yönetici',
    MODERATOR: 'Moderatör',
    MEMBER: 'Üye',
  };

  const roleColors = {
    ADMIN: 'bg-yellow-100 text-yellow-800',
    MODERATOR: 'bg-blue-100 text-blue-800',
    MEMBER: 'bg-gray-100 text-gray-800',
  };

  const profileUrl = member.user.username
    ? `/profile/${member.user.username}`
    : `/profile/${member.user.id}`;

  const weightLoss =
    member.user.startWeight && member.user.goalWeight
      ? member.user.startWeight - member.user.goalWeight
      : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Link href={profileUrl} className="flex-shrink-0">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200">
            {member.user.image ? (
              <Image
                src={member.user.image}
                alt={member.user.name || 'Kullanıcı'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                👤
              </div>
            )}
          </div>
        </Link>

        {/* Bilgiler */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link
                href={profileUrl}
                className="font-semibold text-gray-900 hover:text-green-600 transition-colors block truncate"
              >
                {member.user.name || 'İsimsiz Kullanıcı'}
              </Link>
              {member.user.username && (
                <p className="text-sm text-gray-500 truncate">
                  @{member.user.username}
                </p>
              )}
            </div>

            {/* Rol Badge */}
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                roleColors[member.role]
              }`}
            >
              {roleLabels[member.role]}
            </span>
          </div>

          {/* Bio */}
          {member.user.bio && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {member.user.bio}
            </p>
          )}

          {/* İstatistikler */}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span>⭐</span>
              <span>Seviye {member.user.level}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔥</span>
              <span>{member.user.streak} gün</span>
            </div>
            {weightLoss && weightLoss > 0 && (
              <div className="flex items-center gap-1">
                <span>📉</span>
                <span>{weightLoss} kg</span>
              </div>
            )}
          </div>

          {/* Katılma tarihi */}
          <p className="text-xs text-gray-400 mt-2">
            {new Date(member.joinedAt).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            tarihinde katıldı
          </p>
        </div>
      </div>

      {/* Aksiyon Menüsü */}
      {currentUserId !== member.user.id && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <MemberActions
            memberId={member.user.id}
            memberRole={member.role}
            groupId={groupId}
            currentUserRole={currentUserRole}
            onRemove={() => setIsRemoved(true)}
          />
        </div>
      )}
    </div>
  );
}
