import { createClient } from '@/lib/supabase/server'
import DisenioForm from '../DisenioForm'
import type { Producto } from '@/lib/types'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NuevoDisenioPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('productos').select('*').eq('is_active', true).in('tipo', ['cemento', 'mdf'])
  return (
    <div>
      <Link href="/dashboard/vendedor/disenios" className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-6">
        <ChevronLeft size={16} /> Volver
      </Link>
      <h1 className="text-2xl font-serif font-semibold text-stone-800 mb-8">Nuevo diseño de ejemplo</h1>
      <DisenioForm productos={(data as Producto[]) ?? []} />
    </div>
  )
}
