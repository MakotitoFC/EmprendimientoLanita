import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pb-16 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Mobile: compact */}
        <div className="md:hidden text-center space-y-4">
          <Image src="/logo_desktop.png" alt="Artesanías de Lanita" width={100} height={36} className="h-9 w-auto object-contain mx-auto opacity-80" />
          <p className="text-stone-400 text-xs leading-relaxed">
            Objetos hechos con amor. Cada pieza es única.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <Link href="/piezas-unicas" className="hover:text-white transition-colors">Piedras</Link>
            <Link href="/cemento" className="hover:text-white transition-colors">Cemento</Link>
            <Link href="/cuadros-mdf" className="hover:text-white transition-colors">MDF</Link>
            <Link href="/personalizado" className="hover:text-white transition-colors">Personalizado</Link>
          </div>
        </div>

        {/* Desktop: full */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          <div>
            <Image src="/logo_desktop.png" alt="Artesanías de Lanita" width={120} height={40} className="h-10 w-auto object-contain mb-3 opacity-80" />
            <p className="text-sm leading-relaxed text-stone-400">
              Objetos artesanales hechos con amor y dedicación. Cada pieza es única.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wide">Tienda</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/piezas-unicas" className="hover:text-white transition-colors">Piedras</Link></li>
              <li><Link href="/cemento" className="hover:text-white transition-colors">Cemento</Link></li>
              <li><Link href="/cuadros-mdf" className="hover:text-white transition-colors">MDF</Link></li>
              <li><Link href="/personalizado" className="hover:text-white transition-colors">Personalizado</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wide">Contacto</h4>
            <p className="text-sm text-stone-400">
              Todos los pedidos y consultas por WhatsApp. Te respondemos a la brevedad.
            </p>
          </div>
        </div>

      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-stone-500">
        © 2026 Maria Caffo. Todos los derechos reservados.
      </div>
    </footer>
  )
}
