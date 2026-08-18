'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gem, Box, Frame, Sparkles, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import CartButton from '@/components/cart/CartButton'
import CartDrawer from '@/components/cart/CartDrawer'
import ConsultaNavButton from '@/components/consulta/ConsultaNavButton'
import ConsultaDrawer from '@/components/consulta/ConsultaDrawer'
import Image from 'next/image'

const links = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/piezas-unicas', label: 'Piedras', icon: Gem },
  { href: '/cemento', label: 'Cemento', icon: Box },
  { href: '/cuadros-mdf', label: 'MDF', icon: Frame },
  { href: '/personalizado', label: 'Personalizado', icon: Sparkles },
]

export default function Navbar() {
  const pathname = usePathname()

  const isDashboard = pathname.startsWith('/dashboard') || pathname === '/login'

  return (
    <>
      {/* Top bar — desktop only */}
      <header className="hidden md:block sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-200">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image src="/logo_desktop.png" alt="Artesanías de Lanita" width={160} height={52} className="h-10 w-auto object-contain" priority />
          </Link>
          <div className="flex items-center gap-6">
            <ul className="flex items-center gap-8">
              {links.map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      'text-sm font-medium transition-colors',
                      pathname === l.href ? 'text-stone-900' : 'text-stone-500 hover:text-stone-900'
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-1">
              <ConsultaNavButton />
              <CartButton />
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-200">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image src="/logo_mobile.png" alt="Artesanías de Lanita" width={140} height={48} className="h-10 w-auto object-contain" priority />
          </Link>
          {!isDashboard && (
            <div className="flex items-center gap-1">
              <ConsultaNavButton />
              <CartButton />
            </div>
          )}
        </div>
      </header>

      {/* Mobile bottom navigation */}
      {!isDashboard && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 safe-area-inset-bottom">
          <ul className="flex items-center justify-around px-2 py-1">
            {links.map(l => {
              const Icon = l.icon
              const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href))
              return (
                <li key={l.href} className="flex-1 relative">
                  <Link
                    href={l.href}
                    className={cn(
                      'flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-colors',
                      active ? 'text-stone-900' : 'text-stone-400'
                    )}
                  >
                    <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                    <span className={cn('text-[10px] font-medium leading-none', active ? 'text-stone-900' : 'text-stone-400')}>
                      {l.label}
                    </span>
                    {active && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-stone-800" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      {/* Drawers globales */}
      {!isDashboard && <CartDrawer />}
      {!isDashboard && <ConsultaDrawer />}
    </>
  )
}
