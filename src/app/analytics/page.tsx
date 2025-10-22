import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard";

export const metadata: Metadata = {
  title: "İlerleme Takibi - Zayıflama Planım",
  description: "Kilo, ölçüm ve ruh hali takibi ile ilerlemenizi izleyin",
};

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/analytics");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">İlerleme Takibi</h1>
        <p className="mt-2 text-gray-600">
          Kilo, ölçüm ve ruh halinizi takip edin
        </p>
      </div>

      <AnalyticsDashboard userId={session.user.id} />
    </div>
  );
}
