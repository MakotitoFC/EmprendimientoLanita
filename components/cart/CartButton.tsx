'use client'
import { useCart } from '@/stores/cart'
import { ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function CartButton() {
  const { openCart, count } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const n = mounted ? count() : 0

  return (
    <button
      onClick={openCart}
      className="relative p-2 rounded-xl hover:bg-stone-100 text-stone-700 transition-colors"
      aria-label="Abrir carrito"
    >
      <ShoppingBag size={22} strokeWidth={1.8} />
      {mounted && n > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-stone-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {n > 9 ? '9+' : n}
        </span>
      )}
    </button>
  )
}
