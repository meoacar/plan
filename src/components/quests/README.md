# Görev Sistemi Bileşenleri

Bu klasör, görev sistemi için gerekli tüm frontend bileşenlerini içerir.

## Bileşenler

### 1. QuestProgress
Görevin ilerleme durumunu görsel olarak gösterir.

**Özellikler:**
- Çizgisel (linear) veya dairesel (circular) progress bar
- Animasyonlu ilerleme güncellemesi
- Tamamlanma durumu gösterimi
- Yüzde ve sayısal gösterim

**Kullanım:**
```tsx
import { QuestProgress } from '@/components/quests';

<QuestProgress
  current={7}
  target={10}
  label="İlerleme"
  variant="linear"
  showPercentage={true}
  size="md"
/>
```

### 2. QuestCard
Tek bir görevi kartı şeklinde gösterir.

**Özellikler:**
- Görev tipi badge'i (Günlük, Haftalık, Özel)
- İlerleme çubuğu
- Ödül gösterimi (Coin + XP)
- Kalan süre gösterimi
- "Ödülü Al" butonu (tamamlanan görevler için)
- Animasyonlu ödül talep etme

**Kullanım:**
```tsx
import { QuestCard } from '@/components/quests';

<QuestCard
  quest={userQuest}
  onClaim={(questId) => handleClaimReward(questId)}
  isClaimingReward={false}
/>
```

### 3. QuestList
Görevleri listeler ve yönetir.

**Özellikler:**
- Kategori bazlı görev gösterimi
- Filtreleme (Tümü, Aktif, Tamamlanan)
- Sıralama (Öncelik, İlerleme, Ödül)
- İstatistik kartları
- Responsive grid layout
- Boş durum gösterimi

**Kullanım:**
```tsx
import { QuestList } from '@/components/quests';

<QuestList
  quests={dailyQuests}
  type="daily"
  onClaimReward={(questId) => handleClaimReward(questId)}
  isLoading={false}
  claimingQuestId={null}
/>
```

### 4. QuestRewardModal
Ödül talep edildiğinde gösterilen kutlama modalı.

**Özellikler:**
- Animasyonlu kutlama efektleri
- Konfeti animasyonu
- Ödül detayları (Coin + XP)
- Seviye atlama bildirimi
- Responsive tasarım

**Kullanım:**
```tsx
import { QuestRewardModal } from '@/components/quests';

<QuestRewardModal
  isOpen={showRewardModal}
  onClose={() => setShowRewardModal(false)}
  reward={{
    questTitle: "Günlük Giriş",
    coins: 50,
    xp: 100,
    newLevel: 5,
    leveledUp: true,
  }}
/>
```

## Tam Örnek Kullanım

```tsx
'use client';

import { useState, useEffect } from 'react';
import { QuestList, QuestRewardModal } from '@/components/quests';
import type { UserQuest } from '@/components/quests';

export default function QuestsPage() {
  const [quests, setQuests] = useState<{
    daily: UserQuest[];
    weekly: UserQuest[];
    special: UserQuest[];
  }>({ daily: [], weekly: [], special: [] });
  
  const [isLoading, setIsLoading] = useState(true);
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardData, setRewardData] = useState<any>(null);

  // Görevleri yükle
  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/quests');
      const data = await response.json();
      
      if (data.success) {
        setQuests(data.data);
      }
    } catch (error) {
      console.error('Görevler yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimReward = async (questId: string) => {
    try {
      setClaimingQuestId(questId);
      
      const response = await fetch('/api/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      });

      const data = await response.json();

      if (data.success) {
        // Ödül modalını göster
        setRewardData({
          questTitle: data.quest.title,
          coins: data.rewards.coins,
          xp: data.rewards.xp,
          newLevel: data.newLevel,
          leveledUp: data.leveledUp,
        });
        setShowRewardModal(true);

        // Görevleri yeniden yükle
        await loadQuests();
      }
    } catch (error) {
      console.error('Ödül talep edilemedi:', error);
    } finally {
      setClaimingQuestId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold">Görevler</h1>

      {/* Günlük Görevler */}
      <QuestList
        quests={quests.daily}
        type="daily"
        onClaimReward={handleClaimReward}
        isLoading={isLoading}
        claimingQuestId={claimingQuestId}
      />

      {/* Haftalık Görevler */}
      <QuestList
        quests={quests.weekly}
        type="weekly"
        onClaimReward={handleClaimReward}
        isLoading={isLoading}
        claimingQuestId={claimingQuestId}
      />

      {/* Özel Görevler */}
      {quests.special.length > 0 && (
        <QuestList
          quests={quests.special}
          type="special"
          onClaimReward={handleClaimReward}
          isLoading={isLoading}
          claimingQuestId={claimingQuestId}
        />
      )}

      {/* Ödül Modalı */}
      <QuestRewardModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        reward={rewardData}
      />
    </div>
  );
}
```

## Tip Tanımları

```typescript
interface Quest {
  id: string;
  type: 'DAILY' | 'WEEKLY' | 'SPECIAL';
  category: string;
  title: string;
  description: string;
  icon?: string;
  targetType: string;
  targetValue: number;
  coinReward: number;
  xpReward: number;
  isActive: boolean;
  priority: number;
}

interface UserQuest {
  id: string;
  userId: string;
  questId: string;
  progress: number;
  completed: boolean;
  assignedAt: Date;
  completedAt?: Date | null;
  expiresAt?: Date | null;
  rewardClaimed: boolean;
  quest: Quest;
}
```

## Animasyonlar

Tüm bileşenler Framer Motion kullanarak animasyonludur:
- Kart giriş animasyonları
- İlerleme çubuğu animasyonları
- Ödül talep etme animasyonları
- Konfeti efektleri
- Seviye atlama kutlamaları

## Responsive Tasarım

Tüm bileşenler mobil, tablet ve masaüstü için optimize edilmiştir:
- Mobil: Tek sütun layout
- Tablet: 2 sütun grid
- Masaüstü: 3 sütun grid

## Dark Mode Desteği

Tüm bileşenler dark mode'u destekler ve otomatik olarak tema değişikliklerine uyum sağlar.

## Gereksinimler

- React 18+
- Next.js 14+
- Framer Motion
- Tailwind CSS
- Lucide React (ikonlar)

## API Entegrasyonu

Bileşenler şu API endpoint'lerini kullanır:
- `GET /api/quests` - Kullanıcının aktif görevlerini getirir
- `POST /api/quests/claim` - Görev ödülünü talep eder

## Performans

- Lazy loading ile optimize edilmiş
- Memoization kullanımı
- Efficient re-rendering
- Optimized animations
