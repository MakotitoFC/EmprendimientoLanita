import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import type { DisenioEjemplo } from '@/lib/types'

export const revalidate = 60

export default async function InspiracionPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('disenos_ejemplo')
    .select('*, producto:productos(nombre)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const disenios = (data as (DisenioEjemplo & { producto: { nombre: string } | null })[]) ?? []
  const cemento = disenios.filter(d => d.tipo === 'cemento')
  const mdf = disenios.filter(d => d.tipo === 'mdf')

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-serif font-semibold text-stone-800 mb-2">Inspiración</h1>
        <p className="text-stone-500">
          Algunos de los trabajos que ya hicimos. Puede ser tu punto de partida.
        </p>
      </div>

      {cemento.length > 0 && (
        <section className="mb-14">
          <h2 className="text-xl font-serif font-semibold text-stone-800 mb-5">Objetos de cemento</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cemento.map(d => (
              <GalleryCard key={d.id} disenio={d} />
            ))}
          </div>
        </section>
      )}

      {mdf.length > 0 && (
        <section>
          <h2 className="text-xl font-serif font-semibold text-stone-800 mb-5">Cuadros MDF</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mdf.map(d => (
              <GalleryCard key={d.id} disenio={d} />
            ))}
          </div>
        </section>
      )}

      {disenios.length === 0 && (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg">Pronto vamos a tener ejemplos acá.</p>
        </div>
      )}
    </div>
  )
}

function GalleryCard({ disenio }: { disenio: DisenioEjemplo & { producto: { nombre: string } | null } }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
      <div className="relative aspect-square bg-stone-50">
        {disenio.imagenes[0] && (
          <Image
            src={disenio.imagenes[0]}
            alt={disenio.nombre_diseno}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-stone-800">{disenio.nombre_diseno}</p>
        {disenio.descripcion && (
          <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{disenio.descripcion}</p>
        )}
      </div>
    </div>
  )
}
