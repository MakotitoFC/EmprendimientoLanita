import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Producto, Promocion } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return `S/ ${new Intl.NumberFormat('es-PE', { minimumFractionDigits: 0 }).format(price)}`
}

export function getActivePromotion(producto: Producto, promociones: Promocion[]): Promocion | null {
  const now = new Date()
  return promociones.find(p => {
    if (!p.is_active) return false
    if (new Date(p.fecha_inicio) > now || new Date(p.fecha_fin) < now) return false
    if (!p.productos || p.productos.length === 0) return true
    return p.productos.some(pp => pp.id === producto.id)
  }) ?? null
}

export function getPrecioConPromocion(precioBase: number, promo: Promocion | null): number {
  if (!promo) return precioBase
  if (promo.tipo_descuento === 'porcentaje') {
    return precioBase * (1 - promo.valor_descuento / 100)
  }
  return Math.max(0, precioBase - promo.valor_descuento)
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, '')
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}
