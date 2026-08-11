'use client'
import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { buildWhatsAppUrl } from '@/lib/utils'
import { MessageCircle } from 'lucide-react'

interface WhatsAppModalProps {
  open: boolean
  onClose: () => void
  whatsappNumber: string
  buildMessage: (nombre: string, telefono: string) => string
  title?: string
}

export default function WhatsAppModal({
  open,
  onClose,
  whatsappNumber,
  buildMessage,
  title = 'Consultar por WhatsApp',
}: WhatsAppModalProps) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setError('Por favor ingresá tu nombre.')
      return
    }
    const msg = buildMessage(nombre.trim(), telefono.trim())
    window.open(buildWhatsAppUrl(whatsappNumber, msg), '_blank')
    onClose()
    setNombre('')
    setTelefono('')
    setError('')
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Tu nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nombre}
            onChange={e => { setNombre(e.target.value); setError('') }}
            placeholder="Ej: María García"
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Tu teléfono <span className="text-stone-400">(opcional)</span>
          </label>
          <input
            type="tel"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            placeholder="Ej: +51 903 234 5678"
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" variant="whatsapp" className="w-full" size="lg">
          <MessageCircle size={18} />
          Abrir WhatsApp
        </Button>
        <p className="text-xs text-stone-400 text-center">
          Se va a abrir WhatsApp con tu consulta lista para enviar.
        </p>
      </form>
    </Modal>
  )
}
