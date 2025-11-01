'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { Loader2, TrendingUp } from 'lucide-react';

interface QuickUpdateButtonProps {
  groupId: string;
  goalId: string;
  targetType: string;
  currentValue?: number;
}

export function QuickUpdateButton({
  groupId,
  goalId,
  targetType,
  currentValue,
}: QuickUpdateButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState(currentValue?.toString() || '');

  const targetTypeLabels: Record<string, string> = {
    weight_loss: 'Kilo Kaybı (kg)',
    activity: 'Aktivite Sayısı',
    posts: 'Paylaşım Sayısı',
    exercise: 'Egzersiz Günü',
    water: 'Su Tüketimi (L)',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        toast({
          title: 'Hata!',
          description: 'Lütfen geçerli bir değer girin',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(
        `/api/groups/${groupId}/weekly-goals/${goalId}/progress`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: numValue }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'İlerleme kaydedilemedi');
      }

      toast({
        title: 'Başarılı!',
        description: 'İlerlemeniz başarıyla kaydedildi!',
      });
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Hata!',
        description: error instanceof Error ? error.message : 'İlerleme kaydedilirken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button size="sm" className="gap-2 w-full" onClick={() => setIsOpen(true)}>
        <TrendingUp className="w-4 h-4" />
        İlerleme Kaydet
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>İlerleme Kaydet</DialogTitle>
          <DialogDescription>
            Haftalık hedefe katkınızı kaydedin
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="value">
              {targetTypeLabels[targetType] || 'Değer'}
            </Label>
            <Input
              id="value"
              type="number"
              step="0.1"
              min="0.1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Örn: 2.5"
              required
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              {currentValue
                ? `Mevcut katkınız: ${currentValue.toFixed(1)}`
                : 'Henüz katkı kaydınız yok'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
