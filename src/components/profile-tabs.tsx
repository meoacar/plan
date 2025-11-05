"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanCard } from "@/components/plan-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FavoritesList } from "@/components/favorites-list";

interface ProfileTabsProps {
    isOwnProfile: boolean;
    approvedPlans: any[];
    pendingPlans: any[];
    rejectedPlans: any[];
    polls: any[];
    userId: string;
}

export function ProfileTabs({
    isOwnProfile,
    approvedPlans,
    pendingPlans,
    rejectedPlans,
    polls,
    userId
}: ProfileTabsProps) {
    const [activeTab, setActiveTab] = useState("plans");

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${isOwnProfile ? 'grid-cols-3' : 'grid-cols-2'} mb-8`}>
                <TabsTrigger value="plans">
                    📋 Planlar ({approvedPlans.length})
                </TabsTrigger>
                {polls && polls.length > 0 && (
                    <TabsTrigger value="polls">
                        📊 Anketler ({polls.length})
                    </TabsTrigger>
                )}
                {isOwnProfile && (
                    <TabsTrigger value="favorites">
                        ⭐ Favoriler
                    </TabsTrigger>
                )}
            </TabsList>

            <TabsContent value="plans" className="space-y-8">
                {/* Pending Plans */}
                {isOwnProfile && pendingPlans.length > 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-yellow-100 p-2 rounded-lg">
                                <span className="text-2xl">⏳</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Onay Bekleyen Planlar
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Admin onayından sonra yayınlanacak ({pendingPlans.length})
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pendingPlans.map((plan: any) => (
                                <div key={plan.id} className="relative">
                                    <div className="absolute -top-2 -right-2 z-10 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                        Onay Bekliyor
                                    </div>
                                    <PlanCard plan={plan} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Rejected Plans */}
                {isOwnProfile && rejectedPlans.length > 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-100 p-2 rounded-lg">
                                <span className="text-2xl">❌</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Reddedilen Planlar
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Bu planlar yayınlanmadı - Düzenleyip tekrar gönderebilirsiniz ({rejectedPlans.length})
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {rejectedPlans.map((plan: any) => (
                                <div key={plan.id} className="relative">
                                    <div className="absolute -top-2 -right-2 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                        Reddedildi
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 z-10">
                                        <Link 
                                            href={`/plan/${plan.slug}/edit`}
                                            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 shadow-lg text-white font-medium rounded-md px-3 py-1.5 text-sm transition-colors"
                                        >
                                            ✏️ Düzenle
                                        </Link>
                                    </div>
                                    <div className="opacity-60 hover:opacity-100 transition-opacity">
                                        <PlanCard plan={plan} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Approved Plans */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="text-3xl">📋</span>
                            {isOwnProfile ? "Yayınlanan Planlar" : "Planları"}
                            <span className="text-xl text-gray-500">({approvedPlans.length})</span>
                        </h2>
                    </div>

                    {approvedPlans.length === 0 ? (
                        <Card className="shadow-lg">
                            <CardContent className="py-16 text-center">
                                <div className="text-6xl mb-4">📭</div>
                                <p className="text-xl font-semibold text-gray-600">
                                    {isOwnProfile ? "Henüz yayınlanmış plan bulunmuyor" : "Henüz onaylanmış plan bulunmuyor"}
                                </p>
                                {isOwnProfile && (
                                    <Link 
                                        href="/submit"
                                        className="inline-flex items-center justify-center mt-6 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8 font-medium transition-colors"
                                    >
                                        İlk Planını Ekle
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {approvedPlans.map((plan: any) => (
                                <PlanCard key={plan.id} plan={plan} />
                            ))}
                        </div>
                    )}
                </div>
            </TabsContent>

            {polls && polls.length > 0 && (
                <TabsContent value="polls">
                    <div className="space-y-6">
                        {polls.map((poll: any) => (
                            <Card key={poll.id} className="shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                {poll.question}
                                            </h3>
                                            {poll.description && (
                                                <p className="text-sm text-gray-600 mb-3">{poll.description}</p>
                                            )}
                                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    🗳️ {poll._count.votes} oy
                                                </span>
                                                {poll.allowMultiple && (
                                                    <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">
                                                        Çoklu seçim
                                                    </span>
                                                )}
                                                {poll.isActive ? (
                                                    <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">
                                                        Pasif
                                                    </span>
                                                )}
                                                {poll.endsAt && (
                                                    <span>
                                                        Bitiş: {new Date(poll.endsAt).toLocaleDateString('tr-TR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {poll.options.map((option: any) => {
                                            const percentage = poll._count.votes > 0
                                                ? Math.round((option._count.votes / poll._count.votes) * 100)
                                                : 0;

                                            return (
                                                <div key={option.id} className="relative">
                                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
                                                        <span className="relative z-10 text-sm font-medium text-gray-900">
                                                            {option.text}
                                                        </span>
                                                        <span className="relative z-10 text-sm font-semibold text-gray-700">
                                                            {percentage}% ({option._count.votes})
                                                        </span>
                                                        <div
                                                            className="absolute inset-0 rounded-lg bg-green-100 opacity-50"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <Link 
                                            href="/polls"
                                            className="inline-flex items-center justify-center border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 text-sm font-medium transition-colors"
                                        >
                                            Tüm Anketleri Gör →
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            )}

            {isOwnProfile && (
                <TabsContent value="favorites">
                    <FavoritesList initialFavorites={[]} />
                </TabsContent>
            )}
        </Tabs>
    );
}
