import * as React from "react"
import { cn } from "@/lib/utils"

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]",
      "animate-shimmer",
      className
    )}
    {...props}
  />
))
Skeleton.displayName = "Skeleton"

// Hazır skeleton bileşenleri
const SkeletonCard = () => (
  <div className="rounded-lg border bg-white p-6 shadow-sm">
    <Skeleton className="mb-4 h-6 w-3/4" />
    <Skeleton className="mb-2 h-4 w-full" />
    <Skeleton className="mb-2 h-4 w-5/6" />
    <Skeleton className="h-4 w-4/6" />
  </div>
)

const SkeletonPlanCard = () => (
  <div className="rounded-lg border bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-start justify-between">
      <div className="flex-1">
        <Skeleton className="mb-2 h-7 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
    <Skeleton className="mb-3 h-4 w-full" />
    <Skeleton className="mb-3 h-4 w-5/6" />
    <div className="mb-4 flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
    <div className="flex items-center justify-between border-t pt-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
)

const SkeletonProfile = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-6">
      <Skeleton className="h-24 w-24 rounded-full" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-3">
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </div>
  </div>
)

const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    <Skeleton className="h-12 w-full rounded-lg" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-16 w-full rounded-lg" />
    ))}
  </div>
)

const SkeletonGallery = ({ items = 6 }: { items?: number }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: items }).map((_, i) => (
      <Skeleton key={i} className="aspect-square w-full rounded-lg" />
    ))}
  </div>
)

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonPlanCard, 
  SkeletonProfile, 
  SkeletonTable,
  SkeletonGallery 
}
