import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'
import AdminUsersClient from './AdminUsersClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard/vendedor')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, vendor_settings(*)')
    .order('created_at')

  return (
    <div>
      <h1 className="text-2xl font-serif font-semibold text-stone-800 mb-6">Gestión de usuarios</h1>
      <AdminUsersClient profiles={(profiles as (Profile & { vendor_settings: unknown[] })[]) ?? []} />
    </div>
  )
}
