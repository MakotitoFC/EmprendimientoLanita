'use client'
import { useState } from 'react'
import ImageGallery from '@/components/ui/ImageGallery'
import Button from '@/components/ui/Button'
import WhatsAppModal from '@/components/whatsapp/WhatsAppModal'
import { formatPrice } from '@/lib/utils'
import type { Producto } from '@/lib/types'
import { MessageCircle, Droplets, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  producto: Producto
  whatsappNumber: string
  precioFinal?: number
  tienePromocion?: boolean
}

export default function PiedraClient({ producto, whatsappNumber, precioFinal, tienePromocion }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const noDisponible = !producto.piedra_disponible

  const buildMessage = (nombre: string, telefono: string) => {
    const precio = precioFinal ?? producto.precio_base
    return `COMPRA INTERESADA - PIEZA ÚNICA

Pieza: ${producto.nombre}
Precio: ${formatPrice(precio)}
Cliente: ${nombre}
Teléfono: ${telefono || 'No proporcionado'}

Responder para coordinar pago y envío.`
  }

  return (
    <>
      {/* Back button — mobile */}
      <div className="md:hidden px-4 pt-3 pb-1">
        <Link href="/piezas-unicas" className="inline-flex items-center gap-1 text-sm text-stone-500">
          <ChevronLeft size={16} /> Piezas únicas
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 md:py-10 pb-32 md:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">

          {/* Gallery */}
          <div>
            <ImageGallery images={producto.imagenes} alt={producto.nombre} blurred={noDisponible} />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 md:gap-5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                Pieza única
              </span>
              {producto.piedra_tiene_resina && (
                <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Droplets size={12} /> Con resina
                </span>
              )}
              {noDisponible && (
                <span className="bg-stone-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  No disponible
                </span>
              )}
              {tienePromocion && (
                <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1 rounded-full">
                  En promoción
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-semibold text-stone-800 mb-1">
                {producto.nombre}
              </h1>
              {producto.descripcion_corta && (
                <p className="text-stone-500 text-sm md:text-base">{producto.descripcion_corta}</p>
              )}
            </div>

            {/* Price */}
            <div>
              {tienePromocion && precioFinal !== undefined ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl md:text-3xl font-bold text-stone-800">{formatPrice(precioFinal)}</span>
                  <span className="text-base md:text-lg text-stone-400 line-through">{formatPrice(producto.precio_base)}</span>
                </div>
              ) : (
                <span className="text-2xl md:text-3xl font-bold text-stone-800">{formatPrice(producto.precio_base)}</span>
              )}
            </div>

            {/* CTA — desktop only (mobile uses fixed bottom bar) */}
            <div className="hidden md:block">
              {!noDisponible ? (
                <>
                  <Button variant="whatsapp" size="lg" className="w-full" onClick={() => setModalOpen(true)}>
                    <MessageCircle size={20} />
                    Lo quiero – Consultar por WhatsApp
                  </Button>
                  <p className="text-xs text-stone-400 text-center mt-2">
                    Se abre WhatsApp con tu consulta lista. El vendedor coordina pago y envío.
                  </p>
                </>
              ) : (
                <div className="bg-stone-100 rounded-xl p-4 text-center">
                  <p className="text-stone-500 font-medium">Esta pieza ya encontró su hogar 🏡</p>
                  <p className="text-stone-400 text-sm mt-1">Mirá las otras piezas disponibles.</p>
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
            <span className="text-xl font-bold text-stone-800">
              {formatPrice(precioFinal ?? producto.precio_base)}
            </span>
            {tienePromocion && precioFinal !== undefined && (
              <span className="text-sm text-stone-400 line-through">{formatPrice(producto.precio_base)}</span>
            )}
          </div>
          <Button variant="whatsapp" size="lg" className="w-full" onClick={() => setModalOpen(true)}>
            <MessageCircle size={18} />
            Lo quiero – Consultar por WhatsApp
          </Button>
        </div>
      )}

      <WhatsAppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        whatsappNumber={whatsappNumber}
        buildMessage={buildMessage}
        title="Consultar por esta pieza"
      />
    </>
  )
}
