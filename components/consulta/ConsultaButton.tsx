'use client'
import { MessageCircle, Check } from 'lucide-react'
import { useConsulta } from '@/stores/consulta'
import type { Producto } from '@/lib/types'

interface Props {
  product: Producto
  size?: 'sm' | 'md'
  className?: string
}

export default function ConsultaButton({ product, size = 'md', className = '' }: Props) {
  const { addItem, removeItem, hasItem, openConsulta } = useConsulta()
  const added = hasItem(product.id)

  const handleClick = () => {
    if (added) {
      openConsulta()
    } else {
      addItem(product)
    }
  }

  const sizeClass = size === 'sm'
    ? 'px-3 py-1.5 text-xs gap-1.5'
    : 'px-4 py-2.5 text-sm gap-2'

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center rounded-2xl border font-medium transition-colors ${
        added
          ? 'border-stone-800 bg-stone-800 text-white'
          : 'border-stone-300 text-stone-600 hover:border-stone-500 hover:text-stone-800 bg-white'
      } ${sizeClass} ${className}`}
    >
      {added
        ? <><Check size={size === 'sm' ? 12 : 14} /> En lista</>
        : <><MessageCircle size={size === 'sm' ? 12 : 14} /> Consultar</>
      }
    </button>
  )
}
