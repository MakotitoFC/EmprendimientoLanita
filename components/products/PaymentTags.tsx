import { Smartphone, Building2, Handshake } from 'lucide-react'

const methods = [
  { icon: Smartphone, label: 'Yape / Plin' },
  { icon: Building2, label: 'BCP' },
  { icon: Handshake, label: 'Pago en persona' },
]

export default function PaymentTags() {
  return (
    <div>
      <p className="text-xs text-stone-400 mb-2">Medios de pago</p>
      <div className="flex flex-wrap gap-2">
        {methods.map(({ icon: Icon, label }) => (
          <span key={label} className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-600 text-xs font-medium px-3 py-1.5 rounded-full">
            <Icon size={12} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
