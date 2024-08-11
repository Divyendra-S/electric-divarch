// components/SkeletonCard.tsx
import { Skeleton } from "../ui/skeleton"

export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[160px] w-[220px] rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[220px]" />
      </div>
    </div>
  )
}
