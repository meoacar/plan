# Environment Variables Setup Guide

Bu rehber, projenin çalışması için gerekli environment variables'ların nasıl alınacağını açıklar.

## 🔴 Kritik (Zorunlu)

### 1. Database (DATABASE_URL)
**Durum:** ✅ Mevcut ve Çalışıyor (Neon PostgreSQL)
```env
DATABASE_URL="postgresql://neondb_owner:***@ep-icy-pond-a4mxlej0-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
```
**Sunucu:** ✅ Yapılandırılmış

### 2. NextAuth (NEXTAUTH_SECRET)
**Durum:** ✅ Production key yapılandırılmış
```env
NEXTAUTH_SECRET="PxWDNhMjU+rUdAw7yTk1is6ox3QndMoYKNVTUCnn5/s="
NEXTAUTH_URL="https://zayiflamaplanim.com"
AUTH_TRUST_HOST=true
```
**Sunucu:** ✅ Yapılandırılmış

### 3. Cron Jobs (CRON_SECRET)
**Durum:** ✅ Production key yapılandırılmış
```env
CRON_SECRET="C41R+taGB6ZSDKHpzVldAH1ubAMXT88d10OTIOEkNgs="
```
**Kullanım:** Background task'lar (günlük istatistikler, temizlik işleri)
**Sunucu:** ✅ Yapılandırılmış

### 4. Pusher (Real-time Group Chat)
**Durum:** ✅ Yapılandırılmış ve Çalışıyor - Chat sistemi aktif

```env
PUSHER_APP_ID="2071862"
PUSHER_KEY="b86bb46032f515fad6df"
PUSHER_SECRET="3b3d79eefc1752674cd9"
PUSHER_CLUSTER="eu"
NEXT_PUBLIC_PUSHER_KEY="b86bb46032f515fad6df"
NEXT_PUBLIC_PUSHER_CLUSTER="eu"
```

**Kullanım:**
- Grup mesajlaşma ✅
- Gerçek zamanlı bildirimler ✅
- Online presence (kim çevrimiçi) ✅

**Sunucu:** ✅ Yapılandırılmış ve Aktif

---

## 🟡 Önemli (Opsiyonel ama Önerilen)

### 5. Web Push Notifications (VAPID Keys)
**Durum:** ✅ Yapılandırılmış ve Çalışıyor

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BPG--wyCOf2UGe1ceS_K41hIkx9NaxsO5NOmNCuF6wRLYfBzzbKYaYzKJv4HO-vRkbKyJzwEhqRtJs4_yPcBj3w"
VAPID_PRIVATE_KEY="0wMwy3zLujVfffTBdyZ7Z8I3U2h024XklNb8S8_LrWM"
VAPID_SUBJECT="mailto:admin@zayiflamaplanim.com"
```

**Kullanım:**
- Tarayıcı push bildirimleri ✅
- Mobil web bildirimleri ✅
- 16 farklı bildirim tipi destekleniyor ✅

**Sunucu:** ✅ Yapılandırılmış ve Aktif

### 6. Google OAuth
**Durum:** ✅ Yapılandırılmış ve Aktif

```env
GOOGLE_CLIENT_ID="[CONFIGURED]"
GOOGLE_CLIENT_SECRET="[CONFIGURED]"
```

**Oluşturulma Tarihi:** 2 Kasım 2025, 04:55:56 GMT+3
**Durum:** Enabled

**Authorized redirect URIs:**
- Production: `https://zayiflamaplanim.com/api/auth/callback/google`

**Sunucu:** ✅ Yapılandırılmış

### 6b. Facebook OAuth
**Durum:** ⚠️ Tanımlı ama boş - Facebook ile giriş çalışmaz

```env
FACEBOOK_APP_ID=""
FACEBOOK_APP_SECRET=""
```

**Nasıl Alınır:**
1. https://developers.facebook.com adresine git
2. Yeni app oluştur
3. Facebook Login ekle
4. Valid OAuth Redirect URIs:
   - Production: `https://zayiflamaplanim.com/api/auth/callback/facebook`

**Sunucu:** ⚠️ Yapılandırma bekleniyor

### 7. UploadThing (Görsel Yükleme)
**Durum:** ⚠️ Tanımlı ama boş - Görsel yükleme çalışmaz

```env
UPLOADTHING_TOKEN=""
```

**Nasıl Alınır:**
1. https://uploadthing.com adresine git
2. GitHub ile giriş yap
3. Yeni app oluştur
4. API Keys sekmesinden token'ı kopyala

**Kullanım:**
- Profil fotoğrafları
- İtiraf görselleri
- Grup görselleri

**Sunucu:** ⚠️ Yapılandırma bekleniyor

### 8. Resend (Email Bildirimleri)
**Durum:** ✅ Yapılandırılmış

```env
RESEND_API_KEY="re_3LJ9prno_M8MP4gPG5GJAvGaSweEYJgER"
EMAIL_FROM="noreply@zayiflamaplanim.com"
```

**SMTP Ayarları (Yedek):**
```env
SMTP_HOST="localhost"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="noreply@zayiflamaplanim.com"
SMTP_PASS=""
```

**Kullanım:**
- Hoş geldin emaili ✅
- Şifre sıfırlama ✅
- Haftalık özet emaili ✅

**Sunucu:** ✅ Yapılandırılmış

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

### ✅ Sunucuda Çalışan Sistem (Production)
- [x] DATABASE_URL ✅
- [x] NEXTAUTH_SECRET (production key) ✅
- [x] NEXTAUTH_URL (https://zayiflamaplanim.com) ✅
- [x] CRON_SECRET (production key) ✅
- [x] PUSHER_* (6 değişken) - Chat çalışıyor ✅
- [x] Web Push VAPID keys ✅
- [x] Resend API ✅
- [x] SMTP ayarları ✅

### ⚠️ Yapılandırma Bekleyen
- [x] Google OAuth ✅
- [ ] Facebook OAuth (boş)
- [ ] UploadThing (boş)
- [ ] SMTP_PASS (boş)

### 🎯 Sistem Durumu
**Sunucu:** 31.97.34.163  
**Uygulama:** ✅ Online (PM2)  
**Port:** 3000  
**Domain:** https://zayiflamaplanim.com  

**Çalışan Özellikler:**
- ✅ Kullanıcı girişi (email/password)
- ✅ Veritabanı bağlantısı
- ✅ Grup chat sistemi (Pusher)
- ✅ Push bildirimleri (VAPID)
- ✅ Email bildirimleri (Resend)
- ✅ Cron job'lar
- ✅ Google ile giriş
- ⚠️ Görsel yükleme (yapılandırma gerekli)

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

---

## 📊 Sunucu Durumu Özeti (31.97.34.163)

### ✅ Çalışan Servisler
| Servis | Durum | Notlar |
|--------|-------|--------|
| Database (Neon) | ✅ Aktif | PostgreSQL bağlantısı çalışıyor |
| NextAuth | ✅ Aktif | Email/password girişi çalışıyor |
| Pusher Chat | ✅ Aktif | Grup mesajlaşma çalışıyor |
| Web Push | ✅ Aktif | VAPID keys yapılandırılmış |
| Email (Resend) | ✅ Aktif | Email bildirimleri çalışıyor |
| Cron Jobs | ✅ Aktif | Background task'lar çalışıyor |
| Bildirim Sistemi | ✅ Aktif | 16 tip bildirim destekleniyor |

### ⚠️ Yapılandırma Bekleyen
| Servis | Durum | Etki |
|--------|-------|------|
| Google OAuth | ✅ Aktif | Google ile giriş çalışıyor |
| Facebook OAuth | ⚠️ Boş | Facebook ile giriş çalışmaz |
| UploadThing | ⚠️ Boş | Görsel yükleme çalışmaz |
| SMTP Password | ⚠️ Boş | SMTP email gönderimi çalışmaz (Resend aktif) |

### 🎯 Öncelikli Yapılacaklar
1. **UploadThing Token** - Görsel yükleme için kritik
2. ~~**Google OAuth**~~ ✅ Tamamlandı (2 Kasım 2025)
3. **Facebook OAuth** - Opsiyonel sosyal giriş

### 🚀 Sistem Performansı
- **Uygulama:** Online (PM2 ile yönetiliyor)
- **Başlatma Süresi:** ~834ms
- **Port:** 3000
- **Domain:** https://zayiflamaplanim.com
- **SSL:** ✅ Aktif

**Son Güncelleme:** 2 Kasım 2025
