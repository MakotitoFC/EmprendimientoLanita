'use client'
import { useState } from 'react'
import { updateOrderStatus, markDelivered } from '@/lib/actions/orders'
import { CheckCircle, Copy } from 'lucide-react'

const STATUSES = [
  { value: 'pending',   label: 'Pendiente' },
  { value: 'validated', label: 'Validado' },
]

interface Props {
  orderId: string
  currentStatus: string
}

export default function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirmUrl, setConfirmUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = async (newStatus: string) => {
    setStatus(newStatus)
    setLoading(true)
    setSaved(false)
    setError(null)
    const result = await updateOrderStatus(orderId, newStatus)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDelivered = async () => {
    setLoading(true)
    setError(null)
    const result = await markDelivered(orderId)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    setStatus('delivered')
    if (result.confirmUrl) setConfirmUrl(result.confirmUrl)
  }

  const copyUrl = () => {
    if (!confirmUrl) return
    navigator.clipboard.writeText(confirmUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (status === 'delivered') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
          <CheckCircle size={16} />
          Pedido entregado
        </div>
        {confirmUrl && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
            <p className="text-xs text-stone-500">Enlace de confirmación para el cliente (válido 7 días):</p>
            <div className="flex items-center gap-2">
              <p className="text-xs font-mono text-stone-700 flex-1 break-all">{confirmUrl}</p>
              <button
                onClick={copyUrl}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-stone-200 transition-colors"
                title="Copiar"
              >
                <Copy size={14} className={copied ? 'text-green-600' : 'text-stone-500'} />
              </button>
            </div>
            {copied && <p className="text-xs text-green-600">¡Copiado!</p>}
            <p className="text-xs text-stone-400">
              Enviá este enlace al cliente por WhatsApp o Telegram para que confirme la recepción.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={status}
          onChange={e => handleChange(e.target.value)}
          disabled={loading}
          className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 bg-white disabled:opacity-60"
        >
          {STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button
          onClick={handleDelivered}
          disabled={loading}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          <CheckCircle size={15} />
          Marcar entregado
        </button>
        {loading && <span className="text-xs text-stone-400">Guardando…</span>}
        {saved && <span className="text-xs text-green-600 font-medium">✓ Guardado</span>}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
