'use client'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  whatsappNumber: string
  message?: string
  size?: 'sm' | 'md' | 'lg'
  layout?: 'row' | 'col'
  className?: string
}

export default function ContactButtons({
  whatsappNumber,
  message = 'Hola! Vi tu catálogo y quiero consultar sobre un producto 😊',
  size = 'md',
  layout = 'row',
  className,
}: Props) {
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

  const sizes = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-sm gap-2',
  }

  const base = `inline-flex items-center justify-center font-medium rounded-xl transition-colors active:scale-[0.98] ${sizes[size]}`

  return (
    <div className={cn('flex', layout === 'col' ? 'flex-col' : 'flex-row flex-wrap', 'gap-2', className)}>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(base, 'bg-green-600 text-white hover:bg-green-500')}
      >
        <MessageCircle size={size === 'sm' ? 14 : 16} />
        WhatsApp
      </a>
    </div>
  )
}
