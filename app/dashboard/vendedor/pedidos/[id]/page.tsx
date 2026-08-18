import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Order, OrderItem } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
import OrderStatusSelect from './OrderStatusSelect'

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, customer:customers(*), order_items(*, producto:productos(nombre, imagenes))')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const o = order as Order & {
    customer: { name: string; email: string; phone: string | null; telegram_username: string | null } | null
    order_items: (OrderItem & { producto: { nombre: string; imagenes: string[] } })[]
  }

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/vendedor/pedidos" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-6">
        <ChevronLeft size={16} /> Pedidos
      </Link>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-serif font-semibold text-stone-800 mb-1">Pedido</h1>
          <p className="font-mono text-stone-500 text-sm">{o.id}</p>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full font-medium border ${o.source === 'telegram' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-stone-100 text-stone-600 border-stone-200'}`}>
          {o.source === 'telegram' ? 'Telegram' : 'Web'}
        </span>
      </div>

      {/* Status */}
      <div className="bg-white border border-stone-100 rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-medium text-stone-700 mb-3">Estado del pedido</h2>
        <OrderStatusSelect orderId={o.id} currentStatus={o.status} />
      </div>

      {/* Customer */}
      {o.customer && (
        <div className="bg-white border border-stone-100 rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-medium text-stone-700 mb-3">Cliente</h2>
          <div className="space-y-1.5 text-sm">
            <p><span className="text-stone-400">Nombre:</span> <span className="text-stone-800 font-medium">{o.customer.name}</span></p>
            <p><span className="text-stone-400">Email:</span> <span className="text-stone-800">{o.customer.email}</span></p>
            {o.customer.phone && <p><span className="text-stone-400">Teléfono:</span> <span className="text-stone-800">{o.customer.phone}</span></p>}
            {o.customer.telegram_username && <p><span className="text-stone-400">Telegram:</span> <span className="text-stone-800">@{o.customer.telegram_username}</span></p>}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white border border-stone-100 rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-medium text-stone-700 mb-3">Productos</h2>
        <div className="space-y-3">
          {o.order_items?.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                {item.producto?.imagenes[0] && (
                  <Image src={item.producto.imagenes[0]} alt={item.producto.nombre} fill className="object-cover" sizes="48px" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-800">{item.producto?.nombre}</p>
                {item.options && Object.keys(item.options).length > 0 && (
                  <p className="text-xs text-stone-400">
                    {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-stone-800">{formatPrice(item.unit_price * item.quantity)}</p>
                <p className="text-xs text-stone-400">x{item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-stone-100 mt-4 pt-4 flex justify-between">
          <span className="font-semibold text-stone-700">Total</span>
          <span className="text-lg font-bold text-stone-800">{formatPrice(o.total)}</span>
        </div>
      </div>

      {/* Shipping */}
      {(o.shipping_address || o.notes) && (
        <div className="bg-white border border-stone-100 rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-medium text-stone-700 mb-3">Envío</h2>
          {o.shipping_address && <p className="text-sm text-stone-600 mb-1"><span className="text-stone-400">Dirección:</span> {o.shipping_address}</p>}
          {o.notes && <p className="text-sm text-stone-600"><span className="text-stone-400">Notas:</span> {o.notes}</p>}
        </div>
      )}

      <p className="text-xs text-stone-400 text-center">
        Pedido {new Date(o.created_at).toLocaleString('es-PE')} · Actualizado {new Date(o.updated_at).toLocaleString('es-PE')}
      </p>
    </div>
  )
}
