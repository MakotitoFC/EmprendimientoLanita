import { createClient } from '@/lib/supabase/server'
import type { Customer } from '@/lib/types'

export default async function ClientesPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const customers = (data as Customer[]) ?? []

  return (
    <div>
      <h1 className="text-2xl font-serif font-semibold text-stone-800 mb-6">
        Clientes <span className="text-stone-400 font-sans text-lg font-normal">({customers.length})</span>
      </h1>

      {customers.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p>No hay clientes todavía. Aparecerán cuando llegue el primer pedido.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600 hidden md:table-cell">Teléfono</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600 hidden md:table-cell">Telegram</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600 hidden md:table-cell">Desde</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-stone-800">{c.name}</td>
                    <td className="px-4 py-3 text-stone-500 text-xs">{c.email}</td>
                    <td className="px-4 py-3 text-stone-500 hidden md:table-cell">{c.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-stone-500 hidden md:table-cell">
                      {c.telegram_username ? `@${c.telegram_username}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-stone-400 text-xs hidden md:table-cell">
                      {new Date(c.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
