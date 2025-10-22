# 📱 Sosyal Medya Paylaşım Özelliği

## 🎯 Genel Bakış

Kullanıcıların planlarını sosyal medyada kolayca paylaşabilmeleri için güzel tasarlanmış paylaşım kartları ve paylaşım butonları eklenmiştir.

## ✨ Özellikler

### 1. Dinamik Open Graph Görselleri

Her plan için otomatik olarak oluşturulan, çekici sosyal medya paylaşım kartları:

- **Plan Detay Kartı** (`/plan/[slug]/opengraph-image.tsx`)
  - Plan başlığı
  - Başlangıç ve hedef kilo bilgileri
  - Süre bilgisi
  - Beğeni, yorum ve görüntülenme sayıları
  - Kullanıcı bilgisi
  - Gradient arka plan ve modern tasarım

- **Ana Sayfa Kartı** (`/app/opengraph-image.tsx`)
  - Site logosu ve başlığı
  - Slogan: "Gerçek Planlar, Gerçek Sonuçlar"
  - Özellik ikonları (Plan Paylaş, Keşfet, Başarıya Ulaş)
  - Marka renkleri ile tutarlı tasarım

### 2. Paylaşım Butonları

**ShareButtons** bileşeni (`/components/share-buttons.tsx`):

- **Native Share API Desteği**: Mobil cihazlarda sistem paylaşım menüsü
- **Sosyal Medya Linkleri**:
  - Twitter
  - Facebook
  - WhatsApp
  - LinkedIn
- **Link Kopyalama**: Tek tıkla link kopyalama özelliği
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **Dropdown Menü**: Desktop'ta açılır menü

### 3. Metadata Optimizasyonu

Her sayfa için optimize edilmiş metadata:

```typescript
// Plan detay sayfası
{
  title: "Plan Başlığı - Zayıflama Planım",
  description: "80kg → 65kg | 100 gün | Plan detayları...",
  openGraph: {
    images: ['/plan/[slug]/opengraph-image'],
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
  }
}
```

## 🎨 Tasarım Özellikleri

### Open Graph Görselleri

- **Boyut**: 1200x630px (sosyal medya standartı)
- **Format**: PNG
- **Renk Paleti**: 
  - Primary: #2d7a4a (yeşil)
  - Accent: #4caf50 (açık yeşil)
  - Gradient: 135deg
- **Tipografi**: System-ui font stack
- **Efektler**: 
  - Gradient arka planlar
  - Box shadow
  - Rounded corners
  - Glassmorphism efektleri

### Paylaşım Butonları

- **Renkler**: Her sosyal medya platformunun marka renkleri
  - Twitter: #1DA1F2
  - Facebook: #1877F2
  - WhatsApp: #25D366
  - LinkedIn: #0A66C2
- **İkonlar**: Lucide React icon library
- **Animasyonlar**: Hover efektleri ve geçişler
- **Erişilebilirlik**: ARIA labels ve keyboard navigation

## 📍 Kullanım Yerleri

### Plan Detay Sayfası

```tsx
import { ShareButtons } from '@/components/share-buttons';

<ShareButtons
  title={plan.title}
  url={`/plan/${plan.slug}`}
  description={`${plan.startWeight}kg → ${plan.goalWeight}kg | ${plan.durationText}`}
/>
```

Paylaşım butonu, plan detay sayfasında beğeni ve görüntülenme butonlarının yanında, sağ tarafta konumlandırılmıştır.

## 🔧 Teknik Detaylar

### Next.js ImageResponse API

Open Graph görselleri Next.js 15'in `ImageResponse` API'si ile dinamik olarak oluşturulur:

```typescript
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }) {
  // Görsel oluşturma mantığı
}
```

### Avantajlar

1. **Edge Runtime**: Hızlı görsel oluşturma
2. **Dinamik İçerik**: Her plan için özel görsel
3. **SEO Dostu**: Otomatik metadata oluşturma
4. **Cache**: Vercel'de otomatik cache
5. **Performans**: Sunucu tarafında render

### Native Share API

Modern tarayıcılarda sistem paylaşım menüsü kullanılır:

```typescript
if (navigator.share) {
  await navigator.share({
    title,
    text: description,
    url: shareUrl,
  });
}
```

Desteklemeyen tarayıcılarda dropdown menü gösterilir.

## 📱 Sosyal Medya Önizlemeleri

### Twitter

- Kart tipi: `summary_large_image`
- Görsel: 1200x630px
- Başlık: Plan başlığı
- Açıklama: Kilo bilgileri ve süre

### Facebook

- OG type: `article`
- Görsel: 1200x630px
- Site adı: "Zayıflama Planım"
- Locale: tr_TR

### WhatsApp

- Başlık ve link birlikte paylaşılır
- Otomatik önizleme gösterilir
- Mobil uyumlu

### LinkedIn

- Professional görünüm
- Makale formatında paylaşım
- Otomatik önizleme

## 🚀 Kullanıcı Deneyimi

### Paylaşım Akışı

1. Kullanıcı "Paylaş" butonuna tıklar
2. Mobilde: Native share menüsü açılır
3. Desktop'ta: Dropdown menü gösterilir
4. Kullanıcı platform seçer veya linki kopyalar
5. Paylaşım tamamlanır

### Özellikler

- ✅ Tek tıkla paylaşım
- ✅ Link kopyalama feedback'i (2 saniye)
- ✅ Responsive tasarım
- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Loading states yok (anında açılır)

## 📊 Beklenen Faydalar

### Kullanıcı Tarafı

1. **Kolay Paylaşım**: Tek tıkla sosyal medyada paylaşım
2. **Profesyonel Görünüm**: Güzel tasarlanmış paylaşım kartları
3. **Çoklu Platform**: Tüm popüler platformlar desteklenir
4. **Mobil Uyumlu**: Native share API desteği

### Site Tarafı

1. **Organik Büyüme**: Kullanıcılar planları paylaşarak siteyi tanıtır
2. **SEO**: Sosyal medya sinyalleri
3. **Marka Bilinirliği**: Tutarlı görsel kimlik
4. **Viral Potansiyel**: Güzel kartlar daha çok paylaşılır
5. **Trafik Artışı**: Sosyal medyadan gelen ziyaretçiler

## 🎯 Gelecek İyileştirmeler

### Potansiyel Eklemeler

1. **Paylaşım İstatistikleri**: Hangi planlar en çok paylaşılıyor?
2. **Paylaşım Teşvikleri**: Paylaşan kullanıcılara badge/puan
3. **Özel Hashtag'ler**: Platform bazlı otomatik hashtag'ler
4. **Pinterest Desteği**: Pin butonu ekleme
5. **QR Kod**: Plan için QR kod oluşturma
6. **Embed Kod**: Planı başka sitelere gömme
7. **Email Paylaşımı**: Plan linkini email ile gönderme
8. **Paylaşım Önizlemesi**: Paylaşmadan önce önizleme gösterme

### A/B Test Fikirleri

1. Buton konumu (sağ vs sol)
2. Buton metni ("Paylaş" vs "Arkadaşlarınla Paylaş")
3. İkon stilleri
4. Dropdown vs modal
5. Paylaşım teşvikleri

## 🔍 Test Etme

### Open Graph Görselleri

1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

### Test Adımları

1. Bir plan sayfasına gidin
2. URL'yi yukarıdaki araçlara yapıştırın
3. "Fetch new information" / "Preview card" tıklayın
4. Görsel ve metadata'yı kontrol edin

### Lokal Test

```bash
# Development sunucusunu başlatın
npm run dev

# Tarayıcıda açın
http://localhost:3000/plan/[slug]

# Görsel URL'si
http://localhost:3000/plan/[slug]/opengraph-image
```

## 📝 Notlar

- Open Graph görselleri edge runtime'da oluşturulur (hızlı)
- Görseller otomatik olarak cache'lenir
- Metadata her sayfa için optimize edilmiştir
- Native share API tüm modern tarayıcılarda desteklenir
- Fallback olarak dropdown menü gösterilir

## 🎉 Sonuç

Sosyal medya paylaşım özelliği, kullanıcıların planlarını kolayca paylaşmalarını sağlar ve sitenin organik büyümesine katkıda bulunur. Güzel tasarlanmış paylaşım kartları, profesyonel bir görünüm sunar ve marka bilinirliğini artırır.

