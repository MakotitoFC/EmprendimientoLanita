import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/products/ProductCard'
import type { Producto, Promocion } from '@/lib/types'
import { getActivePromotion, getPrecioConPromocion } from '@/lib/utils'
import { ArrowRight, Gem, Box, Frame, Smartphone, Building2, Handshake, Clock, Package } from 'lucide-react'
import ContactButtons from '@/components/contact/ContactButtons'
import type { Combo } from '@/lib/types'
import Image from 'next/image'

export const revalidate = 60

function HeroCard({
  label,
  width,
  height,
}: {
  label: string
  width: number
  height: number
}) {
  return (
    <div style={{ width, height, position: 'relative', flexShrink: 0 }}>
      <div style={{
        position: 'absolute',
        inset: '16px 10px -10px',
        borderRadius: 9999,
        background: 'rgba(30,25,20,0.3)',
        filter: 'blur(18px)',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 9999,
        background: '#F5F4F0',
        zIndex: 1,
      }} />
      <span style={{
        position: 'absolute',
        bottom: 14,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'rgba(60,50,40,0.4)',
        fontSize: 10,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        zIndex: 2,
      }}>
        {label}
      </span>
    </div>
  )
}

export default async function HomePage() {
  const supabase = await createClient()

  const now = new Date().toISOString()
  const [{ data: productos }, { data: promociones }, { data: settings }, { data: combosData }] = await Promise.all([
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
    supabase
      .from('vendor_settings')
      .select('whatsapp_number, telegram_username')
      .single(),
    supabase
      .from('combos')
      .select('*, combo_items(*, producto:productos(nombre))')
      .eq('is_active', true)
      .or(`es_permanente.eq.true,fecha_fin.gte.${now}`)
      .order('created_at', { ascending: false }),
  ])

  const prods = (productos as Producto[]) ?? []
  const promos = (promociones as unknown as Promocion[]) ?? []
  const whatsappNumber = settings?.whatsapp_number ?? ''
  const combos = (combosData as Combo[]) ?? []

  return (
    <div>

      {/* HERO */}
      <section className="bg-stone-900 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-32 flex flex-col md:grid md:grid-cols-2 md:gap-16 items-center">

          <div className="order-1 mb-10 md:mb-0 text-center md:text-left">
            <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-5">
              Hecho a mano · Trujillo, Perú
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-5">
              Piezas que<br />
              <span className="font-light italic text-stone-300">cuentan algo</span>
            </h1>
            <p className="text-stone-400 text-sm md:text-base mb-8 max-w-sm mx-auto md:mx-0 leading-relaxed">
              Piedras únicas, cemento personalizable y cuadros MDF con tu diseño.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link
                href="/piezas-unicas"
                className="bg-stone-100 hover:bg-white text-stone-900 px-6 py-3 rounded-full font-semibold text-sm transition-colors"
              >
                Ver catálogo
              </Link>
              <ContactButtons
                whatsappNumber={whatsappNumber}
                size="md"
              />
            </div>
          </div>

          {/* Cards — solo desktop */}
          <div className="order-2 w-full hidden lg:flex justify-center">
            <div className="relative" style={{ width: 460, height: 560 }}>
              <div style={{ position: 'absolute', left: 10, top: -80, zIndex: 2 }}>
                <Link href="/piezas-unicas">
                  <HeroCard label="Piedras" width={210} height={620} />
                </Link>
              </div>
              <div style={{ position: 'absolute', left: 270, top: -360, zIndex: 3 }}>
                <Link href="/cemento">
                  <HeroCard label="Cemento" width={210} height={550} />
                </Link>
              </div>
              <div style={{ position: 'absolute', left: 270, top: 230, zIndex: 1 }}>
                <Link href="/cuadros-mdf">
                  <HeroCard label="MDF" width={210} height={420} />
                </Link>
              </div>
            </div>

            {/* Cards mobile — hidden */}
            <div className="hidden">
              <Link href="/cemento">
                <HeroCard label="Cemento" width={120} height={134} />
              </Link>
                <Link href="/cuadros-mdf">
                  <HeroCard label="MDF" width={120} height={134} />
                </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Categories */}
      <section className="py-6 md:py-16">
        <div className="px-4 mb-4 md:max-w-6xl md:mx-auto">
          <h2 className="text-lg md:text-2xl font-semibold text-stone-800">
            ¿Qué estás buscando?
          </h2>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-2">
          {[
            { href: '/piezas-unicas', icon: Gem, label: 'Piezas únicas', desc: 'Cada una existe una sola vez' },
            { href: '/cemento', icon: Box, label: 'Cemento', desc: 'Eliges el color' },
            { href: '/cuadros-mdf', icon: Frame, label: 'Cuadros MDF', desc: 'Tu diseño, tu tamaño' },
          ].map(cat => {
            const Icon = cat.icon
            return (
              <Link key={cat.href} href={cat.href} className="flex-shrink-0 w-40 border border-stone-200 bg-white rounded-2xl p-4">
                <div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="text-stone-600" size={18} />
                </div>
                <p className="font-semibold text-stone-800 text-sm leading-tight mb-1">{cat.label}</p>
                <p className="text-stone-500 text-xs">{cat.desc}</p>
              </Link>
            )
          })}
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
          <Link href="/piezas-unicas" className="group bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center mb-4">
              <Gem className="text-stone-600" size={20} />
            </div>
            <h3 className="font-semibold text-stone-800 text-lg mb-1">Piezas únicas</h3>
            <p className="text-stone-500 text-sm mb-3">Piedras con diseño. Cada una existe una sola vez.</p>
            <span className="text-stone-700 text-sm font-medium group-hover:underline flex items-center gap-1">
              Ver piezas <ArrowRight size={14} />
            </span>
          </Link>
          <Link href="/cemento" className="group bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center mb-4">
              <Box className="text-stone-600" size={20} />
            </div>
            <h3 className="font-semibold text-stone-800 text-lg mb-1">Objetos de cemento</h3>
            <p className="text-stone-500 text-sm mb-3">Eliges el color. Cada pieza se hace a tu medida.</p>
            <span className="text-stone-700 text-sm font-medium group-hover:underline flex items-center gap-1">
              Ver cemento <ArrowRight size={14} />
            </span>
          </Link>
          <Link href="/cuadros-mdf" className="group bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center mb-4">
              <Frame className="text-stone-600" size={20} />
            </div>
            <h3 className="font-semibold text-stone-800 text-lg mb-1">Cuadros MDF</h3>
            <p className="text-stone-500 text-sm mb-3">Trae tu diseño y eliges el tamaño. Lo hacemos realidad.</p>
            <span className="text-stone-700 text-sm font-medium group-hover:underline flex items-center gap-1">
              Ver cuadros <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      {/* Combos */}
      {combos.length > 0 && (
        <section className="py-8 md:py-14 bg-stone-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-5 md:mb-8">
              <div className="flex items-center gap-2 mb-1">
                <Package size={18} className="text-stone-500" />
                <h2 className="text-lg md:text-2xl font-semibold text-stone-800">Combos y kits</h2>
              </div>
              <p className="text-sm text-stone-500">Armados especialmente para ti</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {combos.map(combo => {
                const diasRestantes = combo.es_permanente || !combo.fecha_fin
                  ? null
                  : Math.ceil((new Date(combo.fecha_fin).getTime() - Date.now()) / 86_400_000)
                const urgente = diasRestantes !== null && diasRestantes <= 7

                return (
                  <div key={combo.id} className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm flex flex-col">
                    {/* Imagen */}
                    <div className="relative aspect-[4/3] bg-stone-100">
                      {combo.imagen ? (
                        <Image src={combo.imagen} alt={combo.nombre} fill className="object-cover" sizes="(max-width:640px) 100vw, 33vw" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                          <Package size={40} />
                        </div>
                      )}
                      {/* Badge tiempo */}
                      {!combo.es_permanente && diasRestantes !== null && (
                        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${urgente ? 'bg-red-100 text-red-700' : 'bg-stone-800/80 text-white'}`}>
                          <Clock size={11} />
                          {urgente ? `Quedan ${diasRestantes} día${diasRestantes === 1 ? '' : 's'}` : 'Tiempo limitado'}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 md:p-5 flex flex-col flex-1">
                      <h3 className="font-semibold text-stone-800 text-base mb-1">{combo.nombre}</h3>
                      {combo.descripcion && (
                        <p className="text-sm text-stone-500 mb-3 leading-relaxed">{combo.descripcion}</p>
                      )}

                      {/* Qué incluye */}
                      {combo.combo_items && combo.combo_items.length > 0 && (
                        <ul className="text-xs text-stone-500 space-y-0.5 mb-4">
                          {combo.combo_items.map(item => (
                            <li key={item.id} className="flex items-start gap-1.5">
                              <span className="text-stone-300 mt-0.5">•</span>
                              <span>{item.cantidad > 1 ? `${item.cantidad}× ` : ''}{item.descripcion_item ?? item.producto?.nombre ?? 'Producto'}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Precio + CTA */}
                      <div className="mt-auto flex items-center justify-between gap-3">
                        <div>
                          <p className="text-2xl font-bold text-stone-800">S/ {combo.precio_combo.toFixed(0)}</p>
                          <p className="text-xs text-stone-400">precio del kit</p>
                        </div>
                        <a
                          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola! Me interesa el combo "${combo.nombre}" 🎁`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-stone-800 text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-stone-700 transition-colors whitespace-nowrap"
                        >
                          Lo quiero
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Latest products */}
      {prods.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pt-10 md:pt-16 pb-8 md:pb-16">
          <div className="mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-semibold text-stone-800">Piezas recientes</h2>
            <p className="text-sm text-stone-500 mt-1">Lo último del taller</p>
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
          <div className="mt-6 md:mt-8 flex justify-center">
            <Link
              href="/piezas-unicas"
              className="border border-stone-400 text-stone-600 px-6 py-2.5 rounded-full text-sm font-medium hover:bg-stone-100 transition-colors"
            >
              ver todo el catálogo
            </Link>
          </div>
        </section>
      )}

      {/* Payment methods */}
      <section className="bg-stone-100 py-10 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl md:text-2xl font-semibold text-stone-800 mb-1">¿Cómo pagar?</h2>
          <p className="text-sm text-stone-500 mb-6 md:mb-8">Fácil y a tu manera</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm">
              <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center mb-3">
                <Smartphone className="text-stone-600" size={20} />
              </div>
              <h3 className="font-semibold text-stone-800 mb-1">Yape</h3>
              <p className="text-sm text-stone-500 leading-relaxed">Transferencia al instante por Yape. Te enviamos el número al confirmar.</p>
            </div>
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm">
              <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center mb-3">
                <Building2 className="text-stone-600" size={20} />
              </div>
              <h3 className="font-semibold text-stone-800 mb-1">BCP</h3>
              <p className="text-sm text-stone-500 leading-relaxed">Transferencia o depósito bancario BCP. Te damos los datos al confirmar.</p>
            </div>
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm">
              <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center mb-3">
                <Handshake className="text-stone-600" size={20} />
              </div>
              <h3 className="font-semibold text-stone-800 mb-1">Pago físico</h3>
              <p className="text-sm text-stone-500 leading-relaxed">Coordinamos entrega en persona. Pagas al recibir tu pedido.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-900 text-white py-10 md:py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">¿Quieres una personalización?</h2>
          <p className="text-stone-300 text-sm md:text-base mb-5 md:mb-6">
            Escríbenos y lo conversamos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/cuadros-mdf"
              className="border border-white/60 text-white bg-transparent px-5 py-2.5 md:px-6 md:py-3 rounded-full font-medium hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2 text-sm md:text-base"
            >
              Pedir cuadro personalizado
            </Link>
            <ContactButtons
              whatsappNumber={whatsappNumber}
              message="Hola! Quiero consultar sobre un pedido personalizado"
              size="md"
            />
          </div>
        </div>
      </section>

    </div>
  )
}
