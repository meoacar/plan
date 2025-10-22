import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

// Disable caching for admin pages
export const dynamic = "force-dynamic"

export default async function AdminPage() {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
        redirect("/")
    }

    const [totalUsers, totalPlans, pendingPlans, approvedPlans, totalPolls, totalVotes] = await Promise.all([
        prisma.user.count(),
        prisma.plan.count(),
        prisma.plan.count({ where: { status: "PENDING" } }),
        prisma.plan.count({ where: { status: "APPROVED" } }),
        prisma.poll.count(),
        prisma.pollVote.count(),
    ])

    const topPlans = await prisma.plan.findMany({
        where: { status: "APPROVED" },
        orderBy: { views: "desc" },
        take: 10,
        select: {
            id: true,
            title: true,
            slug: true,
            views: true,
        }
    })

    return (
        <div>
            <div className="bg-gradient-to-r from-[#2d7a4a] to-[#4caf50] text-white p-8 rounded-xl mb-8 shadow-xl">
                <h1 className="text-4xl font-extrabold mb-2">⚙️ Admin Paneli</h1>
                <p className="text-lg text-white/90">Hoş geldiniz, {session.user.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-blue-50">
                        <CardTitle className="text-sm font-bold text-blue-900">👥 Toplam Kullanıcı</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-4xl font-extrabold text-blue-600">{totalUsers}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-purple-50">
                        <CardTitle className="text-sm font-bold text-purple-900">📋 Toplam Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-4xl font-extrabold text-purple-600">{totalPlans}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-orange-50">
                        <CardTitle className="text-sm font-bold text-orange-900">⏳ Onay Bekleyen</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-4xl font-extrabold text-orange-600">{pendingPlans}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-green-50">
                        <CardTitle className="text-sm font-bold text-green-900">✅ Onaylı Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-4xl font-extrabold text-green-600">{approvedPlans}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-teal-50">
                        <CardTitle className="text-sm font-bold text-teal-900">📊 Toplam Anket</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-4xl font-extrabold text-teal-600">{totalPolls}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-indigo-50">
                        <CardTitle className="text-sm font-bold text-indigo-900">🗳️ Toplam Oy</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-4xl font-extrabold text-indigo-600">{totalVotes}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-2">
                    <CardHeader className="bg-gradient-to-r from-[#2d7a4a] to-[#4caf50] text-white rounded-t-xl">
                        <CardTitle className="text-xl font-bold">🚀 Hızlı Erişim</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-6">
                        <Link
                            href="/admin/plans?status=PENDING"
                            className="block p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-lg transition-all border-2 border-orange-200 shadow-sm"
                        >
                            <span className="font-bold text-orange-900">⏳ Onay Bekleyen Planlar</span>
                            <span className="ml-2 px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-bold">
                                {pendingPlans}
                            </span>
                        </Link>
                        <Link
                            href="/admin/plans"
                            className="block p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all border-2 border-blue-200 shadow-sm"
                        >
                            <span className="font-bold text-blue-900">📋 Tüm Planlar</span>
                        </Link>
                        <Link
                            href="/admin/users"
                            className="block p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg transition-all border-2 border-purple-200 shadow-sm"
                        >
                            <span className="font-bold text-purple-900">👥 Kullanıcı Yönetimi</span>
                        </Link>
                        <Link
                            href="/admin/polls"
                            className="block p-4 bg-gradient-to-r from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 rounded-lg transition-all border-2 border-teal-200 shadow-sm"
                        >
                            <span className="font-bold text-teal-900">📊 Anket Yönetimi</span>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-2">
                    <CardHeader className="bg-gradient-to-r from-[#2d7a4a] to-[#4caf50] text-white rounded-t-xl">
                        <CardTitle className="text-xl font-bold">🏆 En Çok Görüntülenen Planlar</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            {topPlans.map((plan: { id: string; title: string; slug: string; views: number }, index: number) => (
                                <Link
                                    key={plan.id}
                                    href={`/plan/${plan.slug}`}
                                    className="block p-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 rounded-lg transition-all border border-gray-200 hover:border-green-300"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-800">
                                            <span className="inline-block w-6 h-6 bg-[#2d7a4a] text-white rounded-full text-center text-xs leading-6 mr-2">
                                                {index + 1}
                                            </span>
                                            {plan.title}
                                        </span>
                                        <span className="text-sm font-bold text-blue-600">
                                            👁️ {plan.views}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
