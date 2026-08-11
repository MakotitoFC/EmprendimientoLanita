import { createClient } from '@/lib/supabase/server'
import MdfClient from './MdfClient'
import type { Producto, TamanoMDF, DisenioEjemplo } from '@/lib/types'

export const revalidate = 60

export default async function CuadrosMdfPage() {
  const supabase = await createClient()

  const [{ data: producto }, { data: settings }] = await Promise.all([
    supabase.from('productos').select('*').eq('tipo', 'mdf').eq('is_active', true).limit(1).single(),
    supabase.from('vendor_settings').select('whatsapp_number').single(),
  ])

  const prod = producto as Producto | null

  const [{ data: tamanos }, { data: disenios }] = await Promise.all([
    prod
      ? supabase.from('tamanos_mdf').select('*').eq('producto_id', prod.id).order('precio')
      : Promise.resolve({ data: [] }),
    supabase.from('disenos_ejemplo').select('*').eq('tipo', 'mdf').eq('is_active', true).order('created_at', { ascending: false }),
  ])

  return (
    <MdfClient
      producto={prod}
      tamanos={(tamanos as TamanoMDF[]) ?? []}
      disenios={(disenios as DisenioEjemplo[]) ?? []}
      whatsappNumber={settings?.whatsapp_number ?? ''}
    />
  )
}
