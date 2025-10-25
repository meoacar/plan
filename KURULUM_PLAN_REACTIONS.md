# Plan Reaksiyonları - Kurulum Rehberi

## 🚀 Hızlı Başlangıç

### 1. SQL Script'i Çalıştır

Veritabanınıza bağlanın ve `add-plan-reactions.sql` dosyasını çalıştırın:

```bash
# PostgreSQL ile
psql -h your-host -U your-user -d your-database -f add-plan-reactions.sql

# Veya Neon Dashboard'dan SQL Editor'de çalıştırın
```

SQL dosyası şunları yapar:
- `PlanReaction` tablosunu oluşturur
- Gerekli index'leri ekler
- Foreign key'leri tanımlar
- `NotificationType` enum'una `PLAN_REACTION` ekler

### 2. Prisma Client'ı Güncelle

```bash
cd zayiflamaplanim
npx prisma generate
```

### 3. Uygulamayı Yeniden Başlat

```bash
npm run dev
```

## ✅ Test Etme

1. Bir plan sayfasına gidin (örn: `/plan/herhangi-bir-plan`)
2. "Bu plana nasıl tepki vermek istersin?" bölümünü görmelisiniz
3. Reaksiyon butonlarına tıklayın:
   - 💪 Destekle
   - 🎉 Tebrik et
   - ❤️ Sevdim
   - 🔥 Harika
   - 👏 Alkış
4. Reaksiyon sayılarının güncellendiğini görün
5. Plan sahibi bildirim almalı

## 🔍 Doğrulama

### Veritabanında Kontrol

```sql
-- PlanReaction tablosunu kontrol et
SELECT * FROM "PlanReaction" LIMIT 10;

-- Bir plana verilen reaksiyonları gör
SELECT 
  pr.emoji,
  pr.label,
  u.name as user_name,
  pr."createdAt"
FROM "PlanReaction" pr
JOIN "User" u ON pr."userId" = u.id
WHERE pr."planId" = 'PLAN_ID_BURAYA'
ORDER BY pr."createdAt" DESC;

-- En çok reaksiyon alan planlar
SELECT 
  p.title,
  COUNT(pr.id) as reaction_count
FROM "Plan" p
LEFT JOIN "PlanReaction" pr ON p.id = pr."planId"
GROUP BY p.id, p.title
ORDER BY reaction_count DESC
LIMIT 10;
```

### API Testi

```bash
# Reaksiyon ekle
curl -X POST http://localhost:3000/api/plans/PLAN_SLUG/reactions \
  -H "Content-Type: application/json" \
  -d '{"emoji":"💪","label":"Destekle"}'

# Response:
# {"success":true,"action":"added"}
```

## 🎨 Özelleştirme

### Yeni Reaksiyon Ekleme

`src/components/plan-reactions.tsx` dosyasında `PLAN_REACTIONS` dizisini düzenleyin:

```typescript
const PLAN_REACTIONS = [
  { emoji: "💪", label: "Destekle", color: "from-blue-500 to-cyan-500" },
  { emoji: "🎉", label: "Tebrik et", color: "from-yellow-500 to-orange-500" },
  // Yeni reaksiyon ekle
  { emoji: "🌟", label: "Muhteşem", color: "from-yellow-400 to-yellow-600" },
]
```

### Bildirim Mesajını Değiştirme

`src/app/api/plans/[slug]/reactions/route.ts` dosyasında:

```typescript
await createNotification({
  userId: plan.userId,
  type: "PLAN_REACTION",
  title: `${emoji} ${label}`,
  message: `${session.user.name} planınıza "${label}" reaksiyonu verdi`, // Burası
  actionUrl: `/plan/${params.slug}`,
  actorId: session.user.id,
  relatedId: plan.id,
})
```

## 🐛 Sorun Giderme

### "PlanReaction is not defined" Hatası

```bash
# Prisma client'ı yeniden oluştur
npx prisma generate
```

### Reaksiyonlar Görünmüyor

1. Tarayıcı konsolunu kontrol edin
2. Network sekmesinde API çağrılarını inceleyin
3. Veritabanında `PlanReaction` tablosunun olduğunu doğrulayın

### Bildirimler Gitmiyor

1. `NotificationType` enum'unda `PLAN_REACTION` olduğunu kontrol edin:
```sql
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'NotificationType');
```

2. Bildirim tercihlerini kontrol edin:
```sql
SELECT * FROM "NotificationPreference" WHERE "userId" = 'USER_ID';
```

## 📊 Performans

- Index'ler sayesinde hızlı sorgular
- Optimistic update ile anında UI güncellemesi
- Cascade delete ile veri tutarlılığı
- Unique constraint ile spam önleme

## 🔐 Güvenlik

- ✅ Kimlik doğrulama zorunlu
- ✅ SQL injection koruması (Prisma ORM)
- ✅ XSS koruması (React otomatik escape)
- ✅ Rate limiting (gerekirse eklenebilir)

## 📝 Notlar

- Her kullanıcı her emoji'den sadece 1 tane verebilir
- Aynı emoji'ye tekrar tıklamak reaksiyonu kaldırır
- Kendi planına reaksiyon verebilir ama bildirim gitmez
- Reaksiyonlar plan silindiğinde otomatik silinir (CASCADE)

## 🎉 Başarılı Kurulum!

Artık kullanıcılarınız planlara hızlı reaksiyonlar verebilir ve sosyal etkileşim artacak! 🚀
