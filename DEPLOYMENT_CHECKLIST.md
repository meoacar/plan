# Production Deployment Checklist

Bu checklist, Zayıflama Planım uygulamasını production'a deploy etmeden önce kontrol edilmesi gereken tüm adımları içerir.

## Pre-Deployment

### 1. Environment Variables

- [ ] `DATABASE_URL` - Production PostgreSQL URL'i ayarlandı
- [ ] `NEXTAUTH_URL` - Production domain ayarlandı (https://yourdomain.com)
- [ ] `NEXTAUTH_SECRET` - Güçlü random secret oluşturuldu
- [ ] `CRON_SECRET` - Güçlü random secret oluşturuldu
- [ ] `RESEND_API_KEY` - Email servisi API key'i ayarlandı (opsiyonel)
- [ ] `EMAIL_FROM` - Email gönderen adresi ayarlandı (opsiyonel)
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth ID ayarlandı (opsiyonel)
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth secret ayarlandı (opsiyonel)
- [ ] `UPLOADTHING_TOKEN` - Görsel yükleme token'ı ayarlandı (opsiyonel)
- [ ] `BACKUP_STORAGE_URL` - Yedekleme storage URL'i ayarlandı (opsiyonel)

### 2. Database

- [ ] Production database oluşturuldu (Neon/Vercel Postgres)
- [ ] Database connection SSL ile yapılandırıldı
- [ ] Migration'lar test edildi
- [ ] Backup stratejisi belirlendi
- [ ] Database user permissions kontrol edildi

### 3. Code Quality

- [ ] TypeScript hataları yok (`npm run build`)
- [ ] ESLint uyarıları kontrol edildi (`npm run lint`)
- [ ] Tüm testler geçiyor (varsa)
- [ ] Console.log'lar temizlendi (production'da)
- [ ] TODO/FIXME yorumları kontrol edildi

### 4. Security

- [ ] `.env` dosyası `.gitignore`'da
- [ ] Hassas bilgiler kod içinde yok
- [ ] Admin route'ları korunuyor
- [ ] CRON_SECRET kontrolü aktif
- [ ] Rate limiting yapılandırıldı (opsiyonel)
- [ ] Security headers eklendi
- [ ] CORS ayarları kontrol edildi
- [ ] Input validation tüm endpoint'lerde var

### 5. Performance

- [ ] Image optimization aktif
- [ ] Cache stratejileri uygulandı
- [ ] Database query'leri optimize edildi
- [ ] Bundle size kontrol edildi
- [ ] Lazy loading uygulandı
- [ ] Code splitting yapıldı

### 6. SEO & Analytics

- [ ] Meta tags eklendi
- [ ] OpenGraph tags eklendi
- [ ] Sitemap oluşturuldu
- [ ] robots.txt yapılandırıldı
- [ ] Google Analytics eklendi (opsiyonel)
- [ ] Vercel Analytics aktif

## Deployment

### 1. Vercel Setup

- [ ] Vercel hesabı oluşturuldu
- [ ] GitHub repo bağlandı
- [ ] Environment variables eklendi
- [ ] Build settings kontrol edildi
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`

### 2. Database Migration

```bash
# Production database'e bağlan
echo "DATABASE_URL=your-production-url" > .env

# Migration'ları deploy et
npx prisma migrate deploy

# Prisma Client oluştur
npx prisma generate
```

- [ ] Migration'lar başarıyla uygulandı
- [ ] Database schema doğru

### 3. Seed Data (İlk Kurulum)

```bash
# Seed script'ini çalıştır
npm run db:seed
```

- [ ] Seed data eklendi
- [ ] Admin kullanıcı oluşturuldu
- [ ] Örnek kategoriler eklendi
- [ ] Site ayarları oluşturuldu

**ÖNEMLİ:** Admin şifresini hemen değiştir!

### 4. Cron Jobs

- [ ] `vercel.json` dosyası commit edildi
- [ ] Vercel Dashboard'dan cron jobs aktif
- [ ] Email queue cron (*/5 * * * *) çalışıyor
- [ ] Auto-backup cron (0 2 * * *) çalışıyor
- [ ] Cron endpoint'leri test edildi

### 5. Domain & DNS

- [ ] Domain satın alındı
- [ ] DNS kayıtları Vercel'e yönlendirildi
- [ ] SSL sertifikası aktif (Vercel otomatik)
- [ ] www redirect ayarlandı (opsiyonel)

### 6. Email Service

- [ ] Resend hesabı oluşturuldu
- [ ] API key alındı
- [ ] Domain doğrulaması yapıldı
- [ ] SPF/DKIM kayıtları eklendi
- [ ] Test email gönderildi

### 7. OAuth Setup (Opsiyonel)

- [ ] Google Cloud Console'da proje oluşturuldu
- [ ] OAuth consent screen yapılandırıldı
- [ ] Credentials oluşturuldu
- [ ] Authorized redirect URIs eklendi
  - `https://yourdomain.com/api/auth/callback/google`
- [ ] Test edildi

## Post-Deployment

### 1. Functional Testing

- [ ] Ana sayfa yükleniyor
- [ ] Kullanıcı kaydı çalışıyor
- [ ] Giriş yapma çalışıyor
- [ ] Google OAuth çalışıyor (varsa)
- [ ] Plan ekleme çalışıyor
- [ ] Yorum ekleme çalışıyor
- [ ] Beğeni sistemi çalışıyor
- [ ] Arama çalışıyor
- [ ] Filtreleme çalışıyor
- [ ] Pagination çalışıyor

### 2. Admin Panel Testing

- [ ] Admin paneline erişim çalışıyor
- [ ] Dashboard yükleniyor
- [ ] Plan onayı çalışıyor
- [ ] Kullanıcı yönetimi çalışıyor
- [ ] Yorum yönetimi çalışıyor
- [ ] Analitik sayfası yükleniyor
- [ ] Kategori yönetimi çalışıyor
- [ ] Email gönderimi çalışıyor
- [ ] Activity log çalışıyor
- [ ] Backup oluşturma çalışıyor
- [ ] Cache temizleme çalışıyor

### 3. Performance Testing

- [ ] Lighthouse score kontrol edildi
  - Performance: > 90
  - Accessibility: > 90
  - Best Practices: > 90
  - SEO: > 90
- [ ] Page load time < 3s
- [ ] API response time < 500ms
- [ ] Database query time < 100ms
- [ ] Image loading optimize

### 4. Security Testing

- [ ] Admin route'ları korunuyor
- [ ] Unauthorized access engelleniyor
- [ ] CSRF koruması aktif
- [ ] XSS koruması aktif
- [ ] SQL injection koruması aktif
- [ ] Rate limiting çalışıyor (varsa)
- [ ] Security headers aktif
- [ ] HTTPS zorunlu

### 5. Monitoring Setup

- [ ] Vercel Analytics aktif
- [ ] Error tracking aktif
- [ ] Performance monitoring aktif
- [ ] Database monitoring aktif
- [ ] Uptime monitoring ayarlandı (opsiyonel)
- [ ] Alert'ler yapılandırıldı

### 6. Backup & Recovery

- [ ] İlk manuel backup alındı
- [ ] Backup indirme test edildi
- [ ] Otomatik backup ayarlandı
- [ ] Backup restore test edildi
- [ ] Disaster recovery planı hazırlandı

### 7. Documentation

- [ ] README güncellendi
- [ ] API documentation hazırlandı (varsa)
- [ ] Admin kullanım kılavuzu hazırlandı
- [ ] Deployment guide güncellendi
- [ ] Troubleshooting guide hazırlandı

## Post-Launch

### İlk 24 Saat

- [ ] Error logs kontrol edildi
- [ ] Performance metrics kontrol edildi
- [ ] User feedback toplandı
- [ ] Critical bug'lar düzeltildi
- [ ] Backup alındı

### İlk Hafta

- [ ] Activity log incelendi
- [ ] Analytics verileri incelendi
- [ ] Performance optimization yapıldı
- [ ] User feedback'e göre iyileştirmeler yapıldı
- [ ] Security audit yapıldı

### İlk Ay

- [ ] Full security audit
- [ ] Performance optimization
- [ ] Feature requests değerlendirildi
- [ ] Database optimization
- [ ] Cost optimization

## Maintenance

### Günlük

- [ ] Error logs kontrol et
- [ ] Activity log kontrol et
- [ ] Performance metrics kontrol et

### Haftalık

- [ ] Backup'ları kontrol et
- [ ] Security alerts kontrol et
- [ ] User feedback oku
- [ ] Analytics raporları incele

### Aylık

- [ ] Dependency updates (`npm audit`)
- [ ] Security patches uygula
- [ ] Database optimization
- [ ] Performance review
- [ ] Cost review

### Yıllık

- [ ] Full security audit
- [ ] Penetration testing
- [ ] Disaster recovery drill
- [ ] Architecture review
- [ ] Scalability planning

## Rollback Plan

Bir sorun olursa:

1. **Immediate Actions**
   ```bash
   # Vercel'de önceki deployment'a dön
   vercel rollback
   ```

2. **Database Rollback** (dikkatli!)
   ```bash
   # Migration'ı geri al
   npx prisma migrate resolve --rolled-back <migration-name>
   ```

3. **Maintenance Mode**
   - Admin panel'den bakım modunu aktif et
   - Kullanıcıları bilgilendir

4. **Investigation**
   - Error logs'u incele
   - Activity log'u incele
   - Database'i kontrol et

5. **Fix & Redeploy**
   - Sorunu düzelt
   - Test et
   - Tekrar deploy et

## Emergency Contacts

- **Developer:** [email]
- **DevOps:** [email]
- **Database Admin:** [email]
- **Security Team:** [email]

## Support Resources

- **Vercel Support:** https://vercel.com/support
- **Neon Support:** https://neon.tech/docs
- **Resend Support:** https://resend.com/docs
- **Next.js Docs:** https://nextjs.org/docs

## Notes

- Bu checklist her deployment öncesi gözden geçirilmelidir
- Tüm adımlar tamamlanmadan production'a deploy edilmemelidir
- Sorun yaşanırsa hemen rollback yapılmalıdır
- Backup'lar düzenli olarak test edilmelidir

---

**Son Güncelleme:** [Tarih]
**Deployment Tarihi:** [Tarih]
**Deployed By:** [İsim]
**Version:** [Version]
