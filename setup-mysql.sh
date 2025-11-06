#!/bin/bash

# MySQL Kurulum Script
# Sunucu: 31.97.34.163
# Kullanıcı: root

echo "=== MySQL Kurulum Başlıyor ==="

# MySQL kurulumu
echo "MySQL yükleniyor..."
apt update
apt install -y mysql-server

# MySQL servisini başlat
echo "MySQL servisi başlatılıyor..."
systemctl start mysql
systemctl enable mysql

# Veritabanı ve kullanıcı oluştur
echo "Veritabanı oluşturuluyor..."
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS zayiflamaplanim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'zayiflama_user'@'%' IDENTIFIED BY 'Zayiflama2024!Secure';
GRANT ALL PRIVILEGES ON zayiflamaplanim.* TO 'zayiflama_user'@'%';
FLUSH PRIVILEGES;
EOF

# MySQL uzak erişim ayarları
echo "Uzak erişim ayarları yapılıyor..."
sed -i 's/bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf

# MySQL'i yeniden başlat
echo "MySQL yeniden başlatılıyor..."
systemctl restart mysql

# Firewall ayarları
echo "Firewall ayarları yapılıyor..."
ufw allow 3306/tcp

echo "=== MySQL Kurulum Tamamlandı ==="
echo ""
echo "Bağlantı Bilgileri:"
echo "Host: 31.97.34.163"
echo "Port: 3306"
echo "Database: zayiflamaplanim"
echo "User: zayiflama_user"
echo "Password: Zayiflama2024!Secure"
echo ""
echo "DATABASE_URL=\"mysql://zayiflama_user:Zayiflama2024!Secure@31.97.34.163:3306/zayiflamaplanim\""
