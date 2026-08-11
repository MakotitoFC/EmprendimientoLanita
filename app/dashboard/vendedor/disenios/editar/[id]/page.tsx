import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DisenioForm from '../../DisenioForm'
import type { DisenioEjemplo, Producto } from '@/lib/types'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function EditarDisenioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: disenio }, { data: productos }] = await Promise.all([
    supabase.from('disenos_ejemplo').select('*').eq('id', id).single(),
    supabase.from('productos').select('*').in('tipo', ['cemento', 'mdf']),
  ])

  if (!disenio) notFound()

  return (
    <div>
      <Link href="/dashboard/vendedor/disenios" className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-6">
        <ChevronLeft size={16} /> Volver
      </Link>
      <h1 className="text-2xl font-serif font-semibold text-stone-800 mb-8">Editar diseño</h1>
      <DisenioForm disenio={disenio as DisenioEjemplo} productos={(productos as Producto[]) ?? []} />
    </div>
  )
}
