"use client"

import Image from "next/image"

interface TopUsersTableProps {
  users: Array<{
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
    activityScore: number
    planCount: number
    commentCount: number
    likeCount: number
  }>
}

export function TopUsersTable({ users }: TopUsersTableProps) {
  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="border-b p-6">
        <h3 className="text-lg font-semibold text-gray-900">En Aktif Kullanıcılar</h3>
        <p className="mt-1 text-sm text-gray-500">
          Aktivite skoru: Plan × 10 + Yorum × 2 + Beğeni
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
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Planlar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Yorumlar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Beğeniler
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Aktivite Skoru
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  Henüz veri yok
                </td>
              </tr>
            ) : (
              users.map((item, index) => (
                <tr key={item.user.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {item.user.image ? (
                          <Image
                            src={item.user.image}
                            alt={item.user.name || "User"}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                            {item.user.name?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.user.name || "İsimsiz"}
                        </div>
                        <div className="text-sm text-gray-500">{item.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {item.planCount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {item.commentCount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {item.likeCount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-blue-600">
                    {item.activityScore}
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
