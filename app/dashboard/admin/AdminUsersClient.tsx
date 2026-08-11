'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProfileWithSettings extends Profile {
  vendor_settings: unknown[]
}

export default function AdminUsersClient({ profiles }: { profiles: ProfileWithSettings[] }) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editProfile, setEditProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'vendor' | 'admin'>('vendor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const openCreate = () => {
    setEditProfile(null)
    setEmail('')
    setPassword('')
    setName('')
    setRole('vendor')
    setError('')
    setModalOpen(true)
  }

  const openEdit = (p: Profile) => {
    setEditProfile(p)
    setEmail(p.email)
    setPassword('')
    setName(p.name ?? '')
    setRole(p.role as 'vendor' | 'admin')
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      if (editProfile) {
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({ name: name.trim() || null, role })
          .eq('id', editProfile.id)
        if (updateErr) throw updateErr
      } else {
        const { data, error: signUpErr } = await supabase.auth.admin?.createUser({
          email,
          password,
          email_confirm: true,
        }) ?? { data: null, error: new Error('Admin API not available from client') }

        if (signUpErr) throw signUpErr

        if (data?.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email,
            name: name.trim() || null,
            role,
          })
        }
      }

      setModalOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} size="sm">
          <Plus size={14} /> Nuevo usuario
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50">
              <th className="text-left px-4 py-3 font-medium text-stone-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Rol</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                <td className="px-4 py-3 text-stone-700">{p.email}</td>
                <td className="px-4 py-3 text-stone-500">{p.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    p.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {p.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors">
                    <Pencil size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editProfile ? 'Editar usuario' : 'Nuevo usuario'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={!!editProfile} required
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 disabled:bg-stone-50" />
          </div>
          {!editProfile && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Rol</label>
            <select value={role} onChange={e => setRole(e.target.value as 'vendor' | 'admin')}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800">
              <option value="vendor">Vendedor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Guardando...' : editProfile ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
          <p className="text-xs text-stone-400 text-center">
            {!editProfile && 'La creación de usuarios requiere la API de administración de Supabase configurada en el servidor.'}
          </p>
        </form>
      </Modal>
    </div>
  )
}
