import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function FacilitatorCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-card">
      {/* Profile image skeleton */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Name and verified badge */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        
        {/* Rating and views */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        
        {/* Price and location */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        {/* Button */}
        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </Card>
  );
}

export function FacilitatorCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <FacilitatorCardSkeleton key={i} />
      ))}
    </>
  );
}
