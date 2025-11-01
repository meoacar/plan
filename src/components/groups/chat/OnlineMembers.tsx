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
    <div className="p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex w-full items-center justify-between rounded-xl px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:from-green-100 hover:to-emerald-100 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Users className="h-5 w-5 text-green-600" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <span className="font-semibold text-green-700">
            Çevrimiçi <span className="text-green-600">({members.length})</span>
          </span>
        </div>
        <svg 
          className={`w-5 h-5 text-green-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2 animate-fadeIn">
          {members.map((member) => {
            const userInfo = member.user_info || { name: null, image: null };
            return (
              <div
                key={member.id}
                className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-green-50/50 transition-all duration-200"
              >
                <div className="relative">
                  {userInfo.image ? (
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                      <Image
                        src={userInfo.image}
                        alt={userInfo.name || 'User'}
                        width={36}
                        height={36}
                        className="relative rounded-full ring-2 ring-white"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                      <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white text-sm font-bold ring-2 ring-white shadow-sm">
                        {userInfo.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    </div>
                  )}
                  {/* Online indicator - Animated */}
                  <div className="absolute bottom-0 right-0">
                    <div className="h-3 w-3 rounded-full border-2 border-white bg-green-500 shadow-sm"></div>
                    <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-500 animate-ping opacity-75"></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
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
