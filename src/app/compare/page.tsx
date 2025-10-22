import { PlanCompare } from '@/components/plan-compare';

export const metadata = {
  title: 'Plan Karşılaştır',
  description: 'Planları yan yana karşılaştırın',
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const params = await searchParams;
  const ids = params.ids?.split(',') || [];

  if (ids.length < 2 || ids.length > 3) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border-2 border-dashed p-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">Plan Karşılaştır</h1>
          <p className="text-gray-600">
            Karşılaştırmak için 2-3 plan seçmelisiniz.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            URL formatı: /compare?ids=plan1,plan2,plan3
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Plan Karşılaştırma</h1>
      <PlanCompare planIds={ids} />
    </div>
  );
}
