"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface PrivacySettings {
  isPrivate: boolean
  showEmail: boolean
  showWeight: boolean
  allowMessages: boolean
  requireFollowApproval: boolean
}

interface PrivacySettingsFormProps {
  initialSettings: PrivacySettings
}

export function PrivacySettingsForm({ initialSettings }: PrivacySettingsFormProps) {
  const router = useRouter()
  const [settings, setSettings] = useState<PrivacySettings>(initialSettings)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/privacy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Ayarlar güncellenemedi")
      }

      alert("✅ Gizlilik ayarların başarıyla güncellendi!")
      router.refresh()
    } catch (error) {
      alert("❌ Ayarlar güncellenirken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Özel Hesap */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <div className="flex-1">
            <Label htmlFor="isPrivate" className="text-base font-semibold text-gray-900 cursor-pointer">
              🔐 Özel Hesap
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Profilin sadece takipçilerin tarafından görülebilir
            </p>
          </div>
          <Switch
            id="isPrivate"
            checked={settings.isPrivate}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, isPrivate: checked })
            }
          />
        </div>

        {/* Takip Onayı */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <div className="flex-1">
            <Label htmlFor="requireFollowApproval" className="text-base font-semibold text-gray-900 cursor-pointer">
              ✅ Takip İsteklerini Onayla
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Seni takip etmek isteyenler önce onay bekler
            </p>
          </div>
          <Switch
            id="requireFollowApproval"
            checked={settings.requireFollowApproval}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, requireFollowApproval: checked })
            }
          />
        </div>

        {/* E-posta Göster */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <div className="flex-1">
            <Label htmlFor="showEmail" className="text-base font-semibold text-gray-900 cursor-pointer">
              📧 E-posta Adresini Göster
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              E-posta adresin profilinde görünür olur
            </p>
          </div>
          <Switch
            id="showEmail"
            checked={settings.showEmail}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, showEmail: checked })
            }
          />
        </div>

        {/* Kilo Bilgisi Göster */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <div className="flex-1">
            <Label htmlFor="showWeight" className="text-base font-semibold text-gray-900 cursor-pointer">
              ⚖️ Kilo Bilgilerini Göster
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Başlangıç ve hedef kilonu profilinde göster
            </p>
          </div>
          <Switch
            id="showWeight"
            checked={settings.showWeight}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, showWeight: checked })
            }
          />
        </div>

        {/* Mesaj İzni */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <div className="flex-1">
            <Label htmlFor="allowMessages" className="text-base font-semibold text-gray-900 cursor-pointer">
              💬 Mesaj Gönderilmesine İzin Ver
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Diğer kullanıcılar sana mesaj gönderebilir
            </p>
          </div>
          <Switch
            id="allowMessages"
            checked={settings.allowMessages}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, allowMessages: checked })
            }
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          {isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
      </div>
    </form>
  )
}
