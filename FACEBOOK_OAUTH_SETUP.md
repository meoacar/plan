# Facebook OAuth Kurulum Rehberi

Facebook OAuth ile giriş özelliğini aktif etmek için aşağıdaki adımları takip edin.

## 1. Facebook Developer Console'da Uygulama Oluşturma

1. https://developers.facebook.com/ adresine gidin
2. Sağ üstten **"My Apps"** > **"Create App"** seçin
3. **Use case:** "Authenticate and request data from users with Facebook Login" seçin
4. **App type:** "Consumer" seçin
5. **App name:** "Zayıflama Planım" (veya istediğiniz bir isim)
6. **App contact email:** Email adresiniz
7. **Create App** butonuna tıklayın

## 2. Facebook Login Ekleme

1. Dashboard'da **"Add Products"** bölümünden **"Facebook Login"** bulun
2. **"Set Up"** butonuna tıklayın
3. Platform olarak **"Web"** seçin
4. Site URL'inizi girin:
   ```
   http://localhost:3000 (development için)
   https://yourdomain.com (production için)
   ```

## 3. OAuth Redirect URIs Yapılandırması

1. Sol menüden **"Facebook Login"** > **"Settings"** seçin
2. **Valid OAuth Redirect URIs** alanına aşağıdaki URL'leri ekleyin:

### Development:
```
http://localhost:3000/api/auth/callback/facebook
```

### Production:
```
https://yourdomain.com/api/auth/callback/facebook
```

3. **Save Changes** butonuna tıklayın

## 4. App ID ve App Secret Alma

1. Sol menüden **"Settings"** > **"Basic"** seçin
2. **App ID** ve **App Secret** değerlerini kopyalayın
3. App Secret'i görmek için **"Show"** butonuna tıklayın

## 5. Admin Panelden Ayarlama

1. Admin paneline giriş yapın: `/admin/settings`
2. **OAuth Giriş Ayarları** bölümüne gidin
3. **Facebook ile Giriş Yap** seçeneğini aktif edin
4. **Facebook App ID** alanına App ID'yi yapıştırın
5. **Facebook App Secret** alanına App Secret'i yapıştırın
6. **Ayarları Kaydet** butonuna tıklayın

## 6. Test Etme

1. http://localhost:3000/login adresine gidin
2. "📘 Facebook ile Giriş Yap" butonuna tıklayın
3. Facebook hesabınızı seçin
4. İzinleri onaylayın
5. Otomatik olarak ana sayfaya yönlendirileceksiniz

## 7. Uygulamayı Yayına Alma (Production)

Facebook uygulamanız varsayılan olarak "Development Mode"dadır. Production'a almak için:

1. Sol menüden **"Settings"** > **"Basic"** seçin
2. **Privacy Policy URL** ekleyin (zorunlu)
3. **Terms of Service URL** ekleyin (opsiyonel)
4. **App Icon** yükleyin (1024x1024 px)
5. **Category** seçin (örn: "Health & Fitness")
6. Sağ üstten **"Switch Mode"** butonuna tıklayın
7. **"Switch to Live Mode"** seçin

### App Review (Opsiyonel)

Temel giriş için App Review gerekmez, ancak ek izinler istiyorsanız:

1. Sol menüden **"App Review"** > **"Permissions and Features"** seçin
2. İhtiyacınız olan izinleri seçin
3. Gerekli bilgileri doldurun
4. Submit edin

## Production Deployment (Vercel)

Vercel'e deploy ederken:

1. Vercel Dashboard > Project > Settings > Environment Variables
2. Aşağıdaki değişkenleri ekleyin:
   - `FACEBOOK_APP_ID`: Facebook App ID
   - `FACEBOOK_APP_SECRET`: Facebook App Secret
3. Facebook Developer Console'da production URL'ini ekleyin:
   ```
   https://yourdomain.com/api/auth/callback/facebook
   ```

## Sorun Giderme

### "URL Blocked" Hatası
- Facebook Developer Console'da Valid OAuth Redirect URIs'in tam olarak eşleştiğinden emin olun
- Sonunda `/` olmamalı
- `http` vs `https` kontrolü yapın

### "App Not Setup" Hatası
- Facebook Login ürününü eklediğinizden emin olun
- OAuth Redirect URIs'i doğru yapılandırdığınızdan emin olun

### Facebook butonu görünmüyor
- Admin panelden Facebook OAuth'u aktif ettiğinizden emin olun
- App ID ve App Secret'in doğru girildiğinden emin olun
- Tarayıcı cache'ini temizleyin

### "This app is in development mode"
- Test kullanıcıları ekleyin: **Roles** > **Test Users**
- Veya uygulamayı Live Mode'a alın

## Güvenlik Notları

- App Secret'i asla public repository'ye commit etmeyin
- Production'da güçlü secret kullanın
- Sadece güvendiğiniz domain'leri Valid OAuth Redirect URIs'e ekleyin
- HTTPS kullanın (production için zorunlu)

## İzinler

Facebook Login varsayılan olarak şu izinleri sağlar:
- `public_profile`: Kullanıcının adı, profil fotoğrafı
- `email`: Kullanıcının email adresi

Ek izinler için App Review gerekir.

## Daha Fazla Bilgi

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [NextAuth.js Facebook Provider](https://next-auth.js.org/providers/facebook)
- [Facebook App Review](https://developers.facebook.com/docs/app-review)
