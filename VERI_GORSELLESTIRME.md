# 📊 Veri & Görselleştirme Özellikleri

Bu dokümantasyon, uygulamaya eklenen 5 yeni veri görselleştirme özelliğini açıklar.

## 🎯 Özellikler

### 1. 🗺️ Kilo Haritası - Türkiye Haritası
**Dosya:** `src/components/analytics/turkey-weight-map.tsx`

Türkiye'nin farklı şehirlerinden kaç kişinin ne kadar kilo verdiğini görselleştirir.

**Özellikler:**
- Şehir bazında kullanıcı sayısı
- Toplam kilo kaybı
- Ortalama kilo kaybı (kişi başı)
- Renk yoğunluğu ile görselleştirme (daha fazla kilo kaybı = daha koyu yeşil)
- Hover efekti ile detaylı bilgi

**API Endpoint:** `/api/analytics/weight-map`

**Kullanım:**
```tsx
import { TurkeyWeightMap } from '@/components/analytics/turkey-weight-map';

<TurkeyWeightMap />
```

---

### 2. ⏳ Zaman Tüneli - Kullanıcı Yolculuğu
**Dosya:** `src/components/analytics/user-timeline.tsx`

Kullanıcının tüm yolculuğunu kronolojik bir timeline'da gösterir.

**Gösterilen Olaylar:**
- ⚖️ Kilo kayıtları
- ✅ Günlük check-in'ler
- 📝 Plan paylaşımları
- 🏆 Kazanılan rozetler
- 📸 İlerleme fotoğrafları

**Özellikler:**
- Tarih sıralı görünüm
- Renkli ikonlar ve kategoriler
- Her olay için detaylı açıklama
- Son 50 olay gösterimi

**API Endpoint:** `/api/analytics/timeline?userId={userId}`

**Kullanım:**
```tsx
import { UserTimeline } from '@/components/analytics/user-timeline';

<UserTimeline userId={session.user.id} />
```

---

### 3. 📊 Karşılaştırma Grafiği - Sen vs Ortalama
**Dosya:** `src/components/analytics/comparison-chart.tsx`

Kullanıcının performansını ortalama kullanıcı ile karşılaştırır.

**Karşılaştırılan Metrikler:**
- Kilo kaybı (kg)
- Kilo takip sayısı
- Check-in sayısı
- Plan sayısı
- Beğeni sayısı
- Yorum sayısı
- Streak (ardışık gün)
- XP puanı

**Özellikler:**
- Recharts ile interaktif bar chart
- Yeşil (sen) vs Gri (ortalama) renk kodlaması
- Tooltip ile detaylı bilgi
- Responsive tasarım

**API Endpoint:** `/api/analytics/comparison?userId={userId}`

**Kullanım:**
```tsx
import { ComparisonChart } from '@/components/analytics/comparison-chart';

<ComparisonChart userId={session.user.id} />
```

---

### 4. 🔥 Aktivite Haritası - Heatmap
**Dosya:** `src/components/analytics/activity-heatmap.tsx`

Hangi gün ve saatlerde daha çok plan paylaşıldığını gösterir.

**Özellikler:**
- 7 gün x 24 saat grid
- Renk yoğunluğu ile aktivite seviyesi
- Hover ile detaylı bilgi
- Son 30 günün verileri
- Responsive tasarım

**Renk Skalası:**
- Gri: Aktivite yok
- Açık yeşil: Az aktivite
- Koyu yeşil: Yoğun aktivite

**API Endpoint:** `/api/analytics/heatmap`

**Kullanım:**
```tsx
import { ActivityHeatmap } from '@/components/analytics/activity-heatmap';

<ActivityHeatmap />
```

---

### 5. 🎯 Başarı Tahmini - Success Predictor
**Dosya:** `src/components/analytics/success-predictor.tsx`

Kullanıcının hedefine ulaşma olasılığını tahmin eder.

**Hesaplanan Faktörler:**
1. **Düzenli Kilo Takibi (30%)** - Son 10 günde kaç kilo kaydı
2. **Check-in Sıklığı (25%)** - Son 30 günde kaç check-in
3. **Süreklilik (20%)** - Streak (ardışık gün sayısı)
4. **Topluluk Katılımı (15%)** - Plan paylaşım sayısı
5. **Başarı Rozetleri (10%)** - Kazanılan rozet sayısı

**Özellikler:**
- Yüzdelik başarı skoru
- Her faktör için detaylı açıklama
- Progress bar ile görselleştirme
- Kişiselleştirilmiş öneriler
- Renk kodlaması (yeşil: yüksek, sarı: orta, kırmızı: düşük)

**API Endpoint:** `/api/analytics/success-prediction?userId={userId}`

**Kullanım:**
```tsx
import { SuccessPredictor } from '@/components/analytics/success-predictor';

<SuccessPredictor userId={session.user.id} />
```

---

## 📄 Ana Sayfa

**Dosya:** `src/app/analytics/page.tsx`

Tüm görselleştirme bileşenlerini bir araya getiren ana sayfa.

**Erişim:** `/analytics`

**Özellikler:**
- Kullanıcı girişi gerekli
- Responsive layout
- Tüm 5 görselleştirme bir arada
- SEO optimize edilmiş

---

## 🔌 API Endpoints

### 1. Weight Map
```
GET /api/analytics/weight-map
```
**Response:**
```json
[
  {
    "city": "İstanbul",
    "userCount": 245,
    "avgWeightLoss": 12.5,
    "totalWeightLoss": 3062.5
  }
]
```

### 2. Timeline
```
GET /api/analytics/timeline?userId={userId}
```
**Response:**
```json
[
  {
    "id": "weight-123",
    "type": "weight_log",
    "title": "75.5 kg",
    "description": "Kilo kaydı eklendi",
    "date": "2024-10-22T10:00:00Z",
    "icon": "⚖️",
    "color": "#3b82f6"
  }
]
```

### 3. Comparison
```
GET /api/analytics/comparison?userId={userId}
```
**Response:**
```json
[
  {
    "metric": "Kilo Kaybı (kg)",
    "you": 12.5,
    "average": 8.5
  }
]
```

### 4. Heatmap
```
GET /api/analytics/heatmap
```
**Response:**
```json
[
  {
    "day": "Pzt",
    "hour": 10,
    "count": 15
  }
]
```

### 5. Success Prediction
```
GET /api/analytics/success-prediction?userId={userId}
```
**Response:**
```json
{
  "successProbability": 78,
  "factors": [
    {
      "name": "Düzenli Kilo Takibi",
      "score": 80,
      "weight": 0.3,
      "description": "Son 10 günde 8 kilo kaydı"
    }
  ],
  "recommendations": [
    "Her gün kilonu kaydet - düzenli takip başarının anahtarı"
  ]
}
```

---

## 🎨 Tasarım Özellikleri

### Renk Paleti
- **Birincil Yeşil:** `#22c55e` (başarı, pozitif)
- **Gri:** `#94a3b8` (ortalama, nötr)
- **Mavi:** `#3b82f6` (bilgi)
- **Mor:** `#8b5cf6` (plan)
- **Turuncu:** `#f59e0b` (rozet)
- **Pembe:** `#ec4899` (fotoğraf)

### Responsive Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### Animasyonlar
- Loading skeleton
- Hover scale efekti
- Smooth transitions
- Progress bar animasyonu

---

## 🚀 Gelecek Geliştirmeler

### Kısa Vadeli
- [ ] Şehir bilgisi için User modeline `city` alanı ekleme
- [ ] Gerçek zamanlı veri güncellemeleri
- [ ] Export to PDF/PNG özelliği
- [ ] Daha fazla karşılaştırma metriği

### Orta Vadeli
- [ ] Makine öğrenmesi ile gelişmiş tahmin
- [ ] Sosyal karşılaştırma (arkadaşlarla)
- [ ] Özel tarih aralığı seçimi
- [ ] Daha fazla görselleştirme tipi

### Uzun Vadeli
- [ ] AI destekli öneriler
- [ ] Kişiselleştirilmiş dashboard
- [ ] Gerçek zamanlı bildirimler
- [ ] Mobil uygulama entegrasyonu

---

## 📝 Notlar

### Performans
- Tüm API endpoint'leri cache'lenebilir
- Büyük veri setleri için pagination önerilir
- Client-side rendering kullanılıyor (loading states)

### Güvenlik
- Kullanıcı kimlik doğrulaması gerekli
- Sadece kendi verilerini görebilir
- Admin panelinden tüm verilere erişim

### Veritabanı
- Mevcut Prisma şeması kullanılıyor
- Ek migration gerekmez
- İndeksler optimize edilmiş

---

## 🔗 İlgili Dosyalar

### Components
- `src/components/analytics/turkey-weight-map.tsx`
- `src/components/analytics/user-timeline.tsx`
- `src/components/analytics/comparison-chart.tsx`
- `src/components/analytics/activity-heatmap.tsx`
- `src/components/analytics/success-predictor.tsx`

### API Routes
- `src/app/api/analytics/weight-map/route.ts`
- `src/app/api/analytics/timeline/route.ts`
- `src/app/api/analytics/comparison/route.ts`
- `src/app/api/analytics/heatmap/route.ts`
- `src/app/api/analytics/success-prediction/route.ts`

### Pages
- `src/app/analytics/page.tsx`

### UI Components
- `src/components/ui/card.tsx`
- `src/components/ui/progress.tsx`

---

## 📞 Destek

Sorularınız için:
- GitHub Issues
- Email: support@zayiflamaplanim.com
- Dokümantasyon: `/docs`

---

**Son Güncelleme:** 22 Ekim 2025
**Versiyon:** 1.0.0
