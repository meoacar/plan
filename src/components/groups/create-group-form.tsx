'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';

export default function CreateGroupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goalType: 'weight-loss',
    targetWeight: '',
    isPrivate: false,
    maxMembers: '',
    imageUrl: '',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      alert('Sadece resim dosyaları yüklenebilir');
      return;
    }

    try {
      setUploading(true);

      // Preview oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Sunucuya yükle
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload/group', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Yükleme başarısız');
      }

      const data = await res.json();
      setFormData({ ...formData, imageUrl: data.imageUrl });
    } catch (error: any) {
      alert(error.message || 'Resim yüklenirken bir hata oluştu');
      setImagePreview(null);
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
    
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          targetWeight: formData.targetWeight ? parseInt(formData.targetWeight) : null,
          maxMembers: formData.maxMembers ? parseInt(formData.maxMembers) : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert('Grup oluşturuldu! Admin onayı bekleniyor.');
        router.push(`/groups/${data.slug}`);
      } else {
        alert('Grup oluşturulamadı');
      }
    } catch (error) {
      alert('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Grup Resmi */}
      <div>
        <label className="block text-sm font-medium mb-2">Grup Resmi</label>
        <div className="space-y-4">
          {imagePreview ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={imagePreview}
                alt="Grup resmi önizleme"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors">
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
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <p className="text-sm text-gray-600 mt-2">Yükleniyor...</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Grup Adı</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Açıklama</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Hedef Tipi</label>
        <select
          value={formData.goalType}
          onChange={(e) => setFormData({ ...formData, goalType: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="weight-loss">Kilo Verme</option>
          <option value="fitness">Fitness</option>
          <option value="healthy-eating">Sağlıklı Beslenme</option>
          <option value="motivation">Motivasyon</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Hedef Kilo (opsiyonel)</label>
        <input
          type="number"
          value={formData.targetWeight}
          onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Örn: 70"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Maksimum Üye Sayısı (opsiyonel)</label>
        <input
          type="number"
          value={formData.maxMembers}
          onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Örn: 50"
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isPrivate}
            onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
          />
          <span className="text-sm">Özel Grup (Katılım için onay gerekir)</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
      >
        {loading ? 'Oluşturuluyor...' : 'Grup Oluştur'}
      </button>

      <p className="text-sm text-gray-500 text-center">
        Oluşturduğunuz grup admin onayından sonra yayınlanacaktır.
      </p>
    </form>
  );
}
