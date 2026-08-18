'use client'
import { MessageCircle } from 'lucide-react'
import { useConsulta } from '@/stores/consulta'

export default function ConsultaNavButton() {
  const { count, openConsulta } = useConsulta()
  const n = count()

  return (
    <button
      onClick={openConsulta}
      className="relative p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
      aria-label="Lista de consulta"
    >
      <MessageCircle size={22} strokeWidth={1.8} />
      {n > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-stone-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {n}
        </span>
      )}
    </button>
  )
}
