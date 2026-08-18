'use client'
import { MessageCircle } from 'lucide-react'

interface Props {
  productoNombre: string
  precioFinal: number
  whatsappNumber: string
  className?: string
  size?: 'sm' | 'lg'
}

export default function ConsultarWAButton({
  productoNombre,
  precioFinal,
  whatsappNumber,
  className = '',
  size = 'lg',
}: Props) {
  const mensaje = `Hola! Quisiera consultar sobre *${productoNombre}* (S/ ${precioFinal.toFixed(0)}). Tengo una pregunta:`

  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`

  const sizeClasses = size === 'lg'
    ? 'py-3 px-5 text-sm'
    : 'py-1.5 px-3 text-xs'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 rounded-2xl border border-stone-300 text-stone-700 font-medium hover:bg-stone-50 transition-colors ${sizeClasses} ${className}`}
    >
      <MessageCircle size={size === 'lg' ? 16 : 13} />
      Consultar por WhatsApp
    </a>
  )
}
