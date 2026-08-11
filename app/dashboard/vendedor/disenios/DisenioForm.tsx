'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import type { DisenioEjemplo, Producto } from '@/lib/types'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface Props {
  disenio?: DisenioEjemplo
  productos: Producto[]
}

export default function DisenioForm({ disenio, productos }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tipo, setTipo] = useState(disenio?.tipo ?? 'cemento')
  const [productoId, setProductoId] = useState(disenio?.producto_id ?? '')
  const [nombre, setNombre] = useState(disenio?.nombre_diseno ?? '')
  const [descripcion, setDescripcion] = useState(disenio?.descripcion ?? '')
  const [isActive, setIsActive] = useState(disenio?.is_active ?? true)
  const [existingImages, setExistingImages] = useState<string[]>(disenio?.imagenes ?? [])
  const [newImages, setNewImages] = useState<File[]>([])

  const filteredProductos = productos.filter(p => p.tipo === tipo)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    if (!productoId) { setError('Seleccioná un producto relacionado.'); return }
    if (existingImages.length + newImages.length === 0) { setError('Subí al menos una imagen.'); return }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      const newUrls: string[] = []
      for (const file of newImages) {
        const ext = file.name.split('.').pop()
        const path = `disenios/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage.from('imagenes').upload(path, file)
        if (upErr) throw new Error(upErr.message)
        const { data: { publicUrl } } = supabase.storage.from('imagenes').getPublicUrl(path)
        newUrls.push(publicUrl)
      }

      const payload = {
        producto_id: productoId,
        tipo,
        nombre_diseno: nombre.trim(),
        imagenes: [...existingImages, ...newUrls],
        descripcion: descripcion.trim() || null,
        is_active: isActive,
      }

      if (disenio?.id) {
        const { error: updateErr } = await supabase.from('disenos_ejemplo').update(payload).eq('id', disenio.id)
        if (updateErr) throw updateErr
      } else {
        const { error: insertErr } = await supabase.from('disenos_ejemplo').insert(payload)
        if (insertErr) throw insertErr
      }

      router.push('/dashboard/vendedor/disenios')
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
        <label className="block text-sm font-medium text-stone-700 mb-1">Tipo</label>
        <select value={tipo} onChange={e => { setTipo(e.target.value as 'cemento' | 'mdf'); setProductoId('') }}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800">
          <option value="cemento">Cemento</option>
          <option value="mdf">MDF</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Producto relacionado <span className="text-red-500">*</span></label>
        <select value={productoId} onChange={e => setProductoId(e.target.value)}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800">
          <option value="">Seleccioná un producto</option>
          {filteredProductos.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Nombre del diseño <span className="text-red-500">*</span></label>
        <input value={nombre} onChange={e => setNombre(e.target.value)}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
          placeholder="Ej: Maceta terracota con barniz" />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 resize-none"
          placeholder="Color, acabado, detalles..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Imágenes <span className="text-red-500">*</span></label>
        <div className="flex flex-wrap gap-3 mb-2">
          {existingImages.map(url => (
            <div key={url} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-stone-200">
              <Image src={url} alt="" fill className="object-cover" sizes="80px" />
              <button type="button" onClick={() => setExistingImages(p => p.filter(u => u !== url))}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={12} />
              </button>
            </div>
          ))}
          {newImages.map((file, i) => (
            <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-dashed border-stone-200">
              <Image src={URL.createObjectURL(file)} alt="" fill className="object-cover" sizes="80px" />
              <button type="button" onClick={() => setNewImages(p => p.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={12} />
              </button>
            </div>
          ))}
          <label className="w-20 h-20 rounded-xl border-2 border-dashed border-stone-300 hover:border-stone-500 transition-colors flex items-center justify-center cursor-pointer bg-stone-50">
            <Upload size={18} className="text-stone-400" />
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="sr-only"
              onChange={e => { setNewImages(p => [...p, ...Array.from(e.target.files ?? [])]); if (fileInputRef.current) fileInputRef.current.value = '' }} />
          </label>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-stone-800 w-4 h-4" />
        <span className="text-sm text-stone-700">Visible en la galería</span>
      </label>

      {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : disenio ? 'Guardar cambios' : 'Crear diseño'}</Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </form>
  )
}
