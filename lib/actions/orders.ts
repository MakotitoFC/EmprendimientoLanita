'use server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

const checkoutSchema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(7, 'Teléfono muy corto'),
  address: z.string().min(5, 'Dirección muy corta'),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    options: z.record(z.string(), z.string()),
  })).min(1),
  total: z.number().positive(),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

export async function createOrder(input: unknown): Promise<{ orderId: string } | { error: string }> {
  try {
    const data = checkoutSchema.parse(input)
    const supabase = await createClient()

    // Upsert customer by email
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', data.email)
      .maybeSingle()

    let customerId: string
    if (existing?.id) {
      customerId = existing.id
      await supabase.from('customers').update({ name: data.name, phone: data.phone }).eq('id', customerId)
    } else {
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert({ email: data.email, name: data.name, phone: data.phone })
        .select('id')
        .single()
      if (error) throw error
      customerId = newCustomer.id
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        total: data.total,
        shipping_address: data.address,
        notes: data.notes ?? null,
        status: 'pending',
        source: 'web',
      })
      .select('id')
      .single()
    if (orderError) throw orderError

    const { error: itemsError } = await supabase.from('order_items').insert(
      data.items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        options: item.options,
      }))
    )
    if (itemsError) throw itemsError

    // Notify vendor via Telegram (best effort)
    try {
      await notifyNewOrder(order.id, data)
    } catch {
      // Don't fail the order if notification fails
    }

    return { orderId: order.id }
  } catch (err) {
    if (err instanceof z.ZodError) return { error: err.issues[0]?.message ?? 'Datos inválidos' }
    const msg =
      err instanceof Error ? err.message
      : typeof err === 'object' && err !== null && 'message' in err ? String((err as { message: unknown }).message)
      : 'Error al procesar el pedido'
    return { error: msg }
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/vendedor/pedidos')
  revalidatePath(`/dashboard/vendedor/pedidos/${orderId}`)
  return {}
}

export async function markDelivered(orderId: string): Promise<{ confirmUrl?: string; error?: string }> {
  const supabase = await createClient()

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'delivered',
      confirmation_token: token,
      confirmation_expires_at: expiresAt,
    })
    .eq('id', orderId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/vendedor/pedidos')
  revalidatePath(`/dashboard/vendedor/pedidos/${orderId}`)

  const hdrs = await headers()
  const host = hdrs.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  return { confirmUrl: `${proto}://${host}/confirmar/${token}` }
}

export async function saveConfirmation(
  token: string,
  comment?: string,
): Promise<{ error?: string; alreadyConfirmed?: boolean }> {
  const supabase = await createClient()

  const { data: order, error: fetchErr } = await supabase
    .from('orders')
    .select('id, confirmation_expires_at, confirmed_at')
    .eq('confirmation_token', token)
    .maybeSingle()

  if (fetchErr || !order) return { error: 'Enlace no encontrado.' }
  if (order.confirmed_at) return { alreadyConfirmed: true }
  if (new Date(order.confirmation_expires_at) < new Date()) return { error: 'Este enlace ya venció.' }

  const { error } = await supabase
    .from('orders')
    .update({ confirmed_at: new Date().toISOString(), review_comment: comment ?? null })
    .eq('id', order.id)

  if (error) return { error: error.message }
  return {}
}

async function notifyNewOrder(orderId: string, data: CheckoutInput) {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('vendor_settings')
    .select('telegram_bot_token, telegram_chat_id')
    .single()

  if (!settings?.telegram_bot_token || !settings?.telegram_chat_id) return

  const itemsText = data.items
    .map(i => `• ${i.productName} x${i.quantity} — S/ ${(i.unitPrice * i.quantity).toFixed(2)}`)
    .join('\n')

  const message = `🛍️ *Nuevo pedido web*\n\n` +
    `👤 ${data.name}\n📧 ${data.email}\n📱 ${data.phone}\n` +
    `📍 ${data.address}\n\n${itemsText}\n\n` +
    `*Total: S/ ${data.total.toFixed(2)}*\n\n` +
    `Ver pedido: /dashboard/vendedor/pedidos/${orderId}`

  await fetch(`https://api.telegram.org/bot${settings.telegram_bot_token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: settings.telegram_chat_id,
      text: message,
      parse_mode: 'Markdown',
    }),
  })
}
