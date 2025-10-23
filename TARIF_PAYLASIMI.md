# 🍽️ Tarif Paylaşımı Sistemi

Kullanıcıların sağlıklı yemek tariflerini paylaşabileceği, admin onayından geçen kapsamlı bir tarif yönetim sistemi.

## ✨ Özellikler

### Kullanıcı Özellikleri

- ✅ **Tarif Paylaşımı**: Kullanıcılar kendi sağlıklı yemek tariflerini paylaşabilir
- 📸 **Resim Yükleme**: En az 1, en fazla 5 resim yüklenebilir (bilgisayar veya mobil cihazdan)
- 📝 **Detaylı Tarif Bilgileri**:
  - Başlık ve açıklama
  - Kategori (Ana Yemek, Çorba, Salata, Tatlı, Atıştırmalık, İçecek)
  - Zorluk seviyesi (Kolay, Orta, Zor)
  - Hazırlık ve pişirme süresi
  - Porsiyon sayısı
  - Malzemeler listesi
  - Adım adım yapılış talimatları
  - Besin değerleri (kalori, protein, karbonhidrat, yağ)

- 🔄 **Tarif Düzenleme**: Reddedilen tarifler düzenlenip tekrar onaya gönderilebilir
- 📋 **Tariflerim Sayfası**: Kullanıcılar kendi tariflerini görüntüleyebilir ve yönetebilir
- ❤️ **Beğeni Sistemi**: Tarifleri beğenme/beğenmekten vazgeçme
- 💬 **Yorum Sistemi**: Tariflere yorum yapabilme
- 👁️ **Görüntülenme Sayacı**: Her tarif için görüntülenme istatistiği
- 🖼️ **Resim Galerisi**: Tarif detayında resimler arasında geçiş yapabilme

### Admin Özellikleri

- ✅ **Onay Sistemi**: Admin tarifleri onaylayabilir veya reddedebilir
- 📝 **Red Nedeni**: Tarif reddedilirken mutlaka neden belirtilmeli
- 🔍 **Filtreleme**: Bekleyen, onaylı ve reddedilen tarifleri filtreleme
- 📊 **İstatistikler**: Admin dashboard'da tarif istatistikleri
- 🗑️ **Silme**: Admin onaylı tarifleri silebilir
- 📋 **Detaylı Liste**: Tüm tarifleri resim, kategori, beğeni ve yorum sayılarıyla görüntüleme

## 📁 Dosya Yapısı

### API Routes
```
src/app/api/
├── recipes/
│   ├── route.ts                    # Tarif listesi ve oluşturma
│   └── [slug]/
│       ├── route.ts                # Tarif detay, güncelleme, silme
│       ├── like/route.ts           # Beğeni işlemleri
│       └── comment/route.ts        # Yorum ekleme
├── admin/recipes/
│   ├── route.ts                    # Admin tarif listesi
│   └── [id]/
│       ├── approve/route.ts        # Tarif onaylama
│       └── reject/route.ts         # Tarif reddetme
└── upload/recipe/route.ts          # Resim yükleme
```

### Pages
```
src/app/
├── recipes/
│   ├── page.tsx                    # Tarif listesi (kategori filtreleme)
│   ├── submit/page.tsx             # Yeni tarif ekleme formu
│   ├── my-recipes/page.tsx         # Kullanıcının tarifleri
│   ├── edit/[slug]/page.tsx        # Tarif düzenleme
│   └── [slug]/page.tsx             # Tarif detay sayfası
└── admin/recipes/page.tsx          # Admin tarif yönetimi
```

### Components
```
src/components/
├── recipe-detail.tsx               # Tarif detay component
├── recipe-edit-form.tsx            # Tarif düzenleme formu
└── admin/
    └── admin-recipe-list.tsx       # Admin tarif listesi component
```

### Database Schema
```prisma
enum RecipeStatus {
  PENDING
  APPROVED
  REJECTED
}

model Recipe {
  id              String
  userId          String
  title           String
  slug            String @unique
  description     String
  ingredients     String (JSON)
  instructions    String
  prepTime        Int?
  cookTime        Int?
  servings        Int?
  difficulty      String?
  category        String
  calories        Float?
  protein         Float?
  carbs           Float?
  fat             Float?
  images          RecipeImage[]
  status          RecipeStatus
  rejectionReason String?
  views           Int
  likes           RecipeLike[]
  comments        RecipeComment[]
  favorites       RecipeFavorite[]
}

model RecipeImage {
  id        String
  recipeId  String
  url       String
  order     Int
}
```

## 🚀 Kullanım

### Kullanıcı İçin

1. **Tarif Paylaşma**:
   - Navbar'dan "Özellikler" > "Sağlıklı Tarifler" > "Tarif Paylaş" butonuna tıklayın
   - Formu doldurun (tüm zorunlu alanlar * ile işaretli)
   - En az 1, en fazla 5 resim yükleyin
   - "Tarifi Gönder" butonuna tıklayın
   - Tarif admin onayına gönderilir

2. **Tariflerimi Görüntüleme**:
   - `/recipes/my-recipes` sayfasına gidin
   - Tüm tariflerinizi durum bilgileriyle görün
   - Reddedilen tarifleri düzenleyebilirsiniz

3. **Tarif Düzenleme**:
   - Reddedilen bir tarifin yanındaki "Düzenle" butonuna tıklayın
   - Red nedenini okuyun
   - Gerekli düzeltmeleri yapın
   - "Güncelle ve Onaya Gönder" butonuna tıklayın

### Admin İçin

1. **Tarif Onaylama/Reddetme**:
   - Admin panelden "Tarifler" menüsüne gidin
   - "Bekleyenler" filtresini seçin
   - Tarifi görüntüleyin
   - "Onayla" veya "Reddet" butonuna tıklayın
   - Reddederken mutlaka neden belirtin

2. **Filtreleme**:
   - Tümü: Tüm tarifler
   - Bekleyenler: Onay bekleyen tarifler
   - Onaylılar: Yayında olan tarifler
   - Reddedilenler: Reddedilen tarifler

## 🔒 Güvenlik

- ✅ Sadece giriş yapmış kullanıcılar tarif paylaşabilir
- ✅ Kullanıcılar sadece kendi tariflerini düzenleyebilir
- ✅ Admin onayı olmadan tarifler yayınlanmaz
- ✅ Resim yükleme boyut kontrolü (5MB limit)
- ✅ Resim tipi kontrolü (sadece image/* kabul edilir)
- ✅ SQL injection koruması (Prisma ORM)
- ✅ XSS koruması

## 📊 Veritabanı Migration

Migration otomatik olarak uygulandı:
```bash
npx prisma migrate dev --name add_recipe_system
```

## 🎨 Kategoriler

- Ana Yemek
- Çorba
- Salata
- Tatlı
- Atıştırmalık
- İçecek

## 📝 Zorluk Seviyeleri

- Kolay
- Orta
- Zor

## 🔗 Linkler

- Tarif Listesi: `/recipes`
- Tarif Paylaş: `/recipes/submit`
- Tariflerim: `/recipes/my-recipes`
- Admin Tarif Yönetimi: `/admin/recipes`

## 🎯 Özellik Detayları

### Resim Yükleme
- Kullanıcılar bilgisayarlarından veya mobil cihazlarından resim seçebilir
- Resimler sunucuda `/public/uploads/recipes/` klasörüne kaydedilir
- Her resim benzersiz bir isimle kaydedilir: `{userId}-{timestamp}-{random}.{extension}`
- Resimler veritabanında URL olarak saklanır

### Onay Süreci
1. Kullanıcı tarif paylaşır → Status: PENDING
2. Admin tarifi inceler
3. Admin onaylar → Status: APPROVED (tarif yayına girer)
4. Admin reddeder → Status: REJECTED (kullanıcı düzenleyebilir)
5. Kullanıcı düzenler → Status: PENDING (tekrar onaya gider)

### Bildirimler
- Tarif gönderildiğinde: "Tarifiniz başarıyla gönderildi! Admin onayından sonra yayınlanacak."
- Tarif güncellendiğinde: "Tarifiniz güncellendi ve tekrar onaya gönderildi!"
- Admin onayladığında: Aktivite loguna kaydedilir
- Admin reddedildiğinde: Aktivite loguna kaydedilir + red nedeni kullanıcıya gösterilir

## 🐛 Hata Ayıklama

Eğer bir sorun yaşarsanız:

1. Konsol loglarını kontrol edin
2. Veritabanı bağlantısını kontrol edin
3. Prisma Client'ı yeniden oluşturun: `npx prisma generate`
4. Migration'ları kontrol edin: `npx prisma migrate status`

## 📈 Gelecek Geliştirmeler

- [ ] Tarif favorileme
- [ ] Tarif koleksiyonları
- [ ] Tarif puanlama sistemi
- [ ] Tarif arama (malzeme bazlı)
- [ ] Tarif yazdırma
- [ ] Tarif PDF export
- [ ] Sosyal medya paylaşımı
- [ ] Tarif önerileri (AI destekli)
- [ ] Besin değeri hesaplayıcı
- [ ] Alışveriş listesi oluşturma (tariften)

## ✅ Tamamlanan Özellikler

- [x] Tarif paylaşımı
- [x] Admin onay sistemi
- [x] Red nedeni sistemi
- [x] Tarif düzenleme
- [x] Resim yükleme (1-5 adet)
- [x] Kategori filtreleme
- [x] Beğeni sistemi
- [x] Yorum sistemi
- [x] Görüntülenme sayacı
- [x] Resim galerisi
- [x] Besin değerleri
- [x] Admin dashboard istatistikleri
- [x] Navbar entegrasyonu
