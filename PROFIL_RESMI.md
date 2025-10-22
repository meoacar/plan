# Profil Resmi Özelliği

## Özellikler

Kullanıcılar artık profil düzenleme sayfasında profil resmi ekleyebilir:

### 1. Dosya Yükleme
- Kullanıcılar kendi resimlerini yükleyebilir
- Maksimum dosya boyutu: 2MB
- Desteklenen formatlar: JPG, PNG, GIF
- Yüklenen resimler `/public/uploads/avatars/` klasörüne kaydedilir

### 2. Hazır Avatar Seçimi
- 10 farklı renkli avatar seçeneği
- Avatarlar `/public/avatars/` klasöründe SVG formatında
- Renkler: Yeşil, Mavi, Mor, Pembe, Turuncu, Kırmızı, Teal, İndigo, Mor-2, Cyan

### 3. Profil Resmi Gösterimi
Profil resmi şu yerlerde görünür:
- ✅ Profil sayfası (büyük avatar)
- ✅ Profil düzenleme sayfası
- ✅ Plan kartlarında (küçük avatar)
- ✅ Yorumlarda (küçük avatar - eğer yorum sistemi varsa)

## Teknik Detaylar

### API Endpoints
- `POST /api/upload/avatar` - Profil resmi yükleme
- `PUT /api/user/profile` - Profil güncelleme (image alanı eklendi)
- `GET /api/user/profile` - Profil bilgilerini getir (image alanı dahil)

### Veritabanı
User modelinde `image` alanı zaten mevcut (NextAuth tarafından kullanılıyor).

### Dosya Yapısı
```
public/
├── avatars/           # Hazır avatar SVG dosyaları
│   ├── avatar-1.svg   # Yeşil
│   ├── avatar-2.svg   # Mavi
│   ├── avatar-3.svg   # Mor
│   ├── avatar-4.svg   # Pembe
│   ├── avatar-5.svg   # Turuncu
│   ├── avatar-6.svg   # Kırmızı
│   ├── avatar-7.svg   # Teal
│   ├── avatar-8.svg   # İndigo
│   ├── avatar-9.svg   # Mor-2
│   └── avatar-10.svg  # Cyan
└── uploads/
    └── avatars/       # Kullanıcı yüklemeleri (gitignore'da)
```

### Güvenlik
- Dosya boyutu kontrolü (max 2MB)
- Dosya tipi kontrolü (sadece resimler)
- Oturum kontrolü (sadece giriş yapmış kullanıcılar)
- Benzersiz dosya adları (userId-timestamp.ext)

## Kullanım

1. Profil düzenleme sayfasına git: `/profile/edit`
2. "Profil Resmi" bölümünde:
   - "Resim Yükle" butonuna tıkla ve bilgisayarından resim seç
   - VEYA "Avatar Seç" butonuna tıkla ve hazır avatarlardan birini seç
3. "Değişiklikleri Kaydet" butonuna tıkla
4. Profil resmin artık her yerde görünecek!

## Notlar

- Yüklenen resimler `/public/uploads/avatars/` klasöründe saklanır
- Bu klasör `.gitignore` dosyasına eklendi (git'e yüklenmez)
- Production ortamında bu resimlerin bir CDN'e yüklenmesi önerilir
- Avatarlar SVG formatında olduğu için her boyutta net görünür
