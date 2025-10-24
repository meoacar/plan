'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateGroupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goalType: 'weight-loss',
    targetWeight: '',
    isPrivate: false,
    maxMembers: '',
    imageUrl: '',
  });

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
      <div>
        <label className="block text-sm font-medium mb-2">Grup Adı</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-3 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Açıklama</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-3 border rounded"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Hedef Tipi</label>
        <select
          value={formData.goalType}
          onChange={(e) => setFormData({ ...formData, goalType: e.target.value })}
          className="w-full p-3 border rounded"
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
          className="w-full p-3 border rounded"
          placeholder="Örn: 70"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Maksimum Üye Sayısı (opsiyonel)</label>
        <input
          type="number"
          value={formData.maxMembers}
          onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
          className="w-full p-3 border rounded"
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
        disabled={loading}
        className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Oluşturuluyor...' : 'Grup Oluştur'}
      </button>

      <p className="text-sm text-gray-500 text-center">
        Oluşturduğunuz grup admin onayından sonra yayınlanacaktır.
      </p>
    </form>
  );
}
