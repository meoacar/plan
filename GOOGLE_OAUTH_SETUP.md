# Google OAuth Kurulum Rehberi

Google OAuth ile giriş özelliğini aktif etmek için aşağıdaki adımları takip edin.

## 1. Google Cloud Console'da Proje Oluşturma

1. https://console.cloud.google.com/ adresine gidin
2. Yeni bir proje oluşturun veya mevcut bir projeyi seçin
3. Proje adı: "Zayıflama Planım" (veya istediğiniz bir isim)

## 2. OAuth Consent Screen Yapılandırması

1. Sol menüden **"APIs & Services"** > **"OAuth consent screen"** seçin
2. **User Type:** "External" seçin (veya Internal - sadece organizasyon içi)
3. **App name:** "Zayıflama Planım"
4. **User support email:** Email adresiniz
5. **Developer contact information:** Email adresiniz
6. **Save and Continue**

## 3. OAuth 2.0 Client ID Oluşturma

1. Sol menüden **"APIs & Services"** > **"Credentials"** seçin
2. **"Create Credentials"** > **"OAuth 2.0 Client ID"** seçin
3. **Application type:** "Web application"
4. **Name:** "Zayıflama Planım Web Client"

### Authorized JavaScript origins:
```
http://localhost:3000
https://yourdomain.com (production için)
```

### Authorized redirect URIs:
```
http://localhost:3000/api/auth/callback/google
https://yourdomain.com/api/auth/callback/google (production için)
```

5. **Create** butonuna tıklayın
6. Client ID ve Client Secret'i kopyalayın

## 4. Environment Variables Ekleme

`.env` dosyanıza aşağıdaki değerleri ekleyin:

```env
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

## 5. Uygulamayı Yeniden Başlatma

```bash
# Development sunucusunu durdurun (Ctrl+C)
# Tekrar başlatın
npm run dev
```

## 6. Test Etme

1. http://localhost:3000/login adresine gidin
2. "🌐 Google ile Giriş Yap" butonuna tıklayın
3. Google hesabınızı seçin
4. İzinleri onaylayın
5. Otomatik olarak ana sayfaya yönlendirileceksiniz

## Production Deployment

Vercel'e deploy ederken:

1. Vercel Dashboard > Project > Settings > Environment Variables
2. `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` ekleyin
3. Google Cloud Console'da production URL'ini authorized redirect URIs'e ekleyin:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

## Sorun Giderme

### "redirect_uri_mismatch" Hatası
- Google Cloud Console'da redirect URI'nin tam olarak eşleştiğinden emin olun
- Sonunda `/` olmamalı
- `http` vs `https` kontrolü yapın

### "Access blocked" Hatası
- OAuth consent screen'i tamamladığınızdan emin olun
- Test kullanıcıları ekleyin (External seçtiyseniz)

### Google butonu görünmüyor
- `.env` dosyasında `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` olduğundan emin olun
- Sunucuyu yeniden başlatın

## Güvenlik Notları

- Client Secret'i asla public repository'ye commit etmeyin
- Production'da güçlü secret kullanın
- Sadece güvendiğiniz domain'leri authorized origins'e ekleyin

## Daha Fazla Bilgi

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
