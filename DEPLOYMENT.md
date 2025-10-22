# Deployment Guide - Zayıflama Planım

Bu doküman, Zayıflama Planım uygulamasının production ortamına deploy edilmesi için gerekli adımları içerir.

## Ön Hazırlık

### 1. Environment Variables

Production ortamında aşağıdaki environment variable'ların ayarlanması gerekir:

#### Zorunlu Değişkenler

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<güçlü-random-secret>"

# Cron Jobs
CRON_SECRET="<güçlü-random-secret>"
```

#### Opsiyonel Değişkenler

```bash
# Google OAuth (Sosyal giriş için)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Email Service (Newsletter ve bildirimler için)
RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="Zayıflama Planım <noreply@zayiflamaplanim.com>"

# Alternatif: SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# UploadThing (Görsel yükleme için)
UPLOADTHING_TOKEN="your-token"

# Backup Storage
BACKUP_STORAGE_URL="./backups"
```

### 2. Secret Oluşturma

Güvenli secret'lar oluşturmak için:

```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Vercel Deployment

### Adım 1: Vercel Projesini Oluştur

```bash
# Vercel CLI'yi yükle
npm i -g vercel

# Projeyi Vercel'e bağla
vercel link
```

### Adım 2: Environment Variables Ayarla

Vercel Dashboard'dan veya CLI ile:

```bash
# Dashboard: Settings > Environment Variables
# veya CLI ile:
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add CRON_SECRET production
# ... diğer değişkenler
```

### Adım 3: Database Migration

Production veritabanına migration'ları uygula:

```bash
# 1. Production DATABASE_URL'i .env dosyasına ekle
echo "DATABASE_URL=your-production-db-url" > .env

# 2. Migration'ları deploy et
npx prisma migrate deploy

# 3. Prisma Client'ı oluştur
npx prisma generate
```

### Adım 4: Seed Data (İlk Kurulum)

İlk deployment'ta örnek veriler eklemek için:

```bash
# Seed script'ini çalıştır
npm run db:seed
```

**Not:** Seed script şunları oluşturur:
- Admin kullanıcı (email: admin@example.com, şifre: admin123)
- Örnek kategoriler (Vegan, Keto, Spor, Düşük Kalorili)
- Örnek etiketler
- Site ayarları

**ÖNEMLİ:** Production'da seed çalıştırdıktan sonra admin şifresini mutlaka değiştirin!

### Adım 5: Deploy

```bash
# Production'a deploy et
vercel --prod
```

## Manuel Deployment (Diğer Platformlar)

### Adım 1: Build

```bash
# Dependencies'leri yükle
npm install

# Production build
npm run build
```

### Adım 2: Database Setup

```bash
# Migration'ları uygula
npx prisma migrate deploy

# Prisma Client oluştur
npx prisma generate

# (Opsiyonel) Seed data
npm run db:seed
```

### Adım 3: Start

```bash
# Production server'ı başlat
npm start
```

## Post-Deployment Kontroller

### 1. Database Bağlantısı

```bash
# Prisma Studio ile kontrol et
npx prisma studio
```

### 2. Admin Panel Erişimi

- `https://yourdomain.com/admin` adresine git
- Admin hesabı ile giriş yap (seed'den gelen veya oluşturduğunuz)
- Tüm modüllerin çalıştığını kontrol et

### 3. Cron Jobs Kontrolü

Vercel Dashboard'dan:
- Settings > Cron Jobs
- Email queue: Her 5 dakikada çalışmalı
- Auto-backup: Her gün 02:00'da çalışmalı

### 4. Email Testi

Admin panel'den:
- `/admin/emails` sayfasına git
- Test email gönder
- Email'in geldiğini kontrol et

### 5. Backup Testi

Admin panel'den:
- `/admin/maintenance` sayfasına git
- Manuel backup oluştur
- Backup'ın başarıyla oluşturulduğunu kontrol et

## Güvenlik Kontrolleri

### 1. Admin Şifresini Değiştir

Seed data kullandıysanız:
- Admin hesabına giriş yap
- Profil ayarlarından şifreyi değiştir

### 2. Environment Variables

- Tüm secret'ların güçlü olduğundan emin ol
- `.env` dosyasının git'e commit edilmediğini kontrol et

### 3. HTTPS

- Domain'in HTTPS ile çalıştığından emin ol
- Vercel otomatik SSL sertifikası sağlar

### 4. Rate Limiting

Cron endpoint'lerinin korunduğunu kontrol et:
- `/api/cron/email-queue` - CRON_SECRET gerekli
- `/api/cron/auto-backup` - CRON_SECRET gerekli

## Monitoring

### 1. Vercel Analytics

Vercel Dashboard'dan:
- Analytics > Overview
- Performance metrikleri
- Error tracking

### 2. Database Monitoring

Neon/Vercel Postgres Dashboard'dan:
- Connection count
- Query performance
- Storage usage

### 3. Activity Log

Admin panel'den:
- `/admin/activity-log` sayfasına git
- Sistem aktivitelerini takip et
- Şüpheli aktiviteleri kontrol et

## Troubleshooting

### Database Connection Hatası

```bash
# Connection string'i kontrol et
echo $DATABASE_URL

# Prisma Client'ı yeniden oluştur
npx prisma generate

# Migration durumunu kontrol et
npx prisma migrate status
```

### Build Hatası

```bash
# Cache'i temizle
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Cron Jobs Çalışmıyor

1. Vercel Dashboard'dan cron job'ların aktif olduğunu kontrol et
2. CRON_SECRET'ın doğru ayarlandığını kontrol et
3. Cron endpoint'lerinin 200 döndüğünü kontrol et

### Email Gönderilmiyor

1. RESEND_API_KEY veya SMTP credentials'ları kontrol et
2. Email queue'yu kontrol et: `/admin/emails`
3. Activity log'da hata mesajlarını kontrol et

## Rollback

Bir sorun olursa önceki versiyona dön:

```bash
# Vercel'de önceki deployment'a dön
vercel rollback

# Database migration'ı geri al (dikkatli kullan!)
npx prisma migrate resolve --rolled-back <migration-name>
```

## Backup ve Recovery

### Manuel Backup

```bash
# PostgreSQL dump
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Otomatik Backup

Admin panel'den:
- `/admin/maintenance` sayfasına git
- Auto-backup ayarlarını yapılandır
- Günlük/haftalık/aylık seçenekleri

## Performans Optimizasyonu

### 1. Database Indexes

Prisma schema'da index'ler tanımlı:
```prisma
@@index([status, createdAt])
@@index([userId, createdAt])
```

### 2. Next.js Cache

```typescript
// API route'larda revalidate kullan
export const revalidate = 300 // 5 dakika
```

### 3. Image Optimization

Next.js Image component kullan:
```tsx
<Image src={url} width={500} height={300} alt="..." />
```

## Maintenance Mode

Bakım modu için:

1. Admin panel'den: `/admin/settings`
2. "Maintenance Mode" toggle'ı aktif et
3. Admin dışındaki kullanıcılar bakım sayfası görecek

## Support

Sorun yaşarsanız:
- Activity log'u kontrol edin: `/admin/activity-log`
- Vercel logs'u kontrol edin: `vercel logs`
- Database logs'u kontrol edin (Neon/Vercel Postgres dashboard)

## Checklist

Deployment öncesi kontrol listesi:

- [ ] Tüm environment variables ayarlandı
- [ ] Database migration'ları uygulandı
- [ ] Seed data çalıştırıldı (ilk kurulum)
- [ ] Admin şifresi değiştirildi
- [ ] HTTPS aktif
- [ ] Cron jobs yapılandırıldı
- [ ] Email servisi test edildi
- [ ] Backup sistemi test edildi
- [ ] Analytics aktif
- [ ] Error tracking aktif
- [ ] Domain DNS ayarları yapıldı
- [ ] Google OAuth yapılandırıldı (opsiyonel)
- [ ] UploadThing yapılandırıldı (opsiyonel)

## Production URL'ler

- Ana sayfa: `https://yourdomain.com`
- Admin panel: `https://yourdomain.com/admin`
- API: `https://yourdomain.com/api`
- Cron jobs:
  - Email queue: `https://yourdomain.com/api/cron/email-queue`
  - Auto-backup: `https://yourdomain.com/api/cron/auto-backup`
