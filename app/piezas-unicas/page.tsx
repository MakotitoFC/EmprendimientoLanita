import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/products/ProductCard'
import type { Producto } from '@/lib/types'

export const revalidate = 60

export default async function PiezasUnicasPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('productos')
    .select('*')
    .eq('tipo', 'piedra')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const productos = (data as Producto[]) ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-serif font-semibold text-stone-800 mb-2">Piezas únicas</h1>
        <p className="text-stone-500">
          Cada piedra es irrepetible. Cuando se va, ya no vuelve.
        </p>
      </div>

      {productos.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg">No hay piezas disponibles por el momento.</p>
          <p className="text-sm mt-2">Volvé pronto, siempre hay novedades.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productos.map(p => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  )
}
