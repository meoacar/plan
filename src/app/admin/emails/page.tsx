'use client'

import { useState, useEffect } from 'react'
import EmailComposer from '@/components/admin/email-composer'
import EmailCampaignList from '@/components/admin/email-campaign-list'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
}

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

// Requirements: 5.1, 5.5
export default function AdminEmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch templates
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch('/api/admin/emails/templates')
        if (!res.ok) throw new Error('Failed to fetch templates')
        const data = await res.json()
        setTemplates(data)
      } catch (err) {
        console.error('Error fetching templates:', err)
      }
    }
    fetchTemplates()
  }, [])

  // Fetch campaigns
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/admin/emails?page=${page}`)
        if (!res.ok) throw new Error('Failed to fetch campaigns')
        const data = await res.json()
        setCampaigns(data.campaigns)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      } catch (err) {
        console.error('Error fetching campaigns:', err)
        setError('Kampanyalar yüklenirken hata oluştu')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCampaigns()
  }, [page])

  const handleSend = async (data: { subject: string; content: string; recipients: string }) => {
    try {
      setIsSending(true)
      setError(null)
      setSuccessMessage(null)

      const res = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to send email')
      }

      const campaign = await res.json()
      
      // Add new campaign to the list
      setCampaigns([campaign, ...campaigns])
      setTotal(total + 1)
      
      setSuccessMessage('Email başarıyla kuyruğa alındı! Kısa süre içinde gönderilecek.')
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err) {
      console.error('Error sending email:', err)
      setError(err instanceof Error ? err.message : 'Email gönderilirken hata oluştu')
    } finally {
      setIsSending(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Email Yönetimi</h1>
        <p className="text-gray-600 mt-2">
          Kullanıcılara toplu email gönderin ve kampanyalarınızı yönetin
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-green-500 text-xl mr-3">✓</span>
            <div>
              <p className="text-green-800 font-medium">Başarılı!</p>
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-red-500 text-xl mr-3">✕</span>
            <div>
              <p className="text-red-800 font-medium">Hata!</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Email Composer */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-6">Yeni Email Kampanyası</h2>
        <EmailComposer
          templates={templates}
          onSend={handleSend}
          isSending={isSending}
        />
      </div>

      {/* Campaign List */}
      <div>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="text-gray-600 mt-4">Kampanyalar yükleniyor...</p>
          </div>
        ) : (
          <EmailCampaignList
            campaigns={campaigns}
            total={total}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Bilgi</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Email'ler kuyruğa alınır ve arka planda gönderilir</li>
          <li>• Gönderim durumunu kampanya listesinden takip edebilirsiniz</li>
          <li>• Rate limiting nedeniyle büyük kampanyalar birkaç dakika sürebilir</li>
          <li>• Email servisi yapılandırılmamışsa, email'ler gönderilmez</li>
        </ul>
      </div>
    </div>
  )
}
