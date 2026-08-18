'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Producto } from '@/lib/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Producto, quantity: number, options: Record<string, string>, unitPrice: number) => void
  removeItem: (productId: string, options: Record<string, string>) => void
  updateQuantity: (productId: string, options: Record<string, string>, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  total: () => number
  count: () => number
}

function sameOptions(a: Record<string, string>, b: Record<string, string>) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity, options, unitPrice) => {
        set(state => {
          const existing = state.items.findIndex(
            i => i.product.id === product.id && sameOptions(i.options, options)
          )
          if (existing >= 0) {
            const items = [...state.items]
            items[existing] = { ...items[existing], quantity: items[existing].quantity + quantity }
            return { items, isOpen: true }
          }
          return { items: [...state.items, { product, quantity, options, unitPrice }], isOpen: true }
        })
      },

      removeItem: (productId, options) => {
        set(state => ({
          items: state.items.filter(i => !(i.product.id === productId && sameOptions(i.options, options)))
        }))
      },

      updateQuantity: (productId, options, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, options)
          return
        }
        set(state => ({
          items: state.items.map(i =>
            i.product.id === productId && sameOptions(i.options, options)
              ? { ...i, quantity }
              : i
          )
        }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'artesanias-cart',
      partialize: state => ({ items: state.items }),
    }
  )
)
