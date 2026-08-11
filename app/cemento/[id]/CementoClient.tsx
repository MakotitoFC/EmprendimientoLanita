'use client'
import { useState } from 'react'
import ImageGallery from '@/components/ui/ImageGallery'
import Button from '@/components/ui/Button'
import WhatsAppModal from '@/components/whatsapp/WhatsAppModal'
import { formatPrice } from '@/lib/utils'
import type { Producto, DisenioEjemplo } from '@/lib/types'
import { MessageCircle, Droplets } from 'lucide-react'
import Image from 'next/image'

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
    const base = selectedDisenio
      ? `PEDIDO - CEMENTO PERSONALIZADO

Producto: ${producto.nombre}
Cliente: ${nombre}
Teléfono: ${telefono || 'No proporcionado'}

OPCIONES ELEGIDAS:
• Diseño de inspiración: ${selectedDisenio.nombre_diseno}
• Color: ${color || 'A definir'}
• Barniz/resina: ${conResina ? `Sí (+${formatPrice(producto.cemento_precio_resina ?? 0)})` : 'No'}

Precio estimado: ${formatPrice(precioTotal)}

Responder para confirmar disponibilidad y plazo.`
      : `PEDIDO - CEMENTO PERSONALIZADO

Producto: ${producto.nombre}
Cliente: ${nombre}
Teléfono: ${telefono || 'No proporcionado'}

OPCIONES ELEGIDAS:
• Color: ${color || 'A definir'}
• Barniz/resina: ${conResina ? `Sí (+${formatPrice(producto.cemento_precio_resina ?? 0)})` : 'No'}

Precio estimado: ${formatPrice(precioTotal)}

Responder para confirmar disponibilidad y plazo.`

    return base
  }

  const openModalForDisenio = (d: DisenioEjemplo) => {
    setSelectedDisenio(d)
    setModalOpen(true)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <ImageGallery images={producto.imagenes} alt={producto.nombre} />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            {tienePromocion && (
              <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3">
                En promoción
              </span>
            )}
            <h1 className="text-2xl font-serif font-semibold text-stone-800 mb-2">
              {producto.nombre}
            </h1>
            {producto.descripcion_corta && (
              <p className="text-stone-500">{producto.descripcion_corta}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <p className="text-sm text-stone-500 mb-1">Desde</p>
            {tienePromocion && precioFinal !== undefined ? (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-stone-800">{formatPrice(precioFinal)}</span>
                <span className="text-lg text-stone-400 line-through">{formatPrice(producto.precio_base)}</span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-stone-800">{formatPrice(producto.precio_base)}</span>
            )}
            <p className="text-xs text-stone-400 mt-1">(modelo en blanco sin nada)</p>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              ¿Qué color deseás?
            </label>
            <input
              type="text"
              value={color}
              onChange={e => setColor(e.target.value)}
              placeholder="Ej: terracota oscuro, gris claro, blanco roto..."
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent"
            />
            <p className="text-xs text-stone-400 mt-1">Texto libre. El vendedor te confirma si puede hacerlo.</p>
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
              <span className="text-sm text-stone-700">
                Barniz / resina (+{formatPrice(producto.cemento_precio_resina)})
              </span>
              <Droplets size={14} className="text-blue-500" />
            </label>
          )}

          {/* Total */}
          {conResina && producto.cemento_precio_resina && (
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
              <p className="text-sm text-stone-600">
                Precio estimado: <span className="font-semibold text-stone-800">{formatPrice(precioTotal)}</span>
              </p>
            </div>
          )}

          {/* CTA */}
          <Button
            variant="whatsapp"
            size="lg"
            className="w-full"
            onClick={() => { setSelectedDisenio(null); setModalOpen(true) }}
          >
            <MessageCircle size={20} />
            Enviar mi pedido por WhatsApp
          </Button>

          <p className="text-xs text-stone-400 text-center">
            El vendedor te confirma disponibilidad y plazo de entrega.
          </p>
        </div>
      </div>

      {/* Diseños de ejemplo */}
      {disenios.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-serif font-semibold text-stone-800 mb-2">Mirá algunos ejemplos</h2>
          <p className="text-stone-500 text-sm mb-6">¿Algo de esto te inspira? Hacé click en "Lo quiero así" para pedirlo.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {disenios.map(d => (
              <div key={d.id} className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
                <div className="relative aspect-square bg-stone-50">
                  {d.imagenes[0] && (
                    <Image src={d.imagenes[0]} alt={d.nombre_diseno} fill className="object-cover" sizes="200px" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-stone-800 mb-1">{d.nombre_diseno}</p>
                  {d.descripcion && <p className="text-xs text-stone-500 mb-2 line-clamp-2">{d.descripcion}</p>}
                  <button
                    onClick={() => openModalForDisenio(d)}
                    className="w-full text-xs bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-1"
                  >
                    <MessageCircle size={12} /> Lo quiero así
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <WhatsAppModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedDisenio(null) }}
        whatsappNumber={whatsappNumber}
        buildMessage={buildMessage}
        title={selectedDisenio ? `Pedir: ${selectedDisenio.nombre_diseno}` : 'Enviar mi pedido'}
      />
    </div>
  )
}
