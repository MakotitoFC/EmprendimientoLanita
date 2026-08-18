'use client'
import Link from 'next/link'
import Image from 'next/image'
import { cn, formatPrice } from '@/lib/utils'
import type { Producto } from '@/lib/types'
import { Gem, ShoppingCart } from 'lucide-react'
import { useCart } from '@/stores/cart'
import ConsultaButton from '@/components/consulta/ConsultaButton'

interface ProductCardProps {
  producto: Producto
  precioFinal?: number
  tienePromocion?: boolean
}

export default function ProductCard({ producto, precioFinal, tienePromocion }: ProductCardProps) {
  const { addItem } = useCart()

  const href =
    producto.tipo === 'piedra' ? `/piezas-unicas/${producto.id}` :
    producto.tipo === 'cemento' ? `/cemento/${producto.id}` :
    '/cuadros-mdf'

  const imagen = producto.imagenes[0]
  const noDisponible = producto.tipo === 'piedra' && !producto.piedra_disponible
  const precio = precioFinal ?? producto.precio_base

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-100">
      {/* Imagen + info — clickable */}
      <Link href={href} className="group block">
        <div className="relative aspect-square overflow-hidden bg-stone-100">
          {imagen ? (
            <Image
              src={imagen}
              alt={producto.nombre}
              fill
              className={cn(
                'object-cover transition-transform duration-500 group-hover:scale-105',
                noDisponible && 'blur-sm scale-105'
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-stone-300">
              <Gem size={36} />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {(producto.tipo === 'piedra' || producto.es_unica) && (
              <span className="bg-stone-800/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Única
              </span>
            )}
            {noDisponible && (
              <span className="bg-stone-700/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                No disponible
              </span>
            )}
            {tienePromocion && !noDisponible && (
              <span className="bg-rose-100 text-rose-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Promoción
              </span>
            )}
          </div>
        </div>

        <div className="px-3 pt-3 pb-2 md:px-4 md:pt-4">
          <h3 className="font-medium text-stone-800 text-xs md:text-sm leading-snug line-clamp-2 mb-1">
            {producto.nombre}
          </h3>
          {producto.descripcion_corta && (
            <p className="text-[10px] md:text-xs text-stone-500 line-clamp-1 mb-1">
              {producto.descripcion_corta}
            </p>
          )}
          <div className="flex items-baseline gap-1.5">
            {tienePromocion && precioFinal !== undefined ? (
              <>
                <span className="font-bold text-stone-800 text-sm md:text-base">{formatPrice(precioFinal)}</span>
                <span className="text-[10px] md:text-xs text-stone-400 line-through">{formatPrice(producto.precio_base)}</span>
              </>
            ) : (
              <span className="font-bold text-stone-800 text-sm md:text-base">
                {(producto.tipo === 'cemento' || producto.tipo === 'mdf') && 'Desde '}
                {formatPrice(producto.precio_base)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Acciones */}
      {!noDisponible && (
        <div className="px-3 pb-3 md:px-4 md:pb-4 flex gap-2">
          <ConsultaButton product={producto} size="sm" className="flex-1" />
          <button
            onClick={() => addItem(producto, 1, {}, precio)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-stone-800 text-white rounded-2xl text-xs font-medium hover:bg-stone-700 transition-colors"
          >
            <ShoppingCart size={12} />
            Agregar
          </button>
        </div>
      )}
    </div>
  )
}
