import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-stone-800 text-stone-300 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-serif text-lg font-semibold mb-3">Artesanías</h3>
            <p className="text-sm leading-relaxed text-stone-400">
              Objetos artesanales hechos con amor y dedicación. Cada pieza es única.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wide">Tienda</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/piezas-unicas" className="hover:text-white transition-colors">Piezas únicas</Link></li>
              <li><Link href="/cemento" className="hover:text-white transition-colors">Objetos de cemento</Link></li>
              <li><Link href="/cuadros-mdf" className="hover:text-white transition-colors">Cuadros MDF</Link></li>
              <li><Link href="/inspiracion" className="hover:text-white transition-colors">Inspiración</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wide">Contacto</h4>
            <p className="text-sm text-stone-400">
              Todos los pedidos y consultas por WhatsApp. Te respondemos a la brevedad.
            </p>
          </div>
        </div>
        <div className="border-t border-stone-700 mt-8 pt-6 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} Artesanías. Hecho con cariño.
        </div>
      </div>
    </footer>
  )
}
