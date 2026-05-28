import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Media, Project, Sector, Service } from '@/payload-types'
import { ProjectsExplorer } from '@/components/ProjectsExplorer'

export const dynamic = 'force-static'
export const revalidate = 600

function imageUrl(m: number | Media | null | undefined): string | null {
  if (!m || typeof m === 'number') return null
  return m.url || null
}

function serviceTitles(items: (number | Service)[] | null | undefined): string[] {
  return (items || [])
    .map((s) => (typeof s === 'object' && s !== null ? s.title : ''))
    .filter(Boolean)
}

function sectorOf(p: Project): Sector | null {
  return typeof p.sector === 'object' && p.sector !== null ? p.sector : null
}

export const metadata: Metadata = {
  title: 'Travaux — BRAVO! Agency',
  description:
    "Projets livrés par BRAVO! Agency depuis 2018 pour des marques, ONG, institutions et nos propres initiatives.",
}

export default async function ProjectsPage() {
  const payload = await getPayload({ config: configPromise })

  const [projectsResult, sectorsResult] = await Promise.all([
    payload.find({
      collection: 'projects',
      depth: 1,
      limit: 100,
      overrideAccess: false,
      sort: '-year',
    }),
    payload.find({
      collection: 'sectors',
      depth: 0,
      limit: 100,
      sort: 'order',
    }),
  ])

  const projects = projectsResult.docs as Project[]
  const sectorsList = sectorsResult.docs as Sector[]
  const total = projects.length

  // Derived stats for the COUNTERS strip (V8 reference)
  const clientCounts = new Map<string, number>()
  for (const p of projects) if (p.client) clientCounts.set(p.client, (clientCounts.get(p.client) ?? 0) + 1)
  const recurrentClients = Array.from(clientCounts.values()).filter((c) => c >= 2).length
  const usedSectorIds = new Set(projects.map((p) => sectorOf(p)?.id).filter(Boolean))
  const sectorsCount = usedSectorIds.size
  const firstYear = projects.reduce<number | null>((min, p) => {
    if (!p.year) return min
    return min === null || p.year < min ? p.year : min
  }, null)

  return (
    <main className="surface-paper min-h-screen pb-20">
      {/* PAGE HERO — Editorial index (paper). Titre + lede en 2 colonnes,
          séparés par une fine rule, stats inline en dessous. */}
      <section className="px-6 sm:px-10 pt-32 sm:pt-40 pb-10 sm:pb-14">
        <div className="mx-auto" style={{ maxWidth: '1640px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-24 items-end pb-10 sm:pb-14 border-b" style={{ borderColor: 'rgba(5,5,7,0.12)' }}>
            <div>
              <div
                className="font-mono text-[0.72rem] tracking-[0.16em] uppercase mb-6 flex gap-2 items-center font-bold"
                style={{ color: 'var(--color-bravo)' }}
              >
                <Link href="/" className="opacity-65 hover:opacity-100">Accueil</Link>
                <span className="opacity-40">/</span>
                <span>Travaux</span>
              </div>
              <h1
                className="font-display font-extrabold uppercase leading-[0.86] tracking-[-0.015em] text-[clamp(4rem,10vw,10rem)]"
                style={{ color: 'var(--color-ink)' }}
              >
                Travaux
                <span
                  className="block font-editorial italic font-normal normal-case tracking-[-0.02em] text-[clamp(1.8rem,4.5vw,5.5rem)] leading-[1.05] mt-2"
                  style={{ color: 'var(--color-bravo)' }}
                >
                  — index complet.
                </span>
              </h1>
            </div>
            <p
              className="font-editorial italic text-[clamp(1.15rem,1.6vw,1.4rem)] leading-[1.5] max-w-[38ch]"
              style={{ color: 'var(--color-ink)', opacity: 0.78 }}
            >
              <strong className="font-sans not-italic font-bold" style={{ color: 'var(--color-bravo)' }}>
                {total} {total <= 1 ? 'projet' : 'projets'}
              </strong>{' '}
              livrés depuis 2018 pour des marques, ONG, institutions et nos propres initiatives.
            </p>
          </div>

          {/* COUNTERS strip — inline, paper */}
          {total > 0 && (
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8 mt-10 sm:mt-12">
              <Counter num={`${total}+`} label="Projets livrés" highlight />
              <Counter num={String(recurrentClients).padStart(2, '0')} label="Clients récurrents" />
              <Counter num={String(sectorsCount).padStart(2, '0')} label="Secteurs couverts" />
              <Counter num={firstYear ? String(firstYear) : '—'} label="Premier projet" />
            </dl>
          )}
        </div>
      </section>

      {/* GALLERY + FILTER UI (client component) */}
      {projects.length === 0 ? (
        <section className="mx-auto px-6 sm:px-10 pt-8 sm:pt-12" style={{ maxWidth: '1640px' }}>
          <EmptyState />
        </section>
      ) : (
        <ProjectsExplorer projects={projects} sectors={sectorsList} />
      )}
    </main>
  )
}

function Counter({
  num,
  label,
  highlight,
}: {
  num: string
  label: string
  /** Use BRAVO bright as primary color for the digit — emphasises the first stat. */
  highlight?: boolean
}) {
  // Splits num so the trailing `+` (when present) gets the BRAVO bright accent.
  const match = /^(.+?)(\+)?$/.exec(num)
  const main = match?.[1] ?? num
  const suffix = match?.[2]
  return (
    <div className="flex flex-col gap-2">
      <span
        className="font-display font-extrabold text-[clamp(2rem,3.5vw,3rem)] leading-none tracking-[-0.01em]"
        style={{ color: highlight ? 'var(--color-bravo)' : 'var(--color-ink)' }}
      >
        {main}
        {suffix && (
          <span style={{ color: highlight ? 'var(--color-ink)' : 'var(--color-bravo)' }}>
            {suffix}
          </span>
        )}
      </span>
      <span
        className="font-mono text-[0.72rem] tracking-[0.14em] uppercase font-semibold"
        style={{ color: 'var(--color-ink)', opacity: 0.55 }}
      >
        {label}
      </span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="border rounded-[28px] p-12 sm:p-16 text-center max-w-3xl mx-auto my-12" style={{ borderColor: 'rgba(5,5,7,0.14)' }}>
      <div
        className="font-mono text-[0.72rem] tracking-[0.18em] uppercase font-semibold mb-4"
        style={{ color: 'var(--color-bravo)' }}
      >
        En préparation
      </div>
      <h2 className="font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(2rem,4vw,3.5rem)] mb-4" style={{ color: 'var(--color-ink)' }}>
        Aucun projet{' '}
        <span className="font-editorial italic font-normal normal-case" style={{ color: 'var(--color-bravo)' }}>
          publié
        </span>{' '}
        pour l&apos;instant.
      </h2>
      <p className="font-editorial italic text-[1.05rem] opacity-70 max-w-[42ch] mx-auto" style={{ color: 'var(--color-ink)' }}>
        Ajoute un projet dans l&apos;admin Payload (collection « Projets ») pour le voir apparaître ici.
      </p>
      <Link
        href="/admin/collections/projects/create"
        className="inline-block mt-8 px-5 py-3 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-sans font-bold text-sm hover:bg-[var(--color-bravo)] transition-colors"
      >
        Créer un projet →
      </Link>
    </div>
  )
}
