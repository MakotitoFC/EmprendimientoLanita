import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import type { DisenioEjemplo } from '@/lib/types'
import { ArrowRight } from 'lucide-react'

export const revalidate = 60

export default async function CuadrosMdfPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('disenos_ejemplo')
    .select('*')
    .eq('tipo', 'mdf')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const disenios = (data as DisenioEjemplo[]) ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
      <div className="flex items-end justify-between mb-6 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-stone-800 mb-1">Cuadros MDF</h1>
          <p className="text-stone-500 text-sm md:text-base">Trabajos que ya hicimos. Tu punto de partida.</p>
        </div>
        <Link
          href="/personalizado"
          className="hidden md:inline-flex items-center gap-1.5 bg-stone-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          Personalizar el mío <ArrowRight size={14} />
        </Link>
      </div>

      {disenios.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          <p className="mb-4">Pronto subimos los primeros diseños.</p>
          <Link href="/personalizado" className="text-stone-600 underline text-sm">Hacer pedido personalizado</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {disenios.map(d => (
            <div key={d.id} className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-square bg-stone-100">
                {d.imagenes[0] && (
                  <Image
                    src={d.imagenes[0]}
                    alt={d.nombre_diseno}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                )}
              </div>
              <div className="p-3 md:p-4">
                <p className="text-sm font-medium text-stone-800 leading-tight mb-1">{d.nombre_diseno}</p>
                {d.descripcion && (
                  <p className="text-xs text-stone-500 line-clamp-2">{d.descripcion}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile CTA */}
      <div className="md:hidden mt-8 flex justify-center">
        <Link
          href="/personalizado"
          className="bg-stone-800 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-stone-700 transition-colors"
        >
          Personalizar el mío
        </Link>
      </div>
    </div>
  )
}
