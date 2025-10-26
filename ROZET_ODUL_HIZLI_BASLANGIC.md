# 🎨 Rozet Ödül Sistemi - Hızlı Başlangıç

## ✨ Özellikler

Rozetler artık sadece XP vermekle kalmıyor, aynı zamanda:
- 🖼️ **Profil Çerçeveleri**: Bronz, gümüş, altın, elmas ve özel çerçeveler
- 🎨 **Arka Planlar**: Fitness, sağlıklı yaşam, başarı yolu ve daha fazlası
- 🎭 **Temalar**: Ateş, okyanus, orman, gece ve efsane temaları
- ⭐ **Özel Rozetler**: Yıldız, kalp, ateş, taç ve şef rozetleri
- ✨ **Animasyonlar**: Parıltı efektleri, konfeti ve seviye atlama animasyonları

## 🚀 5 Dakikada Kurulum

### 1. Veritabanını Güncelle

```bash
# Migration oluştur ve uygula
npx prisma migrate dev --name add_profile_customization

# Veya sadece push
npx prisma db push
```

### 2. Özelleştirme Öğelerini Ekle

```bash
npm run db:seed:customization
```

Bu komut ekler:
- ✅ 9 çerçeve
- ✅ 6 arka plan
- ✅ 6 tema
- ✅ 5 özel rozet

### 3. CSS'i İçe Aktar

`src/app/layout.tsx` veya `src/app/globals.css`:

```typescript
import '@/styles/profile-customization.css';
```

### 4. Test Et

```bash
npm run test:customization
```

## 📖 Kullanım Örnekleri

### Profil Özelleştirme Sayfası

```typescript
// src/app/profile/customization/page.tsx
import ProfileCustomization from "@/components/profile/ProfileCustomization";

export default function Page() {
  return <ProfileCustomization />;
}
```

### Rozet Kazanma Modalı

```typescript
import BadgeUnlockedModal from "@/components/badges/BadgeUnlockedModal";

<BadgeUnlockedModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  badgeName="Glukozsuz Kahraman"
  badgeIcon="🏆"
  xpReward={50}
  unlockedItems={[
    {
      type: "FRAME",
      code: "discipline_frame",
      name: "Disiplin Çerçevesi",
      description: "Yeşil özel çerçeve",
      imageUrl: null,
    }
  ]}
/>
```

### Profilde Çerçeve Göster

```typescript
import { getUserCustomization } from "@/lib/unlock-customization";

const customization = await getUserCustomization(userId);

<div className={`profile-avatar-frame ${customization.activeFrame?.cssClass || 'frame-default'}`}>
  <img src={user.image} alt={user.name} className="rounded-full" />
</div>
```

## 🎯 Rozet-Ödül Eşleştirmesi

| Rozet | Açılan Öğeler |
|-------|---------------|
| İlk Rozet | Bronz Çerçeve |
| 5 Rozet | Gümüş Çerçeve |
| 10 Rozet | Altın Çerçeve |
| 20 Rozet | Elmas Çerçeve + Gece Teması |
| 7 Gün Aktif | Fitness Motivasyon Arka Planı |
| 30 Gün Aktif | Sağlıklı Yaşam Arka Planı |
| 100 Gün Aktif | Başarı Yolu Arka Planı + Ateş Rozeti |
| Glukozsuz Kahraman | Disiplin Çerçevesi (Yeşil) |
| 30 Gün Günah Yok | Orman Teması |
| Fast Food Yok | Sağlıklı Beslenme Arka Planı |
| Kilo Verme Kahramanı | Ateş Teması + Kahraman Çerçevesi + Taç Rozeti |
| 100 Beğeni | Okyanus Teması + Yıldız Rozeti |
| Topluluk Yardımcısı | Kalp Rozeti |
| Tarif Ustası | Şef Çerçevesi + Şef Rozeti |
| Challenge Kazananı | Efsane Teması + Taç Rozeti |

## 🔧 API Endpoints

### Özelleştirmeleri Getir
```typescript
GET /api/profile/customization
```

Dönen veri:
```json
{
  "customization": {
    "activeFrame": "gold_frame",
    "activeBackground": "fitness_motivation_bg",
    "activeTheme": "fire_theme",
    "activeBadges": ["star_badge", "heart_badge"]
  },
  "items": [...],
  "badgeCount": 15
}
```

### Özelleştirme Uygula
```typescript
POST /api/profile/customization
{
  "activeFrame": "gold_frame",
  "activeBackground": "fitness_motivation_bg",
  "activeTheme": "fire_theme",
  "activeBadges": ["star_badge", "heart_badge", "crown_badge"]
}
```

## 🎨 Yeni Öğe Ekleme

### 1. Veritabanına Ekle

```typescript
await prisma.customizationItem.create({
  data: {
    type: "FRAME",
    code: "my_special_frame",
    name: "Özel Çerçevem",
    description: "Çok özel bir çerçeve",
    cssClass: "frame-my-special",
    colors: { gradient: "linear-gradient(135deg, #ff0080 0%, #ff8c00 100%)" },
    unlockCondition: "Özel rozet ile",
    badgeType: "MY_SPECIAL_BADGE",
    isSpecial: true,
    order: 50,
  },
});
```

### 2. CSS Ekle

```css
.frame-my-special {
  background: linear-gradient(135deg, #ff0080 0%, #ff8c00 100%);
  box-shadow: 0 0 30px rgba(255, 0, 128, 0.7);
  animation: mySpecialGlow 2s ease-in-out infinite;
}

@keyframes mySpecialGlow {
  0%, 100% { box-shadow: 0 0 30px rgba(255, 0, 128, 0.7); }
  50% { box-shadow: 0 0 40px rgba(255, 140, 0, 0.9); }
}
```

## 📊 İstatistikler

Sistemde toplam:
- 9 çerçeve (4 standart + 5 özel)
- 6 arka plan (2 standart + 4 özel)
- 6 tema (1 standart + 5 özel)
- 5 özel profil rozeti

## 🐛 Sorun Giderme

### "Öğeler açılmıyor"
```bash
# Rozet sayısı kontrolünü manuel çalıştır
npm run test:customization
```

### "CSS yüklenmiyor"
`src/app/layout.tsx` dosyasında import'u kontrol et:
```typescript
import '@/styles/profile-customization.css';
```

### "Modal görünmüyor"
Lucide-react paketinin yüklü olduğundan emin ol:
```bash
npm install lucide-react
```

## 📚 Daha Fazla Bilgi

- [Detaylı Dokümantasyon](./ROZET_ODUL_SISTEMI.md)
- [Kurulum Rehberi](./ROZET_ODUL_KURULUM.md)
- [API Referansı](./API_DOCS.md)

## 🎉 Başarılar!

Artık kullanıcılarınız rozetler kazanarak profillerini özelleştirebilir! 🚀
