'use client'
import { useState } from 'react'
import ProductCard from '@/components/products/ProductCard'
import type { Producto } from '@/lib/types'

type Filtro = 'todos' | 'disponible' | 'agotado'

export default function PiedrasCatalogo({ productos }: { productos: Producto[] }) {
  const [filtro, setFiltro] = useState<Filtro>('disponible')

  const filtrados = productos.filter(p => {
    if (filtro === 'disponible') return p.piedra_disponible
    if (filtro === 'agotado') return !p.piedra_disponible
    return true
  })

  const filters: { value: Filtro; label: string }[] = [
    { value: 'disponible', label: 'Disponibles' },
    { value: 'todos', label: 'Todas' },
    { value: 'agotado', label: 'Ya adoptadas' },
  ]

  return (
    <>
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors ${
              filtro === f.value
                ? 'bg-stone-800 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-stone-400 self-center">{filtrados.length} pieza{filtrados.length !== 1 ? 's' : ''}</span>
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-16 text-stone-400 text-sm">No hay piezas con ese filtro.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtrados.map(p => <ProductCard key={p.id} producto={p} />)}
        </div>
      )}
    </>
  )
}
