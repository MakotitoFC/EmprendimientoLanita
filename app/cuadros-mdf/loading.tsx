import { ProductGridSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
      <div className="h-7 w-36 bg-stone-200 rounded-xl animate-pulse mb-6" />
      <ProductGridSkeleton count={8} />
    </div>
  )
}
