# Rozet Ödül Sistemi - Kurulum Rehberi

## 🚀 Hızlı Başlangıç

### 1. Veritabanı Migration

```bash
# Prisma schema'yı güncelle
npx prisma generate

# Migration oluştur
npx prisma migrate dev --name add_profile_customization

# Veritabanını güncelle
npx prisma db push
```

### 2. Özelleştirme Öğelerini Ekle

```bash
# Seed script'ini çalıştır
npx tsx prisma/seed-customization-items.ts
```

Bu komut şunları ekler:
- 9 çerçeve (bronz, gümüş, altın, elmas, özel çerçeveler)
- 6 arka plan
- 6 tema
- 5 özel rozet

### 3. CSS Dosyasını İçe Aktar

`src/app/layout.tsx` veya `src/app/globals.css` dosyasına ekle:

```typescript
import '@/styles/profile-customization.css';
```

### 4. Mevcut Kullanıcılar İçin Varsayılan Özelleştirme Oluştur

```bash
# Script oluştur: scripts/init-user-customizations.ts
```

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      profileCustomization: null,
    },
  });

  console.log(`${users.length} kullanıcı için özelleştirme oluşturuluyor...`);

  for (const user of users) {
    await prisma.profileCustomization.create({
      data: {
        userId: user.id,
        unlockedFrames: ["default_frame"],
        unlockedBackgrounds: ["default_bg"],
        unlockedThemes: ["classic_theme"],
        unlockedBadges: [],
        activeBadges: [],
      },
    });
  }

  console.log("✅ Tamamlandı!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

```bash
npx tsx scripts/init-user-customizations.ts
```

## 📝 Kullanım

### Profil Özelleştirme Sayfası Oluştur

`src/app/profile/customization/page.tsx`:

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileCustomization from "@/components/profile/ProfileCustomization";

export default async function CustomizationPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileCustomization />
    </div>
  );
}
```

### Rozet Kazanma Modalını Kullan

Herhangi bir rozet verme fonksiyonunda:

```typescript
import BadgeUnlockedModal from "@/components/badges/BadgeUnlockedModal";

// Component içinde
const [showBadgeModal, setShowBadgeModal] = useState(false);
const [badgeData, setBadgeData] = useState(null);

// Rozet kazanıldığında
const handleBadgeEarned = (badge) => {
  setBadgeData({
    name: badge.name,
    icon: badge.icon,
    xp: badge.xpReward,
    unlockedItems: badge.unlockedItems || [],
  });
  setShowBadgeModal(true);
};

// JSX
<BadgeUnlockedModal
  isOpen={showBadgeModal}
  onClose={() => setShowBadgeModal(false)}
  badgeName={badgeData?.name}
  badgeIcon={badgeData?.icon}
  xpReward={badgeData?.xp}
  unlockedItems={badgeData?.unlockedItems}
/>
```

### Profilde Çerçeve Göster

```typescript
import { getUserCustomization } from "@/lib/unlock-customization";

// Server component
const customization = await getUserCustomization(userId);

// JSX
<div className="profile-avatar-container">
  <div className={`profile-avatar-frame ${customization.activeFrame?.cssClass || 'frame-default'}`}>
    <img src={user.image} alt={user.name} className="rounded-full" />
  </div>
</div>
```

### Profilde Tema Uygula

```typescript
<div className={customization.activeTheme?.cssClass || 'theme-classic'}>
  {/* Profil içeriği */}
</div>
```

## 🎨 Yeni Özelleştirme Öğesi Ekleme

### 1. Veritabanına Ekle

```typescript
await prisma.customizationItem.create({
  data: {
    type: "FRAME",
    code: "special_frame",
    name: "Özel Çerçeve",
    description: "Çok özel bir çerçeve",
    cssClass: "frame-special",
    colors: { gradient: "linear-gradient(135deg, #ff0080 0%, #ff8c00 100%)" },
    unlockCondition: "50 rozet",
    badgeCount: 50,
    isSpecial: true,
    order: 30,
  },
});
```

### 2. CSS Ekle

`src/styles/profile-customization.css`:

```css
.frame-special {
  background: linear-gradient(135deg, #ff0080 0%, #ff8c00 100%);
  box-shadow: 0 0 30px rgba(255, 0, 128, 0.7);
  animation: specialGlow 2s ease-in-out infinite;
}

@keyframes specialGlow {
  0%, 100% {
    box-shadow: 0 0 30px rgba(255, 0, 128, 0.7);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 140, 0, 0.9);
  }
}
```

## 🔧 Özelleştirme

### Rozet Sayısı Kontrolünü Güncelle

`src/lib/unlock-customization.ts` dosyasında `checkBadgeCountUnlocks` fonksiyonu otomatik olarak rozet sayısına göre öğeleri açar.

### Özel Unlock Koşulları

Yeni bir unlock koşulu eklemek için:

```typescript
// Örnek: Tüm kategorilerden rozet kontrolü
export async function checkCategoryUnlocks(userId: string) {
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
  });

  const categories = new Set(userBadges.map(ub => ub.badge.type));
  
  // Her kategoriden en az 1 rozet varsa gökkuşağı çerçevesini aç
  if (categories.size >= 5) {
    // Unlock rainbow frame
  }
}
```

## 📊 Test

### 1. Rozet Verme Testi

```typescript
// Test kullanıcısına rozet ver
const badge = await prisma.badge.findUnique({
  where: { type: "CHEAT_FREE_7_DAYS" },
});

await prisma.userBadge.create({
  data: {
    userId: "test-user-id",
    badgeId: badge.id,
  },
});

// Özelleştirme öğelerini aç
const result = await unlockCustomizationItems("test-user-id", badge.type);
console.log("Açılan öğeler:", result.unlockedItems);
```

### 2. API Testi

```bash
# Özelleştirmeleri getir
curl http://localhost:3000/api/profile/customization

# Özelleştirme uygula
curl -X POST http://localhost:3000/api/profile/customization \
  -H "Content-Type: application/json" \
  -d '{"activeFrame":"gold_frame","activeTheme":"fire_theme"}'
```

## 🎯 Özellikler

### Mevcut Özellikler
- ✅ 9 farklı çerçeve
- ✅ 6 arka plan
- ✅ 6 tema
- ✅ 5 özel rozet
- ✅ Otomatik unlock sistemi
- ✅ Rozet sayısı bazlı unlock
- ✅ Özel rozet bazlı unlock
- ✅ Animasyonlu modal
- ✅ Profil önizleme

### Gelecek Özellikler
- 🔄 Sezonluk öğeler
- 🔄 Animasyonlu çerçeveler
- 🔄 Profil müziği
- 🔄 3D avatar
- 🔄 Özelleştirme paylaşımı
- 🔄 Özelleştirme yarışmaları

## 🐛 Sorun Giderme

### Öğeler Açılmıyor

```typescript
// Manuel unlock
await prisma.profileCustomization.update({
  where: { userId: "user-id" },
  data: {
    unlockedFrames: {
      push: "gold_frame",
    },
  },
});
```

### CSS Yüklenmiyor

`next.config.ts` dosyasında CSS import'unu kontrol et:

```typescript
const nextConfig = {
  // ...
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    });
    return config;
  },
};
```

### Animasyonlar Çalışmıyor

Tailwind config'e animasyonları ekle:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'confetti': 'confetti 3s linear',
        'sparkle': 'sparkle 1s ease-in-out infinite',
      },
    },
  },
};
```

## 📚 Daha Fazla Bilgi

- [Rozet Sistemi Dokümantasyonu](./ROZET_ODUL_SISTEMI.md)
- [Gamification Rehberi](./GAMIFICATION.md)
- [API Dokümantasyonu](./API_DOCS.md)
