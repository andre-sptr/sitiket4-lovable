import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TicketCardSkeletonProps {
  count?: number;
}

export const TicketCardSkeleton = ({ count = 1 }: TicketCardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted" />

          <CardContent className="p-4 pl-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32 col-span-2" />
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};
