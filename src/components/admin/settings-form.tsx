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
  footerAboutTitle: string | null
  footerAboutText: string | null
  footerLinksTitle: string | null
  footerSocialTitle: string | null
  maintenanceMode: boolean
  googleOAuthEnabled: boolean
  googleClientId: string | null
  googleClientSecret: string | null
  facebookOAuthEnabled: boolean
  facebookAppId: string | null
  facebookAppSecret: string | null
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
    footerAboutTitle: initialSettings.footerAboutTitle || "",
    footerAboutText: initialSettings.footerAboutText || "",
    footerLinksTitle: initialSettings.footerLinksTitle || "",
    footerSocialTitle: initialSettings.footerSocialTitle || "",
    maintenanceMode: initialSettings.maintenanceMode,
    googleOAuthEnabled: initialSettings.googleOAuthEnabled,
    googleClientId: initialSettings.googleClientId || "",
    googleClientSecret: initialSettings.googleClientSecret || "",
    facebookOAuthEnabled: initialSettings.facebookOAuthEnabled,
    facebookAppId: initialSettings.facebookAppId || "",
    facebookAppSecret: initialSettings.facebookAppSecret || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(formData.logoUrl || null)
  const [faviconMessage, setFaviconMessage] = useState("")

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingLogo(true)
    setErrors({})

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/logo", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ logo: data.error || "Logo yüklenirken bir hata oluştu" })
        return
      }

      // Form data'yı güncelle
      setFormData((prev) => ({
        ...prev,
        logoUrl: data.url,
      }))
      setLogoPreview(data.url)
      setSuccessMessage("Logo başarıyla yüklendi")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      setErrors({ logo: "Logo yüklenirken bir hata oluştu" })
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingFavicon(true)
    setErrors({})
    setFaviconMessage("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/favicon", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ favicon: data.error || "Favicon yüklenirken bir hata oluştu" })
        return
      }

      setFaviconMessage(data.message || "Favicon başarıyla güncellendi")
      setTimeout(() => setFaviconMessage(""), 5000)
    } catch (error) {
      setErrors({ favicon: "Favicon yüklenirken bir hata oluştu" })
    } finally {
      setIsUploadingFavicon(false)
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
        footerAboutTitle: formData.footerAboutTitle.trim() || undefined,
        footerAboutText: formData.footerAboutText.trim() || undefined,
        footerLinksTitle: formData.footerLinksTitle.trim() || undefined,
        footerSocialTitle: formData.footerSocialTitle.trim() || undefined,
        googleClientId: formData.googleClientId.trim() || undefined,
        googleClientSecret: formData.googleClientSecret.trim() || undefined,
        facebookAppId: formData.facebookAppId.trim() || undefined,
        facebookAppSecret: formData.facebookAppSecret.trim() || undefined,
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Logosu (Opsiyonel)
            </label>
            
            {/* Logo Preview */}
            {logoPreview && (
              <div className="mb-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Mevcut Logo:</p>
                <img 
                  src={logoPreview} 
                  alt="Logo Preview" 
                  className="h-12 w-auto object-contain"
                />
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <label 
                htmlFor="logoFile" 
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-600">
                    {isUploadingLogo ? "Yükleniyor..." : "Logo yüklemek için tıklayın"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG (Max 5MB)</p>
                </div>
                <input
                  id="logoFile"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  onChange={handleLogoUpload}
                  disabled={isUploadingLogo}
                  className="hidden"
                />
              </label>
              
              {errors.logo && (
                <p className="text-sm text-red-600">{errors.logo}</p>
              )}
              
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Önerilen Boyutlar:</strong></p>
                <p>• Yatay Logo: 180x50 piksel veya 200x60 piksel</p>
                <p>• Kare Logo: 48x48 piksel</p>
                <p>• Geniş Logo: 250x60 piksel veya 300x70 piksel</p>
              </div>
            </div>

            {/* Manuel URL girişi */}
            <div className="mt-3">
              <label htmlFor="logoUrl" className="block text-xs text-gray-600 mb-1">
                Veya Logo URL'si girin:
              </label>
              <input
                type="text"
                id="logoUrl"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.logoUrl ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.logoUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.logoUrl}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon (Site İkonu)
            </label>
            
            {/* Favicon Upload */}
            <div className="space-y-2">
              <label 
                htmlFor="faviconFile" 
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-600">
                    {isUploadingFavicon ? "Yükleniyor..." : "Favicon yüklemek için tıklayın"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">ICO, PNG, SVG (Max 1MB)</p>
                </div>
                <input
                  id="faviconFile"
                  type="file"
                  accept=".ico,image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml"
                  onChange={handleFaviconUpload}
                  disabled={isUploadingFavicon}
                  className="hidden"
                />
              </label>
              
              {errors.favicon && (
                <p className="text-sm text-red-600">{errors.favicon}</p>
              )}
              
              {faviconMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-700">{faviconMessage}</p>
                </div>
              )}
              
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Önerilen Boyutlar:</strong></p>
                <p>• 16x16 piksel (tarayıcı sekmesi)</p>
                <p>• 32x32 piksel (standart)</p>
                <p>• 48x48 piksel (yüksek çözünürlük)</p>
                <p className="mt-2 text-yellow-600">⚠️ Değişikliklerin görünmesi için tarayıcı önbelleğini temizlemeniz gerekebilir (Ctrl+F5)</p>
              </div>
            </div>
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
        <h2 className="text-xl font-semibold mb-4">Footer Ayarları</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="footerAboutTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Footer Sol Bölüm Başlığı
            </label>
            <input
              type="text"
              id="footerAboutTitle"
              name="footerAboutTitle"
              value={formData.footerAboutTitle}
              onChange={handleChange}
              placeholder="Hakkımızda"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Varsayılan: "Hakkımızda"</p>
          </div>

          <div>
            <label htmlFor="footerAboutText" className="block text-sm font-medium text-gray-700 mb-1">
              Footer Sol Bölüm Metni
            </label>
            <textarea
              id="footerAboutText"
              name="footerAboutText"
              value={formData.footerAboutText}
              onChange={handleChange}
              rows={3}
              placeholder="Gerçek insanların gerçek başarı hikayeleri..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Footer'ın sol bölümünde görünecek açıklama metni</p>
          </div>

          <div>
            <label htmlFor="footerLinksTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Footer Orta Bölüm Başlığı
            </label>
            <input
              type="text"
              id="footerLinksTitle"
              name="footerLinksTitle"
              value={formData.footerLinksTitle}
              onChange={handleChange}
              placeholder="Hızlı Bağlantılar"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Varsayılan: "Hızlı Bağlantılar"</p>
          </div>

          <div>
            <label htmlFor="footerSocialTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Footer Sağ Bölüm Başlığı
            </label>
            <input
              type="text"
              id="footerSocialTitle"
              name="footerSocialTitle"
              value={formData.footerSocialTitle}
              onChange={handleChange}
              placeholder="Bizi Takip Edin"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Varsayılan: "Bizi Takip Edin"</p>
          </div>

          <div className="border-t pt-4">
            <label htmlFor="footerText" className="block text-sm font-medium text-gray-700 mb-1">
              Footer Alt Metni (Copyright)
            </label>
            <textarea
              id="footerText"
              name="footerText"
              value={formData.footerText}
              onChange={handleChange}
              rows={2}
              placeholder="© 2024 Zayıflama Planım. Tüm hakları saklıdır."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Footer'ın en altında görünecek copyright metni</p>
          </div>
        </div>
      </div>

      {/* OAuth Settings Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">OAuth Giriş Ayarları</h2>
        
        {/* Google OAuth */}
        <div className="mb-6 pb-6 border-b">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="googleOAuthEnabled"
              name="googleOAuthEnabled"
              checked={formData.googleOAuthEnabled}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="googleOAuthEnabled" className="ml-2 block text-sm font-medium text-gray-700">
              Google ile Giriş Yap özelliğini aktif et
            </label>
          </div>
          
          {formData.googleOAuthEnabled && (
            <div className="ml-6 space-y-4">
              <div>
                <label htmlFor="googleClientId" className="block text-sm font-medium text-gray-700 mb-1">
                  Google Client ID *
                </label>
                <input
                  type="text"
                  id="googleClientId"
                  name="googleClientId"
                  value={formData.googleClientId}
                  onChange={handleChange}
                  placeholder="123456789-abc.apps.googleusercontent.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.googleClientId ? "border-red-500" : "border-gray-300"
                  }`}
                  required={formData.googleOAuthEnabled}
                />
                {errors.googleClientId && (
                  <p className="mt-1 text-sm text-red-600">{errors.googleClientId}</p>
                )}
              </div>

              <div>
                <label htmlFor="googleClientSecret" className="block text-sm font-medium text-gray-700 mb-1">
                  Google Client Secret *
                </label>
                <input
                  type="password"
                  id="googleClientSecret"
                  name="googleClientSecret"
                  value={formData.googleClientSecret}
                  onChange={handleChange}
                  placeholder="GOCSPX-..."
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.googleClientSecret ? "border-red-500" : "border-gray-300"
                  }`}
                  required={formData.googleOAuthEnabled}
                />
                {errors.googleClientSecret && (
                  <p className="mt-1 text-sm text-red-600">{errors.googleClientSecret}</p>
                )}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Redirect URI:</strong> {typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/callback/google
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Bu URL'yi Google Cloud Console'da Authorized redirect URIs'e eklemeyi unutmayın.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Facebook OAuth */}
        <div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="facebookOAuthEnabled"
              name="facebookOAuthEnabled"
              checked={formData.facebookOAuthEnabled}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="facebookOAuthEnabled" className="ml-2 block text-sm font-medium text-gray-700">
              Facebook ile Giriş Yap özelliğini aktif et
            </label>
          </div>
          
          {formData.facebookOAuthEnabled && (
            <div className="ml-6 space-y-4">
              <div>
                <label htmlFor="facebookAppId" className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook App ID *
                </label>
                <input
                  type="text"
                  id="facebookAppId"
                  name="facebookAppId"
                  value={formData.facebookAppId}
                  onChange={handleChange}
                  placeholder="123456789012345"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.facebookAppId ? "border-red-500" : "border-gray-300"
                  }`}
                  required={formData.facebookOAuthEnabled}
                />
                {errors.facebookAppId && (
                  <p className="mt-1 text-sm text-red-600">{errors.facebookAppId}</p>
                )}
              </div>

              <div>
                <label htmlFor="facebookAppSecret" className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook App Secret *
                </label>
                <input
                  type="password"
                  id="facebookAppSecret"
                  name="facebookAppSecret"
                  value={formData.facebookAppSecret}
                  onChange={handleChange}
                  placeholder="..."
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.facebookAppSecret ? "border-red-500" : "border-gray-300"
                  }`}
                  required={formData.facebookOAuthEnabled}
                />
                {errors.facebookAppSecret && (
                  <p className="mt-1 text-sm text-red-600">{errors.facebookAppSecret}</p>
                )}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Redirect URI:</strong> {typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/callback/facebook
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Bu URL'yi Facebook Developer Console'da Valid OAuth Redirect URIs'e eklemeyi unutmayın.
                </p>
              </div>
            </div>
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
