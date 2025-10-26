import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { BlogCommentActions } from '@/components/admin/blog-comment-actions';

export const metadata: Metadata = {
  title: 'Blog Yorumları - Admin',
};

async function getComments() {
  return await prisma.blogComment.findMany({
    include: {
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async function getStats() {
  const [total, approved, pending] = await Promise.all([
    prisma.blogComment.count(),
    prisma.blogComment.count({ where: { isApproved: true } }),
    prisma.blogComment.count({ where: { isApproved: false } }),
  ]);

  return { total, approved, pending };
}

export default async function BlogCommentsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const [comments, stats] = await Promise.all([getComments(), getStats()]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Yorumları</h1>
          <p className="text-gray-600 mt-1">Kullanıcı yorumlarını yönetin</p>
        </div>
        <Link
          href="/admin/blog"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          ← Blog Yönetimine Dön
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600 mb-1">Toplam Yorum</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600 mb-1">Onaylanan</div>
          <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600 mb-1">Onay Bekleyen</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
      </div>

      {/* Comments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-500 text-lg">Henüz yorum yok</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Yorum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Blog Yazısı
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Tarih
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-gray-900 line-clamp-2">{comment.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Kullanıcı ID: {comment.authorId.substring(0, 8)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/blog/${comment.post.slug}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {comment.post.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          comment.isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {comment.isApproved ? 'Onaylandı' : 'Onay Bekliyor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(comment.createdAt), 'd MMM yyyy HH:mm', {
                        locale: tr,
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <BlogCommentActions
                        commentId={comment.id}
                        isApproved={comment.isApproved}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
