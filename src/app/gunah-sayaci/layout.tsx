import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Yemek Günah Sayacı | Zayıflama Planım",
  description: "Kaçamak yemeklerini takip et, farkındalık yarat, oyunlaştırılmış beslenme takibi",
};

export default async function GunahSayaciLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/gunah-sayaci");
  }

  return <>{children}</>;
}
