'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ImagePlus, Send, X, TrendingUp, Trophy, Heart, Camera } from 'lucide-react';

interface CreatePostFormProps {
  groupSlug: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

const postTypes = [
  { value: 'UPDATE', label: 'Güncelleme', icon: TrendingUp, color: 'text-blue-600' },
  { value: 'ACHIEVEMENT', label: 'Başarı', icon: Trophy, color: 'text-yellow-600' },
  { value: 'MOTIVATION', label: 'Motivasyon', icon: Heart, color: 'text-red-600' },
  { value: 'PROGRESS', label: 'İlerleme', icon: TrendingUp, color: 'text-green-600' },
  { value: 'PHOTO', label: 'Fotoğraf', icon: Camera, color: 'text-purple-600' },
];

export default function CreatePostForm({ groupSlug, user }: CreatePostFormProps) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<string>('UPDATE');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Paylaşım içeriği boş olamaz');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch(`/api/groups/${groupSlug}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          postType,
          imageUrl: imageUrl.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Paylaşım oluşturulamadı');
      }

      // Formu temizle
      setContent('');
      setImageUrl('');
      setPostType('UPDATE');
      setShowImageInput(false);

      // Sayfayı yenile
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedType = postTypes.find((t) => t.value === postType);
  const TypeIcon = selectedType?.icon || TrendingUp;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Kullanıcı Bilgisi */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
            {user.image ? (
              <Image src={user.image} alt={user.name} width={48} height={48} className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">Paylaşım oluştur</p>
          </div>
        </div>

        {/* İçerik Alanı */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Neler oluyor? Başarılarınızı, hedeflerinizi veya motivasyon mesajlarınızı paylaşın..."
          className="w-full min-h-[120px] p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none transition-all"
          maxLength={5000}
          disabled={loading}
        />

        {/* Karakter Sayacı */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{content.length} / 5000</span>
        </div>

        {/* Resim URL Girişi */}
        {showImageInput && (
          <div className="relative">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Resim URL'si girin..."
              className="w-full p-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => {
                setShowImageInput(false);
                setImageUrl('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Resim Önizleme */}
        {imageUrl && (
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
            <img src={imageUrl} alt="Önizleme" className="w-full h-48 object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Paylaşım Tipi Seçimi */}
        <div className="flex flex-wrap gap-2">
          {postTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setPostType(type.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
                  postType === type.value
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }`}
                disabled={loading}
              >
                <Icon className={`w-4 h-4 ${postType === type.value ? type.color : ''}`} />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Alt Butonlar */}
        <div className="flex items-center justify-between pt-4 border-t">
          <button
            type="button"
            onClick={() => setShowImageInput(!showImageInput)}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 font-semibold transition-colors"
            disabled={loading}
          >
            <ImagePlus className="w-5 h-5" />
            Resim Ekle
          </button>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Paylaşılıyor...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Paylaş
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
