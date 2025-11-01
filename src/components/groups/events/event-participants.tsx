'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Check, X, HelpCircle } from 'lucide-react';

interface Participant {
  id: string;
  status: string;
  user: {
    id: string;
    name: string;
    image: string | null;
    username: string | null;
  };
}

interface EventParticipantsProps {
  eventId: string;
  groupId: string;
  groupSlug: string;
  participants: Participant[];
  userParticipation: Participant | undefined;
  isPast: boolean;
  isFull: boolean;
}

const statusConfig = {
  GOING: { label: 'Katılıyor', icon: Check, color: 'text-green-600' },
  MAYBE: { label: 'Belki', icon: HelpCircle, color: 'text-yellow-600' },
  NOT_GOING: { label: 'Katılmıyor', icon: X, color: 'text-red-600' },
};

export default function EventParticipants({
  eventId,
  groupId,
  groupSlug,
  participants,
  userParticipation,
  isPast,
  isFull,
}: EventParticipantsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(
    userParticipation?.status || null
  );

  const handleJoin = async (status: string) => {
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/groups/${groupId}/events/${eventId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'İşlem başarısız');
      }

      setSelectedStatus(status);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeave = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/groups/${groupId}/events/${eventId}/join`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'İşlem başarısız');
      }

      setSelectedStatus(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goingParticipants = participants.filter((p) => p.status === 'GOING');
  const maybeParticipants = participants.filter((p) => p.status === 'MAYBE');
  const notGoingParticipants = participants.filter((p) => p.status === 'NOT_GOING');

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-900">Katılımcılar</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Join Buttons */}
      {!isPast && (
        <div className="mb-8">
          {!selectedStatus ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Bu etkinliğe katılım durumunuzu belirtin:</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleJoin('GOING')}
                  disabled={isSubmitting || (isFull && selectedStatus !== 'GOING')}
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-5 h-5 inline mr-2" />
                  Katılıyorum
                </button>
                <button
                  onClick={() => handleJoin('MAYBE')}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-xl hover:bg-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HelpCircle className="w-5 h-5 inline mr-2" />
                  Belki
                </button>
                <button
                  onClick={() => handleJoin('NOT_GOING')}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5 inline mr-2" />
                  Katılmıyorum
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  {(() => {
                    const config = statusConfig[selectedStatus as keyof typeof statusConfig];
                    const Icon = config.icon;
                    return (
                      <>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                        <span className="font-semibold text-gray-900">
                          Durumunuz: {config.label}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={handleLeave}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Katılımı İptal Et
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(['GOING', 'MAYBE', 'NOT_GOING'] as const).map((status) => {
                  const config = statusConfig[status];
                  const Icon = config.icon;
                  const isSelected = selectedStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={() => handleJoin(status)}
                      disabled={isSubmitting || (status === 'GOING' && isFull && !isSelected)}
                      className={`px-4 py-2 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 inline mr-1" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Participants Lists */}
      <div className="space-y-6">
        {/* Going */}
        {goingParticipants.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Katılıyor ({goingParticipants.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {goingParticipants.map((participant) => (
                <Link
                  key={participant.id}
                  href={`/profile/${participant.user.username || participant.user.id}`}
                  className="flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
                    {participant.user.image ? (
                      <Image
                        src={participant.user.image}
                        alt={participant.user.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                        {participant.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                    {participant.user.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Maybe */}
        {maybeParticipants.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-yellow-600" />
              Belki ({maybeParticipants.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {maybeParticipants.map((participant) => (
                <Link
                  key={participant.id}
                  href={`/profile/${participant.user.username || participant.user.id}`}
                  className="flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
                    {participant.user.image ? (
                      <Image
                        src={participant.user.image}
                        alt={participant.user.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                        {participant.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                    {participant.user.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {participants.length === 0 && (
        <p className="text-center text-gray-600 py-8">
          Henüz katılımcı yok. İlk katılan siz olun!
        </p>
      )}
    </div>
  );
}
