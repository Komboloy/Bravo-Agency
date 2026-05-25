import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getProjectsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'projects',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: { equals: 'published' },
      },
      select: {
        slug: true,
        updatedAt: true,
        featured: true,
      },
    })

    const dateFallback = new Date().toISOString()

    // Include /projets index + each project detail page
    const sitemap = [
      {
        loc: `${SITE_URL}/projets`,
        lastmod: dateFallback,
        changefreq: 'weekly',
        priority: 0.8,
      } as const,
      ...results.docs
        .filter((p) => Boolean(p?.slug))
        .map((p) => ({
          loc: `${SITE_URL}/projets/${p.slug}`,
          lastmod: p.updatedAt || dateFallback,
          changefreq: 'monthly' as const,
          priority: p.featured ? 0.9 : 0.7,
        })),
    ]

    return sitemap
  },
  ['projects-sitemap'],
  { tags: ['projects-sitemap'] },
)

export async function GET() {
  const sitemap = await getProjectsSitemap()
  return getServerSideSitemap(sitemap)
}
