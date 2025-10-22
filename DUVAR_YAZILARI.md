# Duvar Yazıları Özelliği

Kullanıcıların birbirlerinin profillerine mesaj bırakabilmesi için duvar yazıları sistemi.

## Özellikler

### 1. Mesaj Bırakma
- ✅ Kullanıcılar başkalarının profillerine mesaj yazabilir
- ✅ Kendi profiline mesaj yazılamaz
- ✅ Mesajlar 1-1000 karakter arası
- ✅ Herkese açık veya özel mesaj seçeneği

### 2. Mesaj Görüntüleme
- ✅ Profil sahibi tüm mesajları görebilir (açık + özel)
- ✅ Diğer kullanıcılar sadece herkese açık mesajları görebilir
- ✅ Mesajlar en yeniden eskiye sıralı
- ✅ Sayfalama desteği (10 mesaj/sayfa)

### 3. Mesaj Yönetimi
- ✅ Mesaj yazarı kendi mesajını silebilir
- ✅ Profil sahibi duvarındaki tüm mesajları silebilir
- ✅ Silme işlemi onay gerektirir

### 4. Kullanıcı Deneyimi
- ✅ Gerçek zamanlı karakter sayacı
- ✅ Avatar ve kullanıcı adı gösterimi
- ✅ Göreceli zaman gösterimi (örn: "2 saat önce")
- ✅ Özel mesajlar için kilit ikonu
- ✅ Boş durum mesajları

## Veritabanı Modeli

```prisma
model WallPost {
  id        String   @id @default(cuid())
  userId    String   // Duvarın sahibi
  user      User     @relation("WallPostOwner", fields: [userId], references: [id], onDelete: Cascade)
  authorId  String   // Mesajı yazan
  author    User     @relation("WallPostAuthor", fields: [authorId], references: [id], onDelete: Cascade)
  content   String   @db.Text
  isPublic  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, createdAt])
  @@index([authorId])
}
```

## API Endpoints

### GET /api/wall-posts
Bir kullanıcının duvar yazılarını getirir.

**Query Parameters:**
- `userId` (required): Profil sahibinin ID'si
- `page` (optional): Sayfa numarası (default: 1)
- `limit` (optional): Sayfa başına mesaj sayısı (default: 10)

**Response:**
```json
{
  "posts": [
    {
      "id": "...",
      "content": "Harika ilerleme!",
      "isPublic": true,
      "createdAt": "2024-01-01T12:00:00Z",
      "author": {
        "id": "...",
        "name": "Ahmet",
        "image": "..."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### POST /api/wall-posts
Yeni duvar yazısı oluşturur.

**Body:**
```json
{
  "userId": "...",
  "content": "Mesaj içeriği",
  "isPublic": true
}
```

**Response:**
```json
{
  "id": "...",
  "content": "Mesaj içeriği",
  "isPublic": true,
  "createdAt": "2024-01-01T12:00:00Z",
  "author": {
    "id": "...",
    "name": "Ahmet",
    "image": "..."
  }
}
```

### DELETE /api/wall-posts/[id]
Duvar yazısını siler.

**Authorization:**
- Mesaj yazarı veya profil sahibi silebilir

**Response:**
```json
{
  "success": true
}
```

## Kurulum

### 1. Veritabanı Migrasyonu

```bash
npx prisma migrate dev --name add_wall_posts
```

### 2. Prisma Client Güncelleme

```bash
npx prisma generate
```

## Kullanım

Duvar yazıları bileşeni otomatik olarak kullanıcı profillerinde görünür:

```tsx
import WallPosts from "@/components/wall-posts"

<WallPosts userId={user.id} isOwnProfile={isOwnProfile} />
```

## Güvenlik

- ✅ Kimlik doğrulama gerekli (mesaj yazmak için)
- ✅ Yetkilendirme kontrolü (silme işlemleri için)
- ✅ Input validasyonu (Zod schema)
- ✅ XSS koruması (React otomatik escape)
- ✅ SQL injection koruması (Prisma ORM)

## Gelecek Geliştirmeler

- [ ] Mesajlara emoji reaksiyonları
- [ ] Mesajlara yanıt verme
- [ ] Mesaj bildirimleri
- [ ] Mesaj düzenleme
- [ ] Spam/kötüye kullanım bildirimi
- [ ] Duvar yazılarını kapatma seçeneği
- [ ] Mesaj arama/filtreleme
- [ ] Medya ekleme (resim, GIF)

## Notlar

- Mesajlar cascade delete ile kullanıcı silindiğinde otomatik silinir
- Özel mesajlar sadece profil sahibi tarafından görülebilir
- Sayfalama performans için önemli (çok mesaj olduğunda)
- date-fns kütüphanesi Türkçe tarih formatlaması için kullanılıyor
