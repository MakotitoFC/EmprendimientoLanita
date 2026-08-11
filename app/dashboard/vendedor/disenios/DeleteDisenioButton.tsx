'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

export default function DeleteDisenioButton({ id, nombre }: { id: string; nombre: string }) {
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const supabase = createClient()
    await supabase.from('disenos_ejemplo').delete().eq('id', id)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={handleDelete} className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg">Sí</button>
        <button onClick={() => setConfirming(false)} className="text-xs bg-stone-200 text-stone-700 px-2 py-1 rounded-lg">No</button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={`Eliminar ${nombre}`}
      className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
    >
      <Trash2 size={14} />
    </button>
  )
}
