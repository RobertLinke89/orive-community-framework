import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SessionCardSkeleton() {
  return (
    <Card className="overflow-hidden border-gray-100 dark:border-[#1a3a5c] bg-white dark:bg-[#0f2137] rounded-md">
      {/* Image skeleton */}
      <div className="aspect-video w-full overflow-hidden relative">
        <Skeleton className="w-full h-full" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        
        {/* Facilitator info */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        {/* Tags */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        
        {/* Rating and price */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        {/* Button */}
        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </Card>
  );
}

export function SessionCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SessionCardSkeleton key={i} />
      ))}
    </>
  );
}
