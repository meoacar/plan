# Hesap Verebilirlik Partneri Sistemi

## Genel Bakış

Hesap verebilirlik partneri sistemi, kullanıcıların birbirlerini takip edip destekleyebilecekleri bir ikili eşleşme sistemidir. Bu sistem, kullanıcıların motivasyonunu artırmak ve hedeflerine ulaşmalarında birbirlerine destek olmalarını sağlamak için tasarlanmıştır.

## Özellikler

### 1. Partner Eşleşme
- Kullanıcılar diğer kullanıcılara partner talebi gönderebilir
- Partner talepleri kabul veya reddedilebilir
- Bir kullanıcının aynı anda birden fazla partneri olabilir
- Partner ilişkisi karşılıklıdır (ikili sistem)

### 2. Partner Dashboard
- Partnerlerin ilerlemesini görüntüleme
- Kilo grafikleri karşılaştırması
- Check-in geçmişi
- Ortak hedefler ve başarılar
- Partner aktivite akışı

### 3. Karşılıklı Check-in Sistemi
- Partnerler birbirlerinin günlük check-in'lerini görebilir
- Check-in'lere yorum ve destek mesajı eklenebilir
- Check-in streak'leri (ardışık günler) takibi
- Bildirimler (partner check-in yaptığında)

### 4. Destek Mesajları
- Partnerler arasında özel mesajlaşma
- Motivasyon mesajları
- Emoji ve GIF desteği
- Mesaj bildirimleri

### 5. Ortak Hedefler
- Partnerler birlikte hedef belirleyebilir
- Haftalık/aylık ortak hedefler
- Hedef tamamlama takibi
- Başarı rozetleri

## Veritabanı Modelleri

### AccountabilityPartnership
```prisma
model AccountabilityPartnership {
  id          String                    @id @default(cuid())
  requesterId String                    // Talebi gönderen
  requester   User                      @relation("PartnerRequester", fields: [requesterId], references: [id], onDelete: Cascade)
  partnerId   String                    // Talebi alan
  partner     User                      @relation("PartnerReceiver", fields: [partnerId], references: [id], onDelete: Cascade)
  status      PartnershipStatus         @default(PENDING)
  message     String?                   @db.Text // İlk talep mesajı
  sharedGoals PartnershipGoal[]
  messages    PartnershipMessage[]
  checkIns    PartnershipCheckIn[]
  createdAt   DateTime                  @default(now())
  acceptedAt  DateTime?
  endedAt     DateTime?

  @@unique([requesterId, partnerId])
  @@index([requesterId, status])
  @@index([partnerId, status])
}

enum PartnershipStatus {
  PENDING   // Beklemede
  ACTIVE    // Aktif
  ENDED     // Sonlandırılmış
  REJECTED  // Reddedilmiş
}
```

### PartnershipGoal
```prisma
model PartnershipGoal {
  id             String                   @id @default(cuid())
  partnershipId  String
  partnership    AccountabilityPartnership @relation(fields: [partnershipId], references: [id], onDelete: Cascade)
  title          String
  description    String?                  @db.Text
  targetDate     DateTime
  completed      Boolean                  @default(false)
  completedAt    DateTime?
  createdBy      String                   // Hedefi oluşturan kullanıcı
  createdAt      DateTime                 @default(now())

  @@index([partnershipId, completed])
}
```

### PartnershipMessage
```prisma
model PartnershipMessage {
  id            String                   @id @default(cuid())
  partnershipId String
  partnership   AccountabilityPartnership @relation(fields: [partnershipId], references: [id], onDelete: Cascade)
  senderId      String
  content       String                   @db.Text
  isRead        Boolean                  @default(false)
  readAt        DateTime?
  createdAt     DateTime                 @default(now())

  @@index([partnershipId, createdAt])
  @@index([senderId])
}
```

### PartnershipCheckIn
```prisma
model PartnershipCheckIn {
  id            String                   @id @default(cuid())
  partnershipId String
  partnership   AccountabilityPartnership @relation(fields: [partnershipId], references: [id], onDelete: Cascade)
  checkInId     String
  checkIn       CheckIn                  @relation(fields: [checkInId], references: [id], onDelete: Cascade)
  supportNote   String?                  @db.Text // Partner destek notu
  createdAt     DateTime                 @default(now())

  @@index([partnershipId, createdAt])
}
```

## API Endpoints

### Partner Yönetimi
- `POST /api/partnerships` - Partner talebi gönder
- `GET /api/partnerships` - Tüm partnerlik ilişkilerini listele
- `PATCH /api/partnerships/[id]` - Partner talebini kabul/reddet
- `DELETE /api/partnerships/[id]` - Partnerliği sonlandır

### Mesajlaşma
- `POST /api/partnerships/[id]/messages` - Mesaj gönder
- `GET /api/partnerships/[id]/messages` - Mesajları listele
- `PATCH /api/partnerships/[id]/messages/[messageId]` - Mesajı okundu olarak işaretle

### Ortak Hedefler
- `POST /api/partnerships/[id]/goals` - Ortak hedef oluştur
- `GET /api/partnerships/[id]/goals` - Ortak hedefleri listele
- `PATCH /api/partnerships/[id]/goals/[goalId]` - Hedefi tamamla
- `DELETE /api/partnerships/[id]/goals/[goalId]` - Hedefi sil

### Check-in Desteği
- `POST /api/partnerships/[id]/check-ins/[checkInId]/support` - Check-in'e destek notu ekle
- `GET /api/partnerships/[id]/check-ins` - Partner check-in'lerini listele

## Sayfalar

### Partner Dashboard (`/partnerships`)
- Aktif partnerler listesi
- Bekleyen talepler
- Partner arama ve davet
- Genel istatistikler

### Partner Detay (`/partnerships/[id]`)
- Partner profili
- Karşılaştırmalı kilo grafikleri
- Check-in geçmişi
- Ortak hedefler
- Mesajlaşma alanı
- Destek notları

### Partner Arama (`/partnerships/find`)
- Kullanıcı arama
- Filtreler (hedef kilo, başlangıç kilosu, konum)
- Partner önerileri (benzer hedefler)

## Bildirimler

- Partner talebi alındığında
- Partner talebi kabul/reddedildiğinde
- Partner check-in yaptığında
- Yeni mesaj alındığında
- Ortak hedef tamamlandığında
- Partner streak kaybettiğinde (destek için)

## Gamification Entegrasyonu

### Yeni Rozetler
- **FIRST_PARTNER** - İlk partner edinme
- **SUPPORTIVE_PARTNER** - 50 destek notu
- **GOAL_ACHIEVER** - 10 ortak hedef tamamlama
- **LONG_TERM_PARTNER** - 90 gün aktif partnerlik
- **MOTIVATOR** - 100 motivasyon mesajı

### XP Kazanımları
- Partner talebi gönderme: +10 XP
- Partner talebi kabul etme: +20 XP
- Destek notu ekleme: +5 XP
- Ortak hedef oluşturma: +15 XP
- Ortak hedef tamamlama: +50 XP
- Günlük mesajlaşma: +5 XP

## Güvenlik ve Gizlilik

- Kullanıcılar istedikleri zaman partnerliği sonlandırabilir
- Mesajlar şifrelenmez ama sadece ilgili kullanıcılar görebilir
- Kullanıcılar profil gizlilik ayarlarından partner taleplerini kapatabilir
- Spam ve taciz bildirimi sistemi
- Engelleme özelliği

## Kullanım Senaryoları

### Senaryo 1: İlk Partner Edinme
1. Kullanıcı partner arama sayfasına gider
2. Benzer hedeflere sahip kullanıcıları görür
3. Bir kullanıcıya partner talebi gönderir
4. Karşı taraf talebi kabul eder
5. Partner dashboard'a yönlendirilir

### Senaryo 2: Günlük Destek
1. Kullanıcı günlük check-in yapar
2. Partner bildirim alır
3. Partner check-in'i görüntüler
4. Destek notu ekler
5. Kullanıcı destek notunu görür ve motive olur

### Senaryo 3: Ortak Hedef
1. Partnerler ortak hedef belirler (örn: "Bu hafta 3 gün spor")
2. Her ikisi de ilerlemelerini takip eder
3. Hedef tamamlandığında her ikisi de XP kazanır
4. Başarı rozeti alırlar

## Teknik Notlar

- Real-time güncellemeler için WebSocket veya Server-Sent Events kullanılabilir
- Mesajlaşma için sayfalama (infinite scroll)
- Check-in karşılaştırmaları için grafik kütüphanesi (Recharts)
- Bildirimler için push notification desteği (opsiyonel)

## Gelecek Geliştirmeler

- Grup partnerlik (3+ kişi)
- Video call entegrasyonu
- Haftalık partner raporu (email)
- Partner eşleştirme algoritması (AI destekli)
- Partner liderlik tablosu
- Partner challenge'ları (yarışmalar)

