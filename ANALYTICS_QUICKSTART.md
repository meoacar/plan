# 📊 Analytics Hızlı Başlangıç

## 🚀 Kurulum

### 1. Database Migration
```bash
cd zayiflamaplanim
npx prisma migrate dev --name add_city_to_user
npx prisma generate
```

### 2. Development Server
```bash
npm run dev
```

### 3. Erişim
Tarayıcıda açın: `http://localhost:3000/analytics`

## ✨ Özellikler

### 1. 🗺️ Türkiye Kilo Haritası
- Şehir bazında kilo kaybı istatistikleri
- Renk yoğunluğu ile görselleştirme
- Gerçek zamanlı veri (city alanı doldurulduğunda)

### 2. ⏳ Zaman Tüneli
- Kullanıcının tüm aktiviteleri
- Kilo kayıtları, check-in'ler, planlar, rozetler
- Kronolojik sıralama

### 3. 📊 Karşılaştırma Grafiği
- Sen vs Ortalama kullanıcı
- 8 farklı metrik
- İnteraktif bar chart

### 4. 🔥 Aktivite Haritası
- Gün ve saat bazında aktivite
- 7x24 heatmap
- Son 30 günün verileri

### 5. 🎯 Başarı Tahmini
- 5 faktör bazlı hesaplama
- Yüzdelik başarı skoru
- Kişiselleştirilmiş öneriler

## 📱 Kullanım

### Kullanıcı Olarak
1. Giriş yap
2. Navbar'dan "İlerleme Takibi" tıkla
3. Tüm görselleştirmeleri gör

### Admin Olarak
- Tüm kullanıcıların verilerini görebilir
- Admin panelinden detaylı raporlar

## 🎨 Özelleştirme

### Renkleri Değiştir
```tsx
// components/analytics/*.tsx dosyalarında
const bgColor = `rgba(34, 197, 94, ${intensity / 100})`;
```

### Metrik Ekle
```tsx
// api/analytics/comparison/route.ts
data.push({
  metric: 'Yeni Metrik',
  you: userValue,
  average: avgValue,
});
```

## 🐛 Sorun Giderme

### Veri Görünmüyor
- Kullanıcı girişi yaptığınızdan emin olun
- Veritabanında veri olduğunu kontrol edin
- Console'da hata var mı bakın

### Migration Hatası
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### API Hatası
- `.env` dosyasını kontrol edin
- Database bağlantısını test edin
- Server loglarını inceleyin

## 📚 Daha Fazla Bilgi

- Detaylı dokümantasyon: `VERI_GORSELLESTIRME.md`
- Migration bilgisi: `MIGRATION_CITY_FIELD.md`
- API referansı: Her route dosyasında

## 🎯 Sonraki Adımlar

1. ✅ Migration'ı çalıştır
2. ✅ Profil sayfasına city alanı ekle
3. ✅ Test verisi oluştur
4. ✅ Analytics sayfasını test et
5. ✅ Production'a deploy et

## 💡 İpuçları

- Mock data otomatik gösterilir (veri yoksa)
- Tüm bileşenler responsive
- Loading states otomatik
- Error handling mevcut

---

**Hazır!** Artık analytics özelliklerini kullanabilirsiniz. 🎉
