import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from './DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name, email')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="min-h-screen bg-stone-50">
      <DashboardNav role={profile.role} name={profile.name ?? profile.email} />
      {/* desktop: offset sidebar (w-64) + top bar (h-14) */}
      <main className="md:ml-64 md:pt-14 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
