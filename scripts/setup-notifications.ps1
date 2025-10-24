# PowerShell script for Windows

Write-Host "🔔 Bildirim Sistemi Kurulumu Başlıyor..." -ForegroundColor Green
Write-Host ""

# 1. VAPID Keys Oluştur
Write-Host "📝 VAPID keys oluşturuluyor..." -ForegroundColor Yellow
npx web-push generate-vapid-keys

Write-Host ""
Write-Host "⚠️  Yukarıdaki VAPID keys'i .env dosyanıza ekleyin:" -ForegroundColor Yellow
Write-Host ""
Write-Host "NEXT_PUBLIC_VAPID_PUBLIC_KEY=`"your-public-key`"" -ForegroundColor Cyan
Write-Host "VAPID_PRIVATE_KEY=`"your-private-key`"" -ForegroundColor Cyan
Write-Host "VAPID_SUBJECT=`"mailto:your-email@example.com`"" -ForegroundColor Cyan
Write-Host ""

# 2. Dependencies Yükle
Write-Host "📦 Bağımlılıklar yükleniyor..." -ForegroundColor Yellow
npm install

# 3. Prisma Migration
Write-Host "🗄️  Veritabanı migration'ı çalıştırılıyor..." -ForegroundColor Yellow
npx prisma migrate dev --name add_notifications

# 4. Prisma Client Güncelle
Write-Host "🔄 Prisma client güncelleniyor..." -ForegroundColor Yellow
npx prisma generate

Write-Host ""
Write-Host "✅ Kurulum tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Sonraki adımlar:" -ForegroundColor Yellow
Write-Host "1. .env dosyanıza VAPID keys'i ekleyin"
Write-Host "2. Email servisi için RESEND_API_KEY ekleyin (opsiyonel)"
Write-Host "3. Uygulamayı yeniden başlatın: npm run dev"
Write-Host "4. /ayarlar/bildirimler sayfasından bildirimleri test edin"
Write-Host ""
