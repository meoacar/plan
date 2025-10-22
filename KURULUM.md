# Kurulum Talimatları

## Hızlı Başlangıç

### 1. Veritabanı Kurulumu

PostgreSQL yüklü değilse:
- Windows: https://www.postgresql.org/download/windows/
- Veya Docker kullanın:
```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

### 2. Veritabanı Oluşturma

PostgreSQL'e bağlanın ve veritabanını oluşturun:
```sql
CREATE DATABASE zayiflamaplanim;
```

### 3. Environment Değişkenlerini Ayarlama

`.env` dosyasını düzenleyin:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zayiflamaplanim"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key-change-in-production"
```

Google OAuth için (opsiyonel):
1. https://console.cloud.google.com/ adresine gidin
2. Yeni proje oluşturun
3. "APIs & Services" > "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
4. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Client ID ve Secret'i `.env` dosyasına ekleyin
6. `.env` dosyasında `NEXT_PUBLIC_GOOGLE_ENABLED="true"` yapın

### 4. Veritabanı Migration

```bash
npx prisma migrate dev
```

### 5. Seed Verisi (Opsiyonel)

Test için örnek veriler:
```bash
npm run db:seed
```

Bu komut şunları oluşturur:
- Admin kullanıcı: admin@example.com / admin123
- 2 normal kullanıcı: user1@example.com / user123, user2@example.com / user123
- 3 örnek plan
- Örnek yorumlar ve beğeniler

### 6. Development Sunucusunu Başlatma

```bash
npm run dev
```

Tarayıcıda http://localhost:3000 adresine gidin.

## Önemli Notlar

### Admin Paneline Erişim
- Admin paneline erişmek için ADMIN rolüne sahip bir kullanıcı gerekir
- Seed çalıştırdıysanız: admin@example.com / admin123
- Manuel olarak admin yapmak için:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### Prisma Studio
Veritabanını görsel olarak yönetmek için:
```bash
npx prisma studio
```

### Production Build Test
```bash
npm run build
npm start
```

## Sorun Giderme

### "Module not found" hatası
```bash
npm install
npx prisma generate
```

### Veritabanı bağlantı hatası
- PostgreSQL'in çalıştığından emin olun
- DATABASE_URL'in doğru olduğunu kontrol edin
- Veritabanının oluşturulduğunu doğrulayın

### NextAuth hatası
- NEXTAUTH_SECRET'in ayarlandığından emin olun
- Geliştirme için herhangi bir string kullanabilirsiniz
- Production için güçlü bir secret oluşturun:
```bash
openssl rand -base64 32
```

### Port zaten kullanımda
Farklı bir port kullanın:
```bash
npm run dev -- -p 3001
```

## Sonraki Adımlar

1. Admin hesabıyla giriş yapın: `admin@example.com` / `admin123`
2. Yeni kullanıcı kaydı yapın
3. Plan ekleyin (admin onayı gerekir)
4. Admin panelinden planı onaylayın
5. Ana sayfada planın göründüğünü kontrol edin
6. Arama ve filtreleme özelliklerini test edin
7. Kullanıcı profillerini ziyaret edin
8. Yorum ve beğeni özelliklerini deneyin

## Performans Özellikleri

- **ISR (Incremental Static Regeneration):** Plan detay sayfaları 60 saniyede bir güncellenir
- **Caching:** API yanıtları 60 saniye cache'lenir
- **Rate Limiting:** Plan ekleme (5/saat), Yorum (10/dakika)
- **Static Generation:** En popüler 50 plan build sırasında oluşturulur

## Deployment

Vercel'e deploy için:
1. GitHub'a push edin
2. Vercel'de import edin
3. Environment variables ekleyin
4. Vercel Postgres veya Neon kullanın
5. Deploy edin

Detaylı bilgi için README.md dosyasına bakın.
