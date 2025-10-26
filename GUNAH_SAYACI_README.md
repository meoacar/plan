# 😈 Yemek Günah Sayacı

Mizahi ve oyunlaştırılmış beslenme takip sistemi. Kaçamak yemeklerini takip et, farkındalık yarat, rozetler kazan!

## 🎯 Özellikler

### ✅ Temel Özellikler
- **Kaçamak Ekleme**: 5 kategori (Tatlı, Fast food, Gazlı içecek, Alkol, Diğer)
- **Mizahi Tepkiler**: Her kaçamak için eğlenceli mesajlar
- **Haftalık/Aylık Özet**: İstatistikler ve dağılım
- **Takvim Görünümü**: Emoji sticker'larla görsel takip
- **Temiz Streak**: Kaç gündür kaçamak yapmadığını göster

### 🏆 Gamifikasyon
- **Rozet Sistemi**:
  - 🥇 Glukozsuz Kahraman (7 gün temiz) - 50 XP
  - 💎 Süper Disiplinli (30 gün temiz) - 200 XP
  - 🥈 Yağsavar (30 gün fast food yok) - 100 XP
  - 🥉 Dengeli Dahi (3 gün telafi) - 30 XP
  
  **Not**: Rozetler sadece en az bir kere günah yemeği ekleyen kullanıcılara verilir.

- **Challenge Sistemi**:
  - Haftalık limit belirleme
  - Eğlenceli ceza tanımlama
  - Progress bar takibi
  - Otomatik tamamlanma kontrolü

- **XP & Vicdan Barı**:
  - Kaçamak sayısına göre renk değişimi
  - Mizahi mesajlar
  - Melek puanı hesaplama

### 📊 Takip & Analiz
- Haftalık/Aylık görünüm
- Kategori bazlı istatistikler
- Sağlıklı gün sayısı
- Melek ve şeytan animasyonları

### 🔔 Bildirimler
- **Haftalık Özet** (Her Pazar 20:00):
  - Haftalık kaçamak özeti
  - Sağlıklı gün sayısı
  - Motivasyon mesajları
  
- **Challenge Sonuçları** (Her Pazar 21:00):
  - Başarı/başarısızlık bildirimi
  - Ceza hatırlatması

- **Yeni Rozet**:
  - Popup animasyonu
  - XP kazanımı gösterimi

## 🚀 Kurulum

### 1. Veritabanı Migration
```bash
cd zayiflamaplanim
npx prisma db push
```

### 2. Rozet Seed
```bash
npx tsx prisma/seed-cheat-badges.ts
```

### 3. Environment Variables
`.env` dosyasına ekleyin:
```env
CRON_SECRET=your-secret-key-here
```

### 4. Vercel Cron Jobs
`vercel.json` dosyasında tanımlı:
- Haftalık özet: Her Pazar 20:00
- Challenge kontrolü: Her Pazar 21:00

## 📱 Kullanım

### Kaçamak Ekleme
1. "Kaçamak Ekle" butonuna tıkla
2. Kategori seç (5 seçenek)
3. İsteğe bağlı not ekle
4. Mizahi tepki mesajını gör

### Challenge Oluşturma
1. "Challenge Oluştur" butonuna tıkla
2. Haftalık limit belirle (örn: 2 kaçamak)
3. Ceza tanımla (örn: "10 squat yap")
4. Hafta boyunca takip et

### Rozetleri Görüntüleme
- Kazanılan rozetler renkli gösterilir
- Kilitli rozetler gri ve bulanık
- Her rozet XP değeri gösterir

## 🎨 Tasarım Özellikleri

### Renkler
- **Ana Gradient**: Orange → Red → Purple
- **Başarı**: Green
- **Uyarı**: Yellow/Orange
- **Hata**: Red
- **Rozet**: Gradient (type'a göre)

### Animasyonlar
- **Pulse Glow**: 7+ gün streak için
- **Bounce In**: Yeni rozet kazanımı
- **Fade In**: Modal açılışları
- **Smooth Transitions**: Tüm hover efektleri

### Responsive
- Mobile-first tasarım
- Grid layout (1-4 columns)
- Flexible buttons
- Touch-friendly

## 🔧 API Endpoints

### Kaçamak İşlemleri
```typescript
// Kaçamak ekle
POST /api/cheat-meals
Body: { type: CheatType, note?: string }

// Kaçamakları listele
GET /api/cheat-meals?period=week|month
Response: { cheatMeals: [], stats: [] }
```

### Challenge İşlemleri
```typescript
// Challenge oluştur
POST /api/cheat-meals/challenge
Body: { limit: number, penalty?: string }

// Challenge durumu
GET /api/cheat-meals/challenge
Response: { challenge, cheatCount, exceeded }
```

### Rozet İşlemleri
```typescript
// Rozetleri getir
GET /api/cheat-meals/badges
Response: { badges: [] }

// Yeni rozet kontrolü
POST /api/cheat-meals/badges
Response: { newBadges: [] }
```

### Cron Jobs
```typescript
// Haftalık özet (Her Pazar 20:00)
GET /api/cron/weekly-cheat-summary
Header: Authorization: Bearer ${CRON_SECRET}

// Challenge kontrolü (Her Pazar 21:00)
GET /api/cron/check-challenges
Header: Authorization: Bearer ${CRON_SECRET}
```

## 📦 Dosya Yapısı

```
src/
├── app/
│   ├── api/
│   │   ├── cheat-meals/
│   │   │   ├── route.ts              # Kaçamak CRUD
│   │   │   ├── challenge/route.ts    # Challenge işlemleri
│   │   │   └── badges/route.ts       # Rozet işlemleri
│   │   └── cron/
│   │       ├── weekly-cheat-summary/route.ts
│   │       └── check-challenges/route.ts
│   └── gunah-sayaci/
│       └── page.tsx                  # Ana sayfa
├── components/
│   ├── cheat-meal-tracker.tsx        # Ana tracker
│   ├── cheat-meal-calendar.tsx       # Takvim
│   ├── cheat-meal-challenge.tsx      # Challenge
│   └── cheat-meal-badges.tsx         # Rozetler
└── lib/
    └── cheat-meal-badges.ts          # Rozet logic

prisma/
├── schema.prisma                     # DB modelleri
└── seed-cheat-badges.ts              # Rozet seed
```

## 🎭 Mizahi Mesajlar

### Kategori Tepkileri
- **Tatlı**: "Tatlı da haklı… ama sen daha haklısın 🍫"
- **Fast food**: "Bu seferlik saymıyoruz, ama patates kızartması seni izliyor 👀"
- **Gazlı içecek**: "Köpük değil motivasyon patlasın 🥂"
- **Alkol**: "Bir yudum keyif, ama suyla barış imzala 💧"
- **Diğer**: "Kaydettik, ama yargılamıyoruz 😉"

### Vicdan Barı
- 0 kaçamak: "Tertemiz! 🌟"
- 1-2 kaçamak: "İyi durumda 👍"
- 3-4 kaçamak: "Biraz doldu 😅"
- 5+ kaçamak: "Epey doldu! 😰"

### Melek & Şeytan
- **Melek** (3+ gün temiz): "Aferin, 3 gündür kaçamak yok! 💪"
- **Şeytan** (kaçamak var): "Sadece bir dilim kekti be 🙄"

## 🐛 Troubleshooting

### Rozetler görünmüyor
```bash
# Prisma client'ı yeniden generate et
npx prisma generate

# Rozet seed'ini çalıştır
npx tsx prisma/seed-cheat-badges.ts
```

### Cron job çalışmıyor
1. `CRON_SECRET` environment variable'ını kontrol et
2. Vercel dashboard'da cron logs'u incele
3. Authorization header'ı doğrula

### Bildirimler gelmiyor
1. Kullanıcı bildirim ayarlarını kontrol et
2. `NotificationPreference` tablosunu kontrol et
3. Cron job loglarını incele

## 📈 Gelecek Özellikler

- [ ] Sosyal paylaşım
- [ ] Arkadaşlarla karşılaştırma
- [ ] Aylık/yıllık raporlar
- [ ] Grafik ve chart'lar
- [ ] Export/Import özelliği
- [ ] Özel kategoriler
- [ ] Fotoğraf ekleme

## 🤝 Katkıda Bulunma

1. Feature branch oluştur
2. Değişiklikleri commit et
3. Pull request aç
4. Review bekle

## 📝 Lisans

Bu proje Zayıflama Planım platformunun bir parçasıdır.

---

**Not**: Bu sistem mizahi amaçlıdır ve kullanıcıları suçlamak yerine farkındalık yaratmayı hedefler. 😊
