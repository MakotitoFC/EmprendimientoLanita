'use client'
import { useState } from 'react'
import { saveConfirmation } from '@/lib/actions/orders'
import { MessageSquare, Loader2, CheckCircle2 } from 'lucide-react'

export default function ConfirmForm({ token }: { token: string }) {
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await saveConfirmation(token, comment.trim() || undefined)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="text-center space-y-3">
        <CheckCircle2 className="mx-auto text-emerald-500" size={40} />
        <p className="font-semibold text-stone-800">¡Gracias por tu comentario!</p>
        {comment && <p className="text-sm text-stone-500 italic">"{comment}"</p>}
        <p className="text-xs text-stone-400">Tu opinión le llega directo a Lanita.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          ¿Cómo fue tu experiencia? <span className="text-stone-400 font-normal">(opcional)</span>
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          placeholder="¿Llegó todo bien? ¿Qué te pareció el producto?"
          className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 resize-none"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-stone-800 hover:bg-stone-700 text-white py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
        {loading ? 'Enviando…' : 'Enviar comentario'}
      </button>
    </form>
  )
}
