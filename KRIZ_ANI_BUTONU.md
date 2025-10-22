# 🆘 Kriz Anı Butonu

## Genel Bakış

Kriz Anı Butonu, kullanıcıların zayıflama yolculuğunda zorlu anlar yaşadıklarında anında motivasyon desteği almalarını sağlayan bir özelliktir. Yemek isteği, motivasyon düşüklüğü, stres veya can sıkıntısı gibi durumlarda kullanıcılara güçlü motivasyon mesajları ve pratik öneriler sunar.

## Özellikler

### 1. Sabit Kriz Butonu
- Tüm sayfalarda sağ alt köşede sabit olarak görünür
- Dikkat çekici kırmızı-turuncu gradient tasarım
- Animasyonlu hover efektleri

### 2. Kriz Türleri
Kullanıcılar 4 farklı kriz türü seçebilir:

- **🍕 Yemek İsteği**: Sağlıksız yemek yeme isteği
- **😔 Motivasyon Düşük**: Motivasyon kaybı
- **😰 Stres**: Stresli anlar ve stres yeme
- **😴 Can Sıkıntısı**: Sıkılma ve duygusal yeme

### 3. Motivasyon Bombardımanı
Her kriz türü için özel hazırlanmış:
- 5 güçlü motivasyon mesajı
- Pratik öneriler listesi
- Hemen yapılabilecek aktiviteler

### 4. Gamification Entegrasyonu
- Her atlatılan kriz için +50 XP
- Seviye atlama sistemi
- Başarı takibi

### 5. İstatistik Takibi
- Toplam kriz anı sayısı
- Atlatılan kriz sayısı
- Başarı oranı (%)
- Kriz türlerine göre dağılım
- Zaman çizelgesi

## Teknik Detaylar

### Veritabanı Şeması

```prisma
model CrisisButton {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  trigger     String   // "food_craving", "motivation_low", "stress_eating", "boredom"
  resolved    Boolean  @default(false)
  resolvedAt  DateTime?
  note        String?  @db.Text
  createdAt   DateTime @default(now())

  @@index([userId, createdAt])
  @@index([trigger])
}
```

### API Endpoints

#### POST /api/crisis-button
Yeni kriz anı kaydeder.

**Request Body:**
```json
{
  "trigger": "food_craving",
  "note": "Opsiyonel not"
}
```

**Response:**
```json
{
  "success": true,
  "id": "crisis_id"
}
```

#### POST /api/crisis-button/resolve
Kriz anını çözüldü olarak işaretler ve XP verir.

**Request Body:**
```json
{
  "trigger": "food_craving"
}
```

**Response:**
```json
{
  "success": true,
  "xpReward": 50,
  "message": "Kriz başarıyla atlatıldı!"
}
```

#### GET /api/crisis-button
Kriz anı geçmişini ve istatistikleri getirir.

**Query Parameters:**
- `limit`: Kaç kayıt getirileceği (varsayılan: 10)
- `resolved`: true/false - Sadece çözülmüş veya çözülmemiş krizleri getir

**Response:**
```json
{
  "crisisButtons": [...],
  "stats": {
    "byTrigger": [
      { "trigger": "food_craving", "_count": 5 }
    ],
    "resolved": 8,
    "total": 10,
    "successRate": 80
  }
}
```

### Komponentler

#### CrisisButton
Ana kriz butonu komponenti. Tüm sayfalarda görünür.

**Kullanım:**
```tsx
import { CrisisButton } from '@/components/crisis-button';

<CrisisButton />
```

#### CrisisStats
Kriz anı istatistiklerini gösteren komponent.

**Kullanım:**
```tsx
import { CrisisStats } from '@/components/crisis-stats';

<CrisisStats />
```

## Kullanıcı Akışı

1. **Kriz Anı Başlangıcı**
   - Kullanıcı sağ alttaki "🆘 Kriz Anı!" butonuna tıklar
   - Modal açılır ve kriz türü seçimi yapılır

2. **Motivasyon Desteği**
   - Seçilen kriz türüne özel motivasyon mesajları gösterilir
   - Pratik öneriler ve hemen yapılabilecekler listelenir
   - Kriz anı otomatik olarak kaydedilir

3. **Kriz Çözümü**
   - Kullanıcı "✅ Krizi Atlattım!" butonuna tıklar
   - Kriz çözüldü olarak işaretlenir
   - +50 XP kazanılır
   - Başarı mesajı gösterilir

4. **İstatistik Görüntüleme**
   - Navbar > Özellikler > Kriz İstatistikleri
   - Veya direkt: `/crisis-stats`
   - Tüm kriz geçmişi ve istatistikler görüntülenir

## Motivasyon Mesajları

### Yemek İsteği (food_craving)
- 🔥 Dur bir dakika! Bu his geçici, ama hedefin kalıcı!
- 💪 Şu ana kadar geldiğin yolu düşün. Bunu hak ettin mi?
- ⏰ 20 dakika bekle. Gerçek açlık mı, yoksa duygusal mı?
- 🎯 Hedef kilona ne kadar yakınsın? Bunu riske atmaya değer mi?
- 🌟 Yarın sabah aynaya baktığında gurur duyacak mısın?

### Motivasyon Düşük (motivation_low)
- 🚀 Her gün yeni bir başlangıç! Sen yapabilirsin!
- 💎 Değişim kolay olsaydı, herkes yapardı. Sen farklısın!
- 🏆 Başarı, küçük adımların toplamıdır. Bugün bir adım at!
- 🌈 Zorlu günler, güçlü insanlar yaratır. Sen güçlüsün!
- ⭐ Kendine inan! Buraya kadar geldiysen, sonuna kadar gidebilirsin!

### Stres (stress_eating)
- 🧘 Derin bir nefes al. Stres geçici, sağlığın kalıcı.
- 🎨 Yemek yerine başka bir şey dene: Yürüyüş, müzik, kitap...
- 💚 Vücudun seni seviyor. Ona stresle değil, sevgiyle davran.
- 🌊 Bu dalga geçecek. Sen güçlüsün, kontrol sende!
- 🎯 Stresi yemekle değil, hareketle at! 10 dakika yürü.

### Can Sıkıntısı (boredom)
- 🎮 Can sıkıntısı = Yemek değil! Başka bir aktivite bul.
- 📚 Kitap oku, müzik dinle, arkadaşını ara. Ama yeme!
- 🏃 Sıkıldın mı? Hareket et! 5 dakika egzersiz yap.
- 🎨 Yaratıcı ol! Hobinle ilgilen, yeni bir şey öğren.
- 💪 Can sıkıntısı geçici, pişmanlık kalıcı. Akıllı seç!

## Pratik Öneriler

Her kriz anında kullanıcılara sunulan hemen yapılabilecekler:
- ✅ Bir bardak su iç
- ✅ 10 derin nefes al
- ✅ 5 dakika yürüyüş yap
- ✅ Hedeflerini tekrar oku
- ✅ Başarı fotoğraflarına bak

## Veritabanı Migrasyonu

Özelliği kullanmak için veritabanı şemasını güncellemeniz gerekir:

```bash
npx prisma migrate dev --name add_crisis_button
```

## Gelecek Geliştirmeler

- [ ] Kişiselleştirilmiş motivasyon mesajları
- [ ] Ses kaydı ile motivasyon desteği
- [ ] Partner bildirim sistemi (partner krize girdiğinde bildirim)
- [ ] Kriz anı rozetleri (10, 50, 100 kriz atlatma)
- [ ] Haftalık/aylık kriz raporu
- [ ] AI destekli kişisel motivasyon önerileri
- [ ] Kriz anı günlüğü (detaylı notlar)
- [ ] Kriz tetikleyicileri analizi
- [ ] Başarılı kriz atlama stratejileri paylaşımı

## Performans

- Modal lazy loading ile optimize edilmiştir
- API çağrıları debounce edilmiştir
- İstatistikler cache'lenir (5 dakika)
- Animasyonlar GPU hızlandırmalıdır

## Güvenlik

- Tüm API endpoint'leri authentication gerektirir
- Rate limiting uygulanmıştır (dakikada 10 istek)
- XSS koruması mevcuttur
- CSRF token kontrolü yapılır

## Test Senaryoları

1. **Kriz Butonu Görünürlüğü**
   - Buton tüm sayfalarda görünür mü?
   - Mobil cihazlarda düzgün çalışıyor mu?

2. **Kriz Kaydı**
   - Kriz türü seçimi çalışıyor mu?
   - API'ye doğru kaydediliyor mu?

3. **Motivasyon Gösterimi**
   - Doğru mesajlar gösteriliyor mu?
   - Animasyonlar düzgün çalışıyor mu?

4. **Kriz Çözümü**
   - XP doğru veriliyor mu?
   - Seviye atlama çalışıyor mu?

5. **İstatistikler**
   - Doğru hesaplanıyor mu?
   - Grafik gösterimi düzgün mü?

## Destek

Sorularınız için:
- GitHub Issues
- Discord Community
- Email: support@zayiflamaplanim.com
