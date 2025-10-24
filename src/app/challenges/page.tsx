import { Suspense } from "react";
import ChallengeList from "@/components/challenges/challenge-list";

export const metadata = {
  title: "Challenge'lar - Zayıflama Planım",
  description: "Haftalık ve aylık challenge'lara katılın",
};

export default function ChallengesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🏆 Challenge'lar</h1>
        <p className="text-gray-600">
          Haftalık ve aylık challenge'lara katılın, yarışın ve kazanın!
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-8">Yükleniyor...</div>}>
        <ChallengeList />
      </Suspense>
    </div>
  );
}
