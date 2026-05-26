import Link from 'next/link'
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Media, Project, ProjectShowcaseBlock as Props } from '@/payload-types'

function imageUrl(m: number | Media | null | undefined): string | null {
  if (!m || typeof m === 'number') return null
  return m.url || null
}

async function resolveProjects(props: Props): Promise<Project[]> {
  const { mode = 'manual', projects: manual, limit = 3 } = props

  // Manual mode — projects relationship is already populated when depth >= 1
  if (mode === 'manual') {
    if (!manual || manual.length === 0) return []
    return manual.filter((p): p is Project => typeof p === 'object' && p !== null)
  }

  // Auto modes — query Payload
  const payload = await getPayload({ config: configPromise })
  const baseWhere: Record<string, unknown> = { _status: { equals: 'published' } }
  if (mode === 'featured') baseWhere.featured = { equals: true }
  const result = await payload.find({
    collection: 'projects',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: baseWhere as any,
    depth: 1,
    limit: limit || 3,
    sort: '-year',
    overrideAccess: false,
  })
  return result.docs as Project[]
}

export async function ProjectShowcaseBlock(props: Props) {
  const { label, heading, showViewAll } = props
  const projects = await resolveProjects(props)
  if (projects.length === 0) return null

  return (
    <section className="surface-ink pt-20 sm:pt-32" id="travaux">
      <div
        className="px-6 sm:px-10 grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-8 mb-12 sm:mb-20 mx-auto"
        style={{ maxWidth: '1640px' }}
      >
        <div>
          {label && (
            <span className="section-label" style={{ color: 'var(--color-bravo-bright)' }}>
              {label}
            </span>
          )}
          {heading && (
            <h2 className="mt-5 font-display font-extrabold uppercase leading-[0.92] tracking-[-0.01em] text-[clamp(2.8rem,7vw,7rem)] max-w-[16ch] text-[var(--color-paper)]">
              {heading}
            </h2>
          )}
        </div>
        {showViewAll && (
          <Link
            href="/projets"
            className="inline-flex items-center gap-2 font-mono text-[0.78rem] tracking-[0.14em] uppercase font-semibold border-b border-current pb-1 text-[var(--color-paper)] hover:text-[var(--color-bravo-bright)] transition-colors"
          >
            Voir tous les projets <span>→</span>
          </Link>
        )}
      </div>

      {projects.map((p, i) => (
        <ProjectBand key={p.id} project={p} num={i + 1} />
      ))}
    </section>
  )
}

function ProjectBand({ project, num }: { project: Project; num: number }) {
  const img = imageUrl(project.heroImage) || imageUrl(project.thumbnail)
  return (
    <Link
      href={`/projets/${project.slug}`}
      className="group relative block h-[80vh] min-h-[500px] overflow-hidden"
    >
      {img && (
        <div
          className="absolute inset-0 bg-center bg-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]"
          style={{ backgroundImage: `url(${img})` }}
        />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,5,7,0.18) 0%, transparent 30%, transparent 50%, rgba(5,5,7,0.88) 100%)',
        }}
      />
      <div
        className="relative z-10 h-full px-6 sm:px-10 pb-10 sm:pb-16 flex flex-col justify-end gap-6 mx-auto text-[var(--color-paper)]"
        style={{ maxWidth: '1640px' }}
      >
        <div
          className="font-mono text-[0.75rem] tracking-[0.18em] uppercase font-semibold"
          style={{ color: 'var(--color-bravo-soft)' }}
        >
          {String(num).padStart(2, '0')}
          {project.year && ` — ${project.year}`} · {project.client}
        </div>
        <h3 className="font-display font-extrabold uppercase leading-[0.9] tracking-[-0.01em] text-[clamp(2.8rem,7vw,6.5rem)] max-w-[20ch]">
          {project.title}
          {project.tagline && (
            <>
              {' '}
              <span className="font-editorial italic font-normal normal-case tracking-[-0.02em]">
                {project.tagline}
              </span>
            </>
          )}
        </h3>
      </div>
    </Link>
  )
}
