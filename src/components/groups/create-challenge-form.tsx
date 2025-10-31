'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Calendar, Target, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CreateChallengeFormProps {
  groupId: string;
  groupSlug: string;
}

export default function CreateChallengeForm({ groupId, groupSlug }: CreateChallengeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    goalType: 'weight-loss',
    targetValue: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          groupId,
          targetValue: parseFloat(formData.targetValue),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Challenge oluşturulamadı');
      }

      router.push(`/groups/${groupSlug}`);
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
          href={`/groups/${groupSlug}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Gruba Dön
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Yeni Challenge Oluştur</h1>
        </div>
        <p className="text-gray-600">Grup üyelerini motive edecek bir challenge oluşturun</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Challenge Başlığı *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Örn: 30 Günde 5 Kilo Challenge"
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
            placeholder="Challenge hakkında detaylı bilgi verin..."
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

        {/* Target Value */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Hedef Değer (kg) *
          </label>
          <div className="relative">
            <Target className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.1"
              required
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
              placeholder="5.0"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Örn: 5 kg kilo verme hedefi
          </p>
        </div>

        {/* Date Range */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Başlangıç Tarihi *
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bitiş Tarihi *
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <Link
            href={`/groups/${groupSlug}`}
            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors text-center"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Oluşturuluyor...' : 'Challenge Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
}
