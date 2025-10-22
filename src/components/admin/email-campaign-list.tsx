'use client'

import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface EmailCampaign {
  id: string
  subject: string
  content: string
  recipients: string
  status: 'DRAFT' | 'QUEUED' | 'SENDING' | 'SENT' | 'FAILED'
  sentCount: number
  failedCount: number
  createdAt: Date
  sentAt: Date | null
  creator: {
    id: string
    name: string | null
    email: string
  }
}

interface EmailCampaignListProps {
  campaigns: EmailCampaign[]
  total: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

// Requirements: 5.7
export default function EmailCampaignList({
  campaigns,
  total,
  page,
  totalPages,
  onPageChange,
}: EmailCampaignListProps) {
  const getStatusBadge = (status: EmailCampaign['status']) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      QUEUED: 'bg-blue-100 text-blue-800',
      SENDING: 'bg-yellow-100 text-yellow-800',
      SENT: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    }

    const labels = {
      DRAFT: 'Taslak',
      QUEUED: 'Kuyrukta',
      SENDING: 'Gönderiliyor',
      SENT: 'Gönderildi',
      FAILED: 'Başarısız',
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getRecipientLabel = (recipients: string) => {
    const labels = {
      ALL: 'Tüm Kullanıcılar',
      ADMIN: 'Adminler',
      USER: 'Kullanıcılar',
    }
    return labels[recipients as keyof typeof labels] || recipients
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg mb-2">📧 Henüz email kampanyası yok</p>
        <p className="text-gray-400 text-sm">Yukarıdaki formu kullanarak ilk kampanyanızı oluşturun</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Geçmiş Kampanyalar</h3>
        <p className="text-sm text-gray-600">Toplam: {total}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Konu
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Alıcılar
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Durum
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Gönderim
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Oluşturan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tarih
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <p className="font-medium text-gray-900 truncate">{campaign.subject}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {getRecipientLabel(campaign.recipients)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {campaign.status === 'SENT' || campaign.status === 'FAILED' ? (
                        <>
                          <p className="text-green-600">✓ {campaign.sentCount}</p>
                          {campaign.failedCount > 0 && (
                            <p className="text-red-600">✗ {campaign.failedCount}</p>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="text-gray-900">{campaign.creator.name || 'Anonim'}</p>
                      <p className="text-gray-500 text-xs">{campaign.creator.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600">
                      <p>
                        {format(new Date(campaign.createdAt), 'dd MMM yyyy', { locale: tr })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(campaign.createdAt), 'HH:mm')}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Önceki
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`px-4 py-2 rounded-lg ${
                  p === page
                    ? 'bg-green-500 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  )
}
