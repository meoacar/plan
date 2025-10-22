"use client"

import { useState } from "react"
import { siteSettingsSchema } from "@/lib/validations"

interface SiteSettings {
  id: string
  siteTitle: string
  siteDescription: string
  logoUrl: string | null
  twitterUrl: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  footerText: string | null
  maintenanceMode: boolean
  updatedAt: Date
  updatedBy: string
}

interface SettingsFormProps {
  initialSettings: SiteSettings
  onSuccess?: () => void
}

/**
 * Site ayarları form component'i
 * Requirements: 3.2, 3.3, 3.4, 3.5
 */
export function SettingsForm({ initialSettings, onSuccess }: SettingsFormProps) {
  const [formData, setFormData] = useState({
    siteTitle: initialSettings.siteTitle,
    siteDescription: initialSettings.siteDescription,
    logoUrl: initialSettings.logoUrl || "",
    twitterUrl: initialSettings.twitterUrl || "",
    instagramUrl: initialSettings.instagramUrl || "",
    facebookUrl: initialSettings.facebookUrl || "",
    footerText: initialSettings.footerText || "",
    maintenanceMode: initialSettings.maintenanceMode,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage("")
    setIsSubmitting(true)

    try {
      // Boş string'leri undefined'a çevir
      const dataToSubmit = {
        ...formData,
        logoUrl: formData.logoUrl.trim() || undefined,
        twitterUrl: formData.twitterUrl.trim() || undefined,
        instagramUrl: formData.instagramUrl.trim() || undefined,
        facebookUrl: formData.facebookUrl.trim() || undefined,
        footerText: formData.footerText.trim() || undefined,
      }

      // Client-side validation
      const validatedData = siteSettingsSchema.parse(dataToSubmit)

      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.issues) {
          // Zod validation errors
          const fieldErrors: Record<string, string> = {}
          data.issues.forEach((issue: any) => {
            if (issue.path && issue.path.length > 0) {
              fieldErrors[issue.path[0]] = issue.message
            }
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ general: data.error || "Bir hata oluştu" })
        }
        return
      }

      setSuccessMessage(data.message || "Ayarlar başarıyla güncellendi")
      onSuccess?.()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ general: error.message })
      } else {
        setErrors({ general: "Beklenmeyen bir hata oluştu" })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* General Error */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.general}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* General Settings Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Genel Ayarlar</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Site Başlığı *
            </label>
            <input
              type="text"
              id="siteTitle"
              name="siteTitle"
              value={formData.siteTitle}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.siteTitle ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.siteTitle && (
              <p className="mt-1 text-sm text-red-600">{errors.siteTitle}</p>
            )}
          </div>

          <div>
            <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Site Açıklaması *
            </label>
            <textarea
              id="siteDescription"
              name="siteDescription"
              value={formData.siteDescription}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.siteDescription ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.siteDescription && (
              <p className="mt-1 text-sm text-red-600">{errors.siteDescription}</p>
            )}
          </div>

          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL (Opsiyonel)
            </label>
            <input
              type="text"
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.logoUrl ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.logoUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.logoUrl}</p>
            )}
          </div>
        </div>
      </div>

      {/* Social Media Links Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Sosyal Medya Linkleri</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="twitterUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Twitter URL (Opsiyonel)
            </label>
            <input
              type="text"
              id="twitterUrl"
              name="twitterUrl"
              value={formData.twitterUrl}
              onChange={handleChange}
              placeholder="https://twitter.com/username"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.twitterUrl ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.twitterUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.twitterUrl}</p>
            )}
          </div>

          <div>
            <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Instagram URL (Opsiyonel)
            </label>
            <input
              type="text"
              id="instagramUrl"
              name="instagramUrl"
              value={formData.instagramUrl}
              onChange={handleChange}
              placeholder="https://instagram.com/username"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.instagramUrl ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.instagramUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.instagramUrl}</p>
            )}
          </div>

          <div>
            <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Facebook URL (Opsiyonel)
            </label>
            <input
              type="text"
              id="facebookUrl"
              name="facebookUrl"
              value={formData.facebookUrl}
              onChange={handleChange}
              placeholder="https://facebook.com/username"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.facebookUrl ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.facebookUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.facebookUrl}</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Content Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Footer İçeriği</h2>
        <div>
          <label htmlFor="footerText" className="block text-sm font-medium text-gray-700 mb-1">
            Footer Metni
          </label>
          <textarea
            id="footerText"
            name="footerText"
            value={formData.footerText}
            onChange={handleChange}
            rows={4}
            placeholder="Footer'da görünecek metin..."
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.footerText ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.footerText && (
            <p className="mt-1 text-sm text-red-600">{errors.footerText}</p>
          )}
        </div>
      </div>

      {/* Maintenance Mode Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Bakım Modu</h2>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="maintenanceMode"
            name="maintenanceMode"
            checked={formData.maintenanceMode}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
            Bakım modunu aktif et (Admin dışındaki kullanıcılar siteye erişemez)
          </label>
        </div>
        {formData.maintenanceMode && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              ⚠️ Bakım modu aktif! Sadece admin kullanıcılar siteye erişebilir.
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </button>
      </div>
    </form>
  )
}
