"use client";

import { Badge } from "@prisma/client";

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
  earnedAt?: Date;
}

export function BadgeCard({ badge, earned = false, earnedAt }: BadgeCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 transition-all ${
        earned
          ? "border-yellow-500 bg-yellow-50 shadow-md"
          : "border-gray-200 bg-gray-50 opacity-60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl">{badge.icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{badge.name}</h3>
          <p className="text-sm text-gray-600">{badge.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-medium text-blue-600">
              +{badge.xpReward} XP
            </span>
            {earned && earnedAt && (
              <span className="text-xs text-gray-500">
                {new Date(earnedAt).toLocaleDateString("tr-TR")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
