'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, ArrowLeft, Users, Lock, Upload, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Group {
  id: string;
  name: string;
  slug: string;
  description: string;
  goalType: string;
  imageUrl?: string | null;
  isPrivate: boolean;
  maxMembers?: number | null;
}

interface GroupSettingsFormProps {
  group: Group;
}

export default function GroupSettingsForm({ group }: GroupSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(group.imageUrl || null);

  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description,
    goalType: group.goalType,
    isPrivate: group.isPrivate,
    maxMembers: group.maxMembers?.toString() || '',
    imageUrl: group.imageUrl || '',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Sadece resim dosyaları yüklenebilir');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload/group', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Yükleme başarısız');
      }

      const data = await res.json();
      setFormData({ ...formData, imageUrl: data.imageUrl });
    } catch (err: any) {
      setError(err.message || 'Resim yüklenirken bir hata oluştu');
      setImagePreview(group.imageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/groups/${group.slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          maxMembers: formData.maxMembers ? parseInt(formData.maxMembers) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Güncelleme başarısız');
      }

      router.push(`/groups/${group.slug}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== group.name) {
      setError('Grup adını doğru yazın');
      return;
    }

    if (!confirm('Bu grubu silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/groups/${group.slug}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Silme başarısız');
      }

      router.push('/groups');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/groups/${group.slug}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Gruba Dön
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Grup Ayarları</h1>
        </div>
        <p className="text-gray-600">Grup bilgilerini düzenleyin</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grup Resmi */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Grup Resmi
          </label>
          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-gray-200">
                <Image
                  src={imagePreview}
                  alt="Grup resmi"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Resim yüklemek için tıklayın</span>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG veya WEBP (Max. 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            )}
            {uploading && (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <p className="text-sm text-gray-600 mt-2">Yükleniyor...</p>
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Grup Adı *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Açıklama *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Goal Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Hedef Türü *
          </label>
          <select
            value={formData.goalType}
            onChange={(e) => setFormData({ ...formData, goalType: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
          >
            <option value="weight-loss">Kilo Verme</option>
            <option value="fitness">Fitness</option>
            <option value="healthy-eating">Sağlıklı Beslenme</option>
            <option value="muscle-gain">Kas Kazanımı</option>
          </select>
        </div>

        {/* Max Members */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Maksimum Üye Sayısı
          </label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="1"
              value={formData.maxMembers}
              onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
              placeholder="Sınırsız"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Boş bırakırsanız sınırsız üye kabul edilir
          </p>
        </div>

        {/* Privacy */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <Lock className="w-5 h-5 text-gray-600" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Özel Grup</p>
            <p className="text-sm text-gray-600">Katılmak için onay gerekir</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <Link
            href={`/groups/${group.slug}`}
            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors text-center"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-12 pt-8 border-t-2 border-red-100">
        <div className="bg-red-50 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <Trash2 className="w-6 h-6 text-red-600 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-1">Tehlikeli Bölge</h3>
              <p className="text-sm text-red-700">
                Grubu silmek geri alınamaz bir işlemdir. Tüm üyeler, gönderiler ve challenge'lar silinecektir.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-red-900 mb-2">
                Silmek için grup adını yazın: <span className="font-mono">{group.name}</span>
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={group.name}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || deleteConfirm !== group.name}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Siliniyor...' : 'Grubu Kalıcı Olarak Sil'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
