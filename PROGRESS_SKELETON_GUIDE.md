# Progress Bar ve Skeleton Loading Kullanım Kılavuzu

Bu kılavuz, uygulamaya eklenen yeni progress bar ve skeleton loading bileşenlerinin nasıl kullanılacağını açıklar.

## 📊 Progress Bar Bileşenleri

### 1. Temel Progress Bileşeni

```tsx
import { Progress } from '@/components/ui/progress';

// Basit kullanım
<Progress value={75} max={100} />

// Etiketli kullanım
<Progress 
  value={75} 
  max={100} 
  showLabel 
  label="Tamamlanma Oranı" 
/>

// Farklı varyantlar
<Progress value={75} variant="success" />  // Yeşil
<Progress value={75} variant="warning" />  // Sarı
<Progress value={75} variant="danger" />   // Kırmızı
<Progress value={75} variant="default" />  // Varsayılan (koyu yeşil)

// Farklı boyutlar
<Progress value={75} size="sm" />  // Küçük
<Progress value={75} size="md" />  // Orta (varsayılan)
<Progress value={75} size="lg" />  // Büyük
```

### 2. Profil Tamamlama Bileşeni

```tsx
import { ProfileCompletion } from '@/components/ui/progress';

<ProfileCompletion 
  completedFields={5} 
  totalFields={7}
  className="mb-6"
/>
```

### 3. Hedef İlerleme Bileşeni

```tsx
import { GoalProgress } from '@/components/ui/progress';

<GoalProgress 
  current={65}
  target={80}
  unit="kg"
  label="Kilo Hedefi"
/>
```

### 4. Kilo Hedefi İlerleme Kartı (Gelişmiş)

```tsx
import { WeightGoalProgress } from '@/components/weight-goal-progress';

<WeightGoalProgress 
  startWeight={90}
  currentWeight={75}
  goalWeight={70}
  startDate={new Date('2024-01-01')}
/>
```

### 5. Profil Tamamlama Kartı

```tsx
import { ProfileCompletionCard } from '@/components/profile-completion-card';

<ProfileCompletionCard 
  fields={[
    { name: 'name', label: 'İsim Soyisim', completed: true },
    { name: 'bio', label: 'Hakkında', completed: false },
    { name: 'image', label: 'Profil Resmi', completed: true },
    // ... daha fazla alan
  ]}
/>
```

## 💀 Skeleton Loading Bileşenleri

### 1. Temel Skeleton

```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Basit kullanım
<Skeleton className="h-4 w-full" />
<Skeleton className="h-8 w-32 rounded-full" />
```

### 2. Hazır Skeleton Bileşenleri

```tsx
import { 
  SkeletonCard, 
  SkeletonPlanCard, 
  SkeletonProfile,
  SkeletonTable,
  SkeletonGallery 
} from '@/components/ui/skeleton';

// Kart skeleton
<SkeletonCard />

// Plan kartı skeleton
<SkeletonPlanCard />

// Profil skeleton
<SkeletonProfile />

// Tablo skeleton (5 satır)
<SkeletonTable rows={5} />

// Galeri skeleton (6 öğe)
<SkeletonGallery items={6} />
```

### 3. Loading Sayfaları

Next.js'in otomatik loading state'i için her route'a `loading.tsx` dosyası eklenmiştir:

- `/app/loading.tsx` - Ana sayfa
- `/app/profile/[userId]/loading.tsx` - Profil sayfası
- `/app/progress/loading.tsx` - İlerleme galerisi
- `/app/collections/loading.tsx` - Koleksiyonlar
- `/app/plan/[slug]/loading.tsx` - Plan detay
- `/app/admin/loading.tsx` - Admin paneli
- `/app/polls/loading.tsx` - Anketler

## 🎨 Özelleştirme

### Shimmer Animasyonu

Skeleton bileşenleri otomatik olarak shimmer (parıltı) animasyonu içerir. CSS'de tanımlı:

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### Renk Özelleştirme

Progress bar renklerini değiştirmek için `variant` prop'unu kullanın veya Tailwind sınıflarıyla özelleştirin:

```tsx
<Progress 
  value={75} 
  className="bg-blue-200" // Arka plan
/>
```

## 📝 Kullanım Örnekleri

### Örnek 1: Yükleme Durumu ile Liste

```tsx
'use client';

import { useState, useEffect } from 'react';
import { SkeletonPlanCard } from '@/components/ui/skeleton';

export function PlanList() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetchPlans().then(data => {
      setPlans(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonPlanCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map(plan => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}
```

### Örnek 2: Profil Sayfasında Progress Bar

```tsx
import { WeightGoalProgress } from '@/components/weight-goal-progress';
import { ProfileCompletionCard } from '@/components/profile-completion-card';

export default function ProfilePage({ user }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-6">
        <ProfileCompletionCard fields={getProfileFields(user)} />
        
        {user.startWeight && user.goalWeight && (
          <WeightGoalProgress 
            startWeight={user.startWeight}
            currentWeight={user.currentWeight}
            goalWeight={user.goalWeight}
            startDate={user.createdAt}
          />
        )}
      </div>
      
      {/* Diğer içerik */}
    </div>
  );
}
```

## 🚀 Performans İpuçları

1. **Skeleton sayısını gerçek içerikle eşleştirin**: Kullanıcı deneyimini iyileştirmek için skeleton öğe sayısını gerçek içerik sayısına yakın tutun.

2. **Loading state'i hızlıca gösterin**: Kullanıcılar 100ms'den fazla beklemek zorunda kalırsa loading göstergesi gösterin.

3. **Suspense kullanın**: Next.js 13+ ile Suspense boundary'leri kullanarak otomatik loading state'leri oluşturun.

4. **Optimistic UI**: Mümkün olduğunda optimistic update'ler kullanın ve progress bar'ları anında güncelleyin.

## 🎯 En İyi Pratikler

1. ✅ Her async işlem için loading state gösterin
2. ✅ Skeleton'ları gerçek içeriğe benzer şekilde tasarlayın
3. ✅ Progress bar'larda anlamlı etiketler kullanın
4. ✅ Kullanıcıya ilerleme hakkında bilgi verin
5. ✅ Animasyonları accessibility için kontrol edin (prefers-reduced-motion)

## 🔧 Sorun Giderme

### Shimmer animasyonu çalışmıyor
- `globals.css` dosyasında `@keyframes shimmer` tanımlı olduğundan emin olun
- Tailwind config'de animasyon devre dışı bırakılmamış olmalı

### Progress bar güncellenmıyor
- `value` prop'unun state ile bağlı olduğundan emin olun
- React state güncellemelerini kontrol edin

### Loading sayfası görünmüyor
- `loading.tsx` dosyasının doğru dizinde olduğundan emin olun
- Next.js App Router kullandığınızdan emin olun
- Server Component olarak export edildiğinden emin olun

## 📚 Daha Fazla Bilgi

- [Next.js Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Skeleton Screens](https://www.nngroup.com/articles/skeleton-screens/)
