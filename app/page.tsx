import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/products/ProductCard'
import type { Producto, Promocion } from '@/lib/types'
import { getActivePromotion, getPrecioConPromocion } from '@/lib/utils'
import { ArrowRight, Gem, Box, Frame } from 'lucide-react'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: productos }, { data: promociones }] = await Promise.all([
    supabase
      .from('productos')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('promociones')
      .select('*, productos:promociones_productos(producto_id)')
      .eq('is_active', true)
      .gte('fecha_fin', new Date().toISOString()),
  ])

  const prods = (productos as Producto[]) ?? []
  const promos = (promociones as unknown as Promocion[]) ?? []

  return (
    <div className="pb-2">
      {/* Hero — compact on mobile */}
      <section className="bg-gradient-to-b from-stone-100 to-stone-50 px-4 pt-8 pb-10 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-semibold text-stone-800 mb-3 md:mb-4 leading-tight">
            Objetos hechos<br className="md:hidden" /> a mano
          </h1>
          <p className="text-stone-500 text-sm md:text-lg mb-6 md:mb-8 max-w-sm md:max-w-xl mx-auto leading-relaxed">
            Piezas únicas de piedra, cemento personalizable y cuadros MDF con tu diseño.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/piezas-unicas"
              className="bg-stone-800 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl text-sm md:text-base font-medium hover:bg-stone-700 transition-colors"
            >
              Ver piezas
            </Link>
            <Link
              href="/inspiracion"
              className="border border-stone-300 text-stone-700 px-5 py-2.5 md:px-6 md:py-3 rounded-xl text-sm md:text-base font-medium hover:bg-stone-100 transition-colors"
            >
              Ver inspiración
            </Link>
          </div>
        </div>
      </section>

      {/* Categories — horizontal scroll on mobile */}
      <section className="py-6 md:py-16">
        <div className="px-4 mb-4 md:max-w-6xl md:mx-auto">
          <h2 className="text-lg md:text-2xl font-serif font-semibold text-stone-800">
            ¿Qué estás buscando?
          </h2>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-2">
          {[
            { href: '/piezas-unicas', icon: Gem, label: 'Piezas únicas', desc: 'Cada una existe una sola vez', color: 'bg-amber-50 border-amber-100', iconBg: 'bg-amber-100', iconColor: 'text-amber-700', textColor: 'text-amber-700' },
            { href: '/cemento', icon: Box, label: 'Cemento', desc: 'Elegís el color', color: 'bg-stone-100 border-stone-200', iconBg: 'bg-stone-200', iconColor: 'text-stone-600', textColor: 'text-stone-700' },
            { href: '/cuadros-mdf', icon: Frame, label: 'Cuadros MDF', desc: 'Tu diseño, tu tamaño', color: 'bg-green-50 border-green-100', iconBg: 'bg-green-100', iconColor: 'text-green-700', textColor: 'text-green-700' },
          ].map(cat => {
            const Icon = cat.icon
            return (
              <Link key={cat.href} href={cat.href}
                className={`flex-shrink-0 w-40 border rounded-2xl p-4 ${cat.color}`}
              >
                <div className={`w-9 h-9 ${cat.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={cat.iconColor} size={18} />
                </div>
                <p className="font-semibold text-stone-800 text-sm leading-tight mb-1">{cat.label}</p>
                <p className="text-stone-500 text-xs">{cat.desc}</p>
              </Link>
            )
          })}
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
          <Link href="/piezas-unicas" className="group bg-amber-50 border border-amber-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <Gem className="text-amber-700" size={20} />
            </div>
            <h3 className="font-serif font-semibold text-stone-800 text-lg mb-1">Piezas únicas</h3>
            <p className="text-stone-600 text-sm mb-3">Piedras con diseño. Cada una existe una sola vez.</p>
            <span className="text-amber-700 text-sm font-medium group-hover:underline flex items-center gap-1">
              Ver piezas <ArrowRight size={14} />
            </span>
          </Link>
          <Link href="/cemento" className="group bg-stone-50 border border-stone-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-stone-200 rounded-xl flex items-center justify-center mb-4">
              <Box className="text-stone-600" size={20} />
            </div>
            <h3 className="font-serif font-semibold text-stone-800 text-lg mb-1">Objetos de cemento</h3>
            <p className="text-stone-600 text-sm mb-3">Elegís el color. Cada pieza se hace a tu medida.</p>
            <span className="text-stone-700 text-sm font-medium group-hover:underline flex items-center gap-1">
              Ver cemento <ArrowRight size={14} />
            </span>
          </Link>
          <Link href="/cuadros-mdf" className="group bg-green-50 border border-green-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Frame className="text-green-700" size={20} />
            </div>
            <h3 className="font-serif font-semibold text-stone-800 text-lg mb-1">Cuadros MDF</h3>
            <p className="text-stone-600 text-sm mb-3">Traé tu diseño y elegís el tamaño. Lo hacemos realidad.</p>
            <span className="text-green-700 text-sm font-medium group-hover:underline flex items-center gap-1">
              Ver cuadros <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      {/* Latest products */}
      {prods.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-8 md:pb-16">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-serif font-semibold text-stone-800">Lo último</h2>
            <Link href="/piezas-unicas" className="text-xs md:text-sm text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1">
              Ver todo <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {prods.map(p => {
              const promo = getActivePromotion(p, promos)
              const precioFinal = promo ? getPrecioConPromocion(p.precio_base, promo) : undefined
              return (
                <ProductCard key={p.id} producto={p} precioFinal={precioFinal} tienePromocion={!!promo} />
              )
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-stone-800 text-white py-10 md:py-16 px-4 mx-3 md:mx-0 rounded-2xl md:rounded-none mb-4 md:mb-0">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-serif font-semibold mb-2 md:mb-3">¿Tenés una idea?</h2>
          <p className="text-stone-300 text-sm md:text-base mb-5 md:mb-6">
            Escribinos por WhatsApp y lo charlamos.
          </p>
          <Link
            href="/cuadros-mdf"
            className="bg-white text-stone-800 px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-medium hover:bg-stone-100 transition-colors inline-flex items-center gap-2 text-sm md:text-base"
          >
            Pedir cuadro personalizado
          </Link>
        </div>
      </section>
    </div>
  )
}
