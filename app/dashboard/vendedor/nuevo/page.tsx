import ProductForm from '../ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NuevoProductoPage() {
  return (
    <div>
      <Link href="/dashboard/vendedor" className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-6">
        <ChevronLeft size={16} /> Volver a productos
      </Link>
      <h1 className="text-2xl font-serif font-semibold text-stone-800 mb-8">Nuevo producto</h1>
      <ProductForm />
    </div>
  )
}
