import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keşfet - Zayıflama Planım",
  description: "Zayıflama Planım'da neler yapabileceğini keşfet. Gerçek planlar, günah duvarı, tarif alanı ve daha fazlası!",
};

export default function KesfetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
