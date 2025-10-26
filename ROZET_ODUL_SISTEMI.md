# Rozet Ödül Sistemi - Profil Özelleştirme

## Genel Bakış
Rozetler artık sadece XP vermekle kalmayacak, aynı zamanda özel profil süsleri, arka planlar ve temalar açacak. Bu sistem kullanıcıların profillerini kişiselleştirmelerini ve başarılarını görsel olarak sergilemelerini sağlar.

## Ödül Tipleri

### 1. Profil Çerçeveleri (Profile Frames)
Profil fotoğrafının etrafında görünen özel çerçeveler:
- **Bronz Çerçeve**: İlk rozet kazanıldığında
- **Gümüş Çerçeve**: 5 rozet kazanıldığında
- **Altın Çerçeve**: 10 rozet kazanıldığında
- **Elmas Çerçeve**: 20 rozet kazanıldığında
- **Özel Çerçeveler**: Belirli rozetlerle (örn: "Glukozsuz Kahraman" rozeti yeşil çerçeve açar)

### 2. Profil Arka Planları (Profile Backgrounds)
Profil sayfasının arka plan görseli:
- **Minimal Gradient**: Varsayılan
- **Fitness Motivasyon**: 7 gün aktif rozeti ile
- **Sağlıklı Yaşam**: 30 gün aktif rozeti ile
- **Başarı Yolu**: 100 gün aktif rozeti ile
- **Özel Desenler**: Farklı kategorilerdeki rozetlerle

### 3. Profil Temaları (Profile Themes)
Profil sayfasının renk şeması:
- **Klasik**: Varsayılan (mavi-yeşil)
- **Ateş**: Kilo verme rozetleri ile (kırmızı-turuncu)
- **Okyanus**: Sosyal rozetler ile (mavi tonları)
- **Orman**: Sağlıklı beslenme rozetleri ile (yeşil tonları)
- **Gece**: Premium rozetler ile (mor-siyah)

### 4. Profil Rozetleri (Profile Badges)
Profilde sergilenebilecek özel ikonlar:
- **Yıldız**: En çok beğenilen plan
- **Kalp**: Topluluk yardımcısı
- **Ateş**: Streak ustası
- **Taç**: Lider

### 5. Animasyonlar
Özel profil animasyonları:
- **Parıltı Efekti**: Yeni rozet kazanıldığında
- **Seviye Atlama**: Level up olunca
- **Başarı Konfetisi**: Önemli milestone'larda

## Rozet-Ödül Eşleştirmesi

### Başlangıç Rozetleri
- `FIRST_PLAN`: Bronz çerçeve + "Başlangıç" teması
- `PROFILE_COMPLETE`: Profil tamamlama çerçevesi

### Sosyal Rozetler
- `LIKES_10`: Okyanus teması kilidi açılır
- `LIKES_50`: Gümüş sosyal çerçeve
- `LIKES_100`: Altın sosyal çerçeve + "Popüler" arka planı
- `COMMUNITY_HELPER`: Kalp rozeti + özel yardımcı çerçevesi

### Aktivite Rozetleri
- `ACTIVE_7_DAYS`: "Fitness Motivasyon" arka planı
- `ACTIVE_30_DAYS`: "Sağlıklı Yaşam" arka planı + Gümüş aktivite çerçevesi
- `ACTIVE_100_DAYS`: "Başarı Yolu" arka planı + Elmas çerçeve + Ateş rozeti

### Kilo Verme Rozetleri
- `WEIGHT_LOSS_HERO`: "Ateş" teması + Taç rozeti + Özel kahraman çerçevesi

### Günah Yemeği Rozetleri
- `CHEAT_FREE_7_DAYS`: Yeşil "Disiplin" çerçevesi
- `CHEAT_FREE_30_DAYS`: "Orman" teması + Altın disiplin çerçevesi
- `FAST_FOOD_FREE_30_DAYS`: Özel "Sağlıklı" arka planı
- `BALANCED_RECOVERY`: Denge rozeti

### Tarif Rozetleri
- `RECIPE_MASTER`: Şef çerçevesi + "Mutfak" teması
- `RECIPE_LIKES_100`: Altın şef çerçevesi

### Grup & Challenge Rozetleri
- `CHALLENGE_WINNER`: Taç rozeti + Zafer çerçevesi
- `GROUP_ADMIN`: Lider rozeti + Yönetici çerçevesi

## Veritabanı Yapısı

```prisma
model ProfileCustomization {
  id              String   @id @default(cuid())
  userId          String   @unique
  activeFrame     String?  // Aktif çerçeve ID
  activeBackground String? // Aktif arka plan ID
  activeTheme     String?  // Aktif tema ID
  activeBadges    String[] // Profilde gösterilen rozetler (max 3)
  unlockedFrames  String[] // Açılmış çerçeveler
  unlockedBackgrounds String[] // Açılmış arka planlar
  unlockedThemes  String[] // Açılmış temalar
  unlockedBadges  String[] // Açılmış özel rozetler
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model CustomizationItem {
  id          String   @id @default(cuid())
  type        CustomizationType // FRAME, BACKGROUND, THEME, BADGE
  code        String   @unique  // Benzersiz kod (örn: "bronze_frame")
  name        String   // Görünen isim
  description String?  // Açıklama
  imageUrl    String?  // Görsel URL
  cssClass    String?  // CSS sınıfı
  colors      Json?    // Tema renkleri
  unlockCondition String // Nasıl açılır
  badgeType   BadgeType? // Hangi rozet ile açılır
  badgeCount  Int?     // Kaç rozet gerekir
  isDefault   Boolean  @default(false)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
}

enum CustomizationType {
  FRAME
  BACKGROUND
  THEME
  BADGE
  ANIMATION
}
```

## API Endpoints

### Özelleştirme Bilgilerini Getir
```typescript
GET /api/profile/customization
// Kullanıcının açtığı ve aktif özelleştirmeleri döner
```

### Özelleştirme Uygula
```typescript
POST /api/profile/customization
{
  "activeFrame": "gold_frame",
  "activeBackground": "fitness_motivation",
  "activeTheme": "fire",
  "activeBadges": ["star", "heart", "crown"]
}
```

### Mevcut Öğeleri Listele
```typescript
GET /api/customization/items?type=FRAME
// Tüm çerçeveleri listeler (kilitli/açık durumlarıyla)
```

## UI Bileşenleri

### 1. Profil Özelleştirme Sayfası
- Çerçeve seçici
- Arka plan galerisi
- Tema önizlemesi
- Rozet vitrin alanı

### 2. Rozet Kazanma Modalı
- Animasyonlu rozet gösterimi
- Açılan ödüllerin listesi
- "Şimdi Kullan" butonu

### 3. Profil Önizleme
- Gerçek zamanlı önizleme
- Değişiklikleri kaydet/iptal

## Gamification Özellikleri

### Koleksiyon Sistemi
- Tüm çerçeveleri topla: Özel "Koleksiyoncu" rozeti
- Tüm temaları aç: "Stil İkonu" rozeti
- Tüm arka planları aç: "Dekoratör" rozeti

### Nadir Öğeler
Bazı öğeler sadece özel etkinliklerde veya kombinasyonlarla açılır:
- **Gökkuşağı Çerçeve**: Tüm kategorilerden en az 1 rozet
- **Galaksi Arka Plan**: 50+ rozet
- **Efsane Tema**: Tüm challenge rozetleri

### Sezonluk Öğeler
- Yılbaşı çerçevesi
- Yaz teması
- Ramazan arka planı

## Teknik Detaylar

### Çerçeve Uygulaması
```css
.profile-avatar-frame {
  position: relative;
}

.profile-avatar-frame::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: var(--frame-gradient);
  z-index: -1;
}
```

### Tema Uygulaması
```typescript
const themes = {
  classic: {
    primary: '#10b981',
    secondary: '#3b82f6',
    accent: '#8b5cf6'
  },
  fire: {
    primary: '#ef4444',
    secondary: '#f97316',
    accent: '#fbbf24'
  },
  // ...
}
```

## Kullanıcı Deneyimi

1. **Rozet Kazanma**: Kullanıcı rozet kazandığında modal açılır
2. **Ödül Gösterimi**: Açılan özelleştirmeler gösterilir
3. **Hemen Uygula**: Tek tıkla aktif edilebilir
4. **Profil Ziyareti**: Diğer kullanıcılar özel profilleri görür
5. **Sosyal Prestij**: Nadir öğeler sosyal statü sağlar

## Gelecek Özellikler

- Özel animasyonlu çerçeveler
- Profil müziği (opsiyonel)
- 3D avatar özelleştirme
- NFT entegrasyonu (opsiyonel)
- Özelleştirme paylaşımı
- Özelleştirme yarışmaları
