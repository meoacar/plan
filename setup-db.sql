CREATE DATABASE IF NOT EXISTS zayiflamaplanim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'zayiflama_user'@'%' IDENTIFIED BY 'Zayiflama2024!Secure';
GRANT ALL PRIVILEGES ON zayiflamaplanim.* TO 'zayiflama_user'@'%';
FLUSH PRIVILEGES;
