import type { MetadataRoute } from 'next';
import { getPublishedProducts } from '@/lib/data/productRepository';

// Plan du site toujours à jour (piloté par le back-office).
export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const maintenant = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: maintenant, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/boutique`, lastModified: maintenant, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/contact`, lastModified: maintenant, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/a-propos`, lastModified: maintenant, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/favoris`, lastModified: maintenant, changeFrequency: 'weekly', priority: 0.3 },
  ];

  const produits: MetadataRoute.Sitemap = getPublishedProducts().map((p) => ({
    url: `${base}/produit/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...pages, ...produits];
}
