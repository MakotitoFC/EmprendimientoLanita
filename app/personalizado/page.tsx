import { createClient } from '@/lib/supabase/server'
import PersonalizadoClient from './PersonalizadoClient'
import type { Producto, TamanoMDF, DisenioEjemplo } from '@/lib/types'

export const revalidate = 300

export default async function PersonalizadoPage() {
  const supabase = await createClient()

  const [
    { data: productosCemento },
    { data: productosMdf },
    { data: disenioCemento },
    { data: disenioMdf },
  ] = await Promise.all([
    supabase.from('productos').select('*, tamanos_mdf(*)').eq('tipo', 'cemento').eq('is_active', true),
    supabase.from('productos').select('*, tamanos_mdf(*)').eq('tipo', 'mdf').eq('is_active', true),
    supabase.from('disenos_ejemplo').select('*').eq('tipo', 'cemento').eq('is_active', true).order('created_at', { ascending: false }),
    supabase.from('disenos_ejemplo').select('*').eq('tipo', 'mdf').eq('is_active', true).order('created_at', { ascending: false }),
  ])

  return (
    <PersonalizadoClient
      productosCemento={(productosCemento as Producto[]) ?? []}
      productosMdf={(productosMdf as Producto[]) ?? []}
      disenioCemento={(disenioCemento as DisenioEjemplo[]) ?? []}
      disenioMdf={(disenioMdf as DisenioEjemplo[]) ?? []}
    />
  )
}
