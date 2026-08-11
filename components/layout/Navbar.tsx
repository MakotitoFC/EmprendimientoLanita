'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/piezas-unicas', label: 'Piezas únicas' },
  { href: '/cemento', label: 'Cemento' },
  { href: '/cuadros-mdf', label: 'Cuadros MDF' },
  { href: '/inspiracion', label: 'Inspiración' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-100">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-serif font-semibold text-stone-800 hover:text-stone-600 transition-colors">
          Artesanías
        </Link>

        {/* Desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm text-stone-600 hover:text-stone-900 transition-colors font-medium"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label="Menú"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={cn(
        'md:hidden border-t border-stone-100 bg-white transition-all duration-200 overflow-hidden',
        open ? 'max-h-64' : 'max-h-0'
      )}>
        <ul className="px-4 py-3 space-y-1">
          {links.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block px-3 py-2.5 rounded-lg text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors font-medium"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
