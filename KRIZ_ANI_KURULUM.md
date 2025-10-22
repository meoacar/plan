# 🆘 Kriz Anı Butonu - Kurulum Rehberi

## Hızlı Başlangıç

Kriz Anı Butonu özelliği başarıyla eklendi! Bu özellik kullanıcıların zayıflama yolculuğunda zorlu anlar yaşadıklarında anında motivasyon desteği almalarını sağlar.

## Kurulum Adımları

### 1. Veritabanı Migrasyonu

Veritabanı şemasını güncellemek için:

```bash
cd zayiflamaplanim
npx prisma migrate dev --name add_crisis_button
```

Eğer migration hatası alırsanız, alternatif olarak:

```bash
npx prisma db push
```

### 2. Prisma Client'ı Güncelle

```bash
npx prisma generate
```

### 3. Uygulamayı Başlat

```bash
npm run dev
```

## Eklenen Dosyalar

### Komponentler
- ✅ `src/components/crisis-button.tsx` - Ana kriz butonu komponenti
- ✅ `src/components/crisis-stats.tsx` - İstatistik görüntüleme komponenti

### API Endpoints
- ✅ `src/app/api/crisis-button/route.ts` - Kriz kaydı ve listeleme
- ✅ `src/app/api/crisis-button/resolve/route.ts` - Kriz çözümü ve XP verme

### Sayfalar
- ✅ `src/app/crisis-stats/page.tsx` - İstatistik sayfası

### Veritabanı
- ✅ `prisma/schema.prisma` - CrisisButton modeli eklendi

### Stil
- ✅ `src/app/globals.css` - Animasyon stilleri eklendi

### Dokümantasyon
- ✅ `KRIZ_ANI_BUTONU.md` - Detaylı dokümantasyon
- ✅ `KRIZ_ANI_KURULUM.md` - Bu dosya

## Özellik Özeti

### 🎯 Ana Özellikler

1. **Sabit Kriz Butonu**
   - Tüm sayfalarda sağ alt köşede görünür
   - Pulse animasyonu ile dikkat çeker
   - Tek tıkla erişim

2. **4 Kriz Türü**
   - 🍕 Yemek İsteği
   - 😔 Motivasyon Düşük
   - 😰 Stres
   - 😴 Can Sıkıntısı

3. **Motivasyon Desteği**
   - Her kriz türü için 5 özel mesaj
   - Pratik öneriler
   - Hemen yapılabilecekler listesi

4. **Gamification**
   - Her atlatılan kriz için +50 XP
   - Otomatik seviye atlama
   - Başarı takibi

5. **İstatistikler**
   - Toplam kriz sayısı
   - Atlatılan kriz sayısı
   - Başarı oranı
   - Kriz türlerine göre dağılım
   - Zaman çizelgesi

## Kullanım

### Kullanıcı Perspektifi

1. Kullanıcı zorlu bir an yaşadığında sağ alttaki "🆘 Kriz Anı!" butonuna tıklar
2. Kriz türünü seçer (yemek isteği, motivasyon düşük, vb.)
3. Güçlü motivasyon mesajları ve öneriler görür
4. "✅ Krizi Atlattım!" butonuna tıklayarak +50 XP kazanır
5. İstatistiklerini `/crisis-stats` sayfasından takip eder

### Geliştirici Perspektifi

#### Kriz Butonu Kullanımı
```tsx
import { CrisisButton } from '@/components/crisis-button';

// Layout veya herhangi bir sayfada
<CrisisButton />
```

#### İstatistik Komponenti
```tsx
import { CrisisStats } from '@/components/crisis-stats';

<CrisisStats />
```

#### API Kullanımı
```typescript
// Kriz kaydı
const response = await fetch('/api/crisis-button', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    trigger: 'food_craving',
    note: 'Opsiyonel not'
  }),
});

// Kriz çözümü
const response = await fetch('/api/crisis-button/resolve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ trigger: 'food_craving' }),
});

// İstatistikleri getir
const response = await fetch('/api/crisis-button?limit=20');
const data = await response.json();
```

## Entegrasyon Noktaları

### Layout
Kriz butonu `src/app/layout.tsx` dosyasına eklendi ve tüm sayfalarda görünür.

### Navbar
İstatistik sayfası linki navbar'a eklendi:
- Özellikler > Kriz İstatistikleri

### Gamification
Kriz çözümü gamification sistemi ile entegre:
- +50 XP kazanımı
- Otomatik seviye atlama
- XP bazlı seviye hesaplama (1000 XP = 1 seviye)

## Veritabanı Şeması

```prisma
model CrisisButton {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  trigger     String   // "food_craving", "motivation_low", "stress_eating", "boredom"
  resolved    Boolean  @default(false)
  resolvedAt  DateTime?
  note        String?  @db.Text
  createdAt   DateTime @default(now())

  @@index([userId, createdAt])
  @@index([trigger])
}
```

## Test Senaryoları

### Manuel Test

1. **Kriz Butonu Görünürlüğü**
   ```
   ✓ Ana sayfada butonu gör
   ✓ Butona tıkla
   ✓ Modal açılsın
   ```

2. **Kriz Kaydı**
   ```
   ✓ Kriz türü seç
   ✓ Motivasyon mesajları görünsün
   ✓ "Krizi Atlattım" butonuna tıkla
   ✓ Başarı mesajı görünsün
   ```

3. **İstatistikler**
   ```
   ✓ /crisis-stats sayfasına git
   ✓ İstatistikleri gör
   ✓ Grafiklerin doğru göründüğünü kontrol et
   ```

4. **XP Kazanımı**
   ```
   ✓ Profil sayfasında XP'yi kontrol et
   ✓ Kriz atlat
   ✓ XP'nin arttığını doğrula
   ```

## Sorun Giderme

### Migration Hatası
Eğer `npx prisma migrate dev` komutu hata verirse:

```bash
# Alternatif 1: db push kullan
npx prisma db push

# Alternatif 2: Migration'ı manuel oluştur
npx prisma migrate dev --create-only --name add_crisis_button
# Sonra migration dosyasını düzenle ve uygula
npx prisma migrate deploy
```

### Veritabanı Bağlantı Hatası
`.env` dosyasında `DATABASE_URL` değişkenini kontrol edin:

```env
DATABASE_URL="postgresql://..."
```

### Komponent Görünmüyor
1. Layout dosyasını kontrol edin
2. Browser console'da hata var mı kontrol edin
3. Sayfayı yenileyin (hard refresh: Ctrl+Shift+R)

### API Hataları
1. Kullanıcı giriş yapmış mı kontrol edin
2. Network tab'de API çağrılarını kontrol edin
3. Server console'da hata loglarını kontrol edin

## Performans İpuçları

1. **Modal Lazy Loading**: Modal sadece açıldığında render edilir
2. **API Caching**: İstatistikler client-side cache'lenir
3. **Optimistic Updates**: UI anında güncellenir, API arka planda çalışır
4. **CSS Animations**: GPU hızlandırmalı animasyonlar kullanılır

## Güvenlik

- ✅ Tüm API endpoint'leri authentication gerektirir
- ✅ Rate limiting uygulanmıştır
- ✅ XSS koruması mevcuttur
- ✅ SQL injection koruması (Prisma ORM)

## Gelecek Geliştirmeler

- [ ] Kişiselleştirilmiş motivasyon mesajları
- [ ] Partner bildirim sistemi
- [ ] Kriz anı rozetleri
- [ ] Haftalık/aylık kriz raporu
- [ ] AI destekli motivasyon önerileri
- [ ] Ses kaydı ile motivasyon desteği

## Destek

Sorularınız için:
- GitHub Issues
- Discord Community
- Email: support@zayiflamaplanim.com

## Lisans

Bu özellik projenin ana lisansı altındadır.
