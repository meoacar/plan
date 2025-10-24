'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Clock } from 'lucide-react';
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isPushNotificationSupported,
  getNotificationPermission,
} from '@/lib/push-client';

interface Preferences {
  emailNewFollower: boolean;
  emailComment: boolean;
  emailLike: boolean;
  emailBadge: boolean;
  emailPartnerRequest: boolean;
  emailWeeklyDigest: boolean;
  pushNewFollower: boolean;
  pushComment: boolean;
  pushLike: boolean;
  pushBadge: boolean;
  pushPartnerRequest: boolean;
  inAppNewFollower: boolean;
  inAppComment: boolean;
  inAppLike: boolean;
  inAppBadge: boolean;
  inAppPartnerRequest: boolean;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
}

export function NotificationPreferencesForm() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);

  useEffect(() => {
    fetchPreferences();
    setPushSupported(isPushNotificationSupported());
    setPushEnabled(getNotificationPermission() === 'granted');
  }, []);

  async function fetchPreferences() {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        alert('Tercihleriniz kaydedildi');
      } else {
        alert('Bir hata oluştu');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  }

  async function handleEnablePush() {
    const subscription = await subscribeToPushNotifications();
    if (subscription) {
      setPushEnabled(true);
      alert('Push bildirimleri etkinleştirildi');
    } else {
      alert('Push bildirimleri etkinleştirilemedi');
    }
  }

  async function handleDisablePush() {
    const success = await unsubscribeFromPushNotifications();
    if (success) {
      setPushEnabled(false);
      alert('Push bildirimleri devre dışı bırakıldı');
    } else {
      alert('Bir hata oluştu');
    }
  }

  function updatePreference(key: keyof Preferences, value: boolean | number | null) {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  }

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  if (!preferences) {
    return <div className="text-center py-8">Tercihler yüklenemedi</div>;
  }

  return (
    <div className="space-y-8">
      {/* Push Notifications */}
      {pushSupported && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Push Bildirimleri</h2>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Tarayıcınızda anlık bildirimler alın
            </p>
            {pushEnabled ? (
              <button
                onClick={handleDisablePush}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Push Bildirimlerini Devre Dışı Bırak
              </button>
            ) : (
              <button
                onClick={handleEnablePush}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Push Bildirimlerini Etkinleştir
              </button>
            )}
          </div>

          <div className="space-y-3">
            <PreferenceToggle
              label="Yeni takipçi"
              checked={preferences.pushNewFollower}
              onChange={(checked) => updatePreference('pushNewFollower', checked)}
              disabled={!pushEnabled}
            />
            <PreferenceToggle
              label="Yorum"
              checked={preferences.pushComment}
              onChange={(checked) => updatePreference('pushComment', checked)}
              disabled={!pushEnabled}
            />
            <PreferenceToggle
              label="Beğeni"
              checked={preferences.pushLike}
              onChange={(checked) => updatePreference('pushLike', checked)}
              disabled={!pushEnabled}
            />
            <PreferenceToggle
              label="Rozet kazanımı"
              checked={preferences.pushBadge}
              onChange={(checked) => updatePreference('pushBadge', checked)}
              disabled={!pushEnabled}
            />
            <PreferenceToggle
              label="Partner istekleri"
              checked={preferences.pushPartnerRequest}
              onChange={(checked) => updatePreference('pushPartnerRequest', checked)}
              disabled={!pushEnabled}
            />
          </div>
        </div>
      )}

      {/* Email Notifications */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold">Email Bildirimleri</h2>
        </div>

        <div className="space-y-3">
          <PreferenceToggle
            label="Yeni takipçi"
            checked={preferences.emailNewFollower}
            onChange={(checked) => updatePreference('emailNewFollower', checked)}
          />
          <PreferenceToggle
            label="Yorum"
            checked={preferences.emailComment}
            onChange={(checked) => updatePreference('emailComment', checked)}
          />
          <PreferenceToggle
            label="Beğeni"
            checked={preferences.emailLike}
            onChange={(checked) => updatePreference('emailLike', checked)}
          />
          <PreferenceToggle
            label="Rozet kazanımı"
            checked={preferences.emailBadge}
            onChange={(checked) => updatePreference('emailBadge', checked)}
          />
          <PreferenceToggle
            label="Partner istekleri"
            checked={preferences.emailPartnerRequest}
            onChange={(checked) => updatePreference('emailPartnerRequest', checked)}
          />
          <PreferenceToggle
            label="Haftalık özet"
            checked={preferences.emailWeeklyDigest}
            onChange={(checked) => updatePreference('emailWeeklyDigest', checked)}
          />
        </div>
      </div>

      {/* In-App Notifications */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-semibold">Uygulama İçi Bildirimler</h2>
        </div>

        <div className="space-y-3">
          <PreferenceToggle
            label="Yeni takipçi"
            checked={preferences.inAppNewFollower}
            onChange={(checked) => updatePreference('inAppNewFollower', checked)}
          />
          <PreferenceToggle
            label="Yorum"
            checked={preferences.inAppComment}
            onChange={(checked) => updatePreference('inAppComment', checked)}
          />
          <PreferenceToggle
            label="Beğeni"
            checked={preferences.inAppLike}
            onChange={(checked) => updatePreference('inAppLike', checked)}
          />
          <PreferenceToggle
            label="Rozet kazanımı"
            checked={preferences.inAppBadge}
            onChange={(checked) => updatePreference('inAppBadge', checked)}
          />
          <PreferenceToggle
            label="Partner istekleri"
            checked={preferences.inAppPartnerRequest}
            onChange={(checked) => updatePreference('inAppPartnerRequest', checked)}
          />
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-6 w-6 text-orange-600" />
          <h2 className="text-xl font-semibold">Sessiz Saatler</h2>
        </div>

        <p className="text-gray-600 mb-4">
          Bu saatler arasında push bildirimi almayacaksınız
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlangıç Saati
            </label>
            <select
              value={preferences.quietHoursStart ?? ''}
              onChange={(e) =>
                updatePreference(
                  'quietHoursStart',
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seçiniz</option>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bitiş Saati
            </label>
            <select
              value={preferences.quietHoursEnd ?? ''}
              onChange={(e) =>
                updatePreference(
                  'quietHoursEnd',
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seçiniz</option>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
}

interface PreferenceToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function PreferenceToggle({ label, checked, onChange, disabled }: PreferenceToggleProps) {
  return (
    <label className="flex items-center justify-between py-2">
      <span className={`text-gray-700 ${disabled ? 'opacity-50' : ''}`}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );
}
