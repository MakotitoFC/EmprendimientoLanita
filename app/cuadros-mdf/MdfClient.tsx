'use client'
import { useState } from 'react'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import WhatsAppModal from '@/components/whatsapp/WhatsAppModal'
import { formatPrice } from '@/lib/utils'
import type { Producto, TamanoMDF, DisenioEjemplo } from '@/lib/types'
import { MessageCircle, Droplets, Upload } from 'lucide-react'

interface Props {
  producto: Producto | null
  tamanos: TamanoMDF[]
  disenios: DisenioEjemplo[]
  whatsappNumber: string
}

export default function MdfClient({ producto, tamanos, disenios, whatsappNumber }: Props) {
  const [tamanoId, setTamanoId] = useState('')
  const [conResina, setConResina] = useState(false)
  const [archivoNombre, setArchivoNombre] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDisenio, setSelectedDisenio] = useState<DisenioEjemplo | null>(null)
  const [error, setError] = useState('')

  const tamanoSeleccionado = tamanos.find(t => t.id === tamanoId)
  const precioResina = producto?.mdf_precio_resina ?? 0
  const precioTotal = (tamanoSeleccionado?.precio ?? 0) + (conResina ? precioResina : 0)

  const handleOpenModal = () => {
    if (!tamanoId) { setError('Primero elegí un tamaño.'); return }
    setError('')
    setSelectedDisenio(null)
    setModalOpen(true)
  }

  const buildMessage = (nombre: string, telefono: string) => {
    if (selectedDisenio) {
      return `PEDIDO - CUADRO MDF

Cliente: ${nombre}
Teléfono: ${telefono || 'No proporcionado'}

Diseño elegido: ${selectedDisenio.nombre_diseno}
Barniz/resina: ${conResina ? `Sí (+${formatPrice(precioResina)})` : 'No'}

Responder con precio final y plazo.`
    }

    return `PEDIDO - CUADRO MDF

Cliente: ${nombre}
Teléfono: ${telefono || 'No proporcionado'}

Tamaño: ${tamanoSeleccionado?.nombre ?? ''}
Barniz/resina: ${conResina ? `Sí (+${formatPrice(precioResina)})` : 'No'}
Diseño: ${archivoNombre ? `"${archivoNombre}" (enviarlo por este chat)` : 'Enviar por este chat'}

Precio estimado: ${formatPrice(precioTotal)}

Responder con precio final y plazo.`
  }

  return (
    <div className="pb-36 md:pb-0">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-6 md:pt-12 mb-5 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-stone-800 mb-1">Cuadros MDF</h1>
        <p className="text-stone-500 text-sm md:text-base">Traé tu diseño, elegís el tamaño. Nosotros lo hacemos realidad.</p>
      </div>

      {/* Gallery — horizontal scroll */}
      {producto && producto.imagenes.length > 0 && (
        <div className="mb-6 md:mb-10 max-w-5xl mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {producto.imagenes.map((img, i) => (
              <div key={i} className="relative flex-shrink-0 w-32 h-32 md:w-44 md:h-44 rounded-xl overflow-hidden bg-stone-100">
                <Image src={img} alt={`Ejemplo ${i + 1}`} fill className="object-cover" sizes="160px" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">

          {/* Configurator */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 md:p-6 space-y-5">
            <h2 className="text-base md:text-lg font-semibold text-stone-800">Armá tu pedido</h2>

            {/* Tamaños */}
            <div>
              <p className="text-sm font-medium text-stone-700 mb-2.5">Elegí un tamaño</p>
              {tamanos.length === 0 ? (
                <p className="text-stone-400 text-sm">Sin tamaños disponibles aún.</p>
              ) : (
                <div className="space-y-2">
                  {tamanos.filter(t => t.is_available).map(t => (
                    <label
                      key={t.id}
                      className={`flex items-center gap-3 cursor-pointer rounded-xl border px-4 py-3 transition-colors ${tamanoId === t.id ? 'border-stone-800 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}
                    >
                      <input
                        type="radio"
                        name="tamano"
                        value={t.id}
                        checked={tamanoId === t.id}
                        onChange={() => { setTamanoId(t.id); setError('') }}
                        className="accent-stone-800"
                      />
                      <span className="text-sm text-stone-700 flex-1 font-medium">{t.nombre}</span>
                      <span className="text-sm font-bold text-stone-800">{formatPrice(t.precio)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Resina */}
            {producto?.mdf_tiene_resina && precioResina > 0 && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={conResina}
                  onChange={e => setConResina(e.target.checked)}
                  className="w-4 h-4 accent-stone-800"
                />
                <span className="text-sm text-stone-700 flex items-center gap-1.5">
                  <Droplets size={14} className="text-blue-400" />
                  Barniz / resina (+{formatPrice(precioResina)})
                </span>
              </label>
            )}

            {/* Diseño */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Tu diseño <span className="text-stone-400 font-normal text-xs">(podés mandarlo por WhatsApp)</span>
              </label>
              <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-3.5 cursor-pointer transition-colors ${archivoNombre ? 'border-stone-400 bg-stone-50' : 'border-stone-200 hover:border-stone-400'}`}>
                <Upload size={16} className="text-stone-400 flex-shrink-0" />
                <span className="text-sm text-stone-500 truncate">
                  {archivoNombre || 'Seleccioná JPG o PNG'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="sr-only"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setArchivoNombre(f.name) }}
                />
              </label>
            </div>

            {/* Price summary */}
            {tamanoSeleccionado && (
              <div className="bg-stone-50 rounded-xl px-4 py-3 border border-stone-200">
                <p className="text-sm text-stone-600">
                  Precio estimado: <span className="font-bold text-stone-800">{formatPrice(precioTotal)}</span>
                </p>
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* CTA desktop */}
            <div className="hidden md:block">
              <Button variant="whatsapp" size="lg" className="w-full" onClick={handleOpenModal}>
                <MessageCircle size={20} />
                Pedir mi cuadro por WhatsApp
              </Button>
              <p className="text-xs text-stone-400 text-center mt-2">
                Si subiste diseño, recordá enviarlo también por WhatsApp.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="space-y-3 md:space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 md:p-5">
              <h3 className="font-semibold text-stone-800 mb-2 text-sm md:text-base">¿Cómo funciona?</h3>
              <ol className="text-sm text-stone-600 space-y-1 list-decimal list-inside">
                <li>Elegís el tamaño y opciones</li>
                <li>Tocás "Pedir mi cuadro"</li>
                <li>Se abre WhatsApp con el pedido</li>
                <li>Mandás tu diseño por WhatsApp</li>
                <li>El vendedor confirma precio y plazo</li>
              </ol>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 md:p-5">
              <p className="text-sm text-stone-600">
                <strong className="text-stone-800">¿Sin diseño?</strong> Podés elegir uno de los diseños de abajo, o consultanos.
              </p>
            </div>
          </div>
        </div>

        {/* Diseños ejemplo */}
        {disenios.length > 0 && (
          <div className="mt-10 md:mt-16">
            <h2 className="text-lg md:text-2xl font-serif font-semibold text-stone-800 mb-1">Diseños que ya hicimos</h2>
            <p className="text-stone-500 text-xs md:text-sm mb-4">¿Te copa alguno? Tocá "Lo quiero" y coordinamos.</p>
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
                      <MessageCircle size={11} /> Lo quiero
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
        {tamanoSeleccionado ? (
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-bold text-stone-800">{formatPrice(precioTotal)}</span>
            <span className="text-xs text-stone-500">{tamanoSeleccionado.nombre}</span>
          </div>
        ) : (
          <p className="text-xs text-stone-400 mb-2 text-center">Elegí un tamaño para continuar</p>
        )}
        <Button variant="whatsapp" size="lg" className="w-full" onClick={handleOpenModal}>
          <MessageCircle size={18} />
          Pedir mi cuadro por WhatsApp
        </Button>
      </div>

      <WhatsAppModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedDisenio(null) }}
        whatsappNumber={whatsappNumber}
        buildMessage={buildMessage}
        title={selectedDisenio ? `Pedir: ${selectedDisenio.nombre_diseno}` : 'Pedir mi cuadro'}
      />
    </div>
  )
}
