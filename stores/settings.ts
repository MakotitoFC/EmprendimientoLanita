'use client'
import { create } from 'zustand'

interface SettingsStore {
  whatsappNumber: string
  setWhatsappNumber: (n: string) => void
}

export const useSettings = create<SettingsStore>()(set => ({
  whatsappNumber: '',
  setWhatsappNumber: (whatsappNumber) => set({ whatsappNumber }),
}))
