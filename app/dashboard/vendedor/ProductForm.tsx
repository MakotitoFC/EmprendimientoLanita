'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import type { Producto, TamanoMDF } from '@/lib/types'
import { Plus, Trash2, Upload, X, GripVertical } from 'lucide-react'
import Image from 'next/image'

interface Props {
  producto?: Producto
  tamanos?: TamanoMDF[]
}

interface TamanoForm {
  id?: string
  nombre: string
  precio: string
  is_available: boolean
}

export default function ProductForm({ producto, tamanos: tamanosProp = [] }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [tipo, setTipo] = useState<string>(producto?.tipo ?? 'piedra')
  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(producto?.descripcion_corta ?? '')
  const [precioBase, setPrecioBase] = useState(producto?.precio_base?.toString() ?? '')
  const [isActive, setIsActive] = useState(producto?.is_active ?? true)

  // Image state: existing URLs + new File objects
  const [existingImages, setExistingImages] = useState<string[]>(producto?.imagenes ?? [])
  const [newImages, setNewImages] = useState<File[]>([])

  // Piedra
  const [piedraDisponible, setPiedraDisponible] = useState(producto?.piedra_disponible ?? true)
  const [piedraResina, setPiedraResina] = useState(producto?.piedra_tiene_resina ?? false)

  // Cemento
  const [cementoResina, setCementoResina] = useState(producto?.cemento_tiene_resina ?? false)
  const [cementoPrecioResina, setCementoPrecioResina] = useState(producto?.cemento_precio_resina?.toString() ?? '')

  // MDF
  const [mdfResina, setMdfResina] = useState(producto?.mdf_tiene_resina ?? false)
  const [mdfPrecioResina, setMdfPrecioResina] = useState(producto?.mdf_precio_resina?.toString() ?? '')
  const [tamanos, setTamanos] = useState<TamanoForm[]>(
    tamanosProp.map(t => ({ id: t.id, nombre: t.nombre, precio: t.precio.toString(), is_available: t.is_available }))
  )

  const addTamano = () => setTamanos(t => [...t, { nombre: '', precio: '', is_available: true }])
  const removeTamano = (i: number) => setTamanos(t => t.filter((_, idx) => idx !== i))
  const updateTamano = (i: number, field: keyof TamanoForm, value: string | boolean) =>
    setTamanos(t => t.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setNewImages(prev => [...prev, ...files])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeExisting = (url: string) => setExistingImages(prev => prev.filter(u => u !== url))
  const removeNew = (i: number) => setNewImages(prev => prev.filter((_, idx) => idx !== i))

  const uploadImages = async (supabase: ReturnType<typeof createClient>): Promise<string[]> => {
    const urls: string[] = []
    for (const file of newImages) {
      const ext = file.name.split('.').pop()
      const path = `productos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('imagenes').upload(path, file)
      if (uploadError) throw new Error(`Error al subir imagen: ${uploadError.message}`)
      const { data: { publicUrl } } = supabase.storage.from('imagenes').getPublicUrl(path)
      urls.push(publicUrl)
    }
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    if (!precioBase) { setError('El precio base es obligatorio.'); return }
    if (existingImages.length + newImages.length === 0) { setError('Subí al menos una imagen.'); return }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const newUrls = await uploadImages(supabase)
      const imagenes = [...existingImages, ...newUrls]

      const payload: Partial<Producto> = {
        tipo: tipo as Producto['tipo'],
        nombre: nombre.trim(),
        descripcion_corta: descripcion.trim() || null,
        precio_base: parseFloat(precioBase),
        imagenes,
        is_active: isActive,
        piedra_disponible: tipo === 'piedra' ? piedraDisponible : null,
        piedra_tiene_resina: tipo === 'piedra' ? piedraResina : null,
        cemento_tiene_resina: tipo === 'cemento' ? cementoResina : null,
        cemento_precio_resina: tipo === 'cemento' && cementoResina ? parseFloat(cementoPrecioResina) || null : null,
        mdf_tiene_resina: tipo === 'mdf' ? mdfResina : null,
        mdf_precio_resina: tipo === 'mdf' && mdfResina ? parseFloat(mdfPrecioResina) || null : null,
      }

      let productoId = producto?.id

      if (producto?.id) {
        const { error: updateError } = await supabase.from('productos').update(payload).eq('id', producto.id)
        if (updateError) throw updateError
      } else {
        const { data, error: insertError } = await supabase.from('productos').insert(payload).select('id').single()
        if (insertError) throw insertError
        productoId = data.id
      }

      // Handle MDF sizes
      if (tipo === 'mdf' && productoId) {
        // Delete removed sizes
        const existingIds = tamanosProp.map(t => t.id)
        const keptIds = tamanos.filter(t => t.id).map(t => t.id!)
        const toDelete = existingIds.filter(id => !keptIds.includes(id))
        if (toDelete.length > 0) {
          await supabase.from('tamanos_mdf').delete().in('id', toDelete)
        }

        for (const t of tamanos) {
          if (!t.nombre || !t.precio) continue
          const tamanoPayload = {
            producto_id: productoId,
            nombre: t.nombre,
            precio: parseFloat(t.precio),
            is_available: t.is_available,
          }
          if (t.id) {
            await supabase.from('tamanos_mdf').update(tamanoPayload).eq('id', t.id)
          } else {
            await supabase.from('tamanos_mdf').insert(tamanoPayload)
          }
        }
      }

      router.push('/dashboard/vendedor')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Tipo */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Tipo de producto</label>
        <select
          value={tipo}
          onChange={e => setTipo(e.target.value)}
          disabled={!!producto}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 disabled:bg-stone-50 disabled:text-stone-500"
        >
          <option value="piedra">Pieza única (piedra)</option>
          <option value="cemento">Objeto de cemento</option>
          <option value="mdf">Cuadro MDF</option>
        </select>
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Nombre <span className="text-red-500">*</span></label>
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
          placeholder="Ej: Piedra con mandala dorado"
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Descripción corta</label>
        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          rows={2}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 resize-none"
          placeholder="Una línea que describe el producto"
        />
      </div>

      {/* Precio */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Precio base <span className="text-red-500">*</span></label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={precioBase}
            onChange={e => setPrecioBase(e.target.value)}
            className="w-full border border-stone-200 rounded-xl pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
            placeholder="0"
          />
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Imágenes <span className="text-red-500">*</span>
          <span className="text-stone-400 font-normal ml-1">(la primera es la principal)</span>
        </label>
        <div className="flex flex-wrap gap-3 mb-3">
          {existingImages.map(url => (
            <div key={url} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-stone-200">
              <Image src={url} alt="" fill className="object-cover" sizes="80px" />
              <button
                type="button"
                onClick={() => removeExisting(url)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {newImages.map((file, i) => (
            <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-stone-200 border-dashed">
              <Image src={URL.createObjectURL(file)} alt="" fill className="object-cover" sizes="80px" />
              <button
                type="button"
                onClick={() => removeNew(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <label className="w-20 h-20 rounded-xl border-2 border-dashed border-stone-300 hover:border-stone-500 transition-colors flex items-center justify-center cursor-pointer bg-stone-50">
            <Upload size={18} className="text-stone-400" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
        </div>
        <p className="text-xs text-stone-400">Podés subir varias fotos de distintos ángulos. Arrastrá para reordenar (próximamente).</p>
      </div>

      {/* Type-specific fields */}
      {tipo === 'piedra' && (
        <div className="bg-amber-50 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-stone-700">Opciones de pieza única</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={piedraDisponible} onChange={e => setPiedraDisponible(e.target.checked)} className="accent-stone-800 w-4 h-4" />
            <span className="text-sm text-stone-700">Disponible para compra</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={piedraResina} onChange={e => setPiedraResina(e.target.checked)} className="accent-stone-800 w-4 h-4" />
            <span className="text-sm text-stone-700">Incluye barniz / resina</span>
          </label>
        </div>
      )}

      {tipo === 'cemento' && (
        <div className="bg-stone-50 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-stone-700">Opciones de cemento</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={cementoResina} onChange={e => setCementoResina(e.target.checked)} className="accent-stone-800 w-4 h-4" />
            <span className="text-sm text-stone-700">Ofrecer barniz / resina como extra</span>
          </label>
          {cementoResina && (
            <div className="pl-7">
              <label className="block text-xs font-medium text-stone-600 mb-1">Precio extra del barniz</label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cementoPrecioResina}
                  onChange={e => setCementoPrecioResina(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl pl-7 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {tipo === 'mdf' && (
        <div className="bg-green-50 rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-stone-700">Opciones de MDF</h3>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-stone-600">Tamaños disponibles</p>
              <button type="button" onClick={addTamano} className="text-xs text-green-700 font-medium flex items-center gap-1 hover:underline">
                <Plus size={13} /> Agregar tamaño
              </button>
            </div>
            <div className="space-y-2">
              {tamanos.map((t, i) => (
                <div key={i} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-stone-200">
                  <GripVertical size={14} className="text-stone-300" />
                  <input
                    value={t.nombre}
                    onChange={e => updateTamano(i, 'nombre', e.target.value)}
                    placeholder="15x15cm"
                    className="flex-1 text-sm focus:outline-none bg-transparent"
                  />
                  <span className="text-stone-300 text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    value={t.precio}
                    onChange={e => updateTamano(i, 'precio', e.target.value)}
                    placeholder="0"
                    className="w-16 text-sm text-right focus:outline-none bg-transparent"
                  />
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={t.is_available} onChange={e => updateTamano(i, 'is_available', e.target.checked)} className="accent-stone-800 w-3 h-3" />
                    <span className="text-xs text-stone-500">Activo</span>
                  </label>
                  <button type="button" onClick={() => removeTamano(i)} className="text-stone-300 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {tamanos.length === 0 && (
                <p className="text-xs text-stone-400">Agregá al menos un tamaño.</p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={mdfResina} onChange={e => setMdfResina(e.target.checked)} className="accent-stone-800 w-4 h-4" />
            <span className="text-sm text-stone-700">Ofrecer barniz / resina como extra</span>
          </label>
          {mdfResina && (
            <div className="pl-7">
              <label className="block text-xs font-medium text-stone-600 mb-1">Precio extra del barniz</label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={mdfPrecioResina}
                  onChange={e => setMdfPrecioResina(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl pl-7 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-stone-800 w-4 h-4" />
        <span className="text-sm text-stone-700">Visible en la tienda</span>
      </label>

      {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? 'Guardando...' : producto ? 'Guardar cambios' : 'Crear producto'}
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
