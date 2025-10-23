# 🛒 Alışveriş Listesi Özelliği

## Genel Bakış

Kullanıcıların diyet planlarına göre akıllı alışveriş listeleri oluşturmasını sağlayan kapsamlı bir sistem.

## Özellikler

### ✨ Akıllı Liste Oluşturma
- Diyet planındaki içeriği analiz eder
- Otomatik olarak gerekli malzemeleri tespit eder
- Kategorilere göre düzenler (Protein, Sebze, Meyve, Tahıl, vb.)
- Önerilen miktarları belirtir

### 📋 Liste Yönetimi
- Birden fazla liste oluşturma
- Liste adlandırma ve açıklama ekleme
- Plana özel listeler
- Haftalık/aylık liste organizasyonu

### ✅ Alışveriş Takibi
- Öğeleri işaretleme/işareti kaldırma
- Tamamlanan öğeler görsel olarak farklılaşır
- İlerleme takibi

### 🏷️ Kategoriler
1. **🥩 Protein** - Et, tavuk, balık, yumurta, süt ürünleri
2. **🥬 Sebze** - Taze sebzeler
3. **🍎 Meyve** - Taze meyveler
4. **🌾 Tahıl** - Yulaf, pirinç, ekmek, makarna
5. **🥛 Süt Ürünleri** - Süt, yoğurt, peynir
6. **💧 İçecek** - Su, çay, kahve
7. **📦 Diğer** - Baharatlar, yağlar, kuruyemişler

## Veritabanı Yapısı

### ShoppingList Modeli
```prisma
model ShoppingList {
  id          String              @id @default(cuid())
  userId      String
  planId      String?             // Hangi plana göre oluşturuldu
  name        String
  description String?
  weekNumber  Int?                // Kaçıncı hafta için
  isCompleted Boolean             @default(false)
  items       ShoppingListItem[]
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
}
```

### ShoppingListItem Modeli
```prisma
model ShoppingListItem {
  id             String       @id @default(cuid())
  shoppingListId String
  category       String       // Kategori
  name           String       // Ürün adı
  quantity       String       // Miktar (500g, 2 adet, vb.)
  isChecked      Boolean      @default(false)
  note           String?      // Ek notlar
  estimatedPrice Float?       // Tahmini fiyat
  order          Int          @default(0)
  createdAt      DateTime     @default(now())
}
```

## API Endpoints

### GET /api/shopping-lists
Kullanıcının tüm alışveriş listelerini getirir.

**Query Parameters:**
- `planId` (opsiyonel) - Belirli bir plana ait listeleri filtreler

**Response:**
```json
{
  "lists": [
    {
      "id": "...",
      "name": "Haftalık Alışveriş",
      "items": [...]
    }
  ]
}
```

### POST /api/shopping-lists
Yeni boş liste oluşturur.

**Body:**
```json
{
  "name": "Liste Adı",
  "description": "Açıklama",
  "planId": "plan-id",
  "weekNumber": 1
}
```

### POST /api/shopping-lists/generate
Diyet planından akıllı liste oluşturur.

**Body:**
```json
{
  "planId": "plan-id",
  "planTitle": "Plan Başlığı",
  "dietContent": "Beslenme planı içeriği..."
}
```

**Akıllı Analiz:**
- Beslenme planındaki anahtar kelimeleri tarar
- 50+ farklı yiyecek ve içeceği tanır
- Türkçe ve İngilizce anahtar kelimeler
- Otomatik kategorizasyon
- Önerilen miktarlar

### PATCH /api/shopping-lists/items/[id]
Liste öğesini günceller (işaretleme/işareti kaldırma).

**Body:**
```json
{
  "isChecked": true
}
```

### DELETE /api/shopping-lists/[id]
Listeyi siler.

## Kullanım

### Plan Detay Sayfasında
Alışveriş listesi bileşeni otomatik olarak plan detay sayfasında görünür:

```tsx
<ShoppingList 
  planId={plan.id}
  planTitle={plan.title}
  dietContent={plan.diet}
/>
```

### Akıllı Liste Oluşturma
1. "Yeni Liste" butonuna tıkla
2. "🤖 Akıllı Liste Oluştur" seçeneğini seç
3. Sistem diyet planını analiz eder
4. Otomatik olarak kategorize edilmiş liste oluşturulur

### Manuel Liste Oluşturma
1. "Yeni Liste" butonuna tıkla
2. Liste adı gir
3. "Boş Liste Oluştur" seçeneğini seç
4. Manuel olarak öğe ekle

## Akıllı Analiz Algoritması

### Tanınan Yiyecekler

**Protein Kaynakları:**
- Tavuk göğsü, yumurta, ton balığı
- Süzme yoğurt, peynir, hindi
- Somon, kırmızı et

**Sebzeler:**
- Brokoli, salatalık, domates
- Marul, havuç, ıspanak
- Kabak, biber

**Meyveler:**
- Elma, muz, portakal
- Çilek, kivi, üzüm

**Tahıllar:**
- Yulaf, esmer pirinç
- Tam buğday ekmeği, kinoa, bulgur

**İçecekler:**
- Su, yeşil çay, süt

**Diğer:**
- Zeytinyağı, badem, ceviz
- Fıstık ezmesi

### Anahtar Kelime Eşleştirme
Sistem hem Türkçe hem İngilizce anahtar kelimeleri tarar:
- "tavuk" veya "chicken" → Tavuk göğsü
- "yumurta" veya "egg" → Yumurta
- "brokoli" veya "broccoli" → Brokoli

## Tasarım Özellikleri

### Görsel Stil
- Gradient arka planlar
- Kategori bazlı renk kodlaması
- Glassmorphism efektleri
- Hover animasyonları

### Kullanıcı Deneyimi
- Kolay işaretleme sistemi
- Görsel geri bildirim
- Responsive tasarım
- Hızlı liste geçişi

### Erişilebilirlik
- Büyük tıklama alanları
- Yüksek kontrast
- Açık etiketler
- Klavye navigasyonu

## Gelecek Geliştirmeler

### Planlanan Özellikler
- [ ] Özel öğe ekleme
- [ ] Fiyat takibi ve bütçe hesaplama
- [ ] Market karşılaştırması
- [ ] Tarif entegrasyonu
- [ ] Alışveriş geçmişi
- [ ] Favori ürünler
- [ ] Paylaşılabilir listeler
- [ ] QR kod ile liste paylaşımı
- [ ] Mobil uygulama entegrasyonu
- [ ] Sesli komut desteği

### İyileştirmeler
- [ ] Daha fazla yiyecek tanıma
- [ ] Mevsimsel öneriler
- [ ] Bölgesel ürün önerileri
- [ ] Alternatif ürün önerileri
- [ ] Besin değeri hesaplama

## Güvenlik

- Kullanıcı kimlik doğrulaması gerekli
- Liste sahipliği kontrolü
- Rate limiting (gelecekte eklenecek)
- XSS koruması

## Performans

- Veritabanı indeksleme
- Optimize edilmiş sorgular
- Lazy loading
- Önbellek stratejisi (gelecekte)

## Test Senaryoları

### Manuel Test
1. Giriş yap
2. Bir plan detayına git
3. "Yeni Liste" butonuna tıkla
4. "Akıllı Liste Oluştur" seç
5. Listenin oluşturulduğunu doğrula
6. Öğeleri işaretle/işareti kaldır
7. Yeni liste oluştur
8. Listeler arası geçiş yap
9. Liste sil

### Beklenen Sonuçlar
- Liste başarıyla oluşturulmalı
- Kategoriler doğru görünmeli
- İşaretleme anında çalışmalı
- Silme işlemi onay istenmeli
- Boş liste durumu gösterilmeli

## Sorun Giderme

### Liste Oluşturulamıyor
- Giriş yapıldığından emin olun
- Diyet planı içeriği olduğunu kontrol edin
- Konsol hatalarını kontrol edin

### Öğeler İşaretlenmiyor
- İnternet bağlantısını kontrol edin
- Sayfayı yenileyin
- Tarayıcı konsolunu kontrol edin

### Akıllı Liste Boş
- Diyet planında tanınabilir yiyecekler olmalı
- Temel öğeler otomatik eklenir
- Manuel öğe ekleme özelliği gelecekte eklenecek

## Katkıda Bulunma

Yeni yiyecek tanıma eklemek için:
1. `src/app/api/shopping-lists/generate/route.ts` dosyasını aç
2. İlgili kategoriye yeni öğe ekle
3. Anahtar kelimeleri belirt
4. Test et

## Lisans

Bu özellik projenin genel lisansı altındadır.
