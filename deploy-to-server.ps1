# Sunucuya deploy scripti
$SERVER = "root@31.97.34.163"
$APP_DIR = "/var/www/zayiflamaplanim"

Write-Host "🚀 Sunucuya deploy başlıyor..." -ForegroundColor Green

# SSH ile sunucuya bağlan ve komutları çalıştır
ssh $SERVER @"
cd $APP_DIR
echo '📥 Git pull yapılıyor...'
git pull origin master

echo '📦 Dependencies güncelleniyor...'
npm install

echo '🗄️ Prisma migration çalıştırılıyor...'
npx prisma migrate deploy

echo '🍽️ Yemek veritabanı seed ediliyor...'
npm run db:seed:foods

echo '🔨 Build yapılıyor...'
npm run build

echo '🔄 PM2 restart yapılıyor...'
pm2 restart zayiflamaplanim

echo '✅ Deploy tamamlandı!'
pm2 status
"@

Write-Host "✅ Deploy işlemi tamamlandı!" -ForegroundColor Green
