'use client'

import Link from 'next/link'
import React, { useMemo, useState } from 'react'

import type { Media, Project, Sector, Service } from '@/payload-types'

/* Asymmetric grid placement rotation — matches V8 mockup */
const SIZES = ['lg', 'lg', 'md', 'md', 'md', 'lg', 'tall', 'sm', 'wide', 'tall', 'md'] as const
type Size = (typeof SIZES)[number]

const sizeClasses: Record<Size, string> = {
  lg: 'md:col-span-6',
  md: 'md:col-span-4',
  sm: 'md:col-span-3',
  tall: 'md:col-span-4',
  wide: 'md:col-span-8',
}
const aspectClasses: Record<Size, string> = {
  lg: 'aspect-[5/4]',
  md: 'aspect-[4/5]',
  sm: 'aspect-square',
  tall: 'aspect-[3/4]',
  wide: 'aspect-[16/9]',
}

function imageUrl(m: number | Media | null | undefined): string | null {
  if (!m || typeof m === 'number') return null
  return m.url || null
}

function sectorOf(p: Project): Sector | null {
  return typeof p.sector === 'object' && p.sector !== null ? p.sector : null
}

function serviceTitles(items: (number | Service)[] | null | undefined): string[] {
  return (items || [])
    .map((s) => (typeof s === 'object' && s !== null ? s.title : ''))
    .filter(Boolean)
}

type Sort = 'recent' | 'az'

export function ProjectsExplorer({
  projects,
  sectors,
}: {
  projects: Project[]
  sectors: Sector[]
}) {
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [sort, setSort] = useState<Sort>('recent')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = projects

    // Sector filter
    if (selectedSector) {
      list = list.filter((p) => sectorOf(p)?.slug === selectedSector)
    }

    // Search filter — title, client, tagline, sector title, service titles
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((p) => {
        const hay = [
          p.title,
          p.client,
          p.tagline,
          sectorOf(p)?.title,
          ...serviceTitles(p.services),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
    }

    // Sort
    if (sort === 'az') {
      list = [...list].sort((a, b) => (a.title || '').localeCompare(b.title || '', 'fr'))
    } else {
      list = [...list].sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    }

    return list
  }, [projects, selectedSector, sort, query])

  return (
    <>
      {/* FILTER BAR */}
      <section
        className="mx-auto px-6 sm:px-10 pt-2 pb-8 sm:pb-12 mt-4 sm:mt-6"
        style={{ maxWidth: '1640px' }}
      >
        <div
          className="pt-6 border-t flex flex-col gap-5"
          style={{ borderColor: 'var(--color-rule-dark)' }}
        >
          {/* Row 1: SECTEURS label + pills */}
          <div className="grid grid-cols-[auto_1fr] gap-x-4 sm:gap-x-6 gap-y-3 items-start">
            <span
              className="font-mono text-[0.7rem] tracking-[0.14em] uppercase font-bold opacity-55 pt-2"
            >
              Secteurs
            </span>
            <div className="flex flex-wrap gap-2">
              <Pill
                active={selectedSector === null}
                onClick={() => setSelectedSector(null)}
                label="Tous"
              />
              {sectors.map((s) => (
                <Pill
                  key={s.id}
                  active={selectedSector === s.slug}
                  onClick={() => setSelectedSector(selectedSector === s.slug ? null : s.slug ?? null)}
                  label={s.title}
                />
              ))}
            </div>
          </div>

          {/* Row 2: TRIER (left) + search (right) */}
          <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-x-4 sm:gap-x-6 gap-y-3 items-center">
            <span
              className="font-mono text-[0.7rem] tracking-[0.14em] uppercase font-bold opacity-55"
            >
              Trier
            </span>
            <div className="flex items-center gap-2">
              <SortButton active={sort === 'recent'} onClick={() => setSort('recent')} label="Récent" />
              <span className="opacity-30 font-mono text-[0.7rem]">|</span>
              <SortButton active={sort === 'az'} onClick={() => setSort('az')} label="A–Z" />
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un projet, un client…"
              className="w-full sm:w-64 px-4 py-2 rounded-full font-sans text-[0.78rem] outline-none transition-[background,border-color,box-shadow] placeholder:opacity-50 placeholder:font-mono placeholder:tracking-[0.06em] placeholder:uppercase placeholder:text-[0.7rem] focus:bg-[rgba(244,237,225,0.06)] focus:border-[var(--color-bravo-soft)] focus:shadow-[0_0_0_3px_rgba(244,237,225,0.06)]"
              style={{
                background: 'rgba(244,237,225,0.03)',
                border: '1px solid var(--color-rule-dark)',
                color: 'var(--color-paper)',
              }}
            />
          </div>
        </div>

        {/* Active filter / result count */}
        {(selectedSector || query) && (
          <div className="mt-4 font-mono text-[0.72rem] tracking-[0.12em] uppercase opacity-55">
            {filtered.length} {filtered.length <= 1 ? 'projet' : 'projets'}
            {selectedSector && (
              <>
                {' · secteur: '}
                <span style={{ color: 'var(--color-bravo-soft)' }}>
                  {sectors.find((s) => s.slug === selectedSector)?.title}
                </span>
              </>
            )}
            {query && (
              <>
                {' · recherche: '}
                <span style={{ color: 'var(--color-bravo-soft)' }}>{query}</span>
              </>
            )}
          </div>
        )}
      </section>

      {/* GRID */}
      <section
        className="mx-auto px-6 sm:px-10 pb-12"
        style={{ maxWidth: '1640px' }}
      >
        {filtered.length === 0 ? (
          <NoMatchState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 md:gap-y-12 lg:gap-y-16">
            {filtered.map((p, i) => (
              <ProjectTile key={p.id} project={p} size={SIZES[i % SIZES.length]} featured={!!p.featured} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function Pill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'inline-flex items-center px-3.5 py-1.5 rounded-full font-mono text-[0.7rem] tracking-[0.1em] uppercase font-semibold cursor-pointer transition-[background,color,border-color]',
        active
          ? 'bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-paper)]'
          : 'bg-transparent text-[var(--color-paper)] border border-[var(--color-rule-dark)] hover:border-[var(--color-bravo-soft)] hover:text-[var(--color-bravo-soft)]',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

function SortButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'px-2.5 py-1 rounded-full font-mono text-[0.7rem] tracking-[0.1em] uppercase font-semibold cursor-pointer transition-colors',
        active ? 'text-[var(--color-paper)]' : 'text-[var(--color-paper)] opacity-45 hover:opacity-100',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

function ProjectTile({
  project,
  size,
  featured,
}: {
  project: Project
  size: Size
  featured: boolean
}) {
  const thumb = imageUrl(project.thumbnail) || imageUrl(project.heroImage)
  return (
    <Link
      href={`/projets/${project.slug}`}
      className={['group block relative overflow-hidden', sizeClasses[size]].join(' ')}
    >
      <div className={['relative overflow-hidden bg-[var(--color-ink-2)]', aspectClasses[size]].join(' ')}>
        {thumb ? (
          <div
            className="absolute inset-0 bg-center bg-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.05]"
            style={{ backgroundImage: `url(${thumb})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-ink-2)] to-[var(--color-bravo-deep)]" />
        )}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-transparent via-transparent to-black/70" />
        <span
          className={[
            'absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full backdrop-blur-sm',
            'font-mono text-[0.62rem] tracking-[0.12em] uppercase font-medium text-[var(--color-paper)]',
            'border',
            featured
              ? 'bg-[rgba(73,35,244,0.55)] border-[rgba(244,237,225,0.25)]'
              : 'bg-[rgba(5,5,7,0.55)] border-[rgba(244,237,225,0.18)]',
          ].join(' ')}
        >
          {featured ? '★ Featured' : project.year ?? ''}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 items-end">
        <h3 className="font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(1.6rem,2.2vw,2.2rem)] text-[var(--color-paper)]">
          {project.title}
        </h3>
        <span
          className="font-mono text-[0.7rem] tracking-[0.1em] uppercase font-semibold"
          style={{ color: 'var(--color-bravo-soft)' }}
        >
          {project.year ?? ''}
        </span>
        {project.services && project.services.length > 0 && (
          <span className="col-span-full font-mono text-[0.65rem] tracking-[0.1em] uppercase opacity-65 text-[var(--color-paper)] flex flex-wrap gap-x-2">
            {serviceTitles(project.services).slice(0, 3).map((t, i) => (
              <React.Fragment key={t}>
                {i > 0 && <span className="opacity-50">·</span>}
                <span>{t}</span>
              </React.Fragment>
            ))}
          </span>
        )}
      </div>
    </Link>
  )
}

function NoMatchState() {
  return (
    <div
      className="border rounded-[28px] p-10 sm:p-14 text-center max-w-2xl mx-auto"
      style={{ borderColor: 'var(--color-rule-dark)' }}
    >
      <div
        className="font-mono text-[0.72rem] tracking-[0.18em] uppercase font-semibold mb-3"
        style={{ color: 'var(--color-bravo-soft)' }}
      >
        Aucun résultat
      </div>
      <p className="font-editorial italic text-[1.05rem] opacity-85 text-[var(--color-paper)] max-w-[40ch] mx-auto">
        Essaie un autre secteur, élargis ta recherche, ou retire les filtres pour voir l'index complet.
      </p>
    </div>
  )
}
