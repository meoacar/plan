#!/bin/bash

# Production Hata Düzeltme Deploy Script

echo "🚀 Production deployment başlıyor..."

# 1. Prisma Client'ı güncelle
echo "📦 Prisma Client güncelleniyor..."
npx prisma generate

# 2. Database migration'ları uygula
echo "🗄️  Database migration'ları uygulanıyor..."
npx prisma migrate deploy

# 3. Build oluştur
echo "🔨 Production build oluşturuluyor..."
npm run build

# 4. Health check
echo "🏥 Health check yapılıyor..."
curl -f http://localhost:3000/api/health || echo "⚠️  Health check başarısız (sunucu henüz başlamadı)"

echo "✅ Deployment tamamlandı!"
echo ""
echo "📝 Sonraki adımlar:"
echo "1. npm start ile production sunucusunu başlatın"
echo "2. https://zayiflamaplanim.com/api/health adresini kontrol edin"
echo "3. Browser console'da hataları kontrol edin"
