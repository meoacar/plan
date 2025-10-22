# 📊 Analitik & Takip Sistemi

## Özellikler

### 1. Kilo Takibi
- Günlük kilo kayıtları
- İnteraktif kilo grafiği (Recharts)
- Başlangıç-güncel kilo karşılaştırması
- Kilo değişim hesaplaması
- Notlar ekleme
- Zaman aralığı filtreleme (7/30/90/180 gün)

### 2. Günlük Check-In Sistemi
- Kilo kaydı (opsiyonel)
- Enerji seviyesi (1-5)
- Motivasyon seviyesi (1-5)
- Uyku saati
- Su tüketimi (bardak)
- Egzersiz yapıldı mı?
- Diyet planına uyuldu mu?
- Günlük notlar

### 3. İlerleme Fotoğrafları
- Fotoğraf timeline'ı
- URL-based görsel yükleme (Imgur, Cloudinary, ImgBB)
- Fotoğraf çekildiğinde kilo kaydı
- Açıklama ekleme
- Herkese açık/özel seçeneği
- Fotoğraf silme

### 4. Vücut Ölçümleri
- Göğüs, bel, kalça, uyluk, kol, boyun ölçümleri
- Ölçüm grafiği (çoklu çizgi)
- Başlangıç-güncel karşılaştırma
- Değişim hesaplaması
- Zaman aralığı filtreleme (30/90/180/365 gün)

### 5. Ruh Hali Takibi
- Günlük ruh hali kaydı (1-5, emoji ile)
- Stres seviyesi (1-5)
- Ortalama ruh hali hesaplama
- Ruh hali geçmişi
- Notlar ekleme

## Kullanım

### Erişim
Giriş yapmış kullanıcılar navbar'dan "📊 İlerleme" linkine tıklayarak analitik sayfasına erişebilir.

### Sayfalar
- `/analytics` - Ana analitik dashboard
  - Genel Bakış: Check-in formu + özet grafikler
  - Kilo: Detaylı kilo takibi ve grafik
  - Ölçümler: Vücut ölçümleri ve karşılaştırma
  - Fotoğraflar: İlerleme fotoğrafları timeline
  - Ruh Hali: Mood tracker ve geçmiş

### API Endpoints

#### Kilo Takibi
- `GET /api/analytics/weight?days=30` - Kilo kayıtlarını getir
- `POST /api/analytics/weight` - Yeni kilo kaydı ekle
  ```json
  {
    "weight": 75.5,
    "note": "Bugün harika hissediyorum"
  }
  ```

#### Check-In
- `GET /api/analytics/checkin?days=30` - Check-in kayıtlarını getir
- `POST /api/analytics/checkin` - Yeni check-in ekle
  ```json
  {
    "weight": 75.5,
    "energy": 4,
    "motivation": 5,
    "sleep": 8,
    "water": 10,
    "exercise": true,
    "dietPlan": true,
    "note": "Harika bir gün!"
  }
  ```

#### İlerleme Fotoğrafları
- `GET /api/analytics/photos` - Fotoğrafları getir
- `POST /api/analytics/photos` - Yeni fotoğraf ekle
  ```json
  {
    "imageUrl": "https://i.imgur.com/example.jpg",
    "weight": 75.5,
    "description": "3 aylık ilerleme",
    "isPublic": false
  }
  ```
- `DELETE /api/analytics/photos/[id]` - Fotoğraf sil

#### Ölçümler
- `GET /api/analytics/measurements?days=90` - Ölçümleri getir
- `POST /api/analytics/measurements` - Yeni ölçüm ekle
  ```json
  {
    "chest": 95,
    "waist": 80,
    "hips": 100,
    "thigh": 55,
    "arm": 30,
    "neck": 35,
    "note": "Aylık ölçüm"
  }
  ```

#### Ruh Hali
- `GET /api/analytics/mood?days=30` - Ruh hali kayıtlarını getir
- `POST /api/analytics/mood` - Yeni ruh hali kaydı ekle
  ```json
  {
    "mood": 4,
    "stress": 2,
    "note": "Bugün çok iyiyim"
  }
  ```

## Veritabanı Modelleri

### WeightLog
```prisma
model WeightLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  weight    Float
  note      String?  @db.Text
  createdAt DateTime @default(now())
}
```

### CheckIn
```prisma
model CheckIn {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  weight      Float?
  energy      Int?
  motivation  Int?
  sleep       Int?
  water       Int?
  exercise    Boolean  @default(false)
  dietPlan    Boolean  @default(false)
  note        String?  @db.Text
  createdAt   DateTime @default(now())
}
```

### ProgressPhoto
```prisma
model ProgressPhoto {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  imageUrl    String
  weight      Float?
  description String?  @db.Text
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

### Measurement
```prisma
model Measurement {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  chest     Float?
  waist     Float?
  hips      Float?
  thigh     Float?
  arm       Float?
  neck      Float?
  note      String?  @db.Text
  createdAt DateTime @default(now())
}
```

### MoodLog
```prisma
model MoodLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  mood      Int
  stress    Int?
  note      String?  @db.Text
  createdAt DateTime @default(now())
}
```

## Bileşenler

### Ana Bileşenler
- `AnalyticsDashboard` - Ana dashboard container
- `WeightTracker` - Kilo takibi ve grafik
- `CheckInForm` - Günlük check-in formu
- `ProgressPhotos` - Fotoğraf timeline
- `MeasurementTracker` - Ölçüm takibi
- `MoodTracker` - Ruh hali takibi

### UI Bileşenleri
- `Tabs` - Tab navigasyonu
- `Card` - Kart container
- `Button` - Butonlar
- `Input` - Form inputları
- `Textarea` - Çok satırlı text alanları

## Özellikler

### Grafikler
- Recharts kütüphanesi kullanılıyor
- Responsive tasarım
- İnteraktif tooltip'ler
- Çoklu veri seti desteği

### Validasyon
- Zod ile server-side validasyon
- Kilo: 20-400 kg arası
- Ölçümler: Mantıklı aralıklar
- Ruh hali/enerji: 1-5 arası

### Güvenlik
- Tüm endpoint'ler auth korumalı
- Kullanıcı sadece kendi verilerini görebilir/düzenleyebilir
- Cascade delete (kullanıcı silindiğinde tüm verileri silinir)

### UX
- Loading states
- Success mesajları
- Compact mode (dashboard için)
- Responsive tasarım
- Türkçe tarih formatı (date-fns)

## Gelecek İyileştirmeler

- [ ] Haftalık/aylık raporlar
- [ ] PDF export
- [ ] Hedef belirleme ve takip
- [ ] Bildirimler (check-in hatırlatıcıları)
- [ ] Sosyal paylaşım (ilerleme fotoğrafları)
- [ ] Karşılaştırma görünümü (before/after)
- [ ] İstatistikler ve trendler
- [ ] Veri export (CSV/JSON)
