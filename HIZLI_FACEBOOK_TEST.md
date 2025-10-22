# ⚡ Hızlı Facebook Test - 5 Dakikada

## 🎯 Sorun
Facebook localhost'tan görsel çekemiyor. Çözüm: ngrok ile internete aç.

## 🚀 Hızlı Kurulum

### 1. ngrok İndir (2 dakika)

**Windows:**
1. Git: https://ngrok.com/download
2. "Windows (64-bit)" indir
3. ZIP'i aç
4. `ngrok.exe` dosyasını masaüstüne kopyala

### 2. ngrok Başlat (30 saniye)

```bash
# Yeni terminal aç (CMD veya PowerShell)
cd Desktop
ngrok.exe http 3000
```

**Veya tam yol ile:**
```bash
C:\Users\YourName\Desktop\ngrok.exe http 3000
```

### 3. URL'i Kopyala (10 saniye)

Terminal'de göreceksin:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

`https://abc123.ngrok.io` kısmını kopyala!

### 4. Test Et (2 dakika)

1. **Tarayıcıda aç:**
   ```
   https://abc123.ngrok.io/plan/5-kilo-vermek-p58gns
   ```

2. **Paylaş butonuna tıkla**

3. **Facebook'ta paylaş**

4. **Artık görsel görünecek! 🎉**

---

## 🔍 Facebook Debugger ile Kontrol

1. Git: https://developers.facebook.com/tools/debug/
2. ngrok URL'ini yapıştır
3. "Fetch new information" tıkla
4. Görseli ve bilgileri gör

---

## 💡 Önemli Notlar

### ⏰ Süre Sınırı
- Ücretsiz ngrok 2 saat sonra kapanır
- Yeniden başlatman yeterli
- Yeni URL alırsın

### 🔄 Her Seferinde Farklı URL
- ngrok her başlatmada yeni URL verir
- Normal, sorun değil
- Test için yeterli

### 🚀 Kalıcı Çözüm
Production için Vercel'e deploy et:
```bash
npm i -g vercel
vercel
```

---

## 🎯 Özet

```bash
# 1. ngrok indir ve aç
ngrok.exe http 3000

# 2. URL'i kopyala
https://abc123.ngrok.io

# 3. Tarayıcıda aç
https://abc123.ngrok.io/plan/[slug]

# 4. Facebook'ta paylaş
✅ Görsel artık görünüyor!
```

---

## ❓ Sorun mu Var?

### "ngrok: command not found"
**Çözüm:** Tam yol kullan
```bash
C:\Users\YourName\Desktop\ngrok.exe http 3000
```

### "Development server çalışmıyor"
**Çözüm:** Önce dev server'ı başlat
```bash
# Terminal 1
cd zayiflamaplanim
npm run dev

# Terminal 2
ngrok http 3000
```

### "Facebook hala görsel göstermiyor"
**Çözüm:** Facebook Debugger'da "Fetch new information" tıkla

---

## 🎉 Başarılı!

Artık Facebook'ta paylaşımlarında:
- ✅ Güzel Open Graph görseli
- ✅ Plan başlığı
- ✅ Kilo bilgileri
- ✅ Süre ve istatistikler

görünecek! 🚀

