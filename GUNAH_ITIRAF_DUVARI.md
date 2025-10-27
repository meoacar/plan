# 🍰 Yeme Günahı İtiraf Duvarı

Kullanıcıların yeme günahlarını anonim olarak paylaşıp, AI'dan esprili yanıtlar aldığı, toplulukla empati kurduğu mizahi bir sosyal özellik.

## 🎯 Özellikler

### 1. İtiraf Paylaşımı
- Anonim paylaşım (kullanıcı ID'si saklanır ama gösterilmez)
- 10-500 karakter arası
- AI tarafından otomatik esprili yanıt üretilir
- +50 XP kazanç

### 2. AI Mizah Motoru
8 farklı yemek kategorisi için özel yanıtlar:
- 🍰 Tatlılar (pasta, baklava, künefe)
- 🍔 Fast Food (pizza, hamburger, döner)
- 🌙 Gece Yemekleri
- 🍫 Çikolata
- 🇹🇷 Türk Mutfağı
- 🍦 Dondurma
- 🥨 Atıştırmalıklar
- 🥤 Gazlı İçecekler

### 3. Sosyal Etkileşim
- ❤️ Beğeni sistemi (+5 XP)
- 💬 Yorum sistemi (+10 XP, anonim)
- 😂 8 farklı emoji reaksiyonu
- Reaksiyon özeti

### 4. Sıralama
- 🕐 En Yeniler
- 🔥 Popüler (en çok beğenilen)

### 5. Gamification
5 yeni rozet:
- 🍰 **İlk İtiraf** - İlk itirafını paylaş (+50 XP)
- 🎭 **İtiraf Ustası** - 10 itiraf paylaş (+150 XP)
- 💖 **Empati Ustası** - İtirafların 50 beğeni alsın (+200 XP)
- 💬 **Topluluk Dostu** - 50 itiraf yorumu yap (+100 XP)
- 🦋 **Sosyal Kelebek** - 100 reaksiyon ver (+75 XP)

## 📁 Dosya Yapısı

```
zayiflamaplanim/
├── prisma/
│   └── schema.prisma (Confession modelleri)
├── src/
│   ├── app/
│   │   ├── gunah-itiraf/
│   │   │   ├── page.tsx (Ana sayfa)
│   │   │   └── layout.tsx (SEO metadata)
│   │   └── api/
│   │       └── confessions/
│   │           ├── route.ts (GET, POST)
│   │           └── [id]/
│   │               ├── like/route.ts
│   │               ├── react/route.ts
│   │               └── comments/route.ts
│   ├── lib/
│   │   └── ai-confession.ts (AI yanıt üretici)
│   └── components/
│       └── navbar-client.tsx (Navigation linki)
```

## 🚀 Kullanım

### Kullanıcı Akışı
1. `/gunah-itiraf` sayfasına git
2. İtirafını yaz (örn: "Gece 2'de dolmayı gömdüm")
3. AI yanıtını gör (örn: "Dolma da seni gömmüştür ama sevgiden")
4. İtiraf paylaşılır (+50 XP)
5. Diğer kullanıcılar beğenir, yorum yapar, reaksiyon verir

### API Kullanımı

**İtiraf Oluştur:**
```typescript
POST /api/confessions
Content-Type: application/json

{
  "text": "Gece 2'de dolmayı gömdüm",
  "isAnonymous": true
}

Response:
{
  "id": "...",
  "text": "...",
  "aiReply": "Dolma da seni gömmüştür ama sevgiden.",
  "_count": { "likes": 0, "comments": 0, "reactions": 0 }
}
```

**İtirafları Listele:**
```typescript
GET /api/confessions?sort=recent&limit=20
GET /api/confessions?sort=popular&limit=20

Response:
{
  "confessions": [...],
  "nextCursor": "..."
}
```

**Beğen:**
```typescript
POST /api/confessions/[id]/like

Response:
{ "liked": true }
```

**Reaksiyon Ver:**
```typescript
POST /api/confessions/[id]/react
Content-Type: application/json

{
  "emoji": "😂"
}

Response:
{ "reacted": true }
```

**Yorum Ekle:**
```typescript
POST /api/confessions/[id]/comments
Content-Type: application/json

{
  "content": "Ben de aynısını yaptım!",
  "isAnonymous": true
}

Response:
{
  "id": "...",
  "content": "...",
  "createdAt": "..."
}
```

## 🗄️ Veritabanı Modelleri

```prisma
model Confession {
  id          String                @id @default(cuid())
  userId      String
  text        String
  aiReply     String?
  isAnonymous Boolean               @default(true)
  createdAt   DateTime              @default(now())
  updatedAt   DateTime              @updatedAt
  likes       ConfessionLike[]
  comments    ConfessionComment[]
  reactions   ConfessionReaction[]
}

model ConfessionLike {
  id           String     @id @default(cuid())
  confessionId String
  userId       String
  createdAt    DateTime   @default(now())
  confession   Confession @relation(...)
  
  @@unique([confessionId, userId])
}

model ConfessionComment {
  id           String     @id @default(cuid())
  confessionId String
  userId       String
  content      String
  isAnonymous  Boolean    @default(true)
  createdAt    DateTime   @default(now())
  confession   Confession @relation(...)
}

model ConfessionReaction {
  id           String     @id @default(cuid())
  confessionId String
  userId       String
  emoji        String
  createdAt    DateTime   @default(now())
  confession   Confession @relation(...)
  
  @@unique([confessionId, userId, emoji])
}
```

## 🎨 Tasarım

### Renk Paleti
- Gradient: `from-pink-50 via-purple-50 to-blue-50`
- AI Yanıt: `from-purple-100 to-pink-100`
- Butonlar: `from-purple-600 to-pink-600`

### Emojiler
- 😂 Gülme
- 🫶 Sevgi
- 💪 Güç
- 😅 Utanma
- 🤗 Sarılma
- 👏 Alkış
- ❤️ Kalp
- 🔥 Ateş

## 🔒 Güvenlik

- Tüm endpoint'ler authentication gerektiriyor
- Anonim paylaşım (userId saklanıyor ama gösterilmiyor)
- XSS koruması
- Rate limiting hazır altyapı
- Input validation (10-500 karakter)

## 📊 Performans

- Cursor-based pagination
- Index'ler: `createdAt`, `userId`
- Lazy loading hazır
- Optimistic UI updates

## 🧪 Test

```bash
# Veritabanı migration
cd zayiflamaplanim
npx prisma db push

# Rozetleri seed et
npm run db:seed:gamification

# Development server
npm run dev

# Test URL
http://localhost:3000/gunah-itiraf
```

## 📝 AI Yanıt Örnekleri

| İtiraf | AI Yanıtı |
|--------|-----------|
| "Kardeşimin doğum günü bahanesiyle 3 dilim pasta yedim" | "O noktada artık 'dilim' değil 'destan' yazmışsın." |
| "Gece 2'de dolmayı gömdüm" | "Dolma da seni gömmüştür ama sevgiden." |
| "McDonald's drive-thru'da adımı unuttum" | "İsmini unutan çok olur, ama patates seni asla unutmaz." |
| "1 dilim baklava dedim, 5 oldu" | "O noktada artık 'dilim' değil 'destan' yazmışsın." |
| "Gece 3'te tost yaptım" | "Gece 3'te yapılan tostların vicdanı olmaz, sadece lezzeti olur." |

## 🎯 Hedefler

### Kısa Vadeli
- ✅ Temel itiraf sistemi
- ✅ AI yanıt üretimi
- ✅ Sosyal etkileşim
- ✅ Gamification entegrasyonu

### Orta Vadeli
- [ ] Bildirim sistemi entegrasyonu
- [ ] Günlük/haftalık itiraf özeti
- [ ] En popüler itiraflar sayfası
- [ ] İtiraf kategorileri

### Uzun Vadeli
- [ ] OpenAI API entegrasyonu (daha akıllı yanıtlar)
- [ ] Kullanıcı itiraf geçmişi
- [ ] İtiraf istatistikleri
- [ ] Sosyal medya paylaşımı

## 🤝 Katkıda Bulunma

Yeni AI yanıt kategorileri eklemek için:
1. `src/lib/ai-confession.ts` dosyasını aç
2. `foodPatterns` dizisine yeni kategori ekle
3. Keywords ve replies tanımla

Örnek:
```typescript
{
  keywords: ['kahve', 'latte', 'cappuccino'],
  replies: [
    'Kahve, hayatın yakıtıdır. Suçluluk hissetme.',
    'Kafein, beyin gıdasıdır. Bilimsel gerçek.',
  ],
}
```

## 📞 Destek

Sorularınız için:
- GitHub Issues
- Discord: #gunah-itiraf-duvari
- Email: support@zayiflamaplanim.com

---

**Not:** Bu özellik mizah ve empati odaklıdır. Kullanıcıları suçlamak yerine rahatlatmayı amaçlar. 💖
