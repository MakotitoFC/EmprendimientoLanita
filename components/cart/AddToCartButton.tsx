'use client'
import { useCart } from '@/stores/cart'
import { ShoppingBag, Check } from 'lucide-react'
import { useState } from 'react'
import type { Producto } from '@/lib/types'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'

interface Props {
  product: Producto
  unitPrice: number
  options?: Record<string, string>
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function AddToCartButton({ product, unitPrice, options = {}, className, size = 'md' }: Props) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handle = () => {
    addItem(product, 1, options, unitPrice)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  }

  return (
    <button
      onClick={handle}
      className={cn(
        'flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all active:scale-[0.98]',
        added
          ? 'bg-green-600 text-white'
          : 'bg-stone-800 text-white hover:bg-stone-700',
        sizes[size],
        className
      )}
    >
      {added ? <Check size={18} /> : <ShoppingBag size={18} />}
      {added ? '¡Agregado!' : `Agregar al carrito · ${formatPrice(unitPrice)}`}
    </button>
  )
}
