#!/bin/bash

echo "🔔 Bildirim Sistemi Kurulumu Başlıyor..."
echo ""

# 1. VAPID Keys Oluştur
echo "📝 VAPID keys oluşturuluyor..."
npx web-push generate-vapid-keys

echo ""
echo "⚠️  Yukarıdaki VAPID keys'i .env dosyanıza ekleyin:"
echo ""
echo "NEXT_PUBLIC_VAPID_PUBLIC_KEY=\"your-public-key\""
echo "VAPID_PRIVATE_KEY=\"your-private-key\""
echo "VAPID_SUBJECT=\"mailto:your-email@example.com\""
echo ""

# 2. Dependencies Yükle
echo "📦 Bağımlılıklar yükleniyor..."
npm install

# 3. Prisma Migration
echo "🗄️  Veritabanı migration'ı çalıştırılıyor..."
npx prisma migrate dev --name add_notifications

# 4. Prisma Client Güncelle
echo "🔄 Prisma client güncelleniyor..."
npx prisma generate

echo ""
echo "✅ Kurulum tamamlandı!"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. .env dosyanıza VAPID keys'i ekleyin"
echo "2. Email servisi için RESEND_API_KEY ekleyin (opsiyonel)"
echo "3. Uygulamayı yeniden başlatın: npm run dev"
echo "4. /ayarlar/bildirimler sayfasından bildirimleri test edin"
echo ""
