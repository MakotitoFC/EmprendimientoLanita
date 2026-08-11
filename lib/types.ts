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
  updated_at: string
}
