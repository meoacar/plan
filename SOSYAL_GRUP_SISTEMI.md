# Sosyal Grup Sistemi - Admin Onaylı

## 📋 Genel Bakış

Admin onaylı sosyal grup sistemi, kullanıcıların ortak hedefler için bir araya gelmesini, challenge'lara katılmasını ve birbirleriyle yarışmasını sağlar.

## 🎯 Özellikler

### 1. Grup Yönetimi (Admin Onaylı)
- ✅ Kullanıcılar grup oluşturabilir
- ✅ Admin onayı gerekir
- ✅ Grup durumları: PENDING, APPROVED, REJECTED
- ✅ Red nedeni belirtme
- ✅ Grup silme

### 2. Grup Tipleri
- **Kilo Verme**: Ortak kilo hedefi olan gruplar
- **Fitness**: Spor ve egzersiz odaklı gruplar
- **Sağlıklı Beslenme**: Diyet ve beslenme grupları
- **Motivasyon**: Genel motivasyon ve destek grupları

### 3. Grup Özellikleri
- Özel/Açık grup seçeneği
- Maksimum üye sınırı
- Grup görseli
- Hedef kilo belirleme
- Üye rolleri: ADMIN, MODERATOR, MEMBER

### 4. Challenge Sistemi
- Haftalık/Aylık yarışmalar
- Challenge tipleri:
  - Kilo verme
  - Aktivite
  - Streak (ardışık gün)
  - Check-in
  - Tarif paylaşımı
  - Plan paylaşımı
- Katılımcı takibi
- İlerleme kaydı

### 5. Leaderboard (Sıralama)
- Challenge bazlı sıralama
- Skor hesaplama
- Rank sistemi (1., 2., 3. vb.)
- Gerçek zamanlı güncelleme

### 6. Arkadaş Önerileri
- Benzer hedeflere sahip kullanıcılar
- Aynı şehirden kullanıcılar
- Popüler kullanıcılar
- Aktif kullanıcılar
- Skor bazlı sıralama

## 🗄️ Database Modelleri

### Group
```prisma
model Group {
  id              String
  name            String
  slug            String (unique)
  description     String
  imageUrl        String?
  goalType        String
  targetWeight    Int?
  isPrivate       Boolean
  maxMembers      Int?
  status          GroupStatus (PENDING/APPROVED/REJECTED)
  rejectionReason String?
  createdBy       String
  createdAt       DateTime
  updatedAt       DateTime
  approvedAt      DateTime?
}
```

### GroupMember
```prisma
model GroupMember {
  id        String
  groupId   String
  userId    String
  role      GroupMemberRole (ADMIN/MODERATOR/MEMBER)
  joinedAt  DateTime
}
```

### Challenge
```prisma
model Challenge {
  id          String
  groupId     String?
  title       String
  description String
  type        ChallengeType
  target      Float
  unit        String
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean
  createdBy   String
}
```

### ChallengeLeaderboard
```prisma
model ChallengeLeaderboard {
  id          String
  challengeId String
  userId      String
  score       Float
  rank        Int
}
```

## 🔌 API Endpoints

### Admin API

#### Grup Yönetimi
```
GET    /api/admin/groups?status=PENDING
GET    /api/admin/groups/[id]
PATCH  /api/admin/groups/[id] (approve/reject)
DELETE /api/admin/groups/[id]
```

#### Challenge Yönetimi
```
GET    /api/admin/challenges
POST   /api/admin/challenges
```

### Kullanıcı API

#### Gruplar
```
GET    /api/groups
POST   /api/groups
GET    /api/groups/[slug]
POST   /api/groups/[slug]/join
```

#### Challenge'lar
```
GET    /api/challenges
POST   /api/challenges/[id]/join
GET    /api/challenges/[id]/leaderboard
```

#### Arkadaş Önerileri
```
GET    /api/friend-suggestions
```

## 🎨 Bileşenler

### Admin Bileşenleri
- `AdminGroupList` - Grup onaylama/reddetme
- `AdminChallengeList` - Challenge yönetimi

### Kullanıcı Bileşenleri
- `GroupList` - Grup listesi
- `CreateGroupForm` - Grup oluşturma formu
- `ChallengeList` - Challenge listesi
- `Leaderboard` - Sıralama tablosu
- `FriendSuggestions` - Arkadaş önerileri

## 🚀 Kurulum

### 1. Database Migration
```bash
cd zayiflamaplanim
npx prisma migrate dev --name add_social_groups
npx prisma generate
```

### 2. Rozet Ekleme (Opsiyonel)
```sql
INSERT INTO "Badge" (id, type, name, description, icon, "xpReward", "createdAt")
VALUES
  (gen_random_uuid(), 'GROUP_CREATOR', 'Grup Kurucusu', 'İlk grubunu oluştur', '👥', 50, NOW()),
  (gen_random_uuid(), 'GROUP_ADMIN', 'Grup Yöneticisi', 'Bir grubun admini ol', '⭐', 30, NOW()),
  (gen_random_uuid(), 'CHALLENGE_WINNER', 'Challenge Şampiyonu', 'Bir challenge\'ı kazan', '🏆', 100, NOW()),
  (gen_random_uuid(), 'CHALLENGE_PARTICIPANT', 'Challenge Katılımcısı', 'İlk challenge\'a katıl', '🎯', 20, NOW()),
  (gen_random_uuid(), 'SOCIAL_BUTTERFLY', 'Sosyal Kelebek', '10 kişiyi takip et', '🦋', 40, NOW());
```

## 📱 Kullanım Senaryoları

### Grup Oluşturma
1. Kullanıcı "Grup Oluştur" butonuna tıklar
2. Form doldurulur (ad, açıklama, hedef tipi, vb.)
3. Grup PENDING durumunda oluşturulur
4. Admin onaylar veya reddeder
5. Onaylanırsa grup yayınlanır

### Challenge'a Katılma
1. Kullanıcı aktif challenge'ları görür
2. "Katıl" butonuna tıklar
3. Katılımcı olarak kaydedilir
4. İlerlemesi takip edilir
5. Leaderboard'da sıralanır

### Arkadaş Bulma
1. Sistem benzer kullanıcıları önerir
2. Kullanıcı profilleri inceler
3. "Takip Et" butonuna tıklar
4. Takip ilişkisi oluşur

## 🔒 Güvenlik

- Admin yetkisi kontrolü
- Grup onay sistemi
- Özel grup için katılım onayı
- Maksimum üye sınırı kontrolü
- Spam önleme

## 📊 İstatistikler

Gruplar için:
- Üye sayısı
- Challenge sayısı
- Gönderi sayısı
- Katılım istekleri

Challenge'lar için:
- Katılımcı sayısı
- Tamamlanma oranı
- Leaderboard sıralaması

## 🎯 Gelecek Geliştirmeler

- [ ] Grup içi mesajlaşma
- [ ] Grup etkinlikleri
- [ ] Grup rozetleri
- [ ] Challenge ödülleri
- [ ] Grup istatistikleri
- [ ] Grup arama ve filtreleme
- [ ] Grup kategorileri
- [ ] Grup moderasyon araçları
- [ ] Challenge şablonları
- [ ] Otomatik leaderboard güncelleme

## 🐛 Bilinen Sorunlar

Şu anda bilinen bir sorun bulunmamaktadır.

## 📝 Notlar

- Gruplar admin onayı olmadan yayınlanmaz
- Challenge'lar grup bazlı veya genel olabilir
- Leaderboard manuel veya otomatik güncellenebilir
- Arkadaş önerileri algoritması geliştirilebilir
