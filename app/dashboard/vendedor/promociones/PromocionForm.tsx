'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import type { Promocion, Producto } from '@/lib/types'

interface Props {
  promocion?: Promocion
  productos: Producto[]
  productosAplican?: string[]
}

export default function PromocionForm({ promocion, productos, productosAplican = [] }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [nombre, setNombre] = useState(promocion?.nombre ?? '')
  const [tipoDescuento, setTipoDescuento] = useState<'porcentaje' | 'fijo'>(promocion?.tipo_descuento ?? 'porcentaje')
  const [valor, setValor] = useState(promocion?.valor_descuento?.toString() ?? '')
  const [fechaInicio, setFechaInicio] = useState(promocion?.fecha_inicio?.slice(0, 10) ?? '')
  const [fechaFin, setFechaFin] = useState(promocion?.fecha_fin?.slice(0, 10) ?? '')
  const [isActive, setIsActive] = useState(promocion?.is_active ?? true)
  const [todosLosProductos, setTodosLosProductos] = useState(productosAplican.length === 0)
  const [selectedProductos, setSelectedProductos] = useState<string[]>(productosAplican)

  const toggleProducto = (id: string) => {
    setSelectedProductos(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    if (!valor) { setError('El valor del descuento es obligatorio.'); return }
    if (!fechaInicio || !fechaFin) { setError('Las fechas son obligatorias.'); return }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      const payload = {
        nombre: nombre.trim(),
        tipo_descuento: tipoDescuento,
        valor_descuento: parseFloat(valor),
        fecha_inicio: new Date(fechaInicio).toISOString(),
        fecha_fin: new Date(fechaFin + 'T23:59:59').toISOString(),
        is_active: isActive,
      }

      let promocionId = promocion?.id

      if (promocion?.id) {
        const { error: updateErr } = await supabase.from('promociones').update(payload).eq('id', promocion.id)
        if (updateErr) throw updateErr
        await supabase.from('promociones_productos').delete().eq('promocion_id', promocion.id)
      } else {
        const { data, error: insertErr } = await supabase.from('promociones').insert(payload).select('id').single()
        if (insertErr) throw insertErr
        promocionId = data.id
      }

      if (!todosLosProductos && selectedProductos.length > 0 && promocionId) {
        await supabase.from('promociones_productos').insert(
          selectedProductos.map(pid => ({ promocion_id: promocionId, producto_id: pid }))
        )
      }

      router.push('/dashboard/vendedor/promociones')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Nombre <span className="text-red-500">*</span></label>
        <input value={nombre} onChange={e => setNombre(e.target.value)}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
          placeholder="Ej: Descuento de verano" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Tipo de descuento</label>
          <select value={tipoDescuento} onChange={e => setTipoDescuento(e.target.value as 'porcentaje' | 'fijo')}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800">
            <option value="porcentaje">Porcentaje (%)</option>
            <option value="fijo">Monto fijo ($)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Valor <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 text-sm">
              {tipoDescuento === 'porcentaje' ? '%' : '$'}
            </span>
            <input type="number" min="0" step="0.01" value={valor} onChange={e => setValor(e.target.value)}
              className="w-full border border-stone-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
              placeholder="10" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Fecha inicio <span className="text-red-500">*</span></label>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Fecha fin <span className="text-red-500">*</span></label>
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800" />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-stone-700 mb-2">¿A qué productos aplica?</p>
        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <input type="radio" checked={todosLosProductos} onChange={() => setTodosLosProductos(true)} className="accent-stone-800" />
          <span className="text-sm text-stone-700">Todos los productos</span>
        </label>
        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <input type="radio" checked={!todosLosProductos} onChange={() => setTodosLosProductos(false)} className="accent-stone-800" />
          <span className="text-sm text-stone-700">Productos específicos</span>
        </label>
        {!todosLosProductos && (
          <div className="pl-5 space-y-2 max-h-48 overflow-y-auto">
            {productos.map(p => (
              <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={selectedProductos.includes(p.id)} onChange={() => toggleProducto(p.id)} className="accent-stone-800 w-4 h-4" />
                <span className="text-sm text-stone-700">{p.nombre}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-stone-800 w-4 h-4" />
        <span className="text-sm text-stone-700">Activa</span>
      </label>

      {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : promocion ? 'Guardar cambios' : 'Crear promoción'}</Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </form>
  )
}
