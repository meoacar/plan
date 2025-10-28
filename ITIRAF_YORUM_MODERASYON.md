# İtiraf ve Yorum Moderasyon Sistemi

## Yapılan Değişiklikler

### 1. Veritabanı Değişiklikleri
- `ConfessionComment` modelinde `status` alanının varsayılan değeri `APPROVED`'dan `PENDING`'e değiştirildi
- Artık tüm yorumlar admin onayı bekleyecek

### 2. API Değişiklikleri

#### `/api/confessions/[id]/comments` (GET)
- Onaylanmış yorumları gösterir
- Kullanıcının kendi yorumlarını da gösterir (onay durumu ne olursa olsun)

#### `/api/confessions/[id]/comments` (POST)
- Yeni yorumlar `status: 'PENDING'` ile oluşturulur
- Kullanıcıya "Admin onayından sonra yayınlanacak" mesajı gösterilir

#### `/api/confessions` (GET)
- Onaylanmış itirafları gösterir
- Kullanıcının kendi itiraflarını da gösterir (onay durumu ne olursa olsun)

#### `/api/admin/confession-comments` (Yeni)
- Admin paneli için yorum listesi
- Status filtreleme (PENDING, APPROVED, REJECTED, ALL)
- Sayfalama desteği

#### `/api/admin/confession-comments/[id]` (Yeni)
- PATCH: Yorum durumunu güncelleme (onaylama/reddetme)
- DELETE: Yorumu silme

### 3. Admin Panel

#### `/admin/confession-comments` (Yeni Sayfa)
- Bekleyen, onaylanan ve reddedilen yorumları görüntüleme
- Yorumları onaylama/reddetme
- Yorumları silme
- Hangi itirafa ait olduğunu gösterme
- Admin sidebar'a "İtiraf Yorumları" linki eklendi

### 4. Kullanıcı Arayüzü

#### Günah İtiraf Duvarı (`/gunah-itiraf`)
- İtirafların yanında "⏳ Onay Bekliyor" ibaresi gösterilir (PENDING durumunda)
- Yorumların yanında "⏳ Onay Bekliyor" ibaresi gösterilir (PENDING durumunda)
- Kullanıcı kendi itiraf ve yorumlarını görebilir (onay bekliyor ibaresiyle)
- Yorum gönderildiğinde "Admin onayından sonra yayınlanacak" mesajı gösterilir

## Kullanım

### Admin İşlemleri

1. Admin paneline giriş yapın
2. Sol menüden "İtiraf Yorumları" seçeneğine tıklayın
3. Bekleyen yorumları görüntüleyin
4. "✅ Onayla" veya "❌ Reddet" butonlarını kullanın
5. İstenirse "🗑️ Sil" butonu ile yorumu kalıcı olarak silin

### Kullanıcı Deneyimi

1. Kullanıcı bir itirafa yorum yapar
2. "Yorumun gönderildi! Admin onayından sonra yayınlanacak. +10 XP kazandın 🎉" mesajı görür
3. Kendi yorumunu "⏳ Onay Bekliyor" ibaresiyle görebilir
4. Admin onayladıktan sonra yorum herkese görünür hale gelir

## Özellikler

✅ İtiraflar admin onayı bekler
✅ Yorumlar admin onayı bekler
✅ Kullanıcı kendi içeriklerini görebilir
✅ "Onay Bekliyor" ibaresi gösterilir
✅ Admin panelinde kolay moderasyon
✅ XP sistemi korundu
✅ Anonim yorum desteği devam ediyor

## Veritabanı Güncellemesi

Değişiklikler `npx prisma db push` komutuyla veritabanına uygulandı.
