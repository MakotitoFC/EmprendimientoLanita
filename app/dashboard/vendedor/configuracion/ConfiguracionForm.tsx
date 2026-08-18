'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import type { Profile, VendorSettings } from '@/lib/types'
import Image from 'next/image'
import { Upload, Send } from 'lucide-react'

interface Props {
  profile: Profile
  settings: VendorSettings | null
}

export default function ConfiguracionForm({ profile, settings }: Props) {
  const [whatsapp, setWhatsapp] = useState(settings?.whatsapp_number ?? '')
  const [storeName, setStoreName] = useState(settings?.store_name ?? '')
  const [photoUrl, setPhotoUrl] = useState(settings?.store_photo_url ?? '')
  const [newPhoto, setNewPhoto] = useState<File | null>(null)
  const [telegramToken, setTelegramToken] = useState(settings?.telegram_bot_token ?? '')
  const [telegramChatId, setTelegramChatId] = useState(settings?.telegram_chat_id ?? '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [testMsg, setTestMsg] = useState('')
  const [testLoading, setTestLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        telegram_bot_token: telegramToken.trim() || null,
        telegram_chat_id: telegramChatId.trim() || null,
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

  const handleTestTelegram = async () => {
    if (!telegramToken.trim() || !telegramChatId.trim()) {
      setTestMsg('Completá el token y chat ID primero.')
      return
    }
    setTestLoading(true)
    setTestMsg('')
    try {
      const res = await fetch(`https://api.telegram.org/bot${telegramToken.trim()}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegramChatId.trim(), text: '✅ Conexión Telegram OK desde Artesanías!' }),
      })
      const json = await res.json()
      if (json.ok) setTestMsg('✅ Mensaje enviado. Revisá tu Telegram.')
      else setTestMsg(`❌ Error: ${json.description}`)
    } catch {
      setTestMsg('❌ No se pudo conectar con Telegram.')
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-stone-50 rounded-2xl p-4">
        <p className="text-sm text-stone-500">Cuenta: <span className="font-medium text-stone-700">{profile.email}</span></p>
      </div>

      {/* Tienda */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Tienda</h3>

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
          <label className="block text-sm font-medium text-stone-700 mb-1">WhatsApp (legacy)</label>
          <input
            type="text"
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
            placeholder="51943631914"
          />
          <p className="text-xs text-stone-400 mt-1">Con código de país, sin espacios. Ej: 51943631914</p>
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
      </div>

      {/* Telegram */}
      <div className="space-y-4 border-t border-stone-100 pt-6">
        <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Bot de Telegram</h3>
        <p className="text-xs text-stone-400">Crea tu bot con @BotFather en Telegram. El bot notificará pedidos nuevos automáticamente.</p>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Bot Token</label>
          <input
            type="text"
            value={telegramToken}
            onChange={e => setTelegramToken(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 font-mono"
            placeholder="makotitofc"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Chat ID del vendedor</label>
          <input
            type="text"
            value={telegramChatId}
            onChange={e => setTelegramChatId(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 font-mono"
            placeholder="-100123456789"
          />
          <p className="text-xs text-stone-400 mt-1">Obtenelo enviando /start a @userinfobot en Telegram.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleTestTelegram}
            disabled={testLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-60"
          >
            <Send size={15} />
            {testLoading ? 'Enviando...' : 'Probar conexión'}
          </button>
          {testMsg && <p className="text-sm text-stone-600">{testMsg}</p>}
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
