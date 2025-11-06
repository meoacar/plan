# MySQL Sunucu Kurulum Adımları

## 1. Sunucuya Bağlan

```bash
ssh root@31.97.34.163
```

## 2. Kurulum Scriptini Çalıştır

### Manuel Kurulum:

```bash
# MySQL yükle
apt update
apt install -y mysql-server

# MySQL başlat
systemctl start mysql
systemctl enable mysql

# Veritabanı oluştur
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS zayiflamaplanim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'zayiflama_user'@'%' IDENTIFIED BY 'Zayiflama2024!Secure';
GRANT ALL PRIVILEGES ON zayiflamaplanim.* TO 'zayiflama_user'@'%';
FLUSH PRIVILEGES;
EOF

# Uzak erişim için ayarla
sed -i 's/bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf

# MySQL yeniden başlat
systemctl restart mysql

# Firewall aç
ufw allow 3306/tcp

# Kontrol et
systemctl status mysql
```

## 3. Bağlantıyı Test Et (Kendi Bilgisayarınızdan)

```bash
mysql -h 31.97.34.163 -u zayiflama_user -p
# Şifre: Zayiflama2024!Secure
```

## 4. Prisma Migration Çalıştır (Kendi Bilgisayarınızdan)

```bash
cd zayiflamaplanim

# Prisma client oluştur
npx prisma generate

# Migration çalıştır
npx prisma migrate dev --name mysql_init

# Seed verisi ekle (opsiyonel)
npx prisma db seed
```

## 5. Uygulamayı Başlat

```bash
npm run dev
```

## Bağlantı Bilgileri

```
Host: 31.97.34.163
Port: 3306
Database: zayiflamaplanim
User: zayiflama_user
Password: Zayiflama2024!Secure
```

## .env Dosyası

```env
DATABASE_URL="mysql://zayiflama_user:Zayiflama2024!Secure@31.97.34.163:3306/zayiflamaplanim"
```

## Sorun Giderme

### MySQL çalışmıyor:
```bash
systemctl status mysql
systemctl restart mysql
```

### Port kapalı:
```bash
netstat -tlnp | grep 3306
ufw status
ufw allow 3306/tcp
```

### Bağlantı hatası:
```bash
# MySQL loglarını kontrol et
tail -f /var/log/mysql/error.log

# Kullanıcı izinlerini kontrol et
mysql -u root -e "SELECT user, host FROM mysql.user;"
```

### Şifre değiştirme:
```bash
mysql -u root
ALTER USER 'zayiflama_user'@'%' IDENTIFIED BY 'yeni_sifre';
FLUSH PRIVILEGES;
```
