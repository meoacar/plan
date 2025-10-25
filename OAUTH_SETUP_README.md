# OAuth Giriş Sistemi - Kurulum ve Kullanım

Bu proje artık Google ve Facebook ile giriş yapma özelliğini desteklemektedir. OAuth entegrasyonları admin panelden kolayca yönetilebilir.

## 🎯 Özellikler

- ✅ Google OAuth 2.0 entegrasyonu
- ✅ Facebook OAuth entegrasyonu
- ✅ Admin panelden dinamik yönetim
- ✅ Otomatik cache yönetimi
- ✅ Güvenli credential saklama (veritabanında)
- ✅ Kolay aktif/pasif etme

## 📋 Kurulum Adımları

### 1. Google OAuth Kurulumu

Detaylı kurulum için: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

**Hızlı Özet:**
1. Google Cloud Console'da proje oluştur
2. OAuth 2.0 Client ID al
3. Redirect URI ekle: `http://localhost:3000/api/auth/callback/google`
4. Admin panelden ayarları gir

### 2. Facebook OAuth Kurulumu

Detaylı kurulum için: [FACEBOOK_OAUTH_SETUP.md](./FACEBOOK_OAUTH_SETUP.md)

**Hızlı Özet:**
1. Facebook Developer Console'da uygulama oluştur
2. Facebook Login ekle
3. Valid OAuth Redirect URI ekle: `http://localhost:3000/api/auth/callback/facebook`
4. Admin panelden ayarları gir

## 🔧 Admin Panel Kullanımı

### OAuth Ayarlarını Yapılandırma

1. Admin paneline giriş yap: `/admin/settings`
2. **OAuth Giriş Ayarları** bölümüne git
3. İstediğin provider'ı aktif et:
   - ✅ Google ile Giriş Yap
   - ✅ Facebook ile Giriş Yap
4. Gerekli credential'ları gir:
   - Google: Client ID ve Client Secret
   - Facebook: App ID ve App Secret
5. **Ayarları Kaydet** butonuna tıkla

### Ayarları Devre Dışı Bırakma

Herhangi bir OAuth provider'ı devre dışı bırakmak için:
1. İlgili checkbox'ı kaldır
2. Ayarları kaydet
3. Login/Register sayfalarından buton otomatik olarak kaldırılır

## 🗄️ Veritabanı Yapısı

OAuth ayarları `SiteSettings` tablosunda saklanır:

```prisma
model SiteSettings {
  // ... diğer alanlar
  googleOAuthEnabled   Boolean  @default(false)
  googleClientId       String?
  googleClientSecret   String?
  facebookOAuthEnabled Boolean  @default(false)
  facebookAppId        String?
  facebookAppSecret    String?
}
```

## 🔐 Güvenlik

- ✅ Credential'lar veritabanında güvenli şekilde saklanır
- ✅ Admin yetkisi olmayan kullanıcılar ayarlara erişemez
- ✅ Hassas bilgiler environment variable'lara gerek kalmadan yönetilir
- ✅ Cache mekanizması ile performans optimize edilmiş
- ⚠️ Production'da HTTPS kullanımı zorunludur

## 🚀 Production Deployment

### Vercel Deployment

1. Projeyi Vercel'e deploy et
2. Google/Facebook Console'da production URL'lerini ekle:
   ```
   https://yourdomain.com/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/facebook
   ```
3. Admin panelden production credential'larını gir
4. Test et

### Environment Variables (Opsiyonel)

Eğer environment variable'lar üzerinden yönetmek isterseniz:

```env
# .env dosyasına ekleyin (opsiyonel)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
FACEBOOK_APP_ID="..."
FACEBOOK_APP_SECRET="..."
```

**Not:** Admin panelden yapılan ayarlar environment variable'lara göre önceliklidir.

## 📱 Kullanıcı Deneyimi

### Login Sayfası
- OAuth butonları sadece aktif provider'lar için görünür
- Dinamik olarak yüklenir
- Responsive tasarım

### Register Sayfası
- OAuth ile kayıt seçenekleri
- Otomatik profil oluşturma
- Email doğrulama gerekmez

## 🔄 Cache Yönetimi

OAuth ayarları performans için cache'lenir:
- Cache süresi: 1 dakika
- Admin panelden ayar değiştiğinde otomatik temizlenir
- Manuel temizleme: `clearOAuthCache()` fonksiyonu

## 🐛 Sorun Giderme

### OAuth butonları görünmüyor
1. Admin panelden provider'ın aktif olduğunu kontrol et
2. Credential'ların doğru girildiğini kontrol et
3. Tarayıcı cache'ini temizle
4. Sayfayı yenile

### "redirect_uri_mismatch" hatası
1. Google/Facebook Console'da redirect URI'yi kontrol et
2. Tam URL eşleşmesi gerekir (sonunda `/` olmamalı)
3. `http` vs `https` kontrolü yap

### "Invalid client" hatası
1. Client ID/App ID'nin doğru olduğunu kontrol et
2. Client Secret/App Secret'in doğru olduğunu kontrol et
3. Provider console'da uygulamanın aktif olduğunu kontrol et

## 📚 API Endpoints

### OAuth Status
```
GET /api/auth/oauth-status
```
Aktif OAuth provider'ları döner.

**Response:**
```json
{
  "googleEnabled": true,
  "facebookEnabled": false
}
```

### Admin Settings
```
PATCH /api/admin/settings
```
OAuth ayarlarını günceller (Admin yetkisi gerekir).

## 🎨 Özelleştirme

### Buton Stilleri

Login/Register sayfalarındaki OAuth butonlarını özelleştirmek için:
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`

### Provider Ekleme

Yeni bir OAuth provider eklemek için:
1. `prisma/schema.prisma` - Yeni alanlar ekle
2. `src/lib/auth.ts` - Provider'ı yapılandır
3. `src/components/admin/settings-form.tsx` - Form alanları ekle
4. `src/lib/validations.ts` - Validation kuralları ekle

## 📞 Destek

Sorun yaşarsanız:
1. İlgili kurulum rehberini kontrol edin
2. Console loglarını inceleyin
3. Provider documentation'ına bakın

## 📄 Lisans

Bu özellik projenin ana lisansı altındadır.
