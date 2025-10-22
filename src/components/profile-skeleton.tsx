import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';

export function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Cover & Profile Section */}
      <div className="relative mb-8">
        <Skeleton className="h-48 md:h-64 rounded-2xl" />
        
        <Card className="relative -mt-20 mx-4 md:mx-8 shadow-2xl border-0">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full" />
              
              <div className="flex-1 w-full space-y-4">
                <Skeleton className="h-10 w-64 mx-auto md:mx-0" />
                <Skeleton className="h-5 w-48 mx-auto md:mx-0" />
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <Skeleton className="h-12 w-24 rounded-full" />
                  <Skeleton className="h-12 w-24 rounded-full" />
                  <Skeleton className="h-12 w-24 rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    </div>
  );
}
