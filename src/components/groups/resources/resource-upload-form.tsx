'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, Link as LinkIcon, FileText } from 'lucide-react';
// Toast removed - using alert instead

interface ResourceUploadFormProps {
  groupId: string;
  onClose: () => void;
}

const resourceTypes = [
  { value: 'VIDEO', label: 'Video' },
  { value: 'RECIPE', label: 'Tarif' },
  { value: 'EXERCISE', label: 'Egzersiz' },
  { value: 'PDF', label: 'PDF' },
  { value: 'ARTICLE', label: 'Makale' },
  { value: 'LINK', label: 'Link' },
];

const categories = [
  { value: 'Egzersiz', label: 'Egzersiz' },
  { value: 'Beslenme', label: 'Beslenme' },
  { value: 'Motivasyon', label: 'Motivasyon' },
  { value: 'Genel', label: 'Genel' },
];

export default function ResourceUploadForm({ groupId, onClose }: ResourceUploadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resourceType: 'ARTICLE',
    url: '',
    fileUrl: '',
    content: '',
    category: 'Genel',
    tags: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Başlık gereklidir');
      return;
    }

    if (!formData.url && !formData.fileUrl && !formData.content) {
      alert('En az bir içerik alanı (URL, Dosya URL veya İçerik) doldurulmalıdır');
      return;
    }

    setIsSubmitting(true);

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch(`/api/groups/${groupId}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          resourceType: formData.resourceType,
          url: formData.url || undefined,
          fileUrl: formData.fileUrl || undefined,
          content: formData.content || undefined,
          category: formData.category,
          tags: tags.length > 0 ? tags : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Kaynak eklenemedi');
      }

      alert('Kaynak başarıyla eklendi');
      router.refresh();
      onClose();
    } catch (error: any) {
      console.error('Error creating resource:', error);
      alert(error.message || 'Kaynak eklenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Kaynak Ekle</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Başlık *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Kaynak başlığı"
              maxLength={200}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Kaynak hakkında kısa açıklama"
              rows={3}
              maxLength={2000}
            />
          </div>

          {/* Resource Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kaynak Türü *
            </label>
            <select
              value={formData.resourceType}
              onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              {resourceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kategori *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL (Link)
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com"
                maxLength={1000}
              />
            </div>
          </div>

          {/* File URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dosya URL (PDF, Video vb.)
            </label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com/file.pdf"
                maxLength={1000}
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              İçerik (Metin)
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder="Kaynak içeriği (makale metni, tarif vb.)"
              rows={6}
              maxLength={50000}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Etiketler
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="etiket1, etiket2, etiket3"
            />
            <p className="text-xs text-gray-500 mt-1">
              Virgülle ayırarak birden fazla etiket ekleyebilirsiniz
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Ekleniyor...' : 'Kaynak Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
