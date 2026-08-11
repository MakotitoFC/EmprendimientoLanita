import { createClient } from '@/lib/supabase/server'
import PromocionForm from '../PromocionForm'
import type { Producto } from '@/lib/types'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NuevaPromocionPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('productos').select('*').eq('is_active', true)
  return (
    <div>
      <Link href="/dashboard/vendedor/promociones" className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-6">
        <ChevronLeft size={16} /> Volver
      </Link>
      <h1 className="text-2xl font-serif font-semibold text-stone-800 mb-8">Nueva promoción</h1>
      <PromocionForm productos={(data as Producto[]) ?? []} />
    </div>
  )
}
