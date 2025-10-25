# Plan Reaksiyonları Özelliği

## 📋 Genel Bakış

Kullanıcıların planlara hızlı reaksiyon vermesini sağlayan mini sosyal etkileşim sistemi. kadinatlasi tarzında "günlük notlar" bölümü gibi çalışır.

## 🎯 Özellikler

### 1. Hızlı Reaksiyon Butonları
- 💪 **Destekle**: Motivasyon ve destek için
- 🎉 **Tebrik et**: Başarıları kutlamak için
- ❤️ **Sevdim**: Planı beğendiğinizi göstermek için
- 🔥 **Harika**: Etkileyici planlar için
- 👏 **Alkış**: Takdir göstermek için

### 2. Sosyal Özellikler
- ✅ Reaksiyon sayıları görünür
- ✅ Reaksiyon veren kullanıcıların avatarları
- ✅ Kullanıcı kendi reaksiyonunu görebilir
- ✅ Tek tıkla reaksiyon ekle/kaldır
- ✅ Gerçek zamanlı güncelleme

### 3. Bildirim Sistemi
- ✅ Plan sahibine bildirim gönderilir
- ✅ Kendi planına reaksiyon verirse bildirim gönderilmez
- ✅ Bildirimde reaksiyon tipi ve veren kişi gösterilir

## 🗄️ Database Modeli

```prisma
model PlanReaction {
  id        String   @id @default(cuid())
  planId    String
  userId    String
  emoji     String
  label     String
  createdAt DateTime @default(now())
  plan      Plan     @relation(fields: [planId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([planId, userId, emoji])
  @@index([planId])
  @@index([userId])
}
```

### İlişkiler
- `User` modeline `planReactions PlanReaction[]` eklendi
- `Plan` modeline `reactions PlanReaction[]` eklendi
- `NotificationType` enum'una `PLAN_REACTION` eklendi

## 🔌 API Endpoints

### POST /api/plans/[slug]/reactions
Plan için reaksiyon ekle/kaldır.

**Body:**
```json
{
  "emoji": "💪",
  "label": "Destekle"
}
```

**Response:**
```json
{
  "success": true,
  "action": "added" // veya "removed"
}
```

**Özellikler:**
- Aynı emoji için toggle işlemi yapar
- Bildirim gönderir (kendi planı değilse)
- Unique constraint ile aynı kullanıcı aynı emoji'yi birden fazla veremez

## 🎨 Bileşenler

### PlanReactions
Plan detay sayfasında kullanılan ana reaksiyon bileşeni.

**Props:**
```typescript
interface PlanReactionsProps {
  planId: string
  planSlug: string
  initialReactions?: Array<{
    emoji: string
    userId: string
    user: {
      id: string
      name: string
      image?: string
    }
  }>
}
```

**Özellikler:**
- Gradient renkli butonlar
- Hover efektleri
- Tooltip'ler
- Animasyonlar
- Reaksiyon veren kullanıcıların avatarları

## 🚀 Kurulum

### 1. Database Migration
```bash
cd zayiflamaplanim
npx prisma migrate dev --name add_plan_reactions
npx prisma generate
```

### 2. Kullanım
Reaksiyon bileşeni otomatik olarak plan detay sayfasında görünür. Ek bir işlem gerekmez.

## 💡 Kullanım Senaryoları

### Reaksiyon Verme
1. Kullanıcı plan detay sayfasını açar
2. "Bu plana nasıl tepki vermek istersin?" bölümünü görür
3. İstediği reaksiyon butonuna tıklar
4. Reaksiyon anında eklenir ve sayaç güncellenir
5. Plan sahibine bildirim gönderilir

### Reaksiyon Kaldırma
1. Kullanıcı daha önce verdiği reaksiyona tekrar tıklar
2. Reaksiyon kaldırılır
3. Sayaç güncellenir

### Reaksiyonları Görüntüleme
1. Toplam reaksiyon sayısı gösterilir
2. Her reaksiyon tipinin sayısı ayrı ayrı görünür
3. İlk 5 reaksiyon veren kullanıcının avatarı gösterilir
4. "ve X kişi daha" yazısı ile toplam gösterilir

## 🎨 Tasarım Özellikleri

### Renkler
- **Destekle**: Mavi-Cyan gradient
- **Tebrik et**: Sarı-Turuncu gradient
- **Sevdim**: Kırmızı-Pembe gradient
- **Harika**: Turuncu-Kırmızı gradient
- **Alkış**: Mor-Pembe gradient

### Animasyonlar
- Hover'da scale efekti
- Aktif reaksiyonda bounce animasyonu
- Emoji'lerde scale animasyonu
- Smooth transitions

### Responsive
- Mobilde butonlar küçülür
- Flex-wrap ile alt satıra geçer
- Avatar'lar mobilde daha küçük

## 🔒 Güvenlik

- ✅ Kimlik doğrulama gerekli
- ✅ Unique constraint ile spam önleme
- ✅ Cascade delete ile veri tutarlılığı
- ✅ Input validasyonu

## 📊 İstatistikler

Her plan için:
- Toplam reaksiyon sayısı
- Reaksiyon tipi dağılımı
- Reaksiyon veren kullanıcılar
- En popüler reaksiyon tipi

## 🎯 Gelecek Geliştirmeler

- [ ] Reaksiyon istatistikleri sayfası
- [ ] En çok reaksiyon alan planlar
- [ ] Reaksiyon rozetleri
- [ ] Reaksiyon bildirimleri toplu görüntüleme
- [ ] Özel reaksiyon emojileri
- [ ] Reaksiyon filtreleme
- [ ] Reaksiyon arama

## 🐛 Bilinen Sorunlar

Şu anda bilinen bir sorun bulunmamaktadır.

## 📝 Notlar

- Reaksiyonlar cascade delete ile silinir
- Her kullanıcı her emoji'den sadece 1 tane verebilir
- Kendi planına reaksiyon verebilir ama bildirim gitmez
- Reaksiyonlar gerçek zamanlı güncellenir (optimistic update)

## 🔗 İlgili Dosyalar

- `src/components/plan-reactions.tsx` - Ana reaksiyon bileşeni
- `src/app/api/plans/[slug]/reactions/route.ts` - API endpoint
- `src/app/plan/[slug]/page.tsx` - Plan detay sayfası
- `src/components/plan-detail.tsx` - Plan detay bileşeni
- `prisma/schema.prisma` - Veritabanı şeması

## 🎉 Tamamlandı

✅ PlanReaction modeli eklendi
✅ API endpoint oluşturuldu
✅ UI bileşeni tasarlandı
✅ Bildirim sistemi entegre edildi
✅ Plan detay sayfası güncellendi
✅ Dokümantasyon hazırlandı

Sistem kullanıma hazır! 🚀
