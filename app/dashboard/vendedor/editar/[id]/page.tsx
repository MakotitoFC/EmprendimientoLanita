import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '../../ProductForm'
import type { Producto, TamanoMDF } from '@/lib/types'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: producto }, { data: tamanos }] = await Promise.all([
    supabase.from('productos').select('*').eq('id', id).single(),
    supabase.from('tamanos_mdf').select('*').eq('producto_id', id).order('precio'),
  ])

  if (!producto) notFound()

  return (
    <div>
      <Link href="/dashboard/vendedor" className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-6">
        <ChevronLeft size={16} /> Volver a productos
      </Link>
      <h1 className="text-2xl font-serif font-semibold text-stone-800 mb-8">Editar producto</h1>
      <ProductForm producto={producto as Producto} tamanos={(tamanos as TamanoMDF[]) ?? []} />
    </div>
  )
}
