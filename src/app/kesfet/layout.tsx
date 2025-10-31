import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keşfet - Hayalindeki Vücuda Birlikte Ulaş | Zayıflama Planım",
  description: "Gerçek insanlardan gerçek planlar! 10,000+ aktif kullanıcı, 50,000+ paylaşılan plan, 1M+ destek mesajı. Kendine özel kilo planını oluştur, paylaş ve binlerce kişiyle birlikte ilham al. XP kazan, rozet topla, seviye atla! 🚀",
  keywords: "zayıflama planı, kilo verme, diyet programı, sağlıklı yaşam, fitness topluluğu, motivasyon, başarı hikayeleri, gamification, rozet sistemi",
  openGraph: {
    title: "Keşfet - Hayalindeki Vücuda Birlikte Ulaş",
    description: "Gerçek insanlardan gerçek planlar. 10,000+ aktif kullanıcı, 1M+ destek mesajı. Hemen katıl!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Keşfet - Hayalindeki Vücuda Birlikte Ulaş",
    description: "Gerçek insanlardan gerçek planlar. 10,000+ aktif kullanıcı, 1M+ destek mesajı.",
  },
};

export default function KesfetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
