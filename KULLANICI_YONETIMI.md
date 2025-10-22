# 👥 Gelişmiş Kullanıcı Yönetimi

Admin panelindeki kullanıcı yönetimi sistemi tamamen yenilendi ve çok daha kullanışlı hale getirildi.

## 🎯 Yeni Özellikler

### 📊 İstatistik Kartları
- **Toplam Kullanıcı**: Sistemdeki tüm kullanıcı sayısı
- **Admin Sayısı**: Yönetici yetkisine sahip kullanıcılar
- **Aktif Kullanıcılar**: En az bir plan, yorum veya beğenisi olan kullanıcılar
- **Bu Hafta**: Son 7 günde kayıt olan yeni üyeler
- **Bu Ay**: Son 30 günde kayıt olan yeni üyeler

### 🔍 Arama ve Filtreleme
- **Canlı Arama**: İsim veya email ile anında arama
- **Rol Filtreleme**: Tümü / User / Admin filtresi
- Arama sonuçları anlık olarak güncellenir

### 📋 Sıralama Seçenekleri
- **📅 Tarih**: Kayıt tarihine göre (yeni → eski veya eski → yeni)
- **👤 İsim**: Alfabetik sıralama (A-Z veya Z-A)
- **📋 Plan**: Plan sayısına göre
- **⚡ Aktivite**: Toplam aktiviteye göre (plan + yorum + beğeni)

Her sıralama için artan/azalan seçeneği mevcut (↑/↓)

### ✅ Toplu İşlemler
- **Çoklu Seçim**: Checkbox ile birden fazla kullanıcı seçimi
- **Tümünü Seç**: Filtrelenmiş tüm kullanıcıları tek tıkla seç
- **Toplu Admin Yap**: Seçili kullanıcıları admin yap
- **Toplu User Yap**: Seçili kullanıcıları user yap
- Seçim sayısı ve işlem butonları görsel olarak vurgulanır

### 🗑️ Kullanıcı Silme
- **Güvenli Silme**: Onay modalı ile güvenli silme
- **Cascade Delete**: Kullanıcı silindiğinde tüm ilişkili veriler de silinir:
  - Planlar
  - Yorumlar
  - Beğeniler
  - Hesap bilgileri
  - Oturumlar
- **Kendi Hesabını Silme Engeli**: Admin kendi hesabını silemez

### 📥 Export Özelliği
- **CSV İndirme**: Filtrelenmiş kullanıcı listesini CSV olarak indir
- **Türkçe Başlıklar**: İsim, Email, Rol, Planlar, Yorumlar, Beğeniler, Kayıt Tarihi
- **UTF-8 BOM**: Excel'de Türkçe karakterler düzgün görünür
- Dosya adı: `kullanicilar-YYYY-MM-DD.csv`

### 🎨 Gelişmiş UI/UX
- **Renkli İstatistik Kartları**: Her metrik farklı renk teması
- **Aktivite Göstergeleri**: Plan, yorum, beğeni sayıları renkli kartlarda
- **Toplam Aktivite**: Kullanıcının toplam aktivite skoru
- **Seçim Vurgusu**: Seçili kullanıcılar mavi kenarlık ve arka plan
- **Loading States**: İşlem sırasında yükleme göstergeleri
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu

### 🔒 Güvenlik
- **Admin Kontrolü**: Tüm işlemler admin yetkisi gerektirir
- **Kendi Rolünü Değiştirme Engeli**: Admin kendi rolünü değiştiremez
- **Kendi Hesabını Silme Engeli**: Admin kendi hesabını silemez
- **Onay Modalları**: Kritik işlemler için onay istenir

## 🚀 Kullanım

### Arama Yapma
1. Üst kısımdaki arama kutusuna isim veya email yazın
2. Sonuçlar otomatik olarak filtrelenir

### Filtreleme
1. "Tümü", "User" veya "Admin" butonlarına tıklayın
2. Sadece seçili role sahip kullanıcılar gösterilir

### Sıralama
1. Sıralama butonlarından birini seçin (Tarih, İsim, Plan, Aktivite)
2. Aynı butona tekrar tıklayarak sıralama yönünü değiştirin (↑/↓)

### Toplu İşlem
1. Kullanıcıların yanındaki checkbox'ları işaretleyin
2. Veya "Tümünü Seç" ile hepsini seçin
3. Üstte çıkan mavi alanda "Admin Yap" veya "User Yap" butonuna tıklayın
4. Onaylayın

### Kullanıcı Silme
1. Kullanıcı kartındaki "🗑️ Sil" butonuna tıklayın
2. Açılan modalda uyarıyı okuyun
3. "Evet, Sil" ile onaylayın

### CSV Export
1. Arama/filtreleme ile istediğiniz kullanıcıları bulun
2. "📥 CSV İndir" butonuna tıklayın
3. Dosya otomatik olarak indirilir

## 📱 Responsive Tasarım
- **Mobil**: İstatistikler 2 sütun, filtreler alt alta
- **Tablet**: İstatistikler 3-4 sütun
- **Masaüstü**: Tüm özellikler yan yana, 5 sütun istatistik

## 🎯 Performans
- **Memoization**: Filtreleme ve sıralama optimize edildi
- **Lazy Loading**: Büyük listeler için hazır
- **Debouncing**: Arama için optimize edilebilir (gelecek)

## 🔄 API Endpoints

### PATCH /api/admin/users/[id]
Kullanıcı rolünü günceller
```json
{
  "role": "ADMIN" | "USER"
}
```

### DELETE /api/admin/users/[id]
Kullanıcıyı ve tüm ilişkili verilerini siler (cascade)

## 📝 Notlar
- Tüm işlemler gerçek zamanlı olarak güncellenir
- Sayfa yenileme gerektirmez (router.refresh kullanılır)
- Hata durumlarında kullanıcı dostu mesajlar gösterilir
