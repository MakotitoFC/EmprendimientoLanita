'use client'
import { useState } from 'react'
import { useCart } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import { createOrder, type CheckoutInput } from '@/lib/actions/orders'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, CheckCircle } from 'lucide-react'

type Step = 'form' | 'summary' | 'done'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const [step, setStep] = useState<Step>('form')
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  const totalVal = total()

  if (items.length === 0 && step !== 'done') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-stone-500 mb-4">Tu carrito está vacío.</p>
        <Link href="/" className="text-stone-800 underline text-sm">Volver al inicio</Link>
      </div>
    )
  }

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setError('Completá todos los campos obligatorios.')
      return
    }
    setError('')
    setStep('summary')
  }

  const handleConfirm = async () => {
    setLoading(true)
    setError('')
    const input: CheckoutInput = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim() || undefined,
      items: items.map(i => ({
        productId: i.product.id,
        productName: i.product.nombre,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        options: i.options,
      })),
      total: totalVal,
    }
    const result = await createOrder(input)
    setLoading(false)
    if ('error' in result) {
      setError(result.error)
      setStep('form')
    } else {
      setOrderId(result.orderId)
      clearCart()
      setStep('done')
    }
  }

  if (step === 'done') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-serif font-semibold text-stone-800 mb-3">¡Pedido recibido!</h1>
        <p className="text-stone-500 mb-6">
          Te vamos a contactar por Telegram o al teléfono que dejaste para coordinar el pago y envío.
        </p>
        <div className="bg-stone-50 rounded-2xl p-4 mb-8">
          <p className="text-xs text-stone-400 mb-1">Número de pedido</p>
          <p className="font-mono text-stone-700 text-sm break-all">{orderId}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href={`/pedido/${orderId}`}
            className="bg-stone-800 text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-stone-700 transition-colors"
          >
            Ver estado de mi pedido
          </Link>
          <Link href="/" className="text-stone-500 text-sm hover:text-stone-800">
            Seguir comprando
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-12 pb-24 md:pb-12">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-stone-500 mb-6">
        <ChevronLeft size={16} /> Seguir comprando
      </Link>

      <h1 className="text-2xl font-serif font-semibold text-stone-800 mb-8">
        {step === 'form' ? 'Tu información' : 'Revisá tu pedido'}
      </h1>

      {step === 'form' ? (
        <form onSubmit={handleSubmitForm} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                placeholder="María García"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                placeholder="+51 900 000 000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
              placeholder="maria@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Dirección de envío <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
              placeholder="Calle, número, distrito, ciudad"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Notas adicionales <span className="text-stone-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 resize-none"
              placeholder="Instrucciones especiales, referencias, etc."
            />
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}

          {/* Items summary */}
          <div className="bg-stone-50 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-medium text-stone-700">Tu pedido ({items.length} {items.length === 1 ? 'producto' : 'productos'})</p>
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
                  {item.product.imagenes[0] && (
                    <Image src={item.product.imagenes[0]} alt={item.product.nombre} fill className="object-cover" sizes="40px" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-stone-800 line-clamp-1">{item.product.nombre}</p>
                  {Object.entries(item.options).length > 0 && (
                    <p className="text-[10px] text-stone-400">{Object.values(item.options).join(' · ')}</p>
                  )}
                </div>
                <span className="text-xs font-semibold text-stone-700">
                  {item.quantity > 1 && `${item.quantity}x `}{formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t border-stone-200 pt-3 flex justify-between">
              <span className="text-sm font-semibold text-stone-700">Total</span>
              <span className="text-sm font-bold text-stone-800">{formatPrice(totalVal)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-stone-800 text-white py-4 rounded-2xl font-semibold text-base hover:bg-stone-700 transition-colors"
          >
            Revisar pedido →
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Data summary */}
          <div className="bg-stone-50 rounded-2xl p-5 space-y-2">
            <p className="text-sm font-medium text-stone-700 mb-3">Datos de entrega</p>
            <p className="text-sm text-stone-600"><span className="font-medium">Nombre:</span> {name}</p>
            <p className="text-sm text-stone-600"><span className="font-medium">Email:</span> {email}</p>
            <p className="text-sm text-stone-600"><span className="font-medium">Teléfono:</span> {phone}</p>
            <p className="text-sm text-stone-600"><span className="font-medium">Dirección:</span> {address}</p>
            {notes && <p className="text-sm text-stone-600"><span className="font-medium">Notas:</span> {notes}</p>}
            <button onClick={() => setStep('form')} className="text-xs text-stone-500 underline mt-2">
              Editar datos
            </button>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-stone-100 rounded-2xl p-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                  {item.product.imagenes[0] && (
                    <Image src={item.product.imagenes[0]} alt={item.product.nombre} fill className="object-cover" sizes="56px" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-800">{item.product.nombre}</p>
                  {Object.entries(item.options).length > 0 && (
                    <p className="text-xs text-stone-400 mt-0.5">
                      {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-stone-800">{formatPrice(item.unitPrice * item.quantity)}</p>
                  <p className="text-xs text-stone-400">x{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-4 border-t border-stone-200">
            <span className="font-semibold text-stone-700">Total</span>
            <span className="text-xl font-bold text-stone-800">{formatPrice(totalVal)}</span>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
            <p className="text-sm text-indigo-800">
              💳 El pago se coordina directamente con el vendedor por Telegram o teléfono. No se cobra nada ahora.
            </p>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-stone-800 text-white py-4 rounded-2xl font-semibold text-base hover:bg-stone-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Enviando pedido...' : 'Confirmar pedido'}
          </button>
        </div>
      )}
    </div>
  )
}

