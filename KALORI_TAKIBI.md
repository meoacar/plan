# 🍽️ Kalori Takibi Sistemi

Kullanıcıların günlük yemek ve kalori alımlarını takip etmelerini sağlayan kapsamlı bir sistem.

## ✨ Özellikler

### 1. Yemek Veritabanı
- **45+ Önceden Tanımlı Yemek**: Türk mutfağına özgü yaygın yemekler
- **Kategoriler**: Kahvaltı, Ana Yemek, Sebze, Meyve, İçecek, Atıştırmalık
- **Besin Değerleri**: Kalori, protein, karbonhidrat, yağ, lif
- **Arama Özelliği**: Yemek adına göre hızlı arama

### 2. Günlük Kalori Hedefi
- Kişiselleştirilmiş günlük kalori hedefi belirleme
- Makro besin hedefleri (protein, karbonhidrat, yağ)
- Aktivite seviyesi seçimi:
  - Hareketsiz (Ofis işi)
  - Az Hareketli (Haftada 1-3 gün)
  - Orta Hareketli (Haftada 3-5 gün)
  - Çok Hareketli (Haftada 6-7 gün)
  - Aşırı Hareketli (Günde 2 kez)

### 3. Öğün Takibi
- **4 Öğün Tipi**: Kahvaltı, Öğle, Akşam, Atıştırmalık
- **Çoklu Yemek Ekleme**: Bir öğüne birden fazla yemek eklenebilir
- **Miktar Ayarlama**: Gram cinsinden özelleştirilebilir porsiyonlar
- **Otomatik Hesaplama**: Besin değerleri otomatik hesaplanır
- **Not Ekleme**: Öğünler için opsiyonel notlar

### 4. Görsel İstatistikler
- **Dairesel İlerleme Göstergesi**: Günlük kalori hedefine göre ilerleme
- **Makro Besin Dağılımı**: Protein, karbonhidrat, yağ göstergeleri
- **Kalan Kalori**: Hedefe ulaşmak için kalan kalori miktarı
- **Günlük Özet**: Tüm öğünlerin toplamı

### 5. Tarih Bazlı Takip
- Geçmiş günlere gidebilme
- Günlük öğün geçmişi
- Tarih seçici ile kolay navigasyon

## 📊 Veritabanı Yapısı

### Food (Yemek Veritabanı)
```prisma
model Food {
  id          String
  name        String        // Türkçe isim
  nameEn      String?       // İngilizce isim
  category    String        // Kategori
  calories    Float         // 100g için kalori
  protein     Float?        // 100g için protein (g)
  carbs       Float?        // 100g için karbonhidrat (g)
  fat         Float?        // 100g için yağ (g)
  fiber       Float?        // 100g için lif (g)
  servingSize Float         // Standart porsiyon (g)
  isCommon    Boolean       // Sık kullanılan
}
```

### Meal (Öğün)
```prisma
model Meal {
  id            String
  userId        String
  date          DateTime      // Öğün tarihi
  mealType      String        // Kahvaltı, Öğle, Akşam, Atıştırmalık
  totalCalories Float
  totalProtein  Float
  totalCarbs    Float
  totalFat      Float
  note          String?
  entries       MealEntry[]   // Öğündeki yemekler
}
```

### MealEntry (Öğün İçeriği)
```prisma
model MealEntry {
  id        String
  mealId    String
  foodId    String?   // Veritabanından seçilmişse
  foodName  String    // Yemek adı
  amount    Float     // Miktar (g)
  calories  Float     // Hesaplanan kalori
  protein   Float?
  carbs     Float?
  fat       Float?
}
```

### CalorieGoal (Kalori Hedefi)
```prisma
model CalorieGoal {
  id            String
  userId        String @unique
  dailyCalories Int           // Günlük kalori hedefi
  dailyProtein  Int?          // Günlük protein hedefi (g)
  dailyCarbs    Int?          // Günlük karbonhidrat hedefi (g)
  dailyFat      Int?          // Günlük yağ hedefi (g)
  activityLevel String        // Aktivite seviyesi
}
```

## 🚀 Kurulum

### 1. Veritabanı Migration
```bash
cd zayiflamaplanim
npx prisma migrate dev --name add_calorie_tracking
```

### 2. Yemek Veritabanını Seed Et
```bash
npm run db:seed:foods
```

Bu komut 45 yaygın Türk yemeğini veritabanına ekler.

## 📱 Kullanım

### Kullanıcı Akışı

1. **Kalori Hedefi Belirleme**
   - `/calories` sayfasına git
   - "Hedef Belirle" butonuna tıkla
   - Günlük kalori ve makro besin hedeflerini gir
   - Aktivite seviyesini seç
   - Kaydet

2. **Öğün Ekleme**
   - "Öğün Ekle" butonuna tıkla
   - Öğün tipini seç (Kahvaltı, Öğle, Akşam, Atıştırmalık)
   - Yemek ara ve seç
   - Miktarı ayarla (gram)
   - İstersen daha fazla yemek ekle
   - Opsiyonel not ekle
   - "Öğünü Kaydet"

3. **Öğün Görüntüleme**
   - Günlük öğünler otomatik listelenir
   - Detayları görmek için genişlet
   - İstenmeyen öğünleri sil

4. **Geçmiş Takibi**
   - Tarih seçici ile önceki günlere git
   - Geçmiş öğünleri görüntüle

## 🎨 Bileşenler

### CalorieTracker
Ana konteyner bileşeni. Tarih seçimi ve genel koordinasyonu yönetir.

### CalorieGoalCard
Kullanıcının günlük kalori ve makro besin hedeflerini gösterir ve düzenlemeye izin verir.

### CalorieStats
Günlük özet istatistiklerini dairesel göstergeler ve sayılarla görselleştirir.

### DailyMeals
Seçili güne ait tüm öğünleri listeler. Genişletilebilir detaylar ve silme özelliği.

### AddMealModal
Yeni öğün ekleme modal'ı. Yemek arama, miktar ayarlama ve çoklu yemek ekleme.

## 🔌 API Endpoints

### GET /api/calories/foods
Yemek veritabanından arama yapar.

**Query Parameters:**
- `search`: Arama terimi
- `category`: Kategori filtresi
- `commonOnly`: Sadece sık kullanılanlar

**Response:**
```json
[
  {
    "id": "...",
    "name": "Tavuk Göğsü (Izgara)",
    "category": "Ana Yemek",
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fat": 3.6,
    "servingSize": 100,
    "isCommon": true
  }
]
```

### GET /api/calories/meals
Kullanıcının öğünlerini getirir.

**Query Parameters:**
- `date`: Belirli bir gün (YYYY-MM-DD)
- `startDate` & `endDate`: Tarih aralığı

**Response:**
```json
[
  {
    "id": "...",
    "mealType": "Kahvaltı",
    "date": "2024-10-23T00:00:00.000Z",
    "totalCalories": 450,
    "totalProtein": 25,
    "totalCarbs": 50,
    "totalFat": 15,
    "note": "Güzel bir kahvaltı",
    "entries": [...]
  }
]
```

### POST /api/calories/meals
Yeni öğün ekler.

**Request Body:**
```json
{
  "date": "2024-10-23",
  "mealType": "Kahvaltı",
  "note": "Opsiyonel not",
  "entries": [
    {
      "foodId": "...",
      "foodName": "Beyaz Ekmek",
      "amount": 100,
      "calories": 265,
      "protein": 9,
      "carbs": 49,
      "fat": 3.2
    }
  ]
}
```

### DELETE /api/calories/meals/[id]
Öğün siler (sadece kendi öğünleri).

### GET /api/calories/goal
Kullanıcının kalori hedefini getirir.

### POST /api/calories/goal
Kalori hedefi oluşturur veya günceller.

**Request Body:**
```json
{
  "dailyCalories": 2000,
  "dailyProtein": 150,
  "dailyCarbs": 200,
  "dailyFat": 65,
  "activityLevel": "moderate"
}
```

## 🎯 Gelecek Geliştirmeler

- [ ] Haftalık/aylık kalori grafikleri
- [ ] Favori öğünler (hızlı ekleme)
- [ ] Özel yemek ekleme (kullanıcı tanımlı)
- [ ] Barcode scanner entegrasyonu
- [ ] Yemek fotoğrafı ekleme
- [ ] Kalori hedefi önerileri (BMR hesaplama)
- [ ] Su tüketimi takibi
- [ ] Öğün şablonları
- [ ] CSV/PDF export
- [ ] Besin değerleri detay sayfası

## 📝 Notlar

- Tüm besin değerleri 100g referans alınarak hesaplanır
- Kullanıcılar sadece kendi öğünlerini görebilir ve silebilir
- Yemek veritabanı admin tarafından genişletilebilir
- Tarih seçimi bugünden ileri gidemez
- Öğünler otomatik olarak öğün tipine göre sıralanır

## 🔒 Güvenlik

- Tüm API endpoint'leri authentication gerektirir
- Kullanıcılar sadece kendi verilerine erişebilir
- Input validasyonu (Zod schema)
- SQL injection koruması (Prisma ORM)

## 🎨 UI/UX Özellikleri

- Responsive tasarım (mobil uyumlu)
- Dairesel ilerleme göstergeleri
- Renk kodlu makro besinler (Protein: Mavi, Karbonhidrat: Turuncu, Yağ: Mor)
- Skeleton loading states
- Smooth animasyonlar
- Kolay tarih navigasyonu
- Modal tabanlı öğün ekleme
- Genişletilebilir öğün detayları

---

**Geliştirici:** Kiro AI Assistant
**Tarih:** 23 Ekim 2024
**Versiyon:** 1.0.0
