# Takip Sistemi Test Rehberi

## ✅ Kurulum Tamamlandı

Takip sistemi başarıyla kuruldu! Aşağıdaki adımları takip ederek test edebilirsiniz.

## 🚀 Test Adımları

### 1. Veritabanı Migrasyonu (Tamamlandı ✅)
```bash
npx prisma migrate dev --name add_follow_system
npx prisma generate
```

### 2. Development Server'ı Başlatın
```bash
npm run dev
```

### 3. Test Senaryoları

#### A. Profil Sayfasında Takip
1. Giriş yapın
2. Başka bir kullanıcının profiline gidin: `/profile/[userId]`
3. **"Takip Et"** butonunu görmelisiniz
4. Butona tıklayın → **"Takipten Çık"** olarak değişmeli
5. Takipçi/Takip sayılarının güncellendiğini kontrol edin

#### B. Plan Kartlarında Takip
1. Ana sayfaya gidin: `/`
2. Plan kartlarında kullanıcı adının yanında **compact takip butonu** görmelisiniz
3. Butona tıklayın (sayfa yenilenmeden çalışmalı)
4. İkon değişmeli (UserPlus → UserMinus)

#### C. Takipçi/Takip Listeleri
1. Profil sayfasında **"X Takipçi"** veya **"X Takip"** linklerine tıklayın
2. Liste sayfası açılmalı
3. Her kullanıcı kartında takip butonu olmalı
4. Sayfalama çalışmalı (20'den fazla kullanıcı varsa)

#### D. Navbar Menüsü
1. Sağ üstteki profil menüsünü açın
2. **"Takip Edilenler"** linkini görmelisiniz
3. Tıklayın → Takip ettiğiniz kullanıcılar listelenmeli

## 🔍 Kontrol Listesi

- [ ] Profil sayfasında takip butonu görünüyor
- [ ] Takip butonu çalışıyor (takip et/takipten çık)
- [ ] Takipçi/takip sayıları doğru gösteriliyor
- [ ] Plan kartlarında takip butonu var
- [ ] Takipçi listesi sayfası çalışıyor
- [ ] Takip edilen listesi sayfası çalışıyor
- [ ] Navbar'da takip edilenler linki var
- [ ] Kendi profilinde takip butonu görünmüyor
- [ ] Giriş yapmadan takip butonu görünmüyor

## 🐛 Olası Sorunlar ve Çözümler

### Takip butonu görünmüyor
- Giriş yaptığınızdan emin olun
- Kendi profilinizde değilsiniz değil mi?
- Browser console'da hata var mı kontrol edin

### "Unauthorized" hatası
- Session'ın geçerli olduğundan emin olun
- Çıkış yapıp tekrar giriş yapın

### Takipçi sayıları güncellenmiyor
- Sayfayı yenileyin
- API endpoint'lerinin çalıştığını kontrol edin

### Prisma generate hatası
- Development server'ı durdurun
- `npx prisma generate` komutunu tekrar çalıştırın
- Server'ı yeniden başlatın

## 📊 API Test (Opsiyonel)

### Takip Et
```bash
curl -X POST http://localhost:3000/api/follow \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID_HERE"}'
```

### Takipten Çık
```bash
curl -X DELETE "http://localhost:3000/api/follow?userId=USER_ID_HERE"
```

### Takip Durumu Kontrol
```bash
curl "http://localhost:3000/api/follow/check?userId=USER_ID_HERE"
```

### Takipçileri Getir
```bash
curl "http://localhost:3000/api/follow/followers?userId=USER_ID_HERE"
```

### Takip Edilenleri Getir
```bash
curl "http://localhost:3000/api/follow/following?userId=USER_ID_HERE"
```

## 🎉 Başarılı Test Sonrası

Tüm testler başarılı olduysa, takip sistemi tamamen çalışıyor demektir! 

Artık kullanıcılar:
- Birbirlerini takip edebilir
- Takipçilerini görebilir
- Takip ettikleri kişileri görebilir
- Plan kartlarından hızlıca takip edebilir

## 📝 Notlar

- Takip sistemi gerçek zamanlı çalışır (sayfa yenileme gerektirmez)
- Tüm işlemler veritabanına kaydedilir
- Cascade delete ile kullanıcı silindiğinde takip ilişkileri de silinir
- Performans için indeksler eklenmiştir
