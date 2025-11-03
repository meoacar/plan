import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/profile-customization.css";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import { MaintenanceChecker } from "@/components/maintenance-checker";
import { StreakTracker } from "@/components/gamification/StreakTracker";
import { CrisisButton } from "@/components/crisis-button";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/logo";
import NextTopLoader from 'nextjs-toploader';
import { WebVitalsReporter } from "@/components/web-vitals-reporter";
import { NotificationPermission } from "@/components/notifications/notification-permission";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { RegisterServiceWorker } from "./register-sw";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

// Cache'i devre dışı bırak - ayarlar her zaman güncel olsun
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      orderBy: { updatedAt: "desc" },
    });
    return settings;
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return null;
  }
}

async function getSeoSettings() {
  try {
    const seoSettings = await prisma.seoSettings.findFirst();
    return seoSettings?.settings as any;
  } catch (error) {
    console.error("Error fetching SEO settings:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const title = settings?.siteTitle || "Zayıflama Planım - Gerçek Planlar";
  const description = settings?.siteDescription || "İnsanların gerçek zayıflama rutinlerini keşfet, kendi planını paylaş.";
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return {
    title,
    description,
    keywords: ["zayıflama", "diyet", "egzersiz", "kilo verme", "sağlıklı yaşam"],
    metadataBase: new URL(baseUrl),
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.ico', sizes: 'any' },
      ],
      apple: '/apple-touch-icon.png',
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
      userScalable: true,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "tr_TR",
      url: baseUrl,
      siteName: title,
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ['/opengraph-image'],
    },
  };
}

async function getFooterData() {
  try {
    const [pages, settings] = await Promise.all([
      prisma.page.findMany({
        where: {
          isPublished: true,
          showInFooter: true,
        },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
        },
      }),
      prisma.siteSettings.findFirst({
        orderBy: { updatedAt: "desc" },
        include: {
          footerLinks: {
            orderBy: { order: "asc" },
          },
        },
      }),
    ]);
    return { pages, footerLinks: settings?.footerLinks || [] };
  } catch (error) {
    console.error("Error fetching footer data:", error);
    return { pages: [], footerLinks: [] };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const seoSettings = await getSeoSettings();
  const { pages: footerPages, footerLinks } = await getFooterData();
  const session = await auth();
  
  // Okunmamış bildirim sayısını al
  let unreadCount = 0;
  if (session?.user?.id) {
    try {
      unreadCount = await prisma.notification.count({
        where: {
          userId: session.user.id,
          read: false,
        },
      });
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    }
  }

  return (
    <html lang="tr">
      <head>
        {/* DNS Prefetch & Preconnect for Performance */}
        <link rel="dns-prefetch" href="https://utfs.io" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link rel="preconnect" href="https://utfs.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
        
        {/* App Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#9333ea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Google Search Console Verification */}
        {settings?.googleSearchConsoleCode && (
          <meta name="google-site-verification" content={settings.googleSearchConsoleCode} />
        )}
        
        {/* Google Analytics */}
        {settings?.googleAnalyticsId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${settings.googleAnalyticsId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className}>
        <NextTopLoader
          color="#9333ea"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #9333ea,0 0 5px #9333ea"
        />
        <Providers>
          <RegisterServiceWorker />
          <WebVitalsReporter />
          <MaintenanceChecker />
          <StreakTracker />
          <CrisisButton />
          <NotificationPermission />
          <PWAInstallPrompt />
          <Navbar />
          <main className="min-h-screen bg-[#f8f8f8] pb-0 md:pb-0">
            <div className="max-w-7xl mx-auto px-4">
              {children}
            </div>
          </main>
          <MobileBottomNav 
            isAuthenticated={!!session?.user} 
            unreadCount={unreadCount}
          />
          <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {/* Brand Section */}
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                      <Logo size={36} />
                      <h3 className="text-xl font-bold text-white">
                        {settings?.footerAboutTitle || settings?.siteTitle || "Zayıflama Planım"}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {settings?.footerAboutText || "Gerçek insanların gerçek başarı hikayeleri. Sağlıklı yaşam için ilham alın."}
                    </p>
                  </div>

                  {/* Quick Links */}
                  <div className="text-center">
                    <h4 className="text-white font-semibold mb-4">
                      {settings?.footerLinksTitle || "Hızlı Bağlantılar"}
                    </h4>
                    <div className="flex flex-col gap-2">
                      {/* Newsletter Link */}
                      <a
                        href="/form/newsletter-form"
                        className="text-gray-400 hover:text-[#4caf50] transition-colors text-sm font-medium"
                      >
                        📧 E-Bülten Kayıt
                      </a>

                      {/* Custom Footer Links */}
                      {footerLinks.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target={link.openInNewTab ? "_blank" : undefined}
                          rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                          className="text-gray-400 hover:text-[#4caf50] transition-colors text-sm"
                        >
                          {link.title}
                        </a>
                      ))}

                      {/* Dynamic Pages */}
                      {footerPages.map((page) => (
                        <a
                          key={page.id}
                          href={`/pages/${page.slug}`}
                          className="text-gray-400 hover:text-[#4caf50] transition-colors text-sm"
                        >
                          {page.title}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="text-center md:text-right">
                    <h4 className="text-white font-semibold mb-4">
                      {settings?.footerSocialTitle || "Bizi Takip Edin"}
                    </h4>
                    {(settings?.twitterUrl || settings?.instagramUrl || settings?.facebookUrl) ? (
                      <div className="flex justify-center md:justify-end gap-4">
                        {settings.twitterUrl && (
                          <a
                            href={settings.twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#1DA1F2] flex items-center justify-center transition-all duration-300 hover:scale-110"
                            aria-label="Twitter"
                          >
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                            </svg>
                          </a>
                        )}
                        {settings.instagramUrl && (
                          <a
                            href={settings.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                            aria-label="Instagram"
                          >
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                          </a>
                        )}
                        {settings.facebookUrl && (
                          <a
                            href={settings.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#1877F2] flex items-center justify-center transition-all duration-300 hover:scale-110"
                            aria-label="Facebook"
                          >
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">Sosyal medyada bizi bulun</p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 pt-8">
                  <div className="text-center">
                    {settings?.footerText ? (
                      <p className="text-gray-400 text-sm mb-2 whitespace-pre-line">
                        {settings.footerText}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm mb-2">
                        &copy; {new Date().getFullYear()} {settings?.siteTitle || "Zayıflama Planım"}. Tüm hakları saklıdır.
                      </p>
                    )}
                    <p className="text-gray-500 text-xs">
                      Sağlıklı yaşam için buradayız 💚
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
