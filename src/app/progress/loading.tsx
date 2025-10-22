import { SkeletonGallery } from '@/components/ui/skeleton';

export default function ProgressLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
      
      <SkeletonGallery items={6} />
    </div>
  );
}
