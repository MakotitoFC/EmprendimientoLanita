'use client'
import ImageGallery from '@/components/ui/ImageGallery'
import { formatPrice } from '@/lib/utils'
import type { Producto } from '@/lib/types'
import { Droplets, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import AddToCartButton from '@/components/cart/AddToCartButton'
import ConsultaButton from '@/components/consulta/ConsultaButton'
import PaymentTags from '@/components/products/PaymentTags'

interface Props {
  producto: Producto
  precioFinal?: number
  tienePromocion?: boolean
}

export default function PiedraClient({ producto, precioFinal, tienePromocion }: Props) {
  const noDisponible = !producto.piedra_disponible
  const precio = precioFinal ?? producto.precio_base

  return (
    <>
      {/* Back button — mobile */}
      <div className="md:hidden px-4 pt-3 pb-1">
        <Link href="/piezas-unicas" className="inline-flex items-center gap-1 text-xs text-stone-500">
          <ChevronLeft size={14} /> Piedras
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 md:py-8 pb-32 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">

          {/* Gallery */}
          <div>
            <ImageGallery images={producto.imagenes} alt={producto.nombre} blurred={noDisponible} />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 md:gap-5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-stone-100 text-stone-600 text-[10px] md:text-xs font-semibold px-3 py-1 rounded-full">
                Pieza única
              </span>
              {producto.piedra_tiene_resina && (
                <span className="bg-blue-50 text-blue-700 text-[10px] md:text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Droplets size={11} /> Con resina
                </span>
              )}
              {noDisponible && (
                <span className="bg-stone-700 text-white text-[10px] md:text-xs font-semibold px-3 py-1 rounded-full">
                  No disponible
                </span>
              )}
              {tienePromocion && (
                <span className="bg-rose-100 text-rose-700 text-[10px] md:text-xs font-semibold px-3 py-1 rounded-full">
                  En promoción
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-lg md:text-2xl font-semibold text-stone-800 mb-1">
                {producto.nombre}
              </h1>
              {producto.descripcion_corta && (
                <p className="text-stone-500 text-sm">{producto.descripcion_corta}</p>
              )}
            </div>

            {/* Price */}
            <div>
              {tienePromocion && precioFinal !== undefined ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl md:text-3xl font-bold text-stone-800">{formatPrice(precioFinal)}</span>
                  <span className="text-sm md:text-lg text-stone-400 line-through">{formatPrice(producto.precio_base)}</span>
                </div>
              ) : (
                <span className="text-2xl md:text-3xl font-bold text-stone-800">{formatPrice(producto.precio_base)}</span>
              )}
            </div>

            {/* Payment tags */}
            <PaymentTags />

            {/* CTA — desktop */}
            <div className="hidden md:flex flex-col gap-2">
              {!noDisponible ? (
                <>
                  <AddToCartButton product={producto} unitPrice={precio} className="w-full" size="lg" />
                  <ConsultaButton product={producto} className="w-full" />
                </>
              ) : (
                <div className="bg-stone-100 rounded-xl p-4 text-center">
                  <p className="text-stone-500 font-medium text-sm">Esta pieza ya encontró su hogar 🏡</p>
                  <p className="text-stone-400 text-xs mt-1">Mira las otras piezas disponibles.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fixed bottom CTA */}
      {!noDisponible && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 px-4 pb-3 pt-2 bg-white/95 backdrop-blur-sm border-t border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-stone-800">{formatPrice(precio)}</span>
            {tienePromocion && precioFinal !== undefined && (
              <span className="text-xs text-stone-400 line-through">{formatPrice(producto.precio_base)}</span>
            )}
          </div>
          <div className="flex gap-2">
            <ConsultaButton product={producto} className="flex-1" />
            <AddToCartButton product={producto} unitPrice={precio} className="flex-1" size="lg" />
          </div>
        </div>
      )}
    </>
  )
}
