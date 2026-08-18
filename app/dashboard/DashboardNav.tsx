'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  Package, Image as ImageIcon, Tag, Settings,
  Users, LogOut, ShoppingCart, UserCircle,
  LayoutDashboard, ChevronRight,
} from 'lucide-react'

interface Props {
  role: string
  name: string
}

const vendorLinks = [
  { href: '/dashboard/vendedor',               label: 'Inicio',      icon: LayoutDashboard, exact: true  },
  { href: '/dashboard/vendedor/productos',      label: 'Productos',   icon: Package,         exact: false },
  { href: '/dashboard/vendedor/pedidos',        label: 'Pedidos',     icon: ShoppingCart,    exact: false },
  { href: '/dashboard/vendedor/clientes',       label: 'Clientes',    icon: UserCircle,      exact: false },
  { href: '/dashboard/vendedor/disenios',       label: 'Diseños',     icon: ImageIcon,       exact: false },
  { href: '/dashboard/vendedor/promociones',    label: 'Promociones', icon: Tag,             exact: false },
  { href: '/dashboard/vendedor/configuracion',  label: 'Config',      icon: Settings,        exact: false },
]

const adminLinks = [
  { href: '/dashboard/admin',              label: 'Usuarios',  icon: Users,          exact: true  },
  { href: '/dashboard/vendedor/productos', label: 'Productos', icon: Package,        exact: true  },
  { href: '/dashboard/vendedor/pedidos',   label: 'Pedidos',   icon: ShoppingCart,   exact: false },
  { href: '/dashboard/vendedor/clientes',  label: 'Clientes',  icon: UserCircle,     exact: false },
]

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function DashboardNav({ role, name }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const links = role === 'admin' ? adminLinks : vendorLinks

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const pageLabel = links.find(l =>
    l.exact ? pathname === l.href : pathname.startsWith(l.href)
  )?.label ?? 'Panel'

  return (
    <>
      {/* ── SIDEBAR (desktop) ── */}
      <aside className="
        hidden md:flex flex-col
        fixed left-0 top-0 bottom-0 w-64
        bg-stone-900 text-stone-200 z-40
      ">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <p className="text-white font-bold text-xl tracking-wide leading-none">LANITA</p>
          <p className="text-stone-400 text-[10px] uppercase tracking-widest mt-0.5">Arte en cemento</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {links.map(l => {
            const Icon = l.icon
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-stone-400 hover:bg-white/6 hover:text-stone-200'
                )}
              >
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                {l.label}
                {active && <ChevronRight size={13} className="ml-auto opacity-40" />}
              </Link>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials(name)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{name}</p>
              <p className="text-stone-500 text-[11px] capitalize">{role === 'admin' ? 'Administrador' : 'Vendedor'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-stone-400 hover:bg-white/8 hover:text-stone-200 transition-colors"
          >
            <LogOut size={15} />
            Salir del sistema
          </button>
        </div>
      </aside>

      {/* ── TOP BAR (desktop) — título de página + acciones ── */}
      <header className="
        hidden md:flex
        fixed top-0 left-64 right-0 h-14 z-30
        bg-stone-50 border-b border-stone-200
        items-center justify-between px-6
      ">
        <h1 className="font-semibold text-stone-800 text-base">{pageLabel}</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center text-white text-[10px] font-bold">
              {initials(name)}
            </div>
            <span className="text-sm font-medium text-stone-700">{name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-rose-500 hover:text-rose-700 border border-rose-200 hover:border-rose-300 px-3 py-1.5 rounded-full transition-colors"
          >
            <LogOut size={14} />
            Salir
          </button>
        </div>
      </header>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav className="
        md:hidden fixed bottom-0 left-0 right-0 z-40
        bg-stone-900 border-t border-white/10
        flex items-center justify-around px-2 py-2
        safe-area-inset-bottom
      ">
        {links.slice(0, 5).map(l => {
          const Icon = l.icon
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors',
                active ? 'text-white' : 'text-stone-500'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.3 : 1.7} />
              <span className="text-[9px] font-medium">{l.label}</span>
              {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-white" />}
            </Link>
          )
        })}
      </nav>

      {/* ── MOBILE TOP BAR ── */}
      <header className="
        md:hidden sticky top-0 z-30
        bg-stone-900 text-white
        flex items-center justify-between px-4 h-14
        border-b border-white/10
      ">
        <p className="font-bold text-base tracking-wide">LANITA</p>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white text-xs font-bold">
            {initials(name)}
          </div>
          <button onClick={handleLogout} className="text-stone-400 p-1">
            <LogOut size={18} />
          </button>
        </div>
      </header>
    </>
  )
}
