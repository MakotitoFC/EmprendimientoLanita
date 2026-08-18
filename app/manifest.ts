import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Artesanías de Lanita',
    short_name: 'Lanita',
    description: 'Piezas únicas de piedra, cemento y MDF hechas a mano.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf9',
    theme_color: '#292524',
    orientation: 'portrait',
    icons: [],
  }
}
