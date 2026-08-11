import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/products/ProductCard'
import type { Producto } from '@/lib/types'

export const revalidate = 60

export default async function CementoPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('productos')
    .select('*')
    .eq('tipo', 'cemento')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const productos = (data as Producto[]) ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
      <div className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-stone-800 mb-1">Objetos de cemento</h1>
        <p className="text-stone-500 text-sm md:text-base">
          La misma forma, el color que vos elijas. Cada pieza a tu medida.
        </p>
      </div>

      {productos.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p>No hay productos de cemento disponibles por el momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {productos.map(p => <ProductCard key={p.id} producto={p} />)}
        </div>
      )}
    </div>
  )
}
