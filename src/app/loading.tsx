import { SkeletonPlanCard } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Skeleton */}
      <div className="mb-12 animate-pulse">
        <div className="h-12 bg-gray-200 rounded-lg w-3/4 mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 rounded-lg w-1/2 mx-auto"></div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-4 mb-12">
        <div className="h-16 bg-gray-200 rounded-2xl w-48"></div>
        <div className="h-16 bg-gray-200 rounded-2xl w-48"></div>
      </div>

      {/* Plans Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonPlanCard key={i} />
        ))}
      </div>
    </div>
  );
}
