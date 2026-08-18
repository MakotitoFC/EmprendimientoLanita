import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { ShoppingCart, Package, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import type { Order } from '@/lib/types'

export default async function DashboardHomePage() {
  const supabase = await createClient()

  const [
    { data: orders },
    { count: totalProductos },
    { count: totalClientes },
  ] = await Promise.all([
    supabase.from('orders').select('id, status, total, created_at, source').order('created_at', { ascending: false }).limit(5),
    supabase.from('productos').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
  ])

  const allOrders = (orders as Order[]) ?? []

  // KPIs
  const pending = allOrders.filter(o => o.status === 'pending').length
  const totalVentas = allOrders.filter(o => !['cancelled', 'pending'].includes(o.status))
    .reduce((s, o) => s + o.total, 0)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-serif font-semibold text-stone-800">Panel</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={ShoppingCart}
          label="Pedidos pendientes"
          value={String(pending)}
          accent={pending > 0 ? 'indigo' : 'stone'}
          href="/dashboard/vendedor/pedidos?status=pending"
        />
        <KpiCard
          icon={TrendingUp}
          label="Ventas totales"
          value={formatPrice(totalVentas)}
          accent="green"
          href="/dashboard/vendedor/pedidos"
        />
        <KpiCard
          icon={Package}
          label="Productos activos"
          value={String(totalProductos ?? 0)}
          accent="stone"
          href="/dashboard/vendedor/productos"
        />
        <KpiCard
          icon={Users}
          label="Clientes"
          value={String(totalClientes ?? 0)}
          accent="stone"
          href="/dashboard/vendedor/clientes"
        />
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-700">Últimos pedidos</h2>
          <Link href="/dashboard/vendedor/pedidos" className="text-sm text-stone-500 hover:text-stone-800">
            Ver todos →
          </Link>
        </div>

        {allOrders.length === 0 ? (
          <div className="bg-white border border-stone-100 rounded-2xl p-10 text-center text-stone-400">
            <ShoppingCart size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Todavía no hay pedidos.</p>
          </div>
        ) : (
          <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-medium text-stone-600">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600 hidden md:table-cell">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600 hidden md:table-cell">Origen</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Fecha</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map(o => (
                  <tr key={o.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-stone-400">{o.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3">
                      <StatusDot status={o.status} />
                    </td>
                    <td className="px-4 py-3 font-medium text-stone-700 hidden md:table-cell">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${o.source === 'telegram' ? 'bg-blue-50 text-blue-700' : 'bg-stone-100 text-stone-600'}`}>
                        {o.source === 'telegram' ? 'Telegram' : 'Web'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-400 text-xs">
                      {new Date(o.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/vendedor/pedidos/${o.id}`} className="text-xs text-stone-500 hover:text-stone-800 underline">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, accent, href }: {
  icon: React.ElementType
  label: string
  value: string
  accent: 'indigo' | 'green' | 'stone'
  href: string
}) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-green-50 text-green-700',
    stone: 'bg-stone-100 text-stone-600',
  }
  return (
    <Link href={href} className="bg-white border border-stone-100 rounded-2xl p-5 hover:border-stone-200 transition-colors">
      <div className={`inline-flex p-2 rounded-xl mb-3 ${colors[accent]}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold text-stone-800 mb-0.5">{value}</p>
      <p className="text-xs text-stone-400">{label}</p>
    </Link>
  )
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-indigo-400', confirmed: 'bg-blue-400', paid: 'bg-green-400',
    processing: 'bg-purple-400', shipped: 'bg-indigo-400', delivered: 'bg-emerald-500',
    cancelled: 'bg-red-400',
  }
  const labels: Record<string, string> = {
    pending: 'Pendiente', confirmed: 'Confirmado', paid: 'Pagado',
    processing: 'En proceso', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
  }
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[status] ?? 'bg-stone-300'}`} />
      <span className="text-xs text-stone-600">{labels[status] ?? status}</span>
    </span>
  )
}

