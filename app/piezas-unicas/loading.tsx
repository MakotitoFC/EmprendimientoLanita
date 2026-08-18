import { ProductGridSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-32 bg-stone-200 rounded-xl animate-pulse" />
        <div className="h-4 w-64 bg-stone-200 rounded-xl animate-pulse" />
      </div>
      <div className="flex gap-2 mb-6">
        {[1,2,3].map(i => <div key={i} className="h-8 w-24 bg-stone-200 rounded-full animate-pulse" />)}
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  )
}
