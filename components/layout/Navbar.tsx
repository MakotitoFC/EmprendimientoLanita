'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gem, Box, Frame, Sparkles, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/piezas-unicas', label: 'Piezas', icon: Gem },
  { href: '/cemento', label: 'Cemento', icon: Box },
  { href: '/cuadros-mdf', label: 'MDF', icon: Frame },
  { href: '/inspiracion', label: 'Ideas', icon: Sparkles },
]

export default function Navbar() {
  const pathname = usePathname()

  // Don't show bottom nav in dashboard
  const isDashboard = pathname.startsWith('/dashboard') || pathname === '/login'

  return (
    <>
      {/* Top bar — desktop only */}
      <header className="hidden md:block sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-100">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-serif font-semibold text-stone-800 hover:text-stone-600 transition-colors">
            Artesanías
          </Link>
          <ul className="flex items-center gap-8">
            {links.slice(1).map(l => (
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
        </nav>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-100">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-serif font-semibold text-stone-800">
            Artesanías
          </Link>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      {!isDashboard && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-100 safe-area-inset-bottom">
          <ul className="flex items-center justify-around px-2 py-1">
            {links.map(l => {
              const Icon = l.icon
              const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href))
              return (
                <li key={l.href} className="flex-1">
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
                      <span className="absolute bottom-0 w-1 h-1 rounded-full bg-stone-800" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      {/* Spacer so content isn't hidden behind bottom nav on mobile */}
      {!isDashboard && <div className="md:hidden h-16" aria-hidden />}
    </>
  )
}
