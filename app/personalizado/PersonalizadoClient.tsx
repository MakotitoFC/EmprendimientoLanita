'use client'
import { useState } from 'react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import type { Producto, DisenioEjemplo } from '@/lib/types'
import AddToCartButton from '@/components/cart/AddToCartButton'
import { ChevronDown } from 'lucide-react'

interface Props {
  productosCemento: Producto[]
  productosMdf: Producto[]
  disenioCemento: DisenioEjemplo[]
  disenioMdf: DisenioEjemplo[]
}

type Categoria = 'cemento' | 'mdf'

const COLORES_CEMENTO_DEFAULT = ['Blanco', 'Negro', 'Gris', 'Terracota', 'Beige', 'Verde salvia', 'Azul petróleo']
const ACABADOS_CEMENTO_DEFAULT = ['Mate', 'Satinado', 'Brillante']
const ACCESORIOS_CEMENTO_DEFAULT = ['Sin accesorios', 'Cordón yute', 'Cinta de tela', 'Caja regalo']

const COLORES_MDF_DEFAULT = ['Natural madera', 'Negro', 'Blanco', 'Dorado', 'Plateado']
const ACABADOS_MDF_DEFAULT = ['Sin barniz', 'Barniz mate', 'Barniz brillante', 'Con resina']
const ACCESORIOS_MDF_DEFAULT = ['Sin accesorios', 'Marco de madera', 'Colgador incluido', 'Caja regalo']

function SelectField({ label, options, value, onChange }: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 pr-10"
        >
          <option value="">Selecciona una opción</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
      </div>
    </div>
  )
}

export default function PersonalizadoClient({ productosCemento, productosMdf, disenioCemento, disenioMdf }: Props) {
  const [categoria, setCategoria] = useState<Categoria>('cemento')

  // Cemento state
  const [productoCementoId, setProductoCementoId] = useState(productosCemento[0]?.id ?? '')
  const [colorCemento, setColorCemento] = useState('')
  const [acabadoCemento, setAcabadoCemento] = useState('')
  const [accesorioCemento, setAccesorioCemento] = useState('')
  const [dedicatoriaCemento, setDedicatoriaCemento] = useState('')

  // MDF state
  const [productoMdfId, setProductoMdfId] = useState(productosMdf[0]?.id ?? '')
  const [tamanoMdfId, setTamanoMdfId] = useState('')
  const [colorMdf, setColorMdf] = useState('')
  const [acabadoMdf, setAcabadoMdf] = useState('')
  const [accesorioMdf, setAccesorioMdf] = useState('')
  const [dedicatoriaMdf, setDedicatoriaMdf] = useState('')
  const [inspiracionMdf, setInspiracionMdf] = useState('')

  const productoCemento = productosCemento.find(p => p.id === productoCementoId) ?? productosCemento[0]
  const productoMdf = productosMdf.find(p => p.id === productoMdfId) ?? productosMdf[0]
  const tamanosMdf = (productoMdf as any)?.tamanos_mdf ?? []
  const tamanoSeleccionado = tamanosMdf.find((t: any) => t.id === tamanoMdfId)

  const coloresCemento = productoCemento?.colores_disponibles?.length ? productoCemento.colores_disponibles : COLORES_CEMENTO_DEFAULT
  const acabadosCemento = productoCemento?.acabados_disponibles?.length ? productoCemento.acabados_disponibles : ACABADOS_CEMENTO_DEFAULT
  const accesoriosCemento = productoCemento?.accesorios_disponibles?.length ? productoCemento.accesorios_disponibles : ACCESORIOS_CEMENTO_DEFAULT

  const coloresMdf = productoMdf?.colores_disponibles?.length ? productoMdf.colores_disponibles : COLORES_MDF_DEFAULT
  const acabadosMdf = productoMdf?.acabados_disponibles?.length ? productoMdf.acabados_disponibles : ACABADOS_MDF_DEFAULT
  const accesoriosMdf = productoMdf?.accesorios_disponibles?.length ? productoMdf.accesorios_disponibles : ACCESORIOS_MDF_DEFAULT

  const optionsCemento: Record<string, string> = {
    ...(colorCemento && { color: colorCemento }),
    ...(acabadoCemento && { acabado: acabadoCemento }),
    ...(accesorioCemento && { accesorio: accesorioCemento }),
    ...(dedicatoriaCemento.trim() && { dedicatoria: dedicatoriaCemento.trim() }),
  }

  const optionsMdf: Record<string, string> = {
    ...(tamanoSeleccionado && { tamaño: tamanoSeleccionado.nombre }),
    ...(colorMdf && { color: colorMdf }),
    ...(acabadoMdf && { acabado: acabadoMdf }),
    ...(accesorioMdf && { accesorio: accesorioMdf }),
    ...(inspiracionMdf && { inspiracion: inspiracionMdf }),
    ...(dedicatoriaMdf.trim() && { dedicatoria: dedicatoriaMdf.trim() }),
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-12 pb-32 md:pb-12">
      <div className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-semibold text-stone-800 mb-1">Personalizado</h1>
        <p className="text-stone-500 text-sm md:text-base">Elige tu tipo de objeto y configura los detalles.</p>
      </div>

      {/* Selector de categoría */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setCategoria('cemento')}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${categoria === 'cemento' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
        >
          Objetos de cemento
        </button>
        <button
          onClick={() => setCategoria('mdf')}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${categoria === 'mdf' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
        >
          Cuadros MDF
        </button>
      </div>

      {/* ─── CEMENTO ─── */}
      {categoria === 'cemento' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* Configurador */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 md:p-6 space-y-4">
            <h2 className="text-base font-semibold text-stone-800">Configura tu objeto</h2>

            {productosCemento.length > 1 && (
              <SelectField
                label="Tipo de objeto"
                options={productosCemento.map(p => p.nombre)}
                value={productoCemento?.nombre ?? ''}
                onChange={v => {
                  const p = productosCemento.find(x => x.nombre === v)
                  if (p) setProductoCementoId(p.id)
                }}
              />
            )}

            <div>
              <p className="text-xs text-stone-400 mb-0.5">Precio base</p>
              <p className="text-2xl font-bold text-stone-800">{productoCemento ? formatPrice(productoCemento.precio_base) : '—'}</p>
            </div>

            <SelectField label="Color" options={coloresCemento} value={colorCemento} onChange={setColorCemento} />
            <SelectField label="Acabado" options={acabadosCemento} value={acabadoCemento} onChange={setAcabadoCemento} />
            <SelectField label="Accesorio" options={accesoriosCemento} value={accesorioCemento} onChange={setAccesorioCemento} />

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Dedicatoria <span className="text-stone-400 font-normal text-xs">(opcional)</span></label>
              <textarea
                value={dedicatoriaCemento}
                onChange={e => setDedicatoriaCemento(e.target.value)}
                placeholder="Ej: Para mamá, con amor ♥"
                rows={2}
                maxLength={120}
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
              />
              <p className="text-xs text-stone-400 text-right mt-0.5">{dedicatoriaCemento.length}/120</p>
            </div>

            {productoCemento && (
              <div className="pt-1 hidden md:block">
                <AddToCartButton product={productoCemento} unitPrice={productoCemento.precio_base} options={optionsCemento} className="w-full" size="lg" />
              </div>
            )}
          </div>

          {/* Galería de ejemplos */}
          <div>
            <h2 className="text-base font-semibold text-stone-800 mb-3">Ejemplos ya hechos</h2>
            {disenioCemento.length === 0 ? (
              <p className="text-stone-400 text-sm">Pronto subimos ejemplos.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {disenioCemento.map(d => (
                  <div key={d.id} className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
                    <div className="relative aspect-square bg-stone-100">
                      {d.imagenes[0] && (
                        <Image src={d.imagenes[0]} alt={d.nombre_diseno} fill className="object-cover" sizes="200px" />
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-stone-800 leading-tight">{d.nombre_diseno}</p>
                      {d.descripcion && <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{d.descripcion}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MDF ─── */}
      {categoria === 'mdf' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* Configurador */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 md:p-6 space-y-4">
            <h2 className="text-base font-semibold text-stone-800">Configura tu cuadro</h2>

            {/* Tamaños */}
            <div>
              <p className="text-sm font-medium text-stone-700 mb-2">Tamaño</p>
              {tamanosMdf.length === 0 ? (
                <p className="text-stone-400 text-sm">Sin tamaños disponibles aún.</p>
              ) : (
                <div className="space-y-2">
                  {tamanosMdf.filter((t: any) => t.is_available).map((t: any) => (
                    <label key={t.id} className={`flex items-center gap-3 cursor-pointer rounded-xl border px-4 py-3 transition-colors ${tamanoMdfId === t.id ? 'border-stone-800 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}>
                      <input type="radio" name="tamano" value={t.id} checked={tamanoMdfId === t.id} onChange={() => setTamanoMdfId(t.id)} className="accent-stone-800" />
                      <span className="text-sm text-stone-700 flex-1 font-medium">{t.nombre}</span>
                      <span className="text-sm font-bold text-stone-800">{formatPrice(t.precio)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <SelectField label="Color / acabado base" options={coloresMdf} value={colorMdf} onChange={setColorMdf} />
            <SelectField label="Barniz / acabado" options={acabadosMdf} value={acabadoMdf} onChange={setAcabadoMdf} />
            <SelectField label="Accesorio" options={accesoriosMdf} value={accesorioMdf} onChange={setAccesorioMdf} />

            {/* Inspiración */}
            {disenioMdf.length > 0 && (
              <SelectField
                label="Diseño de referencia (opcional)"
                options={disenioMdf.map(d => d.nombre_diseno)}
                value={inspiracionMdf}
                onChange={setInspiracionMdf}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Dedicatoria <span className="text-stone-400 font-normal text-xs">(opcional)</span></label>
              <textarea
                value={dedicatoriaMdf}
                onChange={e => setDedicatoriaMdf(e.target.value)}
                placeholder="Ej: Feliz cumpleaños, te quiero mucho ♥"
                rows={2}
                maxLength={120}
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
              />
              <p className="text-xs text-stone-400 text-right mt-0.5">{dedicatoriaMdf.length}/120</p>
            </div>

            {productoMdf && tamanoSeleccionado && (
              <div className="pt-1 hidden md:block">
                <AddToCartButton product={productoMdf} unitPrice={tamanoSeleccionado.precio} options={optionsMdf} className="w-full" size="lg" />
              </div>
            )}
            {!tamanoSeleccionado && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2 text-center">Elige un tamaño para continuar</p>
            )}
          </div>

          {/* Galería */}
          <div>
            <h2 className="text-base font-semibold text-stone-800 mb-3">Cuadros ya hechos</h2>
            {disenioMdf.length === 0 ? (
              <p className="text-stone-400 text-sm">Pronto subimos ejemplos.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {disenioMdf.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setInspiracionMdf(d.nombre_diseno)}
                    className={`text-left bg-white rounded-2xl overflow-hidden border shadow-sm transition-all ${inspiracionMdf === d.nombre_diseno ? 'border-stone-800 ring-1 ring-stone-800' : 'border-stone-100 hover:border-stone-300'}`}
                  >
                    <div className="relative aspect-square bg-stone-100">
                      {d.imagenes[0] && (
                        <Image src={d.imagenes[0]} alt={d.nombre_diseno} fill className="object-cover" sizes="200px" />
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-stone-800 leading-tight">{d.nombre_diseno}</p>
                      {d.descripcion && <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{d.descripcion}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile CTA fijo */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3 bg-white/95 backdrop-blur-sm border-t border-stone-100">
        {categoria === 'cemento' && productoCemento && (
          <AddToCartButton product={productoCemento} unitPrice={productoCemento.precio_base} options={optionsCemento} className="w-full" size="lg" />
        )}
        {categoria === 'mdf' && productoMdf && tamanoSeleccionado && (
          <AddToCartButton product={productoMdf} unitPrice={tamanoSeleccionado.precio} options={optionsMdf} className="w-full" size="lg" />
        )}
        {categoria === 'mdf' && !tamanoSeleccionado && (
          <p className="text-center text-sm text-stone-400 py-3">Elige un tamaño para continuar</p>
        )}
      </div>
    </div>
  )
}
