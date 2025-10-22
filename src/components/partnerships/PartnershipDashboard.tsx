'use client';

import { useState } from 'react';
import { MessageSquare, Target, TrendingDown, Calendar, Award } from 'lucide-react';
import PartnershipMessages from './PartnershipMessages';
import PartnershipGoals from './PartnershipGoals';
import PartnershipStats from './PartnershipStats';
import PartnerCheckIns from './PartnerCheckIns';

interface Partner {
    id: string;
    name: string | null;
    image: string | null;
    bio: string | null;
    startWeight: number | null;
    goalWeight: number | null;
    streak: number;
    level: number;
    xp: number;
}

interface Partnership {
    id: string;
    status: string;
    createdAt: Date;
    acceptedAt: Date | null;
    sharedGoals: any[];
}

interface CheckIn {
    id: string;
    weight: number | null;
    energy: number | null;
    motivation: number | null;
    exercise: boolean;
    dietPlan: boolean;
    note: string | null;
    createdAt: Date;
}

interface WeightLog {
    id: string;
    weight: number;
    createdAt: Date;
}

interface Props {
    partnership: Partnership;
    partner: Partner;
    currentUser: Partner;
    partnerCheckIns: CheckIn[];
    currentUserWeightLogs: WeightLog[];
    partnerWeightLogs: WeightLog[];
}

export default function PartnershipDashboard({
    partnership,
    partner,
    currentUser,
    partnerCheckIns,
    currentUserWeightLogs,
    partnerWeightLogs,
}: Props) {
    const [activeTab, setActiveTab] = useState<'stats' | 'messages' | 'goals' | 'checkins'>(
        'stats'
    );

    const tabs = [
        { id: 'stats', label: 'İstatistikler', icon: TrendingDown },
        { id: 'messages', label: 'Mesajlar', icon: MessageSquare },
        { id: 'goals', label: 'Ortak Hedefler', icon: Target },
        { id: 'checkins', label: 'Check-in\'ler', icon: Calendar },
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Partner Bilgileri */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-8 mb-8 text-white">
                <div className="flex items-center gap-6">
                    <img
                        src={partner.image || '/default-avatar.png'}
                        alt={partner.name || 'Partner'}
                        className="w-24 h-24 rounded-full border-4 border-white object-cover"
                    />
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2">{partner.name}</h1>
                        {partner.bio && <p className="text-green-100 mb-3">{partner.bio}</p>}
                        <div className="flex gap-6 text-sm">
                            {partner.startWeight && partner.goalWeight && (
                                <div>
                                    <span className="text-green-200">Hedef:</span>{' '}
                                    <span className="font-semibold">
                                        {partner.startWeight}kg → {partner.goalWeight}kg
                                    </span>
                                </div>
                            )}
                            <div>
                                <span className="text-green-200">Seviye:</span>{' '}
                                <span className="font-semibold">{partner.level}</span>
                            </div>
                            <div>
                                <span className="text-green-200">Streak:</span>{' '}
                                <span className="font-semibold">🔥 {partner.streak} gün</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-white/20 rounded-lg px-6 py-3">
                            <p className="text-sm text-green-100">Partnerlik Süresi</p>
                            <p className="text-2xl font-bold">
                                {Math.floor(
                                    (new Date().getTime() -
                                        new Date(partnership.acceptedAt || partnership.createdAt).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )}{' '}
                                gün
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="border-b">
                    <div className="flex">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-6 py-4 font-medium transition ${activeTab === tab.id
                                        ? 'text-green-600 border-b-2 border-green-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'stats' && (
                        <PartnershipStats
                            currentUser={currentUser}
                            partner={partner}
                            currentUserWeightLogs={currentUserWeightLogs}
                            partnerWeightLogs={partnerWeightLogs}
                        />
                    )}
                    {activeTab === 'messages' && (
                        <PartnershipMessages partnershipId={partnership.id} partner={partner} />
                    )}
                    {activeTab === 'goals' && (
                        <PartnershipGoals
                            partnershipId={partnership.id}
                            goals={partnership.sharedGoals}
                        />
                    )}
                    {activeTab === 'checkins' && (
                        <PartnerCheckIns
                            partnershipId={partnership.id}
                            partner={partner}
                            checkIns={partnerCheckIns}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
