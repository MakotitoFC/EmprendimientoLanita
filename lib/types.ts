export type ProductType = 'piedra' | 'cemento' | 'mdf'

export interface TamanoMDF {
  id: string
  producto_id: string
  nombre: string
  precio: number
  is_available: boolean
  created_at: string
}

export interface Producto {
  id: string
  tipo: ProductType
  nombre: string
  descripcion_corta: string | null
  precio_base: number
  imagenes: string[]
  is_active: boolean
  created_at: string
  // Piedra
  piedra_disponible: boolean | null
  piedra_tiene_resina: boolean | null
  // Cemento
  cemento_tiene_resina: boolean | null
  cemento_precio_resina: number | null
  // MDF
  mdf_tiene_resina: boolean | null
  mdf_precio_resina: number | null
  // Pieza única
  es_unica: boolean
  // Personalización
  colores_disponibles: string[]
  acabados_disponibles: string[]
  accesorios_disponibles: string[]
  // Relations
  tamanos_mdf?: TamanoMDF[]
  promociones?: Promocion[]
}

export interface DisenioEjemplo {
  id: string
  producto_id: string
  tipo: 'cemento' | 'mdf'
  nombre_diseno: string
  imagenes: string[]
  descripcion: string | null
  is_active: boolean
  created_at: string
  producto?: Producto
}

export interface Promocion {
  id: string
  nombre: string
  tipo_descuento: 'porcentaje' | 'fijo'
  valor_descuento: number
  fecha_inicio: string
  fecha_fin: string
  is_active: boolean
  created_at: string
  productos?: Producto[]
}

export interface PromocionProducto {
  id: string
  promocion_id: string
  producto_id: string
}

export interface Profile {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'vendor'
  created_at: string
}

export interface VendorSettings {
  id: string
  profile_id: string
  whatsapp_number: string
  store_name: string | null
  store_photo_url: string | null
  telegram_bot_token: string | null
  telegram_chat_id: string | null
  telegram_webhook_secret: string | null
  updated_at: string
}

export interface Customer {
  id: string
  email: string
  name: string
  phone: string | null
  telegram_username: string | null
  created_at: string
}

export type OrderStatus = 'pending' | 'validated' | 'delivered'
export type OrderSource = 'web' | 'telegram'

export interface Order {
  id: string
  customer_id: string | null
  status: OrderStatus
  total: number
  shipping_address: string | null
  notes: string | null
  telegram_chat_id: string | null
  source: OrderSource
  confirmation_token: string | null
  confirmation_expires_at: string | null
  confirmed_at: string | null
  review_comment: string | null
  created_at: string
  updated_at: string
  customer?: Customer
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  options: Record<string, string>
  created_at: string
  producto?: Producto
}

export interface ComboItem {
  id: string
  combo_id: string
  producto_id: string | null
  cantidad: number
  descripcion_item: string | null
  producto?: Producto
}

export interface Combo {
  id: string
  nombre: string
  descripcion: string | null
  imagen: string | null
  precio_combo: number
  es_permanente: boolean
  fecha_inicio: string
  fecha_fin: string | null
  is_active: boolean
  created_at: string
  combo_items?: ComboItem[]
}

export interface CartItem {
  product: Producto
  quantity: number
  options: Record<string, string>
  unitPrice: number
}
