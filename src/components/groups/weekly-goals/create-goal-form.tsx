'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { Loader2, Target } from 'lucide-react';
import { addDays, startOfWeek, endOfWeek } from 'date-fns';

interface CreateGoalFormProps {
  groupId: string;
  onSuccess?: () => void;
}

export function CreateGoalForm({ groupId, onSuccess }: CreateGoalFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetType: 'weight_loss',
    targetValue: '',
    weekStart: '',
    weekEnd: '',
  });

  // Varsayılan olarak bu haftanın başlangıç ve bitiş tarihlerini ayarla
  const today = new Date();
  const defaultWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Pazartesi
  const defaultWeekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Pazar

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const weekStart = formData.weekStart
        ? new Date(formData.weekStart)
        : defaultWeekStart;
      const weekEnd = formData.weekEnd
        ? new Date(formData.weekEnd)
        : defaultWeekEnd;

      const response = await fetch(`/api/groups/${groupId}/weekly-goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          targetType: formData.targetType,
          targetValue: parseFloat(formData.targetValue),
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Hedef oluşturulamadı');
      }

      toast({
        title: 'Başarılı!',
        description: 'Haftalık hedef başarıyla oluşturuldu!',
      });
      router.refresh();
      onSuccess?.();

      // Formu sıfırla
      setFormData({
        title: '',
        description: '',
        targetType: 'weight_loss',
        targetValue: '',
        weekStart: '',
        weekEnd: '',
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: 'Hata!',
        description: error instanceof Error ? error.message : 'Hedef oluşturulurken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Target className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Yeni Haftalık Hedef
          </h3>
          <p className="text-sm text-gray-600">
            Grubunuz için bir haftalık hedef belirleyin
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Hedef Başlığı *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Örn: Bu hafta 10 kg birlikte verelim!"
            required
            maxLength={200}
          />
        </div>

        <div>
          <Label htmlFor="description">Açıklama</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Hedef hakkında detaylı bilgi..."
            rows={3}
            maxLength={1000}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="targetType">Hedef Türü *</Label>
            <select
              id="targetType"
              value={formData.targetType}
              onChange={(e) =>
                setFormData({ ...formData, targetType: e.target.value })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="weight_loss">Kilo Kaybı (kg)</option>
              <option value="activity">Aktivite Sayısı</option>
              <option value="posts">Paylaşım Sayısı</option>
              <option value="exercise">Egzersiz Günü</option>
              <option value="water">Su Tüketimi (L)</option>
            </select>
          </div>

          <div>
            <Label htmlFor="targetValue">Hedef Değer *</Label>
            <Input
              id="targetValue"
              type="number"
              step="0.1"
              min="0.1"
              value={formData.targetValue}
              onChange={(e) =>
                setFormData({ ...formData, targetValue: e.target.value })
              }
              placeholder="Örn: 10"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weekStart">Başlangıç Tarihi</Label>
            <Input
              id="weekStart"
              type="date"
              value={formData.weekStart}
              onChange={(e) =>
                setFormData({ ...formData, weekStart: e.target.value })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Boş bırakılırsa bu haftanın Pazartesi günü
            </p>
          </div>

          <div>
            <Label htmlFor="weekEnd">Bitiş Tarihi</Label>
            <Input
              id="weekEnd"
              type="date"
              value={formData.weekEnd}
              onChange={(e) =>
                setFormData({ ...formData, weekEnd: e.target.value })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Boş bırakılırsa bu haftanın Pazar günü
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Oluşturuluyor...
            </>
          ) : (
            'Hedef Oluştur'
          )}
        </Button>
      </div>
    </form>
  );
}
