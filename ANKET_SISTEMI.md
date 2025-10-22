# 📊 Anket ve Oylama Sistemi

## Genel Bakış

Kullanıcıların görüşlerini paylaşabileceği, topluluk odaklı bir anket sistemi.

## Özellikler

### ✅ Temel Özellikler
- **Anket Oluşturma** (Tüm kullanıcılar)
- **Çoklu/Tekli Seçim** desteği
- **Gerçek Zamanlı Sonuçlar** (yüzde ve oy sayısı)
- **Bitiş Tarihi** (zorunlu - 1 gün ile 3 ay arası)
- **Aktif/Pasif** durum yönetimi (sadece admin)
- **Oy Değiştirme** (kullanıcı oyunu güncelleyebilir)
- **Profil Entegrasyonu** (kullanıcı profilinde anketler görünür)

### 🎨 Kullanıcı Arayüzü
- Modern, responsive tasarım
- İlerleme çubukları ile görsel sonuçlar
- Mobil uyumlu
- Gerçek zamanlı güncelleme

## Veritabanı Modeli

```prisma
model Poll {
  id            String       @id @default(cuid())
  question      String
  description   String?      @db.Text
  isActive      Boolean      @default(true)
  isPublic      Boolean      @default(true)
  allowMultiple Boolean      @default(false)
  endsAt        DateTime?
  createdBy     String
  creator       User         @relation(fields: [createdBy], references: [id])
  options       PollOption[]
  votes         PollVote[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model PollOption {
  id        String     @id @default(cuid())
  pollId    String
  poll      Poll       @relation(fields: [pollId], references: [id], onDelete: Cascade)
  text      String
  order     Int        @default(0)
  votes     PollVote[]
  createdAt DateTime   @default(now())
}

model PollVote {
  id        String     @id @default(cuid())
  pollId    String
  poll      Poll       @relation(fields: [pollId], references: [id], onDelete: Cascade)
  optionId  String
  option    PollOption @relation(fields: [optionId], references: [id], onDelete: Cascade)
  userId    String
  voter     User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime   @default(now())

  @@unique([pollId, optionId, userId])
}
```

## API Endpoints

### GET /api/polls
Anketleri listele
- Query params: `active=true`, `limit=10`

### POST /api/polls
Yeni anket oluştur (Admin only)
```json
{
  "question": "Soru metni",
  "description": "Açıklama (opsiyonel)",
  "allowMultiple": false,
  "endsAt": "2025-12-31T23:59:59Z",
  "options": ["Seçenek 1", "Seçenek 2", "Seçenek 3"]
}
```

### GET /api/polls/[id]
Tek anket detayı

### PATCH /api/polls/[id]
Anket güncelle (Admin only)
```json
{
  "isActive": true,
  "endsAt": "2025-12-31T23:59:59Z"
}
```

### DELETE /api/polls/[id]
Anket sil (Admin only)

### POST /api/polls/[id]/vote
Oy ver
```json
{
  "optionIds": ["option_id_1", "option_id_2"]
}
```

## Sayfalar

### /polls
Tüm aktif anketleri listeler
- Kullanıcılar oy verebilir
- Sonuçları görüntüleyebilir
- Giriş yapmadan sadece görüntüleme
- "Anket Oluştur" butonu (giriş yapanlara)

### /polls/create
Yeni anket oluşturma sayfası
- Tüm kullanıcılar erişebilir
- Soru, açıklama, seçenekler
- Süre seçimi (1 gün - 3 ay)
- Çoklu seçim ayarı

### /admin/polls
Admin anket yönetimi
- Yeni anket oluşturma
- Anketleri aktif/pasif yapma
- Anket silme
- Sonuçları görüntüleme

### /profile/[userId]
Kullanıcı profili
- Kullanıcının oluşturduğu anketler
- Anket sonuçları
- Anket istatistikleri

## Kullanım

### Anket Oluşturma (Tüm Kullanıcılar)
1. `/polls` sayfasına git
2. "Anket Oluştur" butonuna tıkla
3. Soru ve seçenekleri gir (en az 2, en fazla 10)
4. Anket süresini seç (1 gün - 3 ay)
5. Çoklu seçim ayarını belirle
6. "Anketi Oluştur" butonuna tıkla

### Oy Verme (Kullanıcı)
1. `/polls` sayfasına git
2. Bir anket seç
3. Seçenek(ler)i işaretle
4. "Oy Ver" butonuna tıkla
5. Sonuçları görüntüle

### Oy Değiştirme
- Kullanıcı tekrar oy verdiğinde önceki oyu silinir
- Yeni seçimler kaydedilir

## Seed Verisi

Örnek anketler oluşturmak için:

```bash
npm run db:seed:polls
```

veya

```bash
npx tsx prisma/seed-polls.ts
```

## Özellikler

### ✅ Tamamlanan
- Anket oluşturma (tüm kullanıcılar)
- Oy verme sistemi
- Gerçek zamanlı sonuçlar
- Çoklu/tekli seçim
- Bitiş tarihi desteği (zorunlu)
- Süre seçimi (1 gün - 3 ay)
- Aktif/pasif durum (admin)
- Oy değiştirme
- Responsive tasarım
- Navbar entegrasyonu
- Admin panel entegrasyonu
- Profil sayfası entegrasyonu
- Anket istatistikleri

### 🔮 Gelecek Özellikler (Opsiyonel)
- Anket kategorileri
- Anket arama ve filtreleme
- Anket yorumları
- Anket paylaşım butonları
- Anket istatistikleri (demografik analiz)
- Zamanlı anket yayınlama
- Anket şablonları
- Export sonuçları (CSV, PDF)

## Güvenlik

- Tüm kullanıcılar anket oluşturabilir
- Sadece admin anketleri aktif/pasif yapabilir
- Kullanıcılar sadece kendi oylarını değiştirebilir
- Süresi dolan anketlere oy verilemez
- Pasif anketler görünmez
- Anket süresi zorunlu (spam önleme)
- Rate limiting (gelecekte eklenebilir)

## Performans

- Anket listesi cache'lenir
- Sonuçlar gerçek zamanlı hesaplanır
- Veritabanı indeksleri optimize edilmiş
- Cascade delete ile ilişkili veriler temizlenir

## Test

### Manuel Test Adımları
1. Admin olarak giriş yap
2. `/admin/polls` sayfasına git
3. Yeni anket oluştur
4. Farklı kullanıcılarla oy ver
5. Sonuçları kontrol et
6. Anketi pasif yap
7. Kullanıcı olarak görünmediğini kontrol et

## Sorun Giderme

### Anket görünmüyor
- Anketin aktif olduğundan emin olun
- Bitiş tarihi geçmemiş olmalı
- Veritabanı bağlantısını kontrol edin

### Oy verilemiyor
- Kullanıcı giriş yapmış olmalı
- Anket aktif olmalı
- Bitiş tarihi geçmemiş olmalı
- Seçenek seçilmiş olmalı

### Admin panelinde görünmüyor
- Kullanıcının ADMIN rolü olmalı
- Navbar'da "Anket Yönetimi" linki olmalı

## Notlar

- Anketler silindiğinde tüm oylar da silinir (cascade)
- Kullanıcı silindiğinde oyları da silinir
- Çoklu seçimde birden fazla seçenek işaretlenebilir
- Tekli seçimde sadece bir seçenek işaretlenebilir
