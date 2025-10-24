-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "footerAboutText" TEXT DEFAULT 'Gerçek insanların gerçek başarı hikayeleri. Sağlıklı yaşam için ilham alın.',
ADD COLUMN     "footerAboutTitle" TEXT DEFAULT 'Hakkımızda',
ADD COLUMN     "footerLinksTitle" TEXT DEFAULT 'Hızlı Bağlantılar',
ADD COLUMN     "footerSocialTitle" TEXT DEFAULT 'Bizi Takip Edin';
