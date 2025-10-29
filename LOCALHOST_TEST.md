# 🧪 Localhost'ta PWA Testi

## ✅ Server Çalışıyor!

```
http://localhost:3000
```

## 📋 Test Adımları

### 1. Chrome'da Aç
```
http://localhost:3000
```

### 2. DevTools Aç (F12)

### 3. Application Tab'ına Git

Sol menüden kontrol et:

#### Service Workers
- ✅ Status: **activated and is running**
- ✅ Source: `/sw.js`
- ✅ Scope: `/`

#### Manifest
- ✅ Name: "Zayıflama Planım"
- ✅ Short name: "Zayıflama"
- ✅ Start URL: "/"
- ✅ Display: "standalone"
- ✅ Theme color: "#9333ea"
- ✅ Icons: 2 adet (192x192, 512x512)

#### Cache Storage
- ✅ Cache name: `zayiflama-planim-v1`
- ✅ Cached files görünmeli

### 4. Install Prompt Test

#### Desktop'ta:
1. Adres çubuğuna bak
2. Sağ tarafta **"+"** ikonu olmalı
3. Tıkla → "Yükle" de
4. Uygulama penceresi açılır

#### Mobil Simülasyonu:
1. F12 → **Ctrl+Shift+M** (Device Mode)
2. iPhone 12 Pro seç
3. Sayfayı yenile (F5)
4. **2-3 saniye bekle**
5. Sağ altta popup çıkmalı: "Uygulamayı Yükle"

### 5. Offline Test

1. DevTools → **Network** tab
2. **Offline** checkbox'ını işaretle
3. Sayfayı yenile (F5)
4. Offline sayfası görünmeli

### 6. Console Test

Console'a yapıştır:

```javascript
// Service Worker kontrolü
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs.length);
  regs.forEach(reg => console.log('Scope:', reg.scope));
});

// Cache kontrolü
caches.keys().then(keys => {
  console.log('Caches:', keys);
});

// Manifest kontrolü
fetch('/manifest.json')
  .then(r => r.json())
  .then(m => console.log('Manifest:', m));
```

## 🎯 Beklenen Sonuçlar

### ✅ Başarılı:
- Service Worker: 1 adet registered
- Cache: `zayiflama-planim-v1` var
- Manifest: JSON geçerli
- Install prompt: Çıkıyor
- Offline: Çalışıyor

### ❌ Sorun Varsa:

#### Service Worker yok:
```javascript
// Console'da:
navigator.serviceWorker.register('/sw.js')
  .then(reg => console.log('Registered!', reg))
  .catch(err => console.error('Error:', err));
```

#### Install prompt çıkmıyor:
- localStorage temizle: `localStorage.clear()`
- Sayfayı yenile
- 2-3 saniye bekle

#### Offline çalışmıyor:
- Service Worker aktif mi kontrol et
- Cache'de dosyalar var mı kontrol et

## 📱 Gerçek Mobil Test

### Aynı WiFi'deyseniz:

1. Server'ın network adresini kullan:
```
http://192.168.1.101:3000
```

2. Mobil Chrome'da aç
3. Menü → "Ana ekrana ekle"
4. Telefonda ikon oluşur

### Farklı Ağdaysanız (ngrok):

```bash
# Yeni terminal
npx ngrok http 3000
```

Çıkan URL'i mobilde aç (örn: https://abc123.ngrok.io)

## 🎨 Görsel Kontroller

### Install Prompt Popup:
- Mor-pembe gradient ikon
- "Uygulamayı Yükle" başlık
- "Zayıflama Planım'ı telefonunuza yükleyin" metin
- "Yükle" ve "Şimdi Değil" butonları

### Offline Sayfa:
- Mor-pembe gradient arka plan
- WiFi kapalı ikonu
- "İnternet Bağlantısı Yok" başlık
- "Tekrar Dene" butonu

## 🔧 Debug

### Service Worker Log:
```javascript
// Console'da:
navigator.serviceWorker.addEventListener('message', event => {
  console.log('SW Message:', event.data);
});
```

### Cache İçeriği:
```javascript
caches.open('zayiflama-planim-v1').then(cache => {
  cache.keys().then(keys => {
    console.log('Cached URLs:', keys.map(k => k.url));
  });
});
```

## ✅ Checklist

- [ ] Server çalışıyor (http://localhost:3000)
- [ ] Service Worker registered
- [ ] Manifest geçerli
- [ ] İkonlar yükleniyor
- [ ] Install prompt çıkıyor
- [ ] Offline sayfa çalışıyor
- [ ] Cache çalışıyor

## 🎉 Başarı Kriterleri

Eğer bunlar çalışıyorsa **PWA başarılı**:

1. ✅ DevTools → Application → Service Workers → **activated**
2. ✅ DevTools → Application → Manifest → **Bilgiler görünüyor**
3. ✅ Adres çubuğunda **"+"** ikonu var
4. ✅ Offline modda **sayfa açılıyor**
5. ✅ Console'da **hata yok**

## 🚀 Sonraki Adım

Test başarılıysa:
```bash
# Build ve deploy
npm run build
vercel deploy
```

Production'da HTTPS ile daha iyi çalışır!

---

**Şimdi test et ve sonucu söyle! 🎯**
