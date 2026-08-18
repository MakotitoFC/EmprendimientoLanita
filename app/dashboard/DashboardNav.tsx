'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Package, Image as ImageIcon, Tag, Settings, Users, LogOut, ShoppingCart, UserCircle, LayoutDashboard } from 'lucide-react'

interface Props {
  role: string
  name: string
}

const vendorLinks = [
  { href: '/dashboard/vendedor', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/vendedor/productos', label: 'Productos', icon: Package, exact: false },
  { href: '/dashboard/vendedor/pedidos', label: 'Pedidos', icon: ShoppingCart, exact: false },
  { href: '/dashboard/vendedor/clientes', label: 'Clientes', icon: UserCircle, exact: false },
  { href: '/dashboard/vendedor/disenios', label: 'Diseños', icon: ImageIcon, exact: false },
  { href: '/dashboard/vendedor/promociones', label: 'Promociones', icon: Tag, exact: false },
  { href: '/dashboard/vendedor/configuracion', label: 'Config', icon: Settings, exact: false },
]

const adminLinks = [
  { href: '/dashboard/admin', label: 'Usuarios', icon: Users, exact: true },
  { href: '/dashboard/vendedor', label: 'Productos', icon: Package, exact: true },
  { href: '/dashboard/vendedor/pedidos', label: 'Pedidos', icon: ShoppingCart, exact: false },
  { href: '/dashboard/vendedor/clientes', label: 'Clientes', icon: UserCircle, exact: false },
]

export default function DashboardNav({ role, name }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const links = role === 'admin' ? adminLinks : vendorLinks

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-white border-b border-stone-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-stone-800 font-serif font-semibold text-base">
            Artesanías
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => {
              const Icon = l.icon
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    l.exact ? pathname === l.href : pathname.startsWith(l.href)
                      ? 'bg-stone-100 text-stone-900'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  )}
                >
                  <Icon size={15} />
                  {l.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone-500 hidden md:block">{name}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors px-2 py-1.5 rounded-lg hover:bg-stone-100"
          >
            <LogOut size={15} />
            <span className="hidden md:block">Salir</span>
          </button>
        </div>
      </div>
    </header>
  )
}
