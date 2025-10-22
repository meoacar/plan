"use client"

import Link from "next/link"

interface TopPlansTableProps {
  plans: Array<{
    plan: {
      id: string
      title: string
      slug: string
      authorName: string | null
    }
    views: number
    likes: number
    comments: number
  }>
}

export function TopPlansTable({ plans }: TopPlansTableProps) {
  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="border-b p-6">
        <h3 className="text-lg font-semibold text-gray-900">En Popüler Planlar</h3>
        <p className="mt-1 text-sm text-gray-500">
          Seçili dönem içinde en çok görüntülenen planlar
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Plan Başlığı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Yazar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Görüntülenme
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Beğeni
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Yorum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {plans.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                  Henüz veri yok
                </td>
              </tr>
            ) : (
              plans.map((item, index) => (
                <tr key={item.plan.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="truncate text-sm font-medium text-gray-900">
                        {item.plan.title}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {item.plan.authorName || "İsimsiz"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    <span className="inline-flex items-center gap-1">
                      👁️ {item.views.toLocaleString("tr-TR")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    <span className="inline-flex items-center gap-1">
                      ❤️ {item.likes.toLocaleString("tr-TR")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    <span className="inline-flex items-center gap-1">
                      💬 {item.comments.toLocaleString("tr-TR")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Link
                      href={`/plan/${item.plan.slug}`}
                      target="_blank"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Görüntüle
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
