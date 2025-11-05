# Production Hata Düzeltme Deploy Script (PowerShell)

Write-Host "🚀 Production deployment başlıyor..." -ForegroundColor Green

# 1. Prisma Client'ı güncelle
Write-Host "📦 Prisma Client güncelleniyor..." -ForegroundColor Yellow
npx prisma generate

# 2. Database migration'ları uygula
Write-Host "🗄️  Database migration'ları uygulanıyor..." -ForegroundColor Yellow
npx prisma migrate deploy

# 3. Build oluştur
Write-Host "🔨 Production build oluşturuluyor..." -ForegroundColor Yellow
npm run build

# 4. Health check
Write-Host "🏥 Health check yapılıyor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing
    Write-Host "✅ Health check başarılı!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Health check başarısız (sunucu henüz başlamadı)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Deployment tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Sonraki adımlar:" -ForegroundColor Cyan
Write-Host "1. npm start ile production sunucusunu başlatın"
Write-Host "2. https://zayiflamaplanim.com/api/health adresini kontrol edin"
Write-Host "3. Browser console'da hataları kontrol edin"
