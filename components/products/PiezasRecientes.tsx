'use client'
import { useState } from 'react'
import ProductCard from './ProductCard'
import type { Producto, Promocion } from '@/lib/types'
import { getActivePromotion, getPrecioConPromocion } from '@/lib/utils'
import Link from 'next/link'

type Tipo = 'todos' | 'piedra' | 'cemento' | 'mdf'

const filtros: { value: Tipo; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'piedra', label: 'Piedras' },
  { value: 'cemento', label: 'Cemento' },
  { value: 'mdf', label: 'MDF' },
]

export default function PiezasRecientes({ productos, promociones }: { productos: Producto[]; promociones: Promocion[] }) {
  const [tipo, setTipo] = useState<Tipo>('todos')

  const filtrados = tipo === 'todos' ? productos : productos.filter(p => p.tipo === tipo)

  return (
    <section className="max-w-6xl mx-auto px-4 pt-10 md:pt-16 pb-8 md:pb-16">
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-semibold text-stone-800">Piezas recientes</h2>
        <p className="text-sm text-stone-500 mt-1">Lo último del taller</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {filtros.map(f => (
          <button
            key={f.value}
            onClick={() => setTipo(f.value)}
            className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors ${
              tipo === f.value
                ? 'bg-stone-800 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <p className="text-stone-400 text-sm py-8 text-center">No hay piezas de este tipo aún.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtrados.map(p => {
            const promo = getActivePromotion(p, promociones)
            const precioFinal = promo ? getPrecioConPromocion(p.precio_base, promo) : undefined
            return <ProductCard key={p.id} producto={p} precioFinal={precioFinal} tienePromocion={!!promo} />
          })}
        </div>
      )}

      <div className="mt-6 md:mt-8 flex justify-center">
        <Link
          href={tipo === 'piedra' ? '/piezas-unicas' : tipo === 'cemento' ? '/cemento' : tipo === 'mdf' ? '/cuadros-mdf' : '/piezas-unicas'}
          className="border border-stone-400 text-stone-600 px-6 py-2.5 rounded-full text-sm font-medium hover:bg-stone-100 transition-colors"
        >
          Ver todo el catálogo
        </Link>
      </div>
    </section>
  )
}
