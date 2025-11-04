# Mini Oyunlar Bileşenleri

Bu klasör, mini oyunlar sistemi için kullanılan React bileşenlerini içerir.

## Bileşenler

### GameCard

Oyun kartı bileşeni. Her bir mini oyunu gösteren kart.

**Props:**
- `game`: Oyun bilgileri (id, code, name, description, settings, rewardTiers, dailyLimit)
- `dailyPlays`: Bugün kaç kez oynandı
- `highScore`: Kullanıcının en yüksek skoru (opsiyonel)
- `onPlay`: Oyun başlatma callback fonksiyonu (opsiyonel)
- `path`: Oyun sayfası yolu (opsiyonel)

**Özellikler:**
- Oyun ikonu ve gradient arka plan
- Günlük limit göstergesi
- Yüksek skor badge'i
- Oyun detayları (süre, maksimum ödül, günlük limit)
- Oyna butonu (limit dolduğunda devre dışı)
- Hover animasyonları

**Kullanım:**
```tsx
<GameCard
  game={gameData}
  dailyPlays={3}
  highScore={850}
/>
```

### GameLeaderboard

Oyun liderlik tablosu bileşeni. En yüksek skorları gösterir.

**Props:**
- `gameCode`: Oyun kodu (CALORIE_GUESS, MEMORY_CARDS, vb.)
- `period`: Periyot ('daily', 'weekly', 'all-time') - varsayılan: 'all-time'
- `limit`: Kaç kullanıcı gösterilecek - varsayılan: 50
- `showUserRank`: Kullanıcının sıralamasını göster - varsayılan: true

**Özellikler:**
- İlk 3 sıra için özel badge'ler (altın, gümüş, bronz)
- Kullanıcı avatarları
- Kullanıcının kendi sıralaması vurgulanır
- Periyot bazlı filtreleme
- Boş durum gösterimi
- Yükleme durumu

**Kullanım:**
```tsx
<GameLeaderboard
  gameCode="CALORIE_GUESS"
  period="weekly"
  limit={10}
  showUserRank={true}
/>
```

### CalorieGuessGame

Kalori tahmin oyunu bileşeni. 10 soruluk oyun.

**Props:**
- `onComplete`: Oyun bittiğinde çağrılan callback (score, gameData)
- `onCancel`: İptal butonu callback (opsiyonel)

**Özellikler:**
- 10 soruluk oyun
- Her soru için 30 saniye süre
- Doğruluk bazlı puan sistemi (±10% = 100 puan, ±20% = 50 puan, ±30% = 25 puan)
- İlerleme çubuğu
- Geri sayım timer
- Anlık geri bildirim
- Detaylı sonuç ekranı

### MemoryCardsGame

Hafıza kartları oyunu bileşeni. 4x4 grid'de eşleşme bulma.

**Props:**
- `onComplete`: Oyun bittiğinde çağrılan callback (score, gameData)
- `onCancel`: İptal butonu callback (opsiyonel)

**Özellikler:**
- 4x4 grid (8 çift kart)
- Kart açma/kapama animasyonları
- Hamle sayacı
- Süre takibi
- Eşleşme kontrolü
- Performans bazlı coin ödülü

### QuickClickGame

Hızlı tıklama oyunu bileşeni. 30 saniye süresince sağlıklı yiyecekleri seçme.

**Props:**
- `onComplete`: Oyun bittiğinde çağrılan callback (score, gameData)
- `onCancel`: İptal butonu callback (opsiyonel)

**Özellikler:**
- 30 saniye süre
- Rastgele yiyecek gösterimi
- Sağlıklı/sağlıksız seçimi
- Doğru = +10 puan, Yanlış = -5 puan
- Geri sayım timer
- Skor takibi

## Sayfa Bileşenleri

### GamesPage

Ana oyunlar sayfası. Tüm oyunları listeler ve liderlik tablosunu gösterir.

**Özellikler:**
- Oyun kartları grid layout
- Günlük limit bilgisi
- Liderlik tablosu (günlük, haftalık, tüm zamanlar)
- Tab navigasyonu
- Bilgi kartları
- Responsive tasarım

**Kullanım:**
```tsx
import GamesPage from '@/app/games/GamesPage';

export default function Page() {
  return <GamesPage />;
}
```

## API Entegrasyonu

### GET /api/games
Tüm oyunları ve kullanıcının durumunu getirir.

**Response:**
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "id": "...",
        "code": "CALORIE_GUESS",
        "name": "Kalori Tahmin Oyunu",
        "description": "...",
        "playedToday": 2,
        "remainingPlays": 3,
        "canPlay": true,
        "highScore": 850,
        "totalGames": 15,
        "averageScore": 650
      }
    ],
    "dailyLimit": 5
  }
}
```

### GET /api/games/leaderboard
Oyun liderlik tablosunu getirir.

**Query Params:**
- `gameCode`: Oyun kodu (zorunlu)
- `period`: 'daily' | 'weekly' | 'all-time' (varsayılan: 'all-time')
- `limit`: Kaç kullanıcı (varsayılan: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "userId": "...",
        "userName": "Kullanıcı Adı",
        "userImage": "...",
        "score": 1000,
        "rank": 1
      }
    ],
    "userRank": 5
  }
}
```

### POST /api/games/start
Oyun oturumu başlatır.

**Request:**
```json
{
  "gameCode": "CALORIE_GUESS"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "...",
    "gameCode": "CALORIE_GUESS",
    "startedAt": "2024-01-01T00:00:00Z",
    "settings": { ... }
  }
}
```

### POST /api/games/complete
Oyun oturumunu tamamlar ve coin verir.

**Request:**
```json
{
  "sessionId": "...",
  "score": 850,
  "gameData": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 850,
    "coinsEarned": 100,
    "duration": 300,
    "highScore": true,
    "leaderboardRank": 5
  }
}
```

## Stil ve Tasarım

### Renk Paleti

- **Kalori Tahmin**: Mavi-Cyan gradient (`from-blue-500 to-cyan-600`)
- **Hafıza Kartları**: Mor-Pembe gradient (`from-purple-500 to-pink-600`)
- **Beslenme Quiz**: Turuncu-Kırmızı gradient (`from-orange-500 to-red-600`)
- **Günlük Bulmaca**: Yeşil-Zümrüt gradient (`from-green-500 to-emerald-600`)

### İkonlar

- **Kalori Tahmin**: Target
- **Hafıza Kartları**: Brain
- **Beslenme Quiz**: Zap
- **Günlük Bulmaca**: Trophy

### Animasyonlar

- Hover efektleri (scale, shadow)
- Kart açma/kapama animasyonları
- İlerleme çubuğu animasyonları
- Skor artış animasyonları
- Geri bildirim animasyonları

## Geliştirme Notları

### Yeni Oyun Ekleme

1. `GAME_ICONS`, `GAME_COLORS`, `GAME_PATHS` objelerine yeni oyunu ekle
2. Oyun bileşenini oluştur (örn: `NewGame.tsx`)
3. Oyun sayfasını oluştur (`/app/games/new-game/page.tsx`)
4. Backend'de oyun ayarlarını ekle (`game-system.ts`)
5. Veritabanına oyun kaydını ekle

### Test Etme

```bash
# Bileşen testleri
npm test src/components/games/

# E2E testleri
npm run test:e2e games
```

### Performans

- Oyun listesi cache'lenir (1 saat)
- Liderlik tablosu cache'lenir (5 dakika)
- Lazy loading kullanılır
- Optimistic UI güncellemeleri

## Sorun Giderme

### Oyun başlatılamıyor
- Günlük limit kontrolü yap
- API endpoint'lerini kontrol et
- Console log'larını incele

### Liderlik tablosu yüklenmiyor
- API response'unu kontrol et
- Network tab'ı incele
- Cache'i temizle

### Coin verilmiyor
- Oyun tamamlama API'sini kontrol et
- Coin sistemi log'larını incele
- Transaction geçmişini kontrol et
