import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Promocion } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil } from 'lucide-react'
import DeletePromocionButton from './DeletePromocionButton'

export default async function PromocionesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('promociones')
    .select('*')
    .order('created_at', { ascending: false })

  const promociones = (data as Promocion[]) ?? []
  const now = new Date()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-semibold text-stone-800">Promociones</h1>
        <Link
          href="/dashboard/vendedor/promociones/nueva"
          className="bg-stone-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Nueva promoción
        </Link>
      </div>

      {promociones.length === 0 ? (
        <div className="text-center py-20 text-stone-400">No hay promociones todavía.</div>
      ) : (
        <div className="space-y-3">
          {promociones.map(p => {
            const vigente = p.is_active && new Date(p.fecha_inicio) <= now && new Date(p.fecha_fin) >= now
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-stone-100 p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-stone-800">{p.nombre}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      vigente ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {vigente ? 'Vigente' : 'Inactiva'}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500">
                    {p.tipo_descuento === 'porcentaje' ? `${p.valor_descuento}% de descuento` : `${formatPrice(p.valor_descuento)} de descuento`}
                    {' · '}
                    {new Date(p.fecha_inicio).toLocaleDateString('es-AR')} – {new Date(p.fecha_fin).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/dashboard/vendedor/promociones/editar/${p.id}`}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
                  >
                    <Pencil size={15} />
                  </Link>
                  <DeletePromocionButton id={p.id} nombre={p.nombre} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
