'use client'
import { useCart } from '@/stores/cart'
import { useSettings } from '@/stores/settings'
import { X, Minus, Plus, ShoppingBag, Trash2, MessageCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import CheckoutModal from './CheckoutModal'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, count } = useCart()
  const whatsappNumber = useSettings(s => s.whatsappNumber)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return checkoutOpen ? <CheckoutModal onClose={() => setCheckoutOpen(false)} /> : null

  const totalVal = total()
  const countVal = count()

  const consultarWA = () => {
    if (!items.length) return
    const lineas = items.map(i =>
      `• ${i.product.nombre}${i.quantity > 1 ? ` ×${i.quantity}` : ''} — ${formatPrice(i.unitPrice * i.quantity)}`
    ).join('\n')
    const msg = `Hola! Quisiera consultar sobre estos productos:\n\n${lineas}\n\nTotal referencial: ${formatPrice(totalVal)}\n\nMi consulta:`
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <>
      {/* Overlay con blur */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/*
        Mobile  → bottom sheet (slide desde abajo, esquinas redondeadas arriba)
        md+     → modal centrado (max-w-md, rounded-2xl)
      */}
      <div className="
        fixed z-50 bg-white flex flex-col shadow-2xl
        bottom-0 left-0 right-0 rounded-t-2xl max-h-[92vh]
        md:bottom-auto md:left-1/2 md:top-1/2 md:right-auto
        md:-translate-x-1/2 md:-translate-y-1/2
        md:w-[calc(100%-2rem)] md:max-w-md md:rounded-2xl md:max-h-[80vh]
      ">
        {/* Drag handle — solo mobile */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-stone-700" />
            <h2 className="font-semibold text-stone-800">
              Carrito {countVal > 0 && <span className="text-stone-500 font-normal text-sm">({countVal})</span>}
            </h2>
          </div>
          <button onClick={closeCart} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-stone-50 rounded-2xl">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-200 flex-shrink-0">
                  {item.product.imagenes[0] && (
                    <Image
                      src={item.product.imagenes[0]}
                      alt={item.product.nombre}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 line-clamp-1">{item.product.nombre}</p>
                  {Object.entries(item.options).length > 0 && (
                    <p className="text-xs text-stone-400 mt-0.5">
                      {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-stone-700 mt-1">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.product.id, item.options)}
                    className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.options, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center hover:bg-stone-300 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.options, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-stone-800 text-white flex items-center justify-center hover:bg-stone-700 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-100 p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Subtotal</span>
              <span className="font-semibold text-stone-800">{formatPrice(totalVal)}</span>
            </div>
            <p className="text-xs text-stone-400 text-center">Coordinamos envío y pago por WhatsApp</p>
            <button
              onClick={() => { closeCart(); setCheckoutOpen(true) }}
              className="block w-full bg-stone-800 text-white text-center py-3.5 rounded-2xl font-semibold text-sm hover:bg-stone-700 transition-colors"
            >
              Finalizar pedido
            </button>
            <button
              onClick={consultarWA}
              className="w-full flex items-center justify-center gap-2 border border-stone-300 text-stone-700 py-3 rounded-2xl text-sm font-medium hover:bg-stone-50 transition-colors"
            >
              <MessageCircle size={15} />
              Consultar por WhatsApp
            </button>
          </div>
        )}
      </div>
      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
    </>
  )
}
