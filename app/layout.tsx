import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SettingsInit from '@/components/layout/SettingsInit'
import { createClient } from '@/lib/supabase/server'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Artesanías de Lanita | Objetos únicos hechos a mano',
  description: 'Piedras con diseño, objetos de cemento y cuadros MDF artesanales. Cada pieza hecha con amor.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Lanita',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('vendor_settings')
    .select('whatsapp_number')
    .single()

  return (
    <html lang="es" className={poppins.variable}>
      <body className="min-h-screen flex flex-col bg-stone-50">
        <SettingsInit whatsappNumber={settings?.whatsapp_number ?? ''} />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
