'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Users } from 'lucide-react';

interface OnlineMember {
  id: string;
  user_info: {
    name: string | null;
    image: string | null;
  };
}

interface OnlineMembersProps {
  members: OnlineMember[];
}

export function OnlineMembers({ members }: OnlineMembersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (members.length === 0) {
    return null;
  }

  return (
    <div className="border-b bg-white p-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-green-500" />
          <span>Çevrimiçi ({members.length})</span>
        </div>
        <span className="text-gray-400">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {members.map((member) => {
            const userInfo = member.user_info || { name: null, image: null };
            return (
              <div
                key={member.id}
                className="flex items-center gap-2"
              >
                <div className="relative">
                  {userInfo.image ? (
                    <Image
                      src={userInfo.image}
                      alt={userInfo.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white text-sm font-semibold">
                      {userInfo.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                </div>
                <span className="text-sm text-gray-700">
                  {userInfo.name || 'Anonim'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
