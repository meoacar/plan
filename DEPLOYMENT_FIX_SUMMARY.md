# Deployment Fix - Internal Server Error Çözümü

**Tarih:** 2 Kasım 2025  
**Sorun:** Her push sonrası Internal Server Error

## 🔍 Sorunun Kökeni

Next.js routing hatası:
```
Error: You cannot use different slug names for the same dynamic path ('groupId' !== 'slug')
```

Aynı seviyede hem `[groupId]` hem de `[slug]` klasörleri vardı:
- `/api/groups/[groupId]/` ❌
- `/api/groups/[slug]/` ✅

## ✅ Uygulanan Çözümler

### 1. Routing Hatası Düzeltildi
- `src/app/api/groups/[groupId]` klasörü silindi
- Sadece `[slug]` kullanılıyor
- 29 dosya kaldırıldı (4158 satır)

### 2. Cache Temizleme Sistemi
`.next` klasörü her deployment'ta temizleniyor:

**Sunucu Scripti:** `/var/www/zayiflamaplanim/deploy.sh`
```bash
#!/bin/bash
set -e

echo '🚀 Deployment başlıyor...'
cd /var/www/zayiflamaplanim

echo '📥 Git pull yapılıyor...'
git pull origin master

echo '📦 Dependencies güncelleniyor...'
npm install

echo '🗄️ Prisma migration çalıştırılıyor...'
npx prisma migrate deploy

echo '🧹 Cache temizleniyor (.next klasörü)...'
rm -rf .next
rm -rf node_modules/.cache

echo '🔨 Temiz build yapılıyor...'
npm run build

echo '🔄 PM2 restart yapılıyor...'
pm2 restart zayiflamaplanim

echo '✅ Deploy tamamlandı!'
pm2 status
```

**Local Script:** `deploy-to-server.ps1` (güncellenmiş)
- Her deployment'ta `.next` ve `node_modules/.cache` temizleniyor

### 3. Git Commit
```bash
git commit -m "fix: [groupId] klasörünü kaldır, sadece [slug] kullan - Next.js routing hatası düzeltmesi"
git push origin master
```

## 🎯 Sonuç

✅ Site çalışıyor: https://zayiflamaplanim.com (200 OK)  
✅ Build başarılı (hatasız)  
✅ PM2 online  
✅ Loglar temiz (hata yok)

## 📝 Kullanım

### Sunucudan Deploy
```bash
ssh root@31.97.34.163
cd /var/www/zayiflamaplanim
./deploy.sh
```

### Local'den Deploy
```powershell
.\deploy-to-server.ps1
```

## 🔄 Otomatik Temizleme

Her deployment'ta otomatik olarak:
1. `.next` klasörü silinir
2. `node_modules/.cache` temizlenir
3. Temiz build yapılır
4. PM2 restart edilir

Bu sayede eski cache'lenmiş dosyalar sorun çıkarmaz.

## 🚨 Önemli Notlar

- `[groupId]` klasörü artık kullanılmıyor
- Tüm grup API'leri `[slug]` üzerinden çalışıyor
- Her push sonrası otomatik cache temizleme aktif
- GitHub'dan çekilen kodda `[groupId]` yok (commit edildi)

**Son Güncelleme:** 2 Kasım 2025, 07:19
