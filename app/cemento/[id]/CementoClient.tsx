'use client'
import { useState } from 'react'
import ImageGallery from '@/components/ui/ImageGallery'
import Button from '@/components/ui/Button'
import WhatsAppModal from '@/components/whatsapp/WhatsAppModal'
import { formatPrice } from '@/lib/utils'
import type { Producto, DisenioEjemplo } from '@/lib/types'
import { MessageCircle, Droplets, ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  producto: Producto
  disenios: DisenioEjemplo[]
  whatsappNumber: string
  precioFinal?: number
  tienePromocion?: boolean
}

export default function CementoClient({ producto, disenios, whatsappNumber, precioFinal, tienePromocion }: Props) {
  const [color, setColor] = useState('')
  const [conResina, setConResina] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDisenio, setSelectedDisenio] = useState<DisenioEjemplo | null>(null)

  const precioBase = precioFinal ?? producto.precio_base
  const precioTotal = precioBase + (conResina && producto.cemento_precio_resina ? producto.cemento_precio_resina : 0)

  const buildMessage = (nombre: string, telefono: string) => {
    const extras = selectedDisenio
      ? `• Diseño de inspiración: ${selectedDisenio.nombre_diseno}\n• Color: ${color || 'A definir'}`
      : `• Color: ${color || 'A definir'}`

    return `PEDIDO - CEMENTO PERSONALIZADO

Producto: ${producto.nombre}
Cliente: ${nombre}
Teléfono: ${telefono || 'No proporcionado'}

OPCIONES ELEGIDAS:
${extras}
• Barniz/resina: ${conResina ? `Sí (+${formatPrice(producto.cemento_precio_resina ?? 0)})` : 'No'}

Precio estimado: ${formatPrice(precioTotal)}

Responder para confirmar disponibilidad y plazo.`
  }

  return (
    <>
      {/* Back — mobile */}
      <div className="md:hidden px-4 pt-3 pb-1">
        <Link href="/cemento" className="inline-flex items-center gap-1 text-sm text-stone-500">
          <ChevronLeft size={16} /> Cemento
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 md:py-10 pb-36 md:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">

          {/* Gallery */}
          <div>
            <ImageGallery images={producto.imagenes} alt={producto.nombre} />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 md:gap-5">
            {tienePromocion && (
              <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1 rounded-full self-start">
                En promoción
              </span>
            )}

            <div>
              <h1 className="text-xl md:text-2xl font-serif font-semibold text-stone-800 mb-1">
                {producto.nombre}
              </h1>
              {producto.descripcion_corta && (
                <p className="text-stone-500 text-sm">{producto.descripcion_corta}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Desde</p>
              {tienePromocion && precioFinal !== undefined ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl md:text-3xl font-bold text-stone-800">{formatPrice(precioFinal)}</span>
                  <span className="text-base text-stone-400 line-through">{formatPrice(producto.precio_base)}</span>
                </div>
              ) : (
                <span className="text-2xl md:text-3xl font-bold text-stone-800">{formatPrice(producto.precio_base)}</span>
              )}
              <p className="text-xs text-stone-400 mt-0.5">(modelo en blanco)</p>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                ¿Qué color deseás?
              </label>
              <input
                type="text"
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="Ej: terracota, gris claro, blanco roto..."
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
              />
            </div>

            {/* Resina */}
            {producto.cemento_tiene_resina && producto.cemento_precio_resina && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={conResina}
                  onChange={e => setConResina(e.target.checked)}
                  className="w-4 h-4 accent-stone-800"
                />
                <span className="text-sm text-stone-700 flex items-center gap-1.5">
                  <Droplets size={14} className="text-blue-400" />
                  Barniz / resina (+{formatPrice(producto.cemento_precio_resina)})
                </span>
              </label>
            )}

            {/* Total */}
            {conResina && producto.cemento_precio_resina && (
              <div className="bg-stone-50 rounded-xl px-4 py-3 border border-stone-200">
                <p className="text-sm text-stone-600">
                  Total estimado: <span className="font-bold text-stone-800">{formatPrice(precioTotal)}</span>
                </p>
              </div>
            )}

            {/* CTA desktop */}
            <div className="hidden md:block">
              <Button variant="whatsapp" size="lg" className="w-full" onClick={() => { setSelectedDisenio(null); setModalOpen(true) }}>
                <MessageCircle size={20} />
                Enviar mi pedido por WhatsApp
              </Button>
              <p className="text-xs text-stone-400 text-center mt-2">
                El vendedor confirma disponibilidad y plazo.
              </p>
            </div>
          </div>
        </div>

        {/* Diseños ejemplo */}
        {disenios.length > 0 && (
          <div className="mt-10 md:mt-16">
            <h2 className="text-lg md:text-2xl font-serif font-semibold text-stone-800 mb-1">Mirá algunos ejemplos</h2>
            <p className="text-stone-500 text-xs md:text-sm mb-4">¿Te copa alguno? Hacé click en "Lo quiero así".</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {disenios.map(d => (
                <div key={d.id} className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
                  <div className="relative aspect-square bg-stone-50">
                    {d.imagenes[0] && (
                      <Image src={d.imagenes[0]} alt={d.nombre_diseno} fill className="object-cover" sizes="(max-width:640px) 50vw, 200px" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs md:text-sm font-medium text-stone-800 mb-1 leading-tight">{d.nombre_diseno}</p>
                    {d.descripcion && <p className="text-xs text-stone-500 mb-2 line-clamp-1">{d.descripcion}</p>}
                    <button
                      onClick={() => { setSelectedDisenio(d); setModalOpen(true) }}
                      className="w-full text-xs bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-1"
                    >
                      <MessageCircle size={11} /> Lo quiero así
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile fixed bottom CTA */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 px-4 pb-3 pt-2 bg-white/95 backdrop-blur-sm border-t border-stone-100">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xl font-bold text-stone-800">{formatPrice(precioTotal)}</span>
            {conResina && <span className="text-xs text-stone-400 ml-1">c/ resina</span>}
          </div>
          {tienePromocion && precioFinal !== undefined && (
            <span className="text-sm text-stone-400 line-through">{formatPrice(producto.precio_base)}</span>
          )}
        </div>
        <Button variant="whatsapp" size="lg" className="w-full" onClick={() => { setSelectedDisenio(null); setModalOpen(true) }}>
          <MessageCircle size={18} />
          Enviar mi pedido
        </Button>
      </div>

      <WhatsAppModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedDisenio(null) }}
        whatsappNumber={whatsappNumber}
        buildMessage={buildMessage}
        title={selectedDisenio ? `Pedir: ${selectedDisenio.nombre_diseno}` : 'Enviar mi pedido'}
      />
    </>
  )
}
