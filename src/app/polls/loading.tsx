import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';

export default function PollsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-96 mb-6" />
        <Skeleton className="h-12 w-48 rounded-lg" />
      </div>

      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
