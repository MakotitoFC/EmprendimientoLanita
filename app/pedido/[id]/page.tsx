import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Order, OrderItem } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Recibido — en revisión', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  validated: { label: 'Confirmado',             color: 'text-blue-600 bg-blue-50 border-blue-200' },
  delivered: { label: 'Entregado',              color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
}

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, customer:customers(*), order_items(*, producto:productos(nombre, imagenes))')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const o = order as Order & { order_items: (OrderItem & { producto: { nombre: string; imagenes: string[] } })[] }
  const cfg = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.pending

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-14">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-800 mb-8 inline-block">
        ← Volver al inicio
      </Link>

      <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-stone-400 mb-1">Pedido</p>
              <p className="font-mono text-stone-600 text-sm break-all">{o.id.slice(0, 8)}…</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="p-6 space-y-3 border-b border-stone-100">
          <p className="text-sm font-medium text-stone-700 mb-3">Productos</p>
          {o.order_items?.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
                {item.producto?.imagenes[0] && (
                  <img src={item.producto.imagenes[0]} alt={item.producto.nombre} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 line-clamp-1">{item.producto?.nombre}</p>
                {item.options && Object.keys(item.options).length > 0 && (
                  <p className="text-xs text-stone-400">
                    {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-stone-800">{formatPrice(item.unit_price * item.quantity)}</p>
                <p className="text-xs text-stone-400">x{item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Total + address */}
        <div className="p-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-stone-500">Total</span>
            <span className="text-sm font-bold text-stone-800">{formatPrice(o.total)}</span>
          </div>
          {o.shipping_address && (
            <div>
              <span className="text-xs text-stone-400">Dirección</span>
              <p className="text-sm text-stone-600 mt-0.5">{o.shipping_address}</p>
            </div>
          )}
          {o.notes && (
            <div>
              <span className="text-xs text-stone-400">Notas</span>
              <p className="text-sm text-stone-600 mt-0.5">{o.notes}</p>
            </div>
          )}
          {o.confirmed_at && (
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs mt-1">
              <CheckCircle size={13} />
              Comentario enviado el {new Date(o.confirmed_at).toLocaleDateString('es-PE', { dateStyle: 'long' })}
            </div>
          )}
          <p className="text-xs text-stone-400 pt-2">
            Pedido realizado el {new Date(o.created_at).toLocaleDateString('es-PE', { dateStyle: 'long' })}
          </p>
        </div>
      </div>

      <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
        <p className="text-sm text-indigo-800">
          ¿Tenés preguntas sobre tu pedido? Escribinos por WhatsApp o Telegram.
        </p>
      </div>
    </div>
  )
}
