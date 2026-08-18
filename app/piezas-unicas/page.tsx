import { createClient } from '@/lib/supabase/server'
import type { Producto } from '@/lib/types'
import PiedrasCatalogo from './PiedrasCatalogo'

export const revalidate = 60

export default async function PiedrasPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('productos')
    .select('*')
    .eq('tipo', 'piedra')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const productos = (data as Producto[]) ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-semibold text-stone-800 mb-1">Piedras</h1>
        <p className="text-stone-500 text-sm">Cada piedra es irrepetible. Cuando se va, ya no vuelve.</p>
      </div>
      <PiedrasCatalogo productos={productos} />
    </div>
  )
}
