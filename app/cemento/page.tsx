import { createClient } from '@/lib/supabase/server'
import type { Producto } from '@/lib/types'
import CementoCatalogo from './CementoCatalogo'

export const revalidate = 300

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
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-semibold text-stone-800 mb-1">Cemento</h1>
        <p className="text-stone-500 text-sm">La misma forma, el color que elijas. Cada pieza a tu medida.</p>
      </div>
      <CementoCatalogo productos={productos} />
    </div>
  )
}
