'use client'
import { useEffect } from 'react'
import { useSettings } from '@/stores/settings'

export default function SettingsInit({ whatsappNumber }: { whatsappNumber: string }) {
  const setWhatsappNumber = useSettings(s => s.setWhatsappNumber)
  useEffect(() => {
    setWhatsappNumber(whatsappNumber)
  }, [whatsappNumber, setWhatsappNumber])
  return null
}
