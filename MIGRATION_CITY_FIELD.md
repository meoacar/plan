# Database Migration: City Field

## Değişiklik

User modeline `city` alanı eklendi. Bu alan, Türkiye Kilo Haritası özelliği için kullanılacak.

## Schema Değişikliği

```prisma
model User {
  // ... diğer alanlar
  city             String?           // Şehir bilgisi (analytics için)
  // ... diğer alanlar
}
```

## Migration Komutu

```bash
npx prisma migrate dev --name add_city_to_user
```

## Veya Manuel SQL

PostgreSQL için:

```sql
ALTER TABLE "User" ADD COLUMN "city" TEXT;
```

## Kullanım

Kullanıcılar profil sayfasından şehir bilgilerini güncelleyebilir. Bu bilgi:
- Türkiye Kilo Haritası'nda kullanılır
- İstatistiksel analizlerde kullanılır
- Opsiyoneldir (NULL olabilir)

## Test

Migration sonrası test:

```bash
# Prisma Studio ile kontrol
npx prisma studio

# Veya SQL ile
SELECT id, name, city FROM "User" LIMIT 5;
```

## Rollback

Eğer geri almak isterseniz:

```sql
ALTER TABLE "User" DROP COLUMN "city";
```

## Notlar

- Bu alan opsiyoneldir (nullable)
- Mevcut kullanıcılar için NULL olacak
- Yeni kullanıcılar kayıt sırasında veya profil güncellemede ekleyebilir
- Analytics sayfası, veri yoksa mock data gösterir
