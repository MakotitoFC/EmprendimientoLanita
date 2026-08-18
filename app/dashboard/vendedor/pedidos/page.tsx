import { createClient } from '@/lib/supabase/server'
import type { Order } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import OrderStatusBadge from './OrderStatusBadge'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmado', paid: 'Pagado',
  processing: 'En proceso', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status, page } = await searchParams
  const supabase = await createClient()

  const pageNum = parseInt(page ?? '1')
  const perPage = 20
  const from = (pageNum - 1) * perPage

  let query = supabase
    .from('orders')
    .select('*, customer:customers(name, email, phone)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1)

  if (status && STATUS_LABELS[status]) {
    query = query.eq('status', status)
  }

  const { data, count } = await query
  const orders = (data as (Order & { customer: { name: string; email: string; phone: string | null } | null })[]) ?? []
  const total = count ?? 0
  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <h1 className="text-2xl font-serif font-semibold text-stone-800 mb-6">Pedidos</h1>

      {/* Status filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', ...Object.keys(STATUS_LABELS)].map(s => (
          <Link
            key={s}
            href={s ? `?status=${s}` : '/dashboard/vendedor/pedidos'}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              status === s || (!status && !s)
                ? 'bg-stone-800 text-white border-stone-800'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {s ? STATUS_LABELS[s] : 'Todos'}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p>No hay pedidos {status ? `con estado "${STATUS_LABELS[status]}"` : 'todavía'}.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="text-left px-4 py-3 font-medium text-stone-600">ID</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-600 hidden md:table-cell">Cliente</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-600">Estado</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-600 hidden md:table-cell">Total</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-600 hidden md:table-cell">Origen</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-600">Fecha</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-stone-500">{o.id.slice(0, 8)}…</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="font-medium text-stone-800 text-xs">{o.customer?.name ?? '—'}</p>
                        <p className="text-stone-400 text-xs">{o.customer?.email ?? ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell font-medium text-stone-700">
                        {formatPrice(o.total)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${o.source === 'telegram' ? 'bg-blue-50 text-blue-700' : 'bg-stone-100 text-stone-600'}`}>
                          {o.source === 'telegram' ? 'Telegram' : 'Web'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-400 text-xs">
                        {new Date(o.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/vendedor/pedidos/${o.id}`}
                          className="text-xs text-stone-600 hover:text-stone-900 underline"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Link
                  key={p}
                  href={`?${status ? `status=${status}&` : ''}page=${p}`}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${
                    p === pageNum ? 'bg-stone-800 text-white' : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
