import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/debug-wallet/',
          '/test-step-3/',
          '/onboarding/',
          '/profile/',
          '/proofs/',
          '/social/',
        ],
      },
    ],
    sitemap: 'https://marka-proof.org/sitemap.xml',
  }
}

