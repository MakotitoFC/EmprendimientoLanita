import Link from 'next/link'
import Image from 'next/image'
import { cn, formatPrice } from '@/lib/utils'
import type { Producto } from '@/lib/types'
import { Gem } from 'lucide-react'

interface ProductCardProps {
  producto: Producto
  precioFinal?: number
  tienePromocion?: boolean
}

export default function ProductCard({ producto, precioFinal, tienePromocion }: ProductCardProps) {
  const href =
    producto.tipo === 'piedra' ? `/piezas-unicas/${producto.id}` :
    producto.tipo === 'cemento' ? `/cemento/${producto.id}` :
    '/cuadros-mdf'

  const imagen = producto.imagenes[0]
  const noDisponible = producto.tipo === 'piedra' && !producto.piedra_disponible

  return (
    <Link href={href} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-100">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-stone-50">
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
              <Gem size={40} />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {producto.tipo === 'piedra' && (
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                Pieza única
              </span>
            )}
            {noDisponible && (
              <span className="bg-stone-700 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                No disponible
              </span>
            )}
            {tienePromocion && !noDisponible && (
              <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                Promoción
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-medium text-stone-800 text-sm leading-snug line-clamp-2 mb-1">
            {producto.nombre}
          </h3>
          {producto.descripcion_corta && (
            <p className="text-xs text-stone-500 line-clamp-1 mb-2">{producto.descripcion_corta}</p>
          )}
          <div className="flex items-baseline gap-2">
            {tienePromocion && precioFinal !== undefined ? (
              <>
                <span className="font-semibold text-stone-800">{formatPrice(precioFinal)}</span>
                <span className="text-xs text-stone-400 line-through">{formatPrice(producto.precio_base)}</span>
              </>
            ) : (
              <span className="font-semibold text-stone-800">
                {producto.tipo === 'cemento' || producto.tipo === 'mdf'
                  ? `Desde ${formatPrice(producto.precio_base)}`
                  : formatPrice(producto.precio_base)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
