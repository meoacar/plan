import { Logo } from "@/components/logo";
import Link from "next/link";

interface FooterLink {
  id: string;
  title: string;
  url: string;
  openInNewTab: boolean;
}

interface FooterPage {
  id: string;
  title: string;
  slug: string;
}

interface FooterProps {
  settings?: {
    siteTitle?: string;
    footerAboutTitle?: string;
    footerAboutText?: string;
    footerLinksTitle?: string;
    footerSocialTitle?: string;
    footerText?: string;
    twitterUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    youtubeUrl?: string;
    linkedinUrl?: string;
  } | null;
  footerLinks?: FooterLink[];
  footerPages?: FooterPage[];
}

export function Footer({ settings, footerLinks = [], footerPages = [] }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const siteName = settings?.siteTitle || "Zayıflama Planım";

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            
            {/* Brand & About Section */}
            <div className="lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
                <Logo size={40} />
                <span className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                  {settings?.footerAboutTitle || siteName}
                </span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {settings?.footerAboutText || "Gerçek insanların gerçek başarı hikayeleri. Sağlıklı yaşam için ilham alın."}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Güvenilir Platform</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {settings?.footerLinksTitle || "Hızlı Bağlantılar"}
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/form/newsletter-form"
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="text-purple-500 group-hover:scale-110 transition-transform">📧</span>
                    E-Bülten Kayıt
                  </Link>
                </li>
                <li>
                  <Link
                    href="/submit"
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="text-green-500 group-hover:scale-110 transition-transform">📋</span>
                    Planlar
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="text-blue-500 group-hover:scale-110 transition-transform">📝</span>
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/groups"
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="text-orange-500 group-hover:scale-110 transition-transform">👥</span>
                    Gruplar
                  </Link>
                </li>
                
                {/* Custom Footer Links */}
                {footerLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target={link.openInNewTab ? "_blank" : undefined}
                      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                      className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pages & Resources */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Sayfalar
              </h4>
              <ul className="space-y-2.5">
                {footerPages.length > 0 ? (
                  footerPages.map((page) => (
                    <li key={page.id}>
                      <Link
                        href={`/pages/${page.slug}`}
                        className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                      >
                        {page.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li>
                      <Link href="/pages/hakkimizda" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                        Hakkımızda
                      </Link>
                    </li>
                    <li>
                      <Link href="/pages/iletisim" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                        İletişim
                      </Link>
                    </li>
                    <li>
                      <Link href="/pages/gizlilik-politikasi" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                        Gizlilik Politikası
                      </Link>
                    </li>
                    <li>
                      <Link href="/pages/kullanim-kosullari" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                        Kullanım Koşulları
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Social & Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {settings?.footerSocialTitle || "Bizi Takip Edin"}
              </h4>
              
              {/* Social Media Icons */}
              <div className="flex flex-wrap gap-3 mb-6">
                {settings?.twitterUrl && (
                  <a
                    href={settings.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-[#1DA1F2] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50"
                    aria-label="Twitter"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  </a>
                )}
                {settings?.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/50"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {settings?.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-[#1877F2] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-600/50"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {settings?.youtubeUrl && (
                  <a
                    href={settings.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-[#FF0000] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/50"
                    aria-label="YouTube"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {settings?.linkedinUrl && (
                  <a
                    href={settings.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-[#0A66C2] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-700/50"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
              </div>

              {/* Newsletter CTA */}
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/20">
                <p className="text-white text-sm font-medium mb-2">💌 Haftalık İpuçları</p>
                <p className="text-gray-400 text-xs mb-3">Sağlıklı yaşam için öneriler</p>
                <Link
                  href="/form/newsletter-form"
                  className="inline-block w-full text-center bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Abone Ol
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                {settings?.footerText ? (
                  <p className="text-gray-400 text-sm whitespace-pre-line">
                    {settings.footerText}
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm">
                    &copy; {currentYear} {siteName}. Tüm hakları saklıdır.
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-6 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="text-green-500">💚</span>
                  Sağlıklı yaşam
                </span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1">
                  <span className="text-purple-500">🚀</span>
                  Sürekli gelişim
                </span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1">
                  <span className="text-blue-500">🤝</span>
                  Topluluk desteği
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
