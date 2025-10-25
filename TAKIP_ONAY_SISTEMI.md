# Takip Onay Sistemi ve Kapsamlı Bildirimler

Takip sistemi artık onay mekanizması ile çalışıyor ve tüm etkileşimler için bildirimler eklendi.

## 🎯 Yeni Özellikler

### 1. Takip Onay Sistemi
- ✅ Kullanıcıyı takip etmek için istek gönderme
- ✅ Takip isteklerini kabul/reddetme
- ✅ Bekleyen istekleri görüntüleme
- ✅ Takip durumu kontrolü (PENDING, ACCEPTED, REJECTED)

### 2. Kapsamlı Bildirim Sistemi
- ✅ Takip isteği bildirimi
- ✅ Takip kabul bildirimi
- ✅ Plan beğeni bildirimi
- ✅ Plan yorum bildirimi
- ✅ Yorum reaksiyon bildirimi
- ✅ Tarif beğeni bildirimi
- ✅ Tarif yorum bildirimi

## 📊 Veritabanı Değişiklikleri

### Follow Modeli Güncellemesi

```prisma
model Follow {
  id          String       @id @default(cuid())
  followerId  String
  followingId String
  status      FollowStatus @default(PENDING)  // YENİ
  createdAt   DateTime     @default(now())
  acceptedAt  DateTime?                       // YENİ
  rejectedAt  DateTime?                       // YENİ
  follower    User         @relation("UserFollowing", fields: [followerId], references: [id], onDelete: Cascade)
  following   User         @relation("UserFollowers", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
  @@index([status])                           // YENİ
  @@index([followingId, status])              // YENİ
}

enum FollowStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```

### Yeni Bildirim Tipleri

```prisma
enum NotificationType {
  // Mevcut tipler...
  FOLLOW_REQUEST      // YENİ - Takip isteği
  FOLLOW_ACCEPTED     // YENİ - Takip kabul edildi
  PLAN_LIKE          // YENİ - Plan beğenildi
  PLAN_COMMENT       // YENİ - Plana yorum yapıldı
  RECIPE_LIKE        // YENİ - Tarif beğenildi
  RECIPE_COMMENT     // YENİ - Tarife yorum yapıldı
  // ...
}
```

## 🔧 Kurulum

### 1. Veritabanı Migration

```bash
cd zayiflamaplanim
npx prisma migrate dev --name add_follow_approval_system
npx prisma generate
```

### 2. Mevcut Takipleri Güncelle (Opsiyonel)

Eğer sistemde mevcut takipler varsa, bunları ACCEPTED olarak işaretlemek için:

```sql
UPDATE "Follow" SET status = 'ACCEPTED', "acceptedAt" = "createdAt" WHERE status IS NULL;
```

## 📡 API Endpoint'leri

### Takip İsteği Gönder
```
POST /api/follow
Body: { "userId": "user_id" }
Response: { 
  "success": true, 
  "status": "PENDING",
  "message": "Takip isteği gönderildi"
}
```

### Takip İsteğini Kabul/Reddet
```
PUT /api/follow/request
Body: { 
  "followId": "follow_id",
  "action": "accept" // veya "reject"
}
Response: { 
  "success": true,
  "message": "Takip isteği kabul edildi"
}
```

### Bekleyen İstekleri Getir
```
GET /api/follow/request?page=1&limit=20
Response: {
  "requests": [...],
  "total": 5,
  "page": 1,
  "totalPages": 1
}
```

### Takip Durumunu Kontrol Et
```
GET /api/follow/check?userId=user_id
Response: {
  "isFollowing": false,
  "status": "PENDING",
  "followId": "follow_id",
  "isPending": true,
  "isRejected": false
}
```

### Takipçileri Getir (Sadece Kabul Edilmiş)
```
GET /api/follow/followers?userId=user_id&page=1&limit=20
```

### Takip Edilenleri Getir (Sadece Kabul Edilmiş)
```
GET /api/follow/following?userId=user_id&page=1&limit=20
```

## 🔔 Bildirim Akışı

### Takip İsteği
1. Kullanıcı A, Kullanıcı B'yi takip etmek ister
2. Sistem PENDING durumunda bir Follow kaydı oluşturur
3. Kullanıcı B'ye "FOLLOW_REQUEST" bildirimi gönderilir
4. Kullanıcı B bildirimi görür ve kabul/red edebilir

### Takip Kabul
1. Kullanıcı B isteği kabul eder
2. Follow kaydı ACCEPTED olarak güncellenir
3. Kullanıcı A'ya "FOLLOW_ACCEPTED" bildirimi gönderilir

### Plan Etkileşimleri
1. Kullanıcı bir planı beğenir → Plan sahibine "PLAN_LIKE" bildirimi
2. Kullanıcı plana yorum yapar → Plan sahibine "PLAN_COMMENT" bildirimi
3. Kullanıcı yoruma reaksiyon verir → Yorum sahibine "COMMENT_REACTION" bildirimi

### Tarif Etkileşimleri
1. Kullanıcı bir tarifi beğenir → Tarif sahibine "RECIPE_LIKE" bildirimi
2. Kullanıcı tarife yorum yapar → Tarif sahibine "RECIPE_COMMENT" bildirimi

## 🎨 Frontend Entegrasyonu

### Takip Butonu Durumları

```tsx
// Takip durumuna göre buton metni
const getButtonText = (status: string | null) => {
  switch (status) {
    case 'PENDING':
      return 'İstek Gönderildi';
    case 'ACCEPTED':
      return 'Takip Ediliyor';
    case 'REJECTED':
      return 'Reddedildi';
    default:
      return 'Takip Et';
  }
};

// Takip durumuna göre buton stili
const getButtonStyle = (status: string | null) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-500'; // Beklemede
    case 'ACCEPTED':
      return 'bg-green-500';  // Takip ediliyor
    case 'REJECTED':
      return 'bg-red-500';    // Reddedildi
    default:
      return 'bg-blue-500';   // Takip et
  }
};
```

### Takip İstekleri Sayfası

```tsx
// Bekleyen istekleri göster
const FollowRequests = () => {
  const [requests, setRequests] = useState([]);

  const handleAccept = async (followId: string) => {
    await fetch('/api/follow/request', {
      method: 'PUT',
      body: JSON.stringify({ followId, action: 'accept' }),
    });
    // Listeyi yenile
  };

  const handleReject = async (followId: string) => {
    await fetch('/api/follow/request', {
      method: 'PUT',
      body: JSON.stringify({ followId, action: 'reject' }),
    });
    // Listeyi yenile
  };

  return (
    <div>
      {requests.map(req => (
        <div key={req.id}>
          <span>{req.follower.name}</span>
          <button onClick={() => handleAccept(req.id)}>Kabul Et</button>
          <button onClick={() => handleReject(req.id)}>Reddet</button>
        </div>
      ))}
    </div>
  );
};
```

## 🔒 Güvenlik

- ✅ Sadece takip edilen kişi istekleri onaylayabilir
- ✅ Kullanıcılar kendilerini takip edemez
- ✅ Aynı kullanıcıya birden fazla istek gönderilemez
- ✅ Zaten işlenmiş istekler tekrar işlenemez
- ✅ Tüm API endpoint'leri authentication gerektirir

## 📈 Performans

- ✅ Veritabanı indeksleri ile hızlı sorgular
- ✅ Sadece ACCEPTED durumundaki takipler sayılır
- ✅ Bildirimler asenkron olarak gönderilir
- ✅ Bildirim hataları ana işlemi engellemez

## 🎯 Kullanım Senaryoları

### Senaryo 1: Takip İsteği Gönderme
```
1. Kullanıcı A, Kullanıcı B'nin profilini ziyaret eder
2. "Takip Et" butonuna tıklar
3. İstek gönderilir, buton "İstek Gönderildi" olur
4. Kullanıcı B bildirim alır
```

### Senaryo 2: Takip İsteğini Kabul Etme
```
1. Kullanıcı B bildirimleri kontrol eder
2. Kullanıcı A'nın takip isteğini görür
3. "Kabul Et" butonuna tıklar
4. Kullanıcı A bildirim alır
5. Artık Kullanıcı A, Kullanıcı B'yi takip ediyor
```

### Senaryo 3: Plan Beğenisi
```
1. Kullanıcı A, Kullanıcı B'nin planını beğenir
2. Kullanıcı B "Planınız Beğenildi" bildirimi alır
3. Bildirime tıklayarak plana gidebilir
```

## 🚀 Gelecek Geliştirmeler

- [ ] Toplu takip isteği kabul/red
- [ ] Takip isteklerini otomatik kabul etme seçeneği
- [ ] Engelleme sistemi
- [ ] Özel takip listeleri
- [ ] Takip önerileri
- [ ] Bildirim gruplandırma (örn: "5 kişi planınızı beğendi")

## 📝 Notlar

- Mevcut takip sistemi kullanan komponentler güncellenmeli
- FollowButton komponenti status kontrolü yapmalı
- Takipçi/takip edilen sayıları sadece ACCEPTED olanları saymalı
- Bildirim tercihleri yeni bildirim tipleri için güncellenebilir
