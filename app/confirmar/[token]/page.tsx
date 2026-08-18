import { createClient } from '@/lib/supabase/server'
import ConfirmForm from './ConfirmForm'
import { CheckCircle2, Clock, AlertCircle, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ token: string }>
}

export default async function ConfirmarPage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('id, status, confirmed_at, confirmation_expires_at, total')
    .eq('confirmation_token', token)
    .maybeSingle()

  // Token not found
  if (!order) {
    return (
      <PageShell>
        <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
        <h1 className="text-xl font-semibold text-stone-800 mb-2">Enlace no válido</h1>
        <p className="text-stone-500 text-sm">
          Este enlace no existe o fue revocado. Si creés que es un error, contactá a Lanita.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm text-stone-500 hover:text-stone-800">← Volver al inicio</Link>
      </PageShell>
    )
  }

  // Already commented
  if (order.confirmed_at) {
    return (
      <PageShell>
        <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={48} />
        <h1 className="text-xl font-semibold text-stone-800 mb-2">¡Gracias!</h1>
        <p className="text-stone-500 text-sm">
          Ya enviaste tu comentario. ¡Lanita te lo agradece!
        </p>
      </PageShell>
    )
  }

  // Expired
  const expired = order.confirmation_expires_at && new Date(order.confirmation_expires_at) < new Date()
  if (expired) {
    return (
      <PageShell>
        <Clock className="mx-auto text-indigo-400 mb-4" size={48} />
        <h1 className="text-xl font-semibold text-stone-800 mb-2">Enlace vencido</h1>
        <p className="text-stone-500 text-sm">
          Este enlace de confirmación venció. Si aún no confirmaste tu pedido, escribile a Lanita para que te mande uno nuevo.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm text-stone-500 hover:text-stone-800">← Volver al inicio</Link>
      </PageShell>
    )
  }

  // Ready to confirm
  return (
    <PageShell>
      <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <MessageSquare className="text-stone-600" size={28} />
      </div>
      <h1 className="text-xl font-semibold text-stone-800 mb-1">¿Cómo estuvo?</h1>
      <p className="text-stone-500 text-sm mb-6">
        Lanita quiere saber tu experiencia. Podés dejar un comentario o cerrar si no querés.
      </p>
      <ConfirmForm token={token} />
    </PageShell>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-8 max-w-sm w-full text-center">
        {children}
      </div>
    </div>
  )
}
