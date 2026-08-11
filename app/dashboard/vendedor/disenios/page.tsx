import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import type { DisenioEjemplo } from '@/lib/types'
import { Plus, Pencil } from 'lucide-react'
import DeleteDisenioButton from './DeleteDisenioButton'

export default async function DiseniosPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('disenos_ejemplo')
    .select('*, producto:productos(nombre)')
    .order('created_at', { ascending: false })

  const disenios = (data as (DisenioEjemplo & { producto: { nombre: string } | null })[]) ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-semibold text-stone-800">Diseños de ejemplo</h1>
        <Link
          href="/dashboard/vendedor/disenios/nuevo"
          className="bg-stone-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Nuevo diseño
        </Link>
      </div>

      {disenios.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p>No hay diseños de ejemplo todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {disenios.map(d => (
            <div key={d.id} className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
              <div className="relative aspect-square bg-stone-50">
                {d.imagenes[0] && (
                  <Image src={d.imagenes[0]} alt={d.nombre_diseno} fill className="object-cover" sizes="200px" />
                )}
                {!d.is_active && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold bg-black/60 px-2 py-1 rounded-full">Inactivo</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-stone-800 mb-0.5">{d.nombre_diseno}</p>
                <p className="text-xs text-stone-400 mb-2">
                  {d.tipo === 'cemento' ? 'Cemento' : 'MDF'}
                  {d.producto && ` · ${d.producto.nombre}`}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/vendedor/disenios/editar/${d.id}`}
                    className="flex-1 text-xs bg-stone-100 text-stone-700 py-1.5 rounded-lg hover:bg-stone-200 transition-colors font-medium flex items-center justify-center gap-1"
                  >
                    <Pencil size={12} /> Editar
                  </Link>
                  <DeleteDisenioButton id={d.id} nombre={d.nombre_diseno} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
