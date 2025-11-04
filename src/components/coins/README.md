# Coin Sistemi Bileşenleri

Bu klasör, coin sistemi için frontend bileşenlerini içerir.

## Bileşenler

### 1. CoinBalance

Kullanıcının coin bakiyesini gösterir. Header'da her sayfada görünür olacak şekilde tasarlanmıştır.

**Özellikler:**
- Animasyonlu coin artış/azalış efekti
- Üç farklı boyut seçeneği (sm, md, lg)
- Değişiklik badge'i (artış/azalış göstergesi)
- Parıltı efekti (coin kazanıldığında)

**Kullanım:**
```tsx
import CoinBalance from '@/components/coins/CoinBalance';

// Basit kullanım
<CoinBalance coins={1250} />

// Animasyonsuz
<CoinBalance coins={1250} showAnimation={false} />

// Küçük boyut
<CoinBalance coins={1250} size="sm" />

// Büyük boyut
<CoinBalance coins={1250} size="lg" />
```

**Props:**
- `coins?: number` - Coin bakiyesi (opsiyonel)
- `showAnimation?: boolean` - Animasyon göster (varsayılan: true)
- `size?: 'sm' | 'md' | 'lg'` - Boyut (varsayılan: 'md')
- `className?: string` - Ek CSS sınıfları

### 2. CoinTransactionHistory

Kullanıcının coin işlem geçmişini gösterir. Filtreleme ve sayfalama özellikleri içerir.

**Özellikler:**
- İşlem tipi filtreleme (Kazanıldı, Harcandı, Bonus, İade)
- Sayfalama (daha fazla yükle)
- İşlem tipi renklendirme
- İşlem nedeni ikonları
- Tarih formatlaması (göreceli)

**Kullanım:**
```tsx
import CoinTransactionHistory from '@/components/coins/CoinTransactionHistory';

// Basit kullanım
<CoinTransactionHistory />

// Filtreli
<CoinTransactionHistory filter="EARNED" />

// Filtresiz
<CoinTransactionHistory showFilters={false} />

// Özel limit
<CoinTransactionHistory limit={10} />
```

**Props:**
- `filter?: 'all' | 'EARNED' | 'SPENT' | 'BONUS' | 'REFUND'` - Başlangıç filtresi (varsayılan: 'all')
- `limit?: number` - Sayfa başına işlem sayısı (varsayılan: 20)
- `showFilters?: boolean` - Filtreleri göster (varsayılan: true)
- `className?: string` - Ek CSS sınıfları

### 3. CoinStats

Kullanıcının coin istatistiklerini gösterir. Günlük, haftalık, aylık ve tüm zamanlar için analiz sunar.

**Özellikler:**
- Dönem seçici (Bugün, Bu Hafta, Bu Ay, Tüm Zamanlar)
- Mevcut bakiye
- Kazanılan/Harcanan coin
- Net değişim
- Detaylı analiz (oranlar, ortalamalar)
- Görsel grafik gösterimi

**Kullanım:**
```tsx
import CoinStats from '@/components/coins/CoinStats';

// Basit kullanım
<CoinStats />

// Varsayılan dönem
<CoinStats defaultPeriod="weekly" />

// Belirli kullanıcı için
<CoinStats userId="user-id" />
```

**Props:**
- `userId?: string` - Kullanıcı ID (opsiyonel, session'dan alınır)
- `defaultPeriod?: 'daily' | 'weekly' | 'monthly' | 'all'` - Varsayılan dönem (varsayılan: 'all')
- `className?: string` - Ek CSS sınıfları

## API Endpoints

Bileşenler aşağıdaki API endpoint'lerini kullanır:

### GET /api/coins/balance
Kullanıcının coin bakiyesini getirir.

**Response:**
```json
{
  "success": true,
  "data": {
    "coins": 1250
  }
}
```

### GET /api/coins/transactions
Coin işlem geçmişini getirir.

**Query Parametreleri:**
- `type?: 'EARNED' | 'SPENT' | 'BONUS' | 'REFUND'`
- `limit?: number` (1-100, varsayılan: 50)
- `offset?: number` (varsayılan: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [...],
    "total": 45,
    "hasMore": true,
    "pagination": {
      "limit": 20,
      "offset": 0,
      "nextOffset": 20
    }
  }
}
```

### GET /api/coins/stats
Coin istatistiklerini getirir.

**Query Parametreleri:**
- `period?: 'daily' | 'weekly' | 'monthly' | 'all'` (varsayılan: 'all')

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "all",
    "earned": 2500,
    "spent": 1250,
    "refunded": 0,
    "net": 1250,
    "currentBalance": 1250,
    "transactionCount": 45
  }
}
```

## Örnek Kullanım Senaryoları

### 1. Header'da Coin Bakiyesi

```tsx
// src/components/layout/Header.tsx
import CoinBalance from '@/components/coins/CoinBalance';
import { useSession } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/coins/balance')
        .then(res => res.json())
        .then(data => setCoins(data.data.coins));
    }
  }, [session]);

  return (
    <header>
      {/* ... diğer header içeriği ... */}
      <CoinBalance coins={coins} size="sm" />
    </header>
  );
}
```

### 2. Coin Geçmişi Sayfası

```tsx
// src/app/coins/history/page.tsx
import CoinTransactionHistory from '@/components/coins/CoinTransactionHistory';

export default function CoinHistoryPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Coin Geçmişi</h1>
      <CoinTransactionHistory />
    </div>
  );
}
```

### 3. İstatistikler Sayfası

```tsx
// src/app/coins/stats/page.tsx
import CoinStats from '@/components/coins/CoinStats';

export default function CoinStatsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Coin İstatistikleri</h1>
      <CoinStats defaultPeriod="weekly" />
    </div>
  );
}
```

### 4. Profil Sayfasında Özet

```tsx
// src/app/profile/page.tsx
import CoinBalance from '@/components/coins/CoinBalance';
import CoinStats from '@/components/coins/CoinStats';
import CoinTransactionHistory from '@/components/coins/CoinTransactionHistory';

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      {/* Coin bakiyesi */}
      <div className="mb-8">
        <CoinBalance coins={1250} size="lg" />
      </div>

      {/* İstatistikler */}
      <div className="mb-8">
        <CoinStats defaultPeriod="monthly" />
      </div>

      {/* Son işlemler */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Son İşlemler</h2>
        <CoinTransactionHistory limit={5} showFilters={false} />
      </div>
    </div>
  );
}
```

## Animasyonlar

Bileşenler Framer Motion kullanarak animasyonlar içerir:

- **CoinBalance**: Coin değişikliğinde scale ve color animasyonu, değişiklik badge'i için slide animasyonu
- **CoinTransactionHistory**: Liste öğeleri için fade-in ve slide-up animasyonu
- **CoinStats**: Kart öğeleri için staggered fade-in animasyonu

## Stil ve Tema

Bileşenler dark mode destekli olarak tasarlanmıştır:
- Tailwind CSS kullanılır
- Dark mode için `dark:` prefix'li sınıflar
- Gradient arka planlar
- Renk kodlu işlem tipleri

## Bağımlılıklar

- `framer-motion` - Animasyonlar için
- `lucide-react` - İkonlar için
- `@/components/ui/card` - Card bileşeni
- `@/components/ui/button` - Button bileşeni
- `@prisma/client` - CoinTransactionType enum için

## Notlar

- Tüm bileşenler client-side render edilir (`'use client'`)
- API çağrıları otomatik olarak session kontrolü yapar
- Hata durumları kullanıcı dostu mesajlarla yönetilir
- Loading state'leri spinner ile gösterilir
