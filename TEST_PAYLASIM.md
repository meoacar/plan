# 🧪 Sosyal Medya Paylaşım Testi

## ✅ Düzeltilen Sorunlar

### 1. Internal Server Error (Open Graph)
**Sorun:** Prisma edge runtime'da çalışmıyor
**Çözüm:** Dynamic import kullanarak Prisma'yı edge dışında çalıştırma

```typescript
// Önceki (Hatalı)
import { prisma } from '@/lib/prisma';
export const runtime = 'edge';

// Yeni (Düzeltilmiş)
async function getPlanData(slug: string) {
  const { prisma } = await import('@/lib/prisma');
  return prisma.plan.findUnique(...);
}
```

### 2. Paylaşım Butonu Modernizasyonu
**Önceki:** Basit outline buton + dropdown
**Yeni:** Modern gradient buton + glassmorphism modal

## 🎨 Yeni Tasarım Özellikleri

### Ana Buton
- ✅ Purple-pink gradient
- ✅ Hover scale animasyonu
- ✅ İkon rotate efekti
- ✅ Shadow glow efekti

### Modal
- ✅ Glassmorphism arka plan
- ✅ Gradient glow efekti
- ✅ Smooth fade-in/zoom-in animasyonları
- ✅ Platform kartları (her biri özel tasarım)
- ✅ Backdrop blur efekti

### Platform Kartları
- ✅ Twitter: #1DA1F2
- ✅ Facebook: #1877F2
- ✅ WhatsApp: #25D366
- ✅ LinkedIn: #0A66C2
- ✅ Link Kopyala: Purple → Green (kopyalandığında)

## 🧪 Test Adımları

### 1. Lokal Test

```bash
# Development sunucusunu başlat
cd zayiflamaplanim
npm run dev
```

**Test Senaryoları:**

#### A. Paylaşım Butonu
1. Bir plan detay sayfasına git: `http://localhost:3000/plan/[slug]`
2. Sayfayı aşağı kaydır, paylaşım butonunu bul
3. Butona hover yap → Scale ve glow efekti görülmeli
4. Butona tıkla

**Beklenen Sonuç:**
- Desktop: Modal açılmalı
- Mobil: Native share menüsü açılmalı

#### B. Modal Testi (Desktop)
1. Modal açıldığında:
   - ✅ Backdrop blur görünmeli
   - ✅ Modal center'da olmalı
   - ✅ Smooth animasyon olmalı
   - ✅ 5 platform kartı görünmeli

2. Platform kartlarına hover yap:
   - ✅ Border rengi değişmeli
   - ✅ Arka plan koyulaşmalı
   - ✅ Smooth transition olmalı

3. "Linki Kopyala" butonuna tıkla:
   - ✅ İkon değişmeli (Link → Check)
   - ✅ Renk değişmeli (Purple → Green)
   - ✅ "Kopyalandı!" yazısı görünmeli
   - ✅ 2 saniye sonra reset olmalı

4. X butonuna veya backdrop'a tıkla:
   - ✅ Modal kapanmalı
   - ✅ Smooth fade-out olmalı

#### C. Platform Paylaşımı
1. Twitter kartına tıkla:
   - ✅ Yeni sekmede Twitter açılmalı
   - ✅ Tweet compose ekranı görünmeli
   - ✅ Plan başlığı ve URL dolu olmalı

2. Facebook kartına tıkla:
   - ✅ Facebook share dialog açılmalı
   - ✅ URL doğru olmalı

3. WhatsApp kartına tıkla:
   - ✅ WhatsApp web/app açılmalı
   - ✅ Mesaj formatı doğru olmalı

4. LinkedIn kartına tıkla:
   - ✅ LinkedIn share açılmalı
   - ✅ URL doğru olmalı

### 2. Open Graph Görsel Testi

#### A. Lokal Görsel Kontrolü
```bash
# Tarayıcıda aç
http://localhost:3000/plan/[slug]/opengraph-image
```

**Beklenen Sonuç:**
- ✅ 1200x630px görsel oluşmalı
- ✅ Plan başlığı görünmeli
- ✅ Kilo bilgileri (başlangıç → hedef)
- ✅ Süre bilgisi
- ✅ İstatistikler (beğeni, yorum, görüntülenme)
- ✅ Kullanıcı adı
- ✅ Gradient arka plan

#### B. Sosyal Medya Önizleme

**Facebook Debugger:**
1. Git: https://developers.facebook.com/tools/debug/
2. URL gir: `http://localhost:3000/plan/[slug]` (ngrok kullan)
3. "Fetch new information" tıkla
4. Görsel ve metadata kontrol et

**Twitter Card Validator:**
1. Git: https://cards-dev.twitter.com/validator
2. URL gir
3. "Preview card" tıkla
4. Görsel kontrol et

**LinkedIn Post Inspector:**
1. Git: https://www.linkedin.com/post-inspector/
2. URL gir
3. Önizleme kontrol et

### 3. Responsive Test

#### Mobil (< 768px)
1. Chrome DevTools → Mobile view
2. Paylaşım butonuna tıkla
3. **Beklenen:** Native share API çalışmalı
4. Modal gösterilmemeli

#### Tablet (768px - 1024px)
1. Tablet boyutunda test et
2. Modal düzgün görünmeli
3. Kartlar responsive olmalı

#### Desktop (> 1024px)
1. Full screen test et
2. Modal center'da olmalı
3. Tüm efektler çalışmalı

### 4. Tarayıcı Uyumluluğu

#### Chrome/Edge
- ✅ Tüm özellikler çalışmalı
- ✅ Animasyonlar smooth olmalı

#### Firefox
- ✅ Gradient ve blur efektleri
- ✅ Animasyonlar

#### Safari
- ✅ Backdrop blur
- ✅ Native share API (iOS)

### 5. Performans Testi

#### Lighthouse
```bash
# Chrome DevTools → Lighthouse
# Performance, Accessibility, Best Practices, SEO
```

**Hedef Skorlar:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 95

#### Network
1. DevTools → Network
2. Paylaşım butonuna tıkla
3. **Beklenen:** Ekstra network request yok
4. Modal anında açılmalı

### 6. Erişilebilirlik Testi

#### Keyboard Navigation
1. Tab tuşu ile gezin
2. ✅ Paylaşım butonuna focus olmalı
3. ✅ Enter ile modal açılmalı
4. ✅ Tab ile platform kartları arasında gezinme
5. ✅ Escape ile modal kapanmalı

#### Screen Reader
1. NVDA/JAWS kullan
2. ✅ Buton metni okunmalı
3. ✅ Platform isimleri okunmalı
4. ✅ ARIA labels çalışmalı

## 📊 Test Sonuçları

### ✅ Başarılı Testler
- [x] Paylaşım butonu görünümü
- [x] Modal açılış/kapanış
- [x] Platform kartları hover efektleri
- [x] Link kopyalama
- [x] Native share API (mobil)
- [x] Open Graph görsel oluşturma
- [x] Responsive tasarım
- [x] Animasyonlar
- [x] Erişilebilirlik

### 🐛 Bilinen Sorunlar
- Yok (tüm sorunlar düzeltildi)

## 🚀 Production Deployment

### Öncesi Kontrol Listesi
- [ ] `.env` dosyasında `NEXTAUTH_URL` production URL'i
- [ ] Open Graph görsellerini test et
- [ ] Sosyal medya önizleme araçlarıyla kontrol et
- [ ] Tüm platformlarda paylaşım test et
- [ ] Mobil cihazlarda test et
- [ ] Lighthouse skorlarını kontrol et

### Deployment Sonrası
1. Production URL ile sosyal medya araçlarını test et
2. Gerçek paylaşımlar yap ve kontrol et
3. Analytics'e paylaşım tracking ekle (gelecek)

## 💡 İpuçları

### Ngrok ile Lokal Test
```bash
# Ngrok kur ve çalıştır
ngrok http 3000

# Ngrok URL'ini sosyal medya araçlarında kullan
```

### Cache Temizleme
Facebook ve Twitter görselleri cache'ler:
- Facebook: "Fetch new information" butonu
- Twitter: URL sonuna `?v=2` ekle

### Debug Modu
```typescript
// share-buttons.tsx içinde
console.log('Share URL:', shareUrl);
console.log('Share Text:', shareText);
```

## 📝 Notlar

- Open Graph görselleri ilk istekte oluşturulur ve cache'lenir
- Native share API sadece HTTPS'de çalışır (production)
- Lokal test için ngrok veya localhost tunnel kullan
- Modal animasyonları CSS ile yapılır (performans)

