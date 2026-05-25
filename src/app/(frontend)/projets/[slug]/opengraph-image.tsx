import { ImageResponse } from 'next/og'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Media, Project } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

export const alt = 'BRAVO! Agency — Case study'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function imageUrl(m: number | Media | null | undefined): string | null {
  if (!m || typeof m === 'number') return null
  return m.url || null
}

export default async function OG({ params }: { params: { slug: string } }) {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'projects',
    where: { slug: { equals: decodeURIComponent(params.slug) } },
    limit: 1,
    depth: 1,
  })
  const project = (result.docs?.[0] as Project | undefined) || null

  if (!project) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#4923F4',
            color: '#f3ecde',
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: '-0.02em',
          }}
        >
          BRAVO!
        </div>
      ),
      size,
    )
  }

  const siteUrl = getServerSideURL()
  const hero = imageUrl(project.heroImage) || imageUrl(project.thumbnail)
  const heroAbsolute = hero ? (hero.startsWith('http') ? hero : `${siteUrl}${hero}`) : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: '#050507',
          color: '#f3ecde',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {heroAbsolute && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroAbsolute}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(5,5,7,0.5) 0%, transparent 22%, transparent 45%, rgba(5,5,7,0.92) 100%), linear-gradient(135deg, rgba(73,35,244,0.2), transparent 50%)',
          }}
        />
        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '56px 64px',
          }}
        >
          {/* Top */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 22,
              letterSpacing: 4,
              textTransform: 'uppercase',
              fontWeight: 700,
              color: '#c9bdff',
            }}
          >
            <span>BRAVO!</span>
            <span style={{ opacity: 0.7 }}>
              {project.client}
              {project.year ? ` · ${project.year}` : ''}
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              maxWidth: 1000,
            }}
          >
            <div
              style={{
                fontSize: 120,
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: '#f3ecde',
              }}
            >
              {project.title}
            </div>
            {project.tagline && (
              <div
                style={{
                  fontSize: 34,
                  fontStyle: 'italic',
                  lineHeight: 1.3,
                  opacity: 0.92,
                  maxWidth: 900,
                }}
              >
                {project.tagline}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
