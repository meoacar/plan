# Hesap Verebilirlik Partneri Sistemi - Kurulum Rehberi

## Kurulum Adımları

### 1. Veritabanı Migration

Yeni veritabanı modellerini eklemek için migration çalıştırın:

```bash
npx prisma migrate dev --name add_accountability_partnership
```

### 2. Prisma Client Güncelleme

Migration sonrası Prisma client'ı güncelleyin:

```bash
npx prisma generate
```

### 3. Gamification Seed (Opsiyonel)

Yeni rozetleri eklemek için gamification seed'i çalıştırın:

```bash
npm run db:seed:gamification
```

### 4. Development Server

Uygulamayı başlatın:

```bash
npm run dev
```

## Kullanım

### Partner Bulma

1. Navbar'dan "Partnerler" linkine tıklayın
2. "Yeni Partner Bul" butonuna tıklayın
3. Arama ve filtreleme yaparak uygun kullanıcıları bulun
4. "Talep Gönder" butonuna tıklayarak partner talebi gönderin

### Partner Talebi Kabul Etme

1. "Partnerler" sayfasında "Bekleyen Talepler" bölümünü kontrol edin
2. Gelen talepleri "Kabul Et" veya "Reddet" butonlarıyla yanıtlayın

### Partner Dashboard

1. Aktif partnerlerinizden birine tıklayın
2. Partner dashboard'da şunları yapabilirsiniz:
   - İstatistikleri karşılaştırın
   - Mesajlaşın
   - Ortak hedefler oluşturun
   - Partner check-in'lerini görüntüleyin

## Özellikler

### İstatistikler

- Karşılaştırmalı kilo grafikleri
- İlerleme yüzdeleri
- Motivasyon mesajları

### Mesajlaşma

- Gerçek zamanlı mesajlaşma
- Mesaj geçmişi
- Okundu bilgisi

### Ortak Hedefler

- Hedef oluşturma
- Hedef tamamlama
- XP kazanımı (her iki partner için)

### Check-in Takibi

- Partner check-in'lerini görüntüleme
- Destek notu ekleme
- Detaylı check-in bilgileri

## Gamification Entegrasyonu

### Yeni Rozetler

- **İlk Partner** (100 XP) - İlk partnerini edindiğinde
- **Destekleyici Partner** (200 XP) - 50 destek notu eklediğinde
- **Hedef Avcısı** (300 XP) - 10 ortak hedef tamamladığında
- **Uzun Soluklu Partner** (500 XP) - 90 gün aktif partnerlik
- **Motivasyon Kaynağı** (250 XP) - 100 motivasyon mesajı gönderdiğinde

### XP Kazanımları

- Partner talebi gönderme: +10 XP
- Partner talebi kabul etme: +20 XP
- Mesaj gönderme: +5 XP
- Ortak hedef oluşturma: +15 XP
- Ortak hedef tamamlama: +50 XP (her iki partner)

## API Endpoints

### Partner Yönetimi

- `POST /api/partnerships` - Partner talebi gönder
- `GET /api/partnerships` - Tüm partnerlikleri listele
- `GET /api/partnerships/[id]` - Partnerlik detayı
- `PATCH /api/partnerships/[id]` - Partner talebini kabul/reddet
- `DELETE /api/partnerships/[id]` - Partnerliği sonlandır

### Mesajlaşma

- `POST /api/partnerships/[id]/messages` - Mesaj gönder
- `GET /api/partnerships/[id]/messages` - Mesajları listele

### Ortak Hedefler

- `POST /api/partnerships/[id]/goals` - Ortak hedef oluştur
- `GET /api/partnerships/[id]/goals` - Ortak hedefleri listele
- `PATCH /api/partnerships/[id]/goals/[goalId]` - Hedefi tamamla
- `DELETE /api/partnerships/[id]/goals/[goalId]` - Hedefi sil

### Partner Arama

- `GET /api/partnerships/find` - Partner ara

## Güvenlik

- Tüm endpoint'ler authentication gerektirir
- Sadece ilgili kullanıcılar partnerlik bilgilerine erişebilir
- Rate limiting uygulanmıştır
- XSS koruması mevcuttur

## Sorun Giderme

### Migration Hatası

Eğer migration hatası alırsanız:

```bash
npx prisma migrate reset
npx prisma migrate dev
npm run db:seed
npm run db:seed:gamification
```

### Prisma Client Hatası

Eğer Prisma client hatası alırsanız:

```bash
npx prisma generate
```

### TypeScript Hatası

Eğer TypeScript hatası alırsanız:

```bash
npm run build
```

## Gelecek Geliştirmeler

- [ ] Real-time bildirimler (WebSocket)
- [ ] Grup partnerlik (3+ kişi)
- [ ] Video call entegrasyonu
- [ ] Haftalık partner raporu (email)
- [ ] Partner eşleştirme algoritması (AI destekli)
- [ ] Partner challenge'ları (yarışmalar)
- [ ] Partner liderlik tablosu

## Destek

Herhangi bir sorun yaşarsanız veya öneriniz varsa lütfen bir issue açın.

