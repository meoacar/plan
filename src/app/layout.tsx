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
import { Footer } from "@/components/footer";
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
  const baseUrl = process.env.NEXTAUTH_URL || "https://zayiflamaplanim.com";

  // Cache bypass için timestamp ekle
  const timestamp = Date.now();

  return {
    title,
    description,
    keywords: ["zayıflama", "diyet", "egzersiz", "kilo verme", "sağlıklı yaşam"],
    metadataBase: new URL(baseUrl),
    icons: {
      icon: [
        { url: `/favicon.ico?v=${timestamp}`, sizes: 'any' },
        { url: `/icon.ico?v=${timestamp}`, sizes: 'any' },
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
          FooterLink: {
            orderBy: { order: "asc" },
          },
        },
      }),
    ]);
    return { pages, footerLinks: settings?.FooterLink || [] };
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
          isRead: false,
        },
      });
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    }
  }

  return (
    <html lang="tr">
      <head>
        {/* Favicon - Cache bypass için timestamp */}
        <link rel="icon" type="image/x-icon" href={`/favicon.ico?v=${Date.now()}`} />
        <link rel="shortcut icon" type="image/x-icon" href={`/favicon.ico?v=${Date.now()}`} />
        
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
        <meta name="mobile-web-app-capable" content="yes" />
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
          <Footer 
            settings={settings}
            footerLinks={footerLinks}
            footerPages={footerPages}
          />
        </Providers>
      </body>
    </html>
  );
}
