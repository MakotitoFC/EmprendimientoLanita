'use client'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:   { label: 'Pendiente',  className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  validated: { label: 'Validado',   className: 'bg-blue-50 text-blue-700 border-blue-200' },
  delivered: { label: 'Entregado',  className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

export default function OrderStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-stone-50 text-stone-600 border-stone-200' }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

