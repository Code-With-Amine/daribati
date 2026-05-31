import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/client/', '/notaire/', '/admin/'],
    },
    sitemap: 'https://notaireflow.com/sitemap.xml',
  }
}
