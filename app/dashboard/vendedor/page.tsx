import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import type { Producto } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil } from 'lucide-react'
import DeleteProductButton from './DeleteProductButton'

export default async function VendedorProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>
}) {
  const { tipo } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('productos').select('*').order('created_at', { ascending: false })
  if (tipo && ['piedra', 'cemento', 'mdf'].includes(tipo)) {
    query = query.eq('tipo', tipo)
  }

  const { data } = await query
  const productos = (data as Producto[]) ?? []

  const tipoLabels: Record<string, string> = {
    piedra: 'Pieza única',
    cemento: 'Cemento',
    mdf: 'MDF',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-semibold text-stone-800">Productos</h1>
        <Link
          href="/dashboard/vendedor/nuevo"
          className="bg-stone-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Nuevo producto
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'piedra', 'cemento', 'mdf'].map(t => (
          <Link
            key={t}
            href={t ? `?tipo=${t}` : '/dashboard/vendedor'}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              tipo === t || (!tipo && !t)
                ? 'bg-stone-800 text-white border-stone-800'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {t ? tipoLabels[t] : 'Todos'}
          </Link>
        ))}
      </div>

      {/* Table */}
      {productos.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p>No hay productos todavía.</p>
          <Link href="/dashboard/vendedor/nuevo" className="text-stone-600 underline mt-2 inline-block text-sm">
            Crear el primero
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-4 py-3 font-medium text-stone-600">Producto</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600 hidden md:table-cell">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600 hidden md:table-cell">Precio base</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Activo</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                        {p.imagenes[0] ? (
                          <Image src={p.imagenes[0]} alt={p.nombre} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="w-full h-full bg-stone-200" />
                        )}
                      </div>
                      <span className="font-medium text-stone-800 line-clamp-1">{p.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-stone-500">
                    {tipoLabels[p.tipo]}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-stone-700">
                    {formatPrice(p.precio_base)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block w-2 h-2 rounded-full ${p.is_active ? 'bg-green-500' : 'bg-stone-300'}`} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/dashboard/vendedor/editar/${p.id}`}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
                      >
                        <Pencil size={15} />
                      </Link>
                      <DeleteProductButton id={p.id} nombre={p.nombre} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
