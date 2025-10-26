import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export const metadata: Metadata = {
    title: 'Blog Yönetimi - Admin',
};

async function getBlogPosts() {
    return await prisma.blogPost.findMany({
        include: {
            category: true,
            _count: {
                select: {
                    comments: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}

async function getStats() {
    const [total, published, draft, totalViews] = await Promise.all([
        prisma.blogPost.count(),
        prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
        prisma.blogPost.count({ where: { status: 'DRAFT' } }),
        prisma.blogPost.aggregate({
            _sum: {
                views: true,
            },
        }),
    ]);

    return { total, published, draft, totalViews: totalViews._sum.views || 0 };
}

export default async function AdminBlogPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/login');
    }

    const [posts, stats] = await Promise.all([getBlogPosts(), getStats()]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Blog Yönetimi</h1>
                    <p className="text-gray-600 mt-1">Blog yazılarını yönetin</p>
                </div>
                <Link
                    href="/admin/blog/yeni"
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                    + Yeni Yazı Ekle
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-600 mb-1">Toplam Yazı</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-600 mb-1">Yayınlanan</div>
                    <div className="text-3xl font-bold text-green-600">{stats.published}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-600 mb-1">Taslak</div>
                    <div className="text-3xl font-bold text-yellow-600">{stats.draft}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-600 mb-1">Toplam Görüntülenme</div>
                    <div className="text-3xl font-bold text-blue-600">{stats.totalViews}</div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Link
                    href="/admin/blog/kategoriler"
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-md transition"
                >
                    <h3 className="font-semibold text-gray-900 mb-1">Kategoriler</h3>
                    <p className="text-sm text-gray-600">Blog kategorilerini yönetin</p>
                </Link>
                <Link
                    href="/admin/blog/etiketler"
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-md transition"
                >
                    <h3 className="font-semibold text-gray-900 mb-1">Etiketler</h3>
                    <p className="text-sm text-gray-600">Blog etiketlerini yönetin</p>
                </Link>
                <Link
                    href="/admin/blog/yorumlar"
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-md transition"
                >
                    <h3 className="font-semibold text-gray-900 mb-1">Yorumlar</h3>
                    <p className="text-sm text-gray-600">Kullanıcı yorumlarını yönetin</p>
                </Link>
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Başlık</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Kategori</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Durum</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Görüntülenme</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tarih</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {posts.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{post.title}</div>
                                        <div className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {post.category && (
                                            <span
                                                className="inline-block px-2 py-1 rounded text-xs font-medium text-white"
                                                style={{ backgroundColor: post.category.color }}
                                            >
                                                {post.category.name}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${post.status === 'PUBLISHED'
                                                ? 'bg-green-100 text-green-800'
                                                : post.status === 'DRAFT'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                }`}
                                        >
                                            {post.status === 'PUBLISHED' ? 'Yayında' : post.status === 'DRAFT' ? 'Taslak' : 'Zamanlanmış'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{post.views}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {format(new Date(post.createdAt), 'd MMM yyyy', { locale: tr })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                target="_blank"
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Görüntüle
                                            </Link>
                                            <Link
                                                href={`/admin/blog/duzenle/${post.id}`}
                                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                                            >
                                                Düzenle
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
