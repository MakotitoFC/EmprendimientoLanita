import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PromocionForm from '../../PromocionForm'
import type { Promocion, Producto } from '@/lib/types'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function EditarPromocionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: promocion }, { data: productos }, { data: relaciones }] = await Promise.all([
    supabase.from('promociones').select('*').eq('id', id).single(),
    supabase.from('productos').select('*'),
    supabase.from('promociones_productos').select('producto_id').eq('promocion_id', id),
  ])

  if (!promocion) notFound()

  const productosAplican = (relaciones ?? []).map((r: { producto_id: string }) => r.producto_id)

  return (
    <div>
      <Link href="/dashboard/vendedor/promociones" className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-6">
        <ChevronLeft size={16} /> Volver
      </Link>
      <h1 className="text-2xl font-serif font-semibold text-stone-800 mb-8">Editar promoción</h1>
      <PromocionForm
        promocion={promocion as Promocion}
        productos={(productos as Producto[]) ?? []}
        productosAplican={productosAplican}
      />
    </div>
  )
}
