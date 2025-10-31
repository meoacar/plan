'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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

const goalTypeLabels: Record<string, string> = {
    'weight-loss': 'Kilo Verme',
    'fitness': 'Fitness',
    'healthy-eating': 'Sağlıklı Beslenme',
    'muscle-gain': 'Kas Kazanımı',
};

export default function GroupDetail({ group }: GroupDetailProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        <div className="space-y-8">
            {/* Grup Başlığı */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {group.imageUrl && (
                    <div className="relative h-64 w-full">
                        <Image
                            src={group.imageUrl}
                            alt={group.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
                            <div className="flex gap-4 text-sm text-gray-600">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                                    {goalTypeLabels[group.goalType] || group.goalType}
                                </span>
                                {group.isPrivate && (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                                        🔒 Özel Grup
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            {!group.isMember ? (
                                <button
                                    onClick={handleJoinGroup}
                                    disabled={loading}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {loading ? 'Katılınıyor...' : 'Gruba Katıl'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleLeaveGroup}
                                    disabled={loading}
                                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                                >
                                    {loading ? 'Ayrılınıyor...' : 'Gruptan Ayrıl'}
                                </button>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                            {error}
                        </div>
                    )}

                    <p className="text-gray-700 mb-6">{group.description}</p>

                    <div className="flex gap-8 text-sm">
                        <div>
                            <span className="text-gray-600">Üye Sayısı:</span>
                            <span className="ml-2 font-semibold">{group._count.members}</span>
                            {group.maxMembers && (
                                <span className="text-gray-500"> / {group.maxMembers}</span>
                            )}
                        </div>
                        <div>
                            <span className="text-gray-600">Aktif Challenge:</span>
                            <span className="ml-2 font-semibold">{group._count.challenges}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Sol Kolon - Üyeler */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">
                            Üyeler ({group._count.members})
                        </h2>
                        <div className="space-y-3">
                            {group.members.slice(0, 10).map((member) => (
                                <Link
                                    key={member.id}
                                    href={`/profile/${member.user.username || member.user.id}`}
                                    className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                >
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                        {member.user.image ? (
                                            <Image
                                                src={member.user.image}
                                                alt={member.user.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                {member.user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{member.user.name}</p>
                                        {member.role === 'ADMIN' && (
                                            <span className="text-xs text-blue-600">Admin</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                        {group._count.members > 10 && (
                            <button className="mt-4 w-full text-center text-blue-600 hover:text-blue-700 text-sm">
                                Tüm üyeleri gör ({group._count.members})
                            </button>
                        )}
                    </div>
                </div>

                {/* Sağ Kolon - Challenge'lar */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">
                            Aktif Challenge'lar ({group._count.challenges})
                        </h2>
                        {group.challenges.length > 0 ? (
                            <div className="space-y-4">
                                {group.challenges.map((challenge) => (
                                    <div
                                        key={challenge.id}
                                        className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                                    >
                                        <h3 className="font-semibold mb-2">{challenge.title}</h3>
                                        <p className="text-gray-600 text-sm mb-3">
                                            {challenge.description}
                                        </p>
                                        <div className="flex justify-between items-center text-sm text-gray-500">
                                            <span>
                                                {new Date(challenge.startDate).toLocaleDateString('tr-TR')} -{' '}
                                                {new Date(challenge.endDate).toLocaleDateString('tr-TR')}
                                            </span>
                                            <button className="text-blue-600 hover:text-blue-700">
                                                Detaylar →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p>Henüz aktif challenge bulunmuyor</p>
                                {group.memberRole === 'ADMIN' && (
                                    <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                        Challenge Oluştur
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
