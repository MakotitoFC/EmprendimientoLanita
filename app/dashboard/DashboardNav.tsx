'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Package, Image as ImageIcon, Tag, Settings, Users, LogOut } from 'lucide-react'

interface Props {
  role: string
  name: string
}

const vendorLinks = [
  { href: '/dashboard/vendedor', label: 'Productos', icon: Package },
  { href: '/dashboard/vendedor/disenios', label: 'Diseños', icon: ImageIcon },
  { href: '/dashboard/vendedor/promociones', label: 'Promociones', icon: Tag },
  { href: '/dashboard/vendedor/configuracion', label: 'Configuración', icon: Settings },
]

const adminLinks = [
  { href: '/dashboard/admin', label: 'Usuarios', icon: Users },
  { href: '/dashboard/vendedor', label: 'Productos', icon: Package },
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
                    pathname === l.href
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
