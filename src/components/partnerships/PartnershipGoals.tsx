'use client';

import { useState } from 'react';
import { Plus, CheckCircle, Trash2, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Goal {
    id: string;
    title: string;
    description: string | null;
    targetDate: Date;
    completed: boolean;
    completedAt: Date | null;
    createdBy: string;
}

interface Props {
    partnershipId: string;
    goals: Goal[];
}

export default function PartnershipGoals({ partnershipId, goals: initialGoals }: Props) {
    const [goals, setGoals] = useState<Goal[]>(initialGoals);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetDate: '',
    });

    const createGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/partnerships/${partnershipId}/goals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    targetDate: new Date(formData.targetDate).toISOString(),
                }),
            });

            if (res.ok) {
                const goal = await res.json();
                setGoals([...goals, goal]);
                setFormData({ title: '', description: '', targetDate: '' });
                setShowForm(false);
            } else {
                alert('Hedef oluşturulamadı');
            }
        } catch (error) {
            console.error('Create goal error:', error);
            alert('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const completeGoal = async (goalId: string) => {
        try {
            const res = await fetch(`/api/partnerships/${partnershipId}/goals/${goalId}`, {
                method: 'PATCH',
            });

            if (res.ok) {
                const updatedGoal = await res.json();
                setGoals(goals.map((g) => (g.id === goalId ? updatedGoal : g)));
            }
        } catch (error) {
            console.error('Complete goal error:', error);
        }
    };

    const deleteGoal = async (goalId: string) => {
        if (!confirm('Bu hedefi silmek istediğinizden emin misiniz?')) return;

        try {
            const res = await fetch(`/api/partnerships/${partnershipId}/goals/${goalId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setGoals(goals.filter((g) => g.id !== goalId));
            }
        } catch (error) {
            console.error('Delete goal error:', error);
        }
    };

    const activeGoals = goals.filter((g) => !g.completed);
    const completedGoals = goals.filter((g) => g.completed);

    return (
        <div className="space-y-6">
            {/* Yeni Hedef Butonu */}
            <div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Hedef Ekle
                </button>
            </div>

            {/* Hedef Ekleme Formu */}
            {showForm && (
                <form onSubmit={createGoal} className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Hedef Başlığı</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Örn: Bu hafta 3 gün spor"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                            required
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Açıklama (Opsiyonel)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Hedef hakkında detaylar..."
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                            rows={3}
                            maxLength={500}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Hedef Tarihi</label>
                        <input
                            type="date"
                            value={formData.targetDate}
                            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                            required
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Oluştur'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                        >
                            İptal
                        </button>
                    </div>
                </form>
            )}

            {/* Aktif Hedefler */}
            {activeGoals.length > 0 && (
                <div>
                    <h3 className="font-semibold text-lg mb-4">Aktif Hedefler</h3>
                    <div className="space-y-3">
                        {activeGoals.map((goal) => (
                            <div key={goal.id} className="bg-white border rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold">{goal.title}</h4>
                                        {goal.description && (
                                            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(goal.targetDate), 'dd MMMM yyyy', { locale: tr })}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => completeGoal(goal.id)}
                                            className="text-green-600 hover:text-green-700 p-2"
                                            title="Tamamla"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => deleteGoal(goal.id)}
                                            className="text-red-600 hover:text-red-700 p-2"
                                            title="Sil"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tamamlanan Hedefler */}
            {completedGoals.length > 0 && (
                <div>
                    <h3 className="font-semibold text-lg mb-4">Tamamlanan Hedefler</h3>
                    <div className="space-y-3">
                        {completedGoals.map((goal) => (
                            <div key={goal.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <h4 className="font-semibold text-green-900">{goal.title}</h4>
                                        </div>
                                        {goal.description && (
                                            <p className="text-sm text-green-700 mt-1 ml-7">{goal.description}</p>
                                        )}
                                        <p className="text-sm text-green-600 mt-2 ml-7">
                                            Tamamlandı: {format(new Date(goal.completedAt!), 'dd MMMM yyyy', { locale: tr })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Boş Durum */}
            {goals.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    Henüz ortak hedef yok. İlk hedefi sen oluştur!
                </div>
            )}
        </div>
    );
}
