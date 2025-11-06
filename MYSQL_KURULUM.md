# MySQL Kurulum Rehberi

## 1. MySQL Sunucuya Kurulum

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### CentOS/RHEL:
```bash
sudo yum install mysql-server
sudo systemctl start mysqld
sudo mysql_secure_installation
```

### Windows:
- [MySQL Installer](https://dev.mysql.com/downloads/installer/) indir
- Kurulum sihirbazını takip et

## 2. Veritabanı Oluşturma

MySQL'e bağlan:
```bash
mysql -u root -p
```

Veritabanı ve kullanıcı oluştur:
```sql
CREATE DATABASE zayiflamaplanim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'zayiflama_user'@'localhost' IDENTIFIED BY 'güçlü_şifre_buraya';
GRANT ALL PRIVILEGES ON zayiflamaplanim.* TO 'zayiflama_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 3. .env Dosyası Ayarları

`.env` dosyasını oluştur ve düzenle:
```env
DATABASE_URL="mysql://zayiflama_user:güçlü_şifre_buraya@localhost:3306/zayiflamaplanim"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="openssl rand -base64 32 ile oluştur"
```

## 4. Prisma Migration

```bash
# Prisma client oluştur
npx prisma generate

# Migration dosyaları oluştur ve çalıştır
npx prisma migrate dev --name init

# Seed verisi ekle (opsiyonel)
npx prisma db seed
```

## 5. Uzak Sunucu Bağlantısı

Eğer MySQL uzak sunucudaysa:

### MySQL'de uzak erişim izni ver:
```sql
CREATE USER 'zayiflama_user'@'%' IDENTIFIED BY 'güçlü_şifre_buraya';
GRANT ALL PRIVILEGES ON zayiflamaplanim.* TO 'zayiflama_user'@'%';
FLUSH PRIVILEGES;
```

### MySQL config düzenle:
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

`bind-address` satırını değiştir:
```
bind-address = 0.0.0.0
```

MySQL'i yeniden başlat:
```bash
sudo systemctl restart mysql
```

### Firewall ayarları:
```bash
sudo ufw allow 3306/tcp
```

### .env dosyasında uzak bağlantı:
```env
DATABASE_URL="mysql://zayiflama_user:şifre@SUNUCU_IP:3306/zayiflamaplanim"
```

## 6. Production Ayarları

### SSL Bağlantısı (Önerilen):
```env
DATABASE_URL="mysql://user:pass@host:3306/db?sslaccept=strict"
```

### Connection Pool:
```env
DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=10&pool_timeout=20"
```

## 7. Yedekleme

### Manuel yedek:
```bash
mysqldump -u zayiflama_user -p zayiflamaplanim > backup_$(date +%Y%m%d).sql
```

### Otomatik yedek (crontab):
```bash
crontab -e
```

Ekle:
```
0 2 * * * mysqldump -u zayiflama_user -p'şifre' zayiflamaplanim > /backups/db_$(date +\%Y\%m\%d).sql
```

### Yedekten geri yükleme:
```bash
mysql -u zayiflama_user -p zayiflamaplanim < backup_20241106.sql
```

## 8. Performans Optimizasyonu

### my.cnf ayarları:
```ini
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
query_cache_size = 64M
```

## 9. Sorun Giderme

### Bağlantı hatası:
```bash
# MySQL çalışıyor mu?
sudo systemctl status mysql

# Port dinliyor mu?
sudo netstat -tlnp | grep 3306

# Kullanıcı izinleri kontrol
mysql -u root -p
SELECT user, host FROM mysql.user;
```

### Migration hatası:
```bash
# Prisma cache temizle
npx prisma generate --force

# Migration sıfırla (DİKKAT: Veri kaybı!)
npx prisma migrate reset
```

## 10. Hosting Servisleri

### PlanetScale (Ücretsiz):
- https://planetscale.com
- Serverless MySQL
- Otomatik yedekleme

### Railway:
- https://railway.app
- MySQL container
- Kolay deployment

### DigitalOcean Managed Database:
- https://www.digitalocean.com/products/managed-databases-mysql
- Yönetilen MySQL
- Otomatik yedekleme

### AWS RDS:
- https://aws.amazon.com/rds/mysql/
- Ölçeklenebilir
- Yüksek güvenlik
