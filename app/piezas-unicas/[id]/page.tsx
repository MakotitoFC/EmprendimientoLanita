import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PiedraClient from './PiedraClient'
import type { Producto } from '@/lib/types'
import { getActivePromotion, getPrecioConPromocion } from '@/lib/utils'

export const revalidate = 60

export default async function PiedraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: producto }, { data: settings }, { data: promociones }] = await Promise.all([
    supabase.from('productos').select('*').eq('id', id).eq('tipo', 'piedra').single(),
    supabase.from('vendor_settings').select('whatsapp_number').single(),
    supabase
      .from('promociones')
      .select('*, productos:promociones_productos(producto_id)')
      .eq('is_active', true)
      .gte('fecha_fin', new Date().toISOString()),
  ])

  if (!producto) notFound()

  const p = producto as Producto
  const promos = (promociones as unknown[] ?? []) as Parameters<typeof getActivePromotion>[1]
  const promo = getActivePromotion(p, promos)
  const precioFinal = promo ? getPrecioConPromocion(p.precio_base, promo) : undefined

  return (
    <PiedraClient
      producto={p}
      whatsappNumber={settings?.whatsapp_number ?? ''}
      precioFinal={precioFinal}
      tienePromocion={!!promo}
    />
  )
}
