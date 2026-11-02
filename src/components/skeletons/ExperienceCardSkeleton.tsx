import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ExperienceCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-card">
      {/* Image skeleton with badge placeholder */}
      <div className="aspect-video w-full overflow-hidden relative">
        <Skeleton className="w-full h-full" />
        <Skeleton className="absolute top-3 right-3 h-5 w-16 rounded-full" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-4/5" />
        
        {/* Description lines */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        
        {/* Host info */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2 w-16" />
          </div>
        </div>
        
        {/* Date and price row */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-12" />
        </div>
        
        {/* Button */}
        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </Card>
  );
}

export function ExperienceCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ExperienceCardSkeleton key={i} />
      ))}
    </>
  );
}
