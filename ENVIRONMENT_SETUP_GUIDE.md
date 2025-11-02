# Environment Variables Setup Guide

Bu rehber, projenin çalışması için gerekli environment variables'ların nasıl alınacağını açıklar.

## 🔴 Kritik (Zorunlu)

### 1. Database (DATABASE_URL)
**Durum:** ✅ Mevcut (Neon PostgreSQL)
```env
DATABASE_URL="postgresql://..."
```

### 2. NextAuth (NEXTAUTH_SECRET)
**Durum:** ⚠️ Development key mevcut, production için değiştirilmeli
```bash
# Yeni secret oluştur:
openssl rand -base64 32
```

### 3. Cron Jobs (CRON_SECRET)
**Durum:** ⚠️ Development key mevcut, production için değiştirilmeli
```bash
# Yeni secret oluştur:
openssl rand -base64 32
```
**Kullanım:** Background task'lar (günlük istatistikler, temizlik işleri)

### 4. Pusher (Real-time Group Chat)
**Durum:** ✅ Yapılandırılmış - Chat sistemi çalışıyor

**Nasıl Alınır:**
1. https://pusher.com adresine git
2. Ücretsiz hesap oluştur (100 bağlantı/gün ücretsiz)
3. Yeni bir "Channels" app oluştur
4. Cluster olarak "eu" seç (Avrupa için)
5. App Keys sekmesinden değerleri kopyala

```env
PUSHER_APP_ID="your-app-id"
PUSHER_KEY="your-key"
PUSHER_SECRET="your-secret"
PUSHER_CLUSTER="eu"
NEXT_PUBLIC_PUSHER_KEY="your-key"  # PUSHER_KEY ile aynı
NEXT_PUBLIC_PUSHER_CLUSTER="eu"
```

**Kullanım:**
- Grup mesajlaşma
- Gerçek zamanlı bildirimler
- Online presence (kim çevrimiçi)

---

## 🟡 Önemli (Opsiyonel ama Önerilen)

### 5. Web Push Notifications (VAPID Keys)
**Durum:** ❌ Eksik - Push bildirimleri çalışmaz

**Nasıl Oluşturulur:**
```bash
# web-push kütüphanesini kur ve key oluştur:
npx web-push generate-vapid-keys
```

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BM..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:admin@zayiflamaplanim.com"
```

**Kullanım:**
- Tarayıcı push bildirimleri
- Mobil web bildirimleri

### 6. Google OAuth
**Durum:** ❌ Eksik - Google ile giriş çalışmaz

**Nasıl Alınır:**
1. https://console.cloud.google.com adresine git
2. Yeni proje oluştur veya mevcut projeyi seç
3. "APIs & Services" > "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
4. Application type: "Web application"
5. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://zayiflamaplanim.com/api/auth/callback/google`

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"
```

### 7. UploadThing (Görsel Yükleme)
**Durum:** ❌ Eksik - Görsel yükleme çalışmaz

**Nasıl Alınır:**
1. https://uploadthing.com adresine git
2. GitHub ile giriş yap
3. Yeni app oluştur
4. API Keys sekmesinden token'ı kopyala

```env
UPLOADTHING_TOKEN="your-token"
```

**Kullanım:**
- Profil fotoğrafları
- İtiraf görselleri
- Grup görselleri

### 8. Resend (Email Bildirimleri)
**Durum:** ❌ Eksik - Email gönderimi çalışmaz

**Nasıl Alınır:**
1. https://resend.com adresine git
2. Ücretsiz hesap oluştur (100 email/gün ücretsiz)
3. Domain ekle veya test domain kullan
4. API Keys sekmesinden key oluştur

```env
RESEND_API_KEY="re_..."
EMAIL_FROM="Zayıflama Planım <noreply@zayiflamaplanim.com>"
```

**Kullanım:**
- Hoş geldin emaili
- Şifre sıfırlama
- Haftalık özet emaili

---

## 🟢 Opsiyonel (İleri Seviye)

### 9. Redis / Vercel KV (Caching)
**Kullanım:** Cache, leaderboard, performans optimizasyonu
**Gerekli mi:** Hayır, ama büyük ölçekte önerilir

### 10. Upstash Rate Limit
**Kullanım:** API rate limiting
**Gerekli mi:** Hayır, ama production'da önerilir

### 11. Sentry (Error Tracking)
**Kullanım:** Hata takibi ve monitoring
**Gerekli mi:** Hayır, ama production'da önerilir

---

## 📋 Hızlı Kurulum Checklist

### Minimum Çalışır Sistem (Development)
- [x] DATABASE_URL
- [x] NEXTAUTH_SECRET (development key)
- [x] NEXTAUTH_URL
- [x] CRON_SECRET (development key)
- [x] PUSHER_* (6 değişken) - Chat çalışıyor ✅

### Tam Özellikli Sistem
- [ ] Web Push VAPID keys
- [ ] Google OAuth
- [ ] UploadThing
- [ ] Resend API

### Production Hazırlık
- [ ] NEXTAUTH_SECRET değiştir (production key)
- [ ] CRON_SECRET değiştir (production key)
- [ ] NEXTAUTH_URL güncelle (https://zayiflamaplanim.com)
- [ ] Tüm API key'leri production ortamına ekle

---

## 🚀 Hızlı Başlangıç

1. **VAPID keys oluştur** (push bildirimleri için):
   ```bash
   npx web-push generate-vapid-keys
   # Çıktıyı .env dosyasına ekle
   ```

2. **Production secrets oluştur**:
   ```bash
   openssl rand -base64 32  # NEXTAUTH_SECRET için
   openssl rand -base64 32  # CRON_SECRET için
   ```

3. **Diğer servisleri ihtiyaca göre ekle**:
   - Google OAuth (sosyal giriş için)
   - UploadThing (görsel yükleme için)
   - Resend (email için)

---

## ⚠️ Güvenlik Notları

1. **Asla .env dosyasını commit etme!** (.gitignore'da olmalı)
2. Production key'leri development'tan farklı olmalı
3. Public key'ler (NEXT_PUBLIC_*) client-side'da görünür, hassas bilgi içermemeli
4. API key'leri düzenli olarak rotate et
5. Production'da environment variables'ları hosting platformunda (Vercel, Railway, vb.) ayarla

---

## 🔍 Sorun Giderme

### "Pusher is not configured" hatası
→ PUSHER_* değişkenlerini ekle

### "Failed to send push notification" hatası
→ VAPID keys'leri oluştur ve ekle

### "Google sign in failed" hatası
→ Google OAuth credentials'ları ekle ve redirect URI'ları kontrol et

### "Image upload failed" hatası
→ UPLOADTHING_TOKEN ekle

### "Failed to send email" hatası
→ RESEND_API_KEY ekle veya SMTP ayarlarını yapılandır
