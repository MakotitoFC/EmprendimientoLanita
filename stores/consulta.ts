'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '@/lib/types'

interface ConsultaStore {
  items: Producto[]
  isOpen: boolean
  addItem: (p: Producto) => void
  removeItem: (id: string) => void
  hasItem: (id: string) => boolean
  openConsulta: () => void
  closeConsulta: () => void
  count: () => number
}

export const useConsulta = create<ConsultaStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (p) => {
        if (get().hasItem(p.id)) return
        set(state => ({ items: [...state.items, p], isOpen: true }))
      },
      removeItem: (id) => set(state => ({ items: state.items.filter(i => i.id !== id) })),
      hasItem: (id) => get().items.some(i => i.id === id),
      openConsulta: () => set({ isOpen: true }),
      closeConsulta: () => set({ isOpen: false }),
      count: () => get().items.length,
    }),
    {
      name: 'artesanias-consulta',
      partialize: state => ({ items: state.items }),
    }
  )
)
