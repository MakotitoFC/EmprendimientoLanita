'use client'
import { useState } from 'react'
import { useCart } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import { createOrder, type CheckoutInput } from '@/lib/actions/orders'
import Image from 'next/image'
import Link from 'next/link'
import { X, Check, CheckCircle } from 'lucide-react'
import { useEffect } from 'react'

type Step = 1 | 2 | 3

interface Props {
  onClose: () => void
}

function StepBar({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: 'Tus datos' },
    { n: 2, label: 'Revisar' },
    { n: 3, label: 'Listo' },
  ]
  return (
    <div className="flex items-center justify-center gap-0 px-6 py-4">
      {steps.map((s, i) => {
        const done = step > s.n
        const active = step === s.n
        return (
          <div key={s.n} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${done ? 'bg-stone-800 text-white' : active ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-400'}
              `}>
                {done ? <Check size={13} strokeWidth={3} /> : s.n}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'text-stone-800' : done ? 'text-stone-500' : 'text-stone-300'}`}>
                {s.label}
              </span>
            </div>
            {/* Connector */}
            {i < steps.length - 1 && (
              <div className={`w-12 h-px mb-4 mx-1 ${done ? 'bg-stone-800' : 'bg-stone-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function CheckoutModal({ onClose }: Props) {
  const { items, total, clearCart } = useCart()
  const [step, setStep] = useState<Step>(1)
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  const totalVal = total()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setError('Completa todos los campos obligatorios.')
      return
    }
    setError('')
    setStep(2)
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
    } else {
      setOrderId(result.orderId)
      clearCart()
      setStep(3)
    }
  }

  const inputClass = 'w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 bg-white'

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={step === 3 ? onClose : undefined} />

      {/* Modal: bottom sheet mobile / centrado desktop */}
      <div className="
        fixed z-[60] bg-white flex flex-col shadow-2xl
        bottom-0 left-0 right-0 rounded-t-2xl max-h-[95vh]
        md:bottom-auto md:left-1/2 md:top-1/2 md:right-auto
        md:-translate-x-1/2 md:-translate-y-1/2
        md:w-[calc(100%-2rem)] md:max-w-lg md:rounded-2xl md:max-h-[88vh]
      ">
        {/* Drag handle mobile */}
        <div className="md:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-0 flex-shrink-0">
          <h2 className="font-semibold text-stone-800 text-base">
            {step === 1 && 'Finalizar pedido'}
            {step === 2 && 'Confirmar pedido'}
            {step === 3 && '¡Pedido recibido!'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500">
            <X size={18} />
          </button>
        </div>

        {/* Step bar */}
        {step < 3 && <StepBar step={step} />}

        {/* Divider */}
        <div className="border-t border-stone-100 flex-shrink-0" />

        {/* Content scrollable */}
        <div className="flex-1 overflow-y-auto">

          {/* PASO 1: Datos */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Nombre completo <span className="text-red-400">*</span></label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="María García" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Teléfono <span className="text-red-400">*</span></label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+51 900 000 000" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Email <span className="text-red-400">*</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="maria@email.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Dirección de envío <span className="text-red-400">*</span></label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className={inputClass} placeholder="Calle, número, distrito, ciudad" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Notas <span className="text-stone-400 font-normal">(opcional)</span></label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Instrucciones especiales, referencias, etc." />
              </div>

              {error && <p className="text-red-500 text-xs bg-red-50 rounded-xl px-4 py-2">{error}</p>}

              {/* Resumen rápido */}
              <div className="bg-stone-50 rounded-xl p-3 space-y-1.5">
                <p className="text-xs font-medium text-stone-600 mb-2">Tu pedido ({items.length} {items.length === 1 ? 'producto' : 'productos'})</p>
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
                      {item.product.imagenes[0] && <Image src={item.product.imagenes[0]} alt={item.product.nombre} fill className="object-cover" sizes="32px" />}
                    </div>
                    <p className="flex-1 text-xs text-stone-700 line-clamp-1">{item.product.nombre}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</p>
                    <span className="text-xs font-semibold text-stone-700">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-stone-200 pt-2 flex justify-between">
                  <span className="text-xs font-semibold text-stone-700">Total</span>
                  <span className="text-xs font-bold text-stone-800">{formatPrice(totalVal)}</span>
                </div>
              </div>

              <button type="submit" className="w-full bg-stone-800 text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-stone-700 transition-colors">
                Continuar →
              </button>
            </form>
          )}

          {/* PASO 2: Resumen */}
          {step === 2 && (
            <div className="p-5 space-y-4">
              {/* Datos */}
              <div className="bg-stone-50 rounded-xl p-4 space-y-1.5">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-semibold text-stone-700">Datos de entrega</p>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 px-3 py-1 rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                </div>
                {[['Nombre', name], ['Email', email], ['Teléfono', phone], ['Dirección', address], notes && ['Notas', notes]].filter(Boolean).map(([k, v]) => (
                  <p key={k as string} className="text-xs text-stone-600"><span className="font-medium">{k}:</span> {v}</p>
                ))}
              </div>

              {/* Productos */}
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white border border-stone-100 rounded-xl p-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                      {item.product.imagenes[0] && <Image src={item.product.imagenes[0]} alt={item.product.nombre} fill className="object-cover" sizes="48px" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 line-clamp-1">{item.product.nombre}</p>
                      {Object.entries(item.options).length > 0 && (
                        <p className="text-xs text-stone-400">{Object.values(item.options).join(' · ')}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-stone-800">{formatPrice(item.unitPrice * item.quantity)}</p>
                      {item.quantity > 1 && <p className="text-xs text-stone-400">×{item.quantity}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-3 border-t border-stone-200">
                <span className="font-semibold text-stone-700">Total</span>
                <span className="text-lg font-bold text-stone-800">{formatPrice(totalVal)}</span>
              </div>

              <div className="bg-stone-50 border border-stone-100 rounded-xl p-3">
                <p className="text-xs text-stone-500 text-center">
                  El pago se coordina directamente por WhatsApp. No se cobra nada ahora.
                </p>
              </div>

              {error && <p className="text-red-500 text-xs bg-red-50 rounded-xl px-4 py-2">{error}</p>}

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-stone-800 text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-stone-700 transition-colors disabled:opacity-60"
              >
                {loading ? 'Enviando...' : 'Confirmar pedido'}
              </button>
            </div>
          )}

          {/* PASO 3: Confirmado */}
          {step === 3 && (
            <div className="p-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-stone-800 mb-1">¡Pedido recibido!</h3>
                <p className="text-sm text-stone-500">Te contactaremos al número que dejaste para coordinar el pago y envío por WhatsApp.</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-xs text-stone-400 mb-1">Número de pedido</p>
                <p className="font-mono text-stone-700 text-xs break-all">{orderId}</p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href={`/pedido/${orderId}`}
                  onClick={onClose}
                  className="block w-full bg-stone-800 text-white py-3 rounded-2xl font-semibold text-sm hover:bg-stone-700 transition-colors"
                >
                  Ver estado de mi pedido
                </Link>
                <button onClick={onClose} className="text-stone-400 text-sm py-2">
                  Seguir comprando
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
