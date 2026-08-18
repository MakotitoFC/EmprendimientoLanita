'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: string
}

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/*
        Mobile  → bottom sheet
        md+     → modal centrado
      */}
      <div className={`
        fixed z-50 bg-white flex flex-col shadow-2xl overflow-hidden
        bottom-0 left-0 right-0 rounded-t-2xl max-h-[92vh]
        md:bottom-auto md:left-1/2 md:top-1/2 md:right-auto
        md:-translate-x-1/2 md:-translate-y-1/2
        md:w-[calc(100%-2rem)] ${maxWidth} md:rounded-2xl md:max-h-[85vh]
      `}>
        {/* Drag handle — solo mobile */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-stone-800">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  )
}
