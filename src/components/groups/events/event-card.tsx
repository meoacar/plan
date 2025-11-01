'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, Clock, Video, BookOpen, Dumbbell, Trophy, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    eventType: string;
    startDate: Date;
    endDate: Date | null;
    location: string | null;
    maxParticipants: number | null;
    creator: {
      id: string;
      name: string;
      image: string | null;
      username: string | null;
    };
    _count: {
      participants: number;
    };
    userParticipation: {
      status: string;
    } | null;
  };
  groupId: string;
  groupSlug: string;
  onJoin?: () => void;
}

const eventTypeConfig = {
  MEETUP: { label: 'Buluşma', icon: Users, color: 'bg-blue-100 text-blue-700' },
  WEBINAR: { label: 'Webinar', icon: Video, color: 'bg-purple-100 text-purple-700' },
  WORKSHOP: { label: 'Atölye', icon: BookOpen, color: 'bg-green-100 text-green-700' },
  CHALLENGE: { label: 'Challenge', icon: Trophy, color: 'bg-yellow-100 text-yellow-700' },
  OTHER: { label: 'Diğer', icon: Calendar, color: 'bg-gray-100 text-gray-700' },
};

const statusConfig = {
  GOING: { label: 'Katılıyorum', color: 'bg-green-100 text-green-700 border-green-300' },
  MAYBE: { label: 'Belki', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  NOT_GOING: { label: 'Katılmıyorum', color: 'bg-red-100 text-red-700 border-red-300' },
};

export default function EventCard({ event, groupId, groupSlug, onJoin }: EventCardProps) {
  const typeConfig = eventTypeConfig[event.eventType as keyof typeof eventTypeConfig] || eventTypeConfig.OTHER;
  const TypeIcon = typeConfig.icon;

  const isPast = new Date(event.startDate) < new Date();
  const isFull = event.maxParticipants && event._count.participants >= event.maxParticipants;

  const userStatus = event.userParticipation?.status;
  const statusInfo = userStatus ? statusConfig[userStatus as keyof typeof statusConfig] : null;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${typeConfig.color}`}>
                <TypeIcon className="w-3 h-3" />
                {typeConfig.label}
              </span>
              {isPast && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                  Geçmiş
                </span>
              )}
              {isFull && !isPast && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                  Dolu
                </span>
              )}
            </div>
            <Link
              href={`/groups/${groupSlug}/events/${event.id}`}
              className="block group"
            >
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                {event.title}
              </h3>
            </Link>
            {event.description && (
              <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">
              {format(new Date(event.startDate), 'dd MMMM yyyy, HH:mm', { locale: tr })}
            </span>
          </div>

          {event.endDate && (
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm">
                {format(new Date(event.endDate), 'HH:mm', { locale: tr })} bitiş
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span className="text-sm">{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">
              {event._count.participants} katılımcı
              {event.maxParticipants && ` / ${event.maxParticipants}`}
            </span>
          </div>
        </div>

        {/* Creator */}
        <Link
          href={`/profile/${event.creator.username || event.creator.id}`}
          className="flex items-center gap-2 mb-4 group"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
            {event.creator.image ? (
              <Image
                src={event.creator.image}
                alt={event.creator.name}
                width={32}
                height={32}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                {event.creator.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">
            {event.creator.name} tarafından oluşturuldu
          </span>
        </Link>

        {/* User Status */}
        {statusInfo && (
          <div className={`px-4 py-2 rounded-lg border-2 ${statusInfo.color} text-center mb-4`}>
            <span className="text-sm font-semibold">{statusInfo.label}</span>
          </div>
        )}

        {/* Action Button */}
        <Link
          href={`/groups/${groupSlug}/events/${event.id}`}
          className="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all text-center"
        >
          Detayları Gör
        </Link>
      </div>
    </div>
  );
}
