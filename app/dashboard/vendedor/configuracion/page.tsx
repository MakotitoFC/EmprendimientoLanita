import { createClient } from '@/lib/supabase/server'
import ConfiguracionForm from './ConfiguracionForm'
import type { VendorSettings, Profile } from '@/lib/types'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('vendor_settings').select('*').eq('profile_id', user!.id).single(),
  ])

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-serif font-semibold text-stone-800 mb-8">Configuración</h1>
      <ConfiguracionForm
        profile={profile as Profile}
        settings={settings as VendorSettings | null}
      />
    </div>
  )
}
