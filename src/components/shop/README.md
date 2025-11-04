# Mağaza Bileşenleri

Bu klasör, ödül mağazası sisteminin frontend bileşenlerini içerir.

## Bileşenler

### RewardCard
Tek bir ödülü gösteren kart bileşeni.

**Özellikler:**
- Ödül görseli veya ikonu
- Ödül adı, açıklaması ve fiyatı
- Stok durumu gösterimi
- Satın alma butonu
- Öne çıkan ve sahip olunan ödüller için özel rozetler
- Hover animasyonları

**Kullanım:**
```tsx
<RewardCard
  reward={reward}
  userCoins={userCoins}
  onPurchase={handlePurchase}
  isPurchasing={false}
  isOwned={false}
/>
```

### RewardShop
Tüm ödülleri listeleyen ana mağaza bileşeni.

**Özellikler:**
- Kategori filtreleme (Dijital, Fiziksel, Premium)
- Sıralama (Fiyat, Popülerlik, Yeni)
- Arama fonksiyonu
- Grid layout ile ödül gösterimi
- Coin bakiyesi gösterimi
- Satın alma modal yönetimi

**Kullanım:**
```tsx
<RewardShop
  initialRewards={rewards}
  initialUserCoins={userCoins}
  ownedRewardIds={ownedIds}
/>
```

### PurchaseModal
Satın alma onay modal'ı.

**Özellikler:**
- Ödül detayları
- Fiyat ve bakiye gösterimi
- Kalan bakiye hesaplama
- Yetersiz bakiye uyarısı
- Onay ve iptal butonları

**Kullanım:**
```tsx
<PurchaseModal
  reward={selectedReward}
  userCoins={userCoins}
  isOpen={isModalOpen}
  onClose={handleClose}
  onConfirm={handleConfirm}
  isPurchasing={false}
/>
```

### MyRewards
Kullanıcının satın aldığı ödülleri gösteren bileşen.

**Özellikler:**
- Aktif, kullanılmış ve süresi dolmuş ödüller için sekmeler
- Ödül kodlarını gösterme ve kopyalama
- Süre bilgisi gösterimi
- Tarih formatlaması
- Boş durum gösterimi

**Kullanım:**
```tsx
<MyRewards initialRewards={userRewards} />
```

## API Entegrasyonu

Bileşenler aşağıdaki API endpoint'lerini kullanır:

- `GET /api/shop/rewards` - Mağaza ödüllerini listeler
- `POST /api/shop/purchase` - Ödül satın alır
- `GET /api/shop/my-rewards` - Kullanıcının ödüllerini getirir

## Stil ve Animasyonlar

- Framer Motion ile animasyonlar
- Tailwind CSS ile stil
- Dark mode desteği
- Responsive tasarım
- Hover ve transition efektleri

## Ödül Tipleri

- **BADGE**: Rozet
- **THEME**: Tema
- **AVATAR**: Avatar
- **FRAME**: Çerçeve
- **DISCOUNT_CODE**: İndirim Kodu
- **GIFT_CARD**: Hediye Çeki
- **AD_FREE**: Reklamsız
- **PREMIUM_STATS**: Premium İstatistikler
- **CUSTOM_PROFILE**: Özel Profil

## Kategoriler

- **DIGITAL**: Dijital ödüller (rozet, tema, avatar, çerçeve)
- **PHYSICAL**: Fiziksel ödüller (indirim kodu, hediye çeki)
- **PREMIUM**: Premium özellikler (reklamsız, premium istatistikler, özel profil)

## Notlar

- Tüm bileşenler client-side render edilir (`'use client'`)
- Coin bakiyesi değişikliklerinde otomatik güncelleme
- Hata yönetimi ve yükleme durumları
- Kullanıcı dostu hata mesajları
- Responsive ve mobil uyumlu tasarım
