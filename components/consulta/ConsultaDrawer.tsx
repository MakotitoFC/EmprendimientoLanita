'use client'
import { useConsulta } from '@/stores/consulta'
import { useSettings } from '@/stores/settings'
import { X, MessageCircle, Trash2, ShoppingCart, HelpCircle } from 'lucide-react'
import { useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '@/stores/cart'

export default function ConsultaDrawer() {
  const { items, isOpen, closeConsulta, removeItem, count } = useConsulta()
  const { addItem: addToCart } = useCart()
  const whatsappNumber = useSettings(s => s.whatsappNumber)

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const enviarWA = () => {
    if (!items.length) return
    const lineas = items.map(i => `• ${i.nombre} — S/ ${i.precio_base.toFixed(0)}`).join('\n')
    const msg = `Hola! Tengo consultas sobre estos productos de Lanita:\n\n${lineas}\n\nMis preguntas:`
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={closeConsulta} />

      <div className="
        fixed z-50 bg-white flex flex-col shadow-2xl
        bottom-0 left-0 right-0 rounded-t-2xl max-h-[92vh]
        md:bottom-auto md:left-1/2 md:top-1/2 md:right-auto
        md:-translate-x-1/2 md:-translate-y-1/2
        md:w-[calc(100%-2rem)] md:max-w-md md:rounded-2xl md:max-h-[80vh]
      ">
        {/* Drag handle mobile */}
        <div className="md:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-stone-600" />
            <h2 className="font-semibold text-stone-800">
              Lista de consulta {count() > 0 && <span className="text-stone-400 font-normal text-sm">({count()})</span>}
            </h2>
          </div>
          <button onClick={closeConsulta} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500">
            <X size={18} />
          </button>
        </div>

        {/* Explicación */}
        <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex-shrink-0">
          <div className="flex gap-2.5 items-start">
            <HelpCircle size={15} className="text-stone-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-stone-500 leading-relaxed">
              ¿Tienes dudas sobre algún producto? Agrégalo aquí y envíanos tu consulta por WhatsApp. Te respondemos a la brevedad.
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <MessageCircle size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium mb-1">Tu lista de consulta está vacía</p>
              <p className="text-xs text-stone-400">Toca <span className="font-semibold">Consultar</span> en cualquier producto para agregarlo aquí.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-3 p-3 bg-stone-50 rounded-2xl">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-200 flex-shrink-0">
                  {item.imagenes[0] && (
                    <Image src={item.imagenes[0]} alt={item.nombre} fill className="object-cover" sizes="56px" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 line-clamp-1">{item.nombre}</p>
                  {item.descripcion_corta && (
                    <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">{item.descripcion_corta}</p>
                  )}
                  <p className="text-sm font-semibold text-stone-700 mt-1">S/ {item.precio_base.toFixed(0)}</p>
                </div>
                <div className="flex flex-col items-end justify-between gap-2">
                  <button onClick={() => removeItem(item.id)} className="p-1 text-stone-300 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => { addToCart(item, 1, {}, item.precio_base); removeItem(item.id) }}
                    title="Mover al carrito"
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                  >
                    <ShoppingCart size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-100 p-5 space-y-3 flex-shrink-0">
            <p className="text-xs text-stone-400 text-center">
              Se abrirá WhatsApp con la lista lista. Solo escribe tu pregunta al final.
            </p>
            <button
              onClick={enviarWA}
              className="w-full flex items-center justify-center gap-2 bg-stone-800 text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-stone-700 transition-colors"
            >
              <MessageCircle size={16} />
              Enviar consulta por WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  )
}
