'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import type { Profile, VendorSettings } from '@/lib/types'
import Image from 'next/image'
import { Upload } from 'lucide-react'

interface Props {
  profile: Profile
  settings: VendorSettings | null
}

export default function ConfiguracionForm({ profile, settings }: Props) {
  const [whatsapp, setWhatsapp] = useState(settings?.whatsapp_number ?? '')
  const [storeName, setStoreName] = useState(settings?.store_name ?? '')
  const [photoUrl, setPhotoUrl] = useState(settings?.store_photo_url ?? '')
  const [newPhoto, setNewPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!whatsapp.trim()) { setError('El número de WhatsApp es obligatorio.'); return }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const supabase = createClient()
      let finalPhotoUrl = photoUrl

      if (newPhoto) {
        const ext = newPhoto.name.split('.').pop()
        const path = `perfiles/${profile.id}.${ext}`
        const { error: upErr } = await supabase.storage.from('imagenes').upload(path, newPhoto, { upsert: true })
        if (upErr) throw new Error(upErr.message)
        const { data: { publicUrl } } = supabase.storage.from('imagenes').getPublicUrl(path)
        finalPhotoUrl = publicUrl
      }

      const payload = {
        profile_id: profile.id,
        whatsapp_number: whatsapp.trim(),
        store_name: storeName.trim() || null,
        store_photo_url: finalPhotoUrl || null,
        updated_at: new Date().toISOString(),
      }

      if (settings?.id) {
        const { error: updateErr } = await supabase.from('vendor_settings').update(payload).eq('id', settings.id)
        if (updateErr) throw updateErr
      } else {
        const { error: insertErr } = await supabase.from('vendor_settings').insert(payload)
        if (insertErr) throw insertErr
      }

      if (newPhoto) setPhotoUrl(finalPhotoUrl)
      setNewPhoto(null)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-stone-50 rounded-2xl p-4">
        <p className="text-sm text-stone-500">Cuenta: <span className="font-medium text-stone-700">{profile.email}</span></p>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Número de WhatsApp <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={whatsapp}
          onChange={e => setWhatsapp(e.target.value)}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
          placeholder="51943631914"
        />
        <p className="text-xs text-stone-400 mt-1">Con código de país, sin espacios ni símbolos. Ej: 51943631914</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Nombre de la tienda</label>
        <input
          type="text"
          value={storeName}
          onChange={e => setStoreName(e.target.value)}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
          placeholder="Artesanías de la casa"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Foto de perfil / logo</label>
        <div className="flex items-center gap-4">
          {(photoUrl || newPhoto) && (
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-stone-200">
              <Image
                src={newPhoto ? URL.createObjectURL(newPhoto) : photoUrl}
                alt="Logo"
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          )}
          <label className="cursor-pointer flex items-center gap-2 text-sm text-stone-600 border border-stone-200 rounded-xl px-4 py-2 hover:bg-stone-50 transition-colors">
            <Upload size={16} />
            {photoUrl || newPhoto ? 'Cambiar foto' : 'Subir foto'}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) setNewPhoto(f)
                if (fileRef.current) fileRef.current.value = ''
              }}
            />
          </label>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}
      {success && <p className="text-green-600 text-sm bg-green-50 rounded-xl px-4 py-3">Configuración guardada correctamente.</p>}

      <Button type="submit" disabled={loading} size="lg">
        {loading ? 'Guardando...' : 'Guardar configuración'}
      </Button>
    </form>
  )
}
