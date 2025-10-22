# Zayıflama Planım - Gerçek Planlar

Topluluk odaklı zayıflama planı paylaşım platformu. Kullanıcılar gerçek deneyimlerini paylaşabilir, başkalarının planlarını inceleyebilir ve yorum yapabilir.

## Özellikler

### Kullanıcı Özellikleri
- 🔐 Email/Şifre + Google OAuth kimlik doğrulama
- 📝 Plan ekleme ve paylaşma (admin onayı ile)
- 🖼️ Görsel desteği (URL-based, Imgur/Cloudinary/ImgBB)
- ❤️ Beğeni ve yorum sistemi (toggle like, yorum silme)
- 🔍 Arama ve filtreleme (başlık, kullanıcı, hedef kilo)
- 🏷️ Kategori ve etiket bazlı filtreleme
- 📄 Pagination (12 plan/sayfa)
- 👤 Kullanıcı profil sayfaları (istatistikler, planlar)
- 🔗 Benzer planlar önerisi
- 📱 Sosyal medya paylaşım kartları (Twitter, Facebook, WhatsApp, LinkedIn)

### Gelişmiş Admin Paneli
- 📊 **Dashboard:** Genel istatistikler ve hızlı erişim
- ✅ **Plan Yönetimi:** Plan onayı, reddetme ve silme
- 👥 **Kullanıcı Yönetimi:** Rol değiştirme, kullanıcı silme
- 💬 **Yorum Yönetimi:** Toplu yorum silme, arama ve filtreleme
- 📈 **Analitik & Raporlar:** Grafikler, istatistikler, CSV export
- ⚙️ **Site Ayarları:** Başlık, açıklama, sosyal medya, bakım modu
- 🛡️ **İçerik Moderasyonu:** Yasaklı kelime yönetimi, otomatik spam tespiti
- 📧 **Email Yönetimi:** Toplu email gönderimi, newsletter, şablonlar
- 🏷️ **Kategori & Etiket Sistemi:** Kategori oluşturma, renklendirme, sıralama
- 📝 **Aktivite Logu:** Tüm admin işlemlerinin kaydı, CSV export
- 🔧 **Yedekleme & Bakım:** Veritabanı yedeği, cache temizleme, sistem sağlığı

### Teknik Özellikler
- 🎨 Modern ve responsive tasarım (yüksek kontrast)
- 🌐 SEO optimizasyonu (sitemap, robots, RSS, OpenGraph)
- ⚡ ISR & Caching (60s revalidation)
- 🛡️ Rate Limiting (IP-based)
- 🔒 Güvenli ve ölçeklenebilir mimari
- 🤖 Otomatik arka plan işleri (email kuyruğu, otomatik yedekleme)

## Teknoloji Yığını

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Stil:** TailwindCSS + shadcn/ui
- **Auth:** NextAuth v5
- **Database:** Prisma + PostgreSQL
- **Email:** Resend
- **Charts:** Recharts
- **Drag & Drop:** @dnd-kit
- **Rich Text:** Tiptap
- **Validation:** Zod
- **Deployment:** Vercel

## Kurulum

### Gereksinimler

- Node.js 18+
- PostgreSQL veritabanı
- npm veya pnpm

### Adımlar

1. Repoyu klonlayın:
```bash
git clone <repo-url>
cd zayiflamaplanim
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun:
```bash
cp .env.example .env
```

4. `.env` dosyasını düzenleyin ve gerekli değişkenleri ayarlayın:
```env
# Zorunlu
DATABASE_URL="postgresql://user:password@localhost:5432/zayiflamaplanim"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Opsiyonel - Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Opsiyonel - Email servisi (Resend)
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="Zayıflama Planım <noreply@zayiflamaplanim.com>"

# Opsiyonel - Cron jobs için güvenlik
CRON_SECRET="your-cron-secret-key"
```

5. Veritabanını oluşturun ve migrate edin:
```bash
npx prisma migrate dev
```

6. (Opsiyonel) Seed verisi ekleyin:
```bash
npx prisma db seed
```

7. Development sunucusunu başlatın:
```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## Veritabanı Yönetimi

### Migration Oluşturma
```bash
npx prisma migrate dev --name migration_name
```

### Prisma Studio (Veritabanı GUI)
```bash
npx prisma studio
```

### Prisma Client Güncelleme
```bash
npx prisma generate
```

## Deployment (Vercel)

1. Vercel hesabınıza giriş yapın
2. Yeni proje oluşturun ve GitHub reposunu bağlayın
3. Environment variables ekleyin (.env dosyasındaki değişkenler)
4. Vercel Postgres veya Neon gibi bir PostgreSQL servisi kullanın
5. Build command: `npm run build`
6. Deploy edin

### Environment Variables (Production)

```env
# Zorunlu
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-secret-key"

# Opsiyonel - Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Opsiyonel - Email servisi (admin paneli için önerilir)
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="Zayıflama Planım <noreply@yourdomain.com>"

# Opsiyonel - Cron jobs (otomatik yedekleme ve email kuyruğu için)
CRON_SECRET="production-cron-secret"
```

### Vercel Cron Jobs Yapılandırması

Admin paneli özellikleri için otomatik arka plan işleri gereklidir. `vercel.json` dosyası zaten yapılandırılmıştır:

```json
{
  "crons": [
    {
      "path": "/api/cron/email-queue",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/auto-backup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

- **Email Queue:** Her 5 dakikada bir çalışır, bekleyen email'leri gönderir
- **Auto Backup:** Her gün saat 02:00'de otomatik veritabanı yedeği alır

**Not:** Cron job'ların çalışması için `CRON_SECRET` environment variable'ı ayarlanmalıdır.

### Performans Özellikleri

- **ISR:** Plan detay sayfaları 60 saniyede bir güncellenir
- **Static Generation:** En popüler 50 plan build sırasında oluşturulur
- **Caching:** API yanıtları 60 saniye cache'lenir
- **Rate Limiting:** IP-based (Plan: 5/saat, Yorum: 10/dk)
- **Optimized Queries:** Prisma ile optimize edilmiş veritabanı sorguları
- **Loading States:** Skeleton screens ve spinner'lar
- **Error Boundaries:** Hata yakalama ve kullanıcı dostu mesajlar

### Ek Dökümanlar

- **GOOGLE_OAUTH_SETUP.md** - Google OAuth kurulum rehberi
- **GORSEL_YUKLEME.md** - Görsel yükleme rehberi (Imgur, Cloudinary, vb.)
- **KURULUM.md** - Detaylı kurulum talimatları
- **KULLANICI_YONETIMI.md** - Kullanıcı yönetimi ve roller
- **MAINTENANCE_MODULE.md** - Bakım modülü kullanım rehberi
- **SOSYAL_MEDYA_PAYLASIM.md** - Sosyal medya paylaşım özelliği rehberi
- **SOSYAL_MEDYA_OZET.md** - Hızlı başlangıç rehberi
- **PAYLASIM_BUTONU_TASARIM.md** - Tasarım detayları ve teknik döküman
- **FACEBOOK_TEST.md** - Facebook paylaşım testi (localhost sorunu ve çözümü)
- **HIZLI_FACEBOOK_TEST.md** - 5 dakikada ngrok ile test

## Proje Yapısı

```
src/
├── app/                    # Next.js App Router sayfaları
│   ├── api/               # API route'ları
│   │   ├── admin/        # Admin API endpoints
│   │   │   ├── analytics/      # Analitik verileri
│   │   │   ├── categories/     # Kategori yönetimi
│   │   │   ├── comments/       # Yorum yönetimi
│   │   │   ├── emails/         # Email kampanyaları
│   │   │   ├── moderation/     # İçerik moderasyonu
│   │   │   ├── settings/       # Site ayarları
│   │   │   ├── activity-log/   # Aktivite logu
│   │   │   └── maintenance/    # Bakım araçları
│   │   └── cron/         # Arka plan işleri
│   ├── login/             # Giriş sayfası
│   ├── register/          # Kayıt sayfası
│   ├── submit/            # Plan ekleme sayfası
│   ├── plan/[slug]/       # Plan detay sayfası
│   └── admin/             # Admin paneli
│       ├── analytics/     # Analitik sayfası
│       ├── categories/    # Kategori yönetimi
│       ├── comments/      # Yorum yönetimi
│       ├── emails/        # Email yönetimi
│       ├── moderation/    # Moderasyon paneli
│       ├── settings/      # Site ayarları
│       ├── activity-log/  # Aktivite logu
│       └── maintenance/   # Bakım araçları
├── components/            # React bileşenleri
│   ├── admin/            # Admin paneli bileşenleri
│   └── ui/               # UI bileşenleri
├── lib/                  # Yardımcı fonksiyonlar
│   ├── auth.ts           # NextAuth yapılandırması
│   ├── prisma.ts         # Prisma client
│   ├── validations.ts    # Zod şemaları
│   ├── activity-logger.ts # Aktivite loglama
│   ├── moderation.ts     # İçerik moderasyonu
│   ├── email-queue.ts    # Email kuyruğu
│   └── utils.ts          # Genel yardımcılar
└── types/                # TypeScript tip tanımları
```

## Admin Paneli Kullanımı

### İlk Admin Kullanıcısı Oluşturma

1. Normal kullanıcı kaydı yapın
2. Veritabanında kullanıcının rolünü ADMIN olarak değiştirin:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```
3. Veya Prisma Studio kullanarak:
```bash
npx prisma studio
```

### Admin Paneli Özellikleri

- **Dashboard** (`/admin`): Genel istatistikler ve hızlı erişim
- **Planlar** (`/admin/plans`): Plan onayı, reddetme, silme
- **Kullanıcılar** (`/admin/users`): Kullanıcı yönetimi, rol değiştirme
- **Yorumlar** (`/admin/comments`): Toplu yorum yönetimi
- **Analitik** (`/admin/analytics`): Grafikler ve raporlar
- **Kategoriler** (`/admin/categories`): Kategori ve etiket yönetimi
- **Moderasyon** (`/admin/moderation`): Yasaklı kelime ve spam yönetimi
- **Email** (`/admin/emails`): Toplu email gönderimi ve newsletter
- **Aktivite** (`/admin/activity-log`): Sistem aktivite kayıtları
- **Ayarlar** (`/admin/settings`): Site ayarları ve bakım modu
- **Bakım** (`/admin/maintenance`): Yedekleme ve sistem bakımı

### Email Servisi Kurulumu (Resend)

1. [Resend](https://resend.com) hesabı oluşturun
2. API key alın
3. `.env` dosyasına ekleyin:
```env
RESEND_API_KEY="re_..."
EMAIL_FROM="Zayıflama Planım <noreply@yourdomain.com>"
```
4. Domain doğrulaması yapın (production için)

### Otomatik Yedekleme Ayarları

Admin panelinden (`/admin/maintenance`) otomatik yedekleme ayarlarını yapılandırabilirsiniz:
- Günlük yedekleme (önerilen)
- Haftalık yedekleme
- Aylık yedekleme

Yedekler veritabanında saklanır ve indirilebilir.

## Sık Karşılaşılan Hatalar

### Database Connection Error
- PostgreSQL'in çalıştığından emin olun
- DATABASE_URL'in doğru olduğunu kontrol edin
- Veritabanının oluşturulduğundan emin olun

### NextAuth Error
- NEXTAUTH_SECRET'in ayarlandığından emin olun
- NEXTAUTH_URL'in doğru olduğunu kontrol edin
- Google OAuth için callback URL'i ayarlayın: `http://localhost:3000/api/auth/callback/google`

### Prisma Client Error
- `npx prisma generate` komutunu çalıştırın
- node_modules'u silin ve tekrar yükleyin

### Email Gönderim Hatası
- RESEND_API_KEY'in doğru ayarlandığından emin olun
- Email domain'inin doğrulandığından emin olun (production)
- Rate limit'e takılmadığınızı kontrol edin

### Cron Job Çalışmıyor
- CRON_SECRET'in ayarlandığından emin olun
- Vercel'de cron job'ların aktif olduğunu kontrol edin
- Cron endpoint'lerinin doğru çalıştığını test edin

## Lisans

MIT

## Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için lütfen önce bir issue açın.
