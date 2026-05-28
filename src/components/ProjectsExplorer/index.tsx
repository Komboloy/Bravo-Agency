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
          style={{ borderColor: 'rgba(5,5,7,0.14)', color: 'var(--color-ink)' }}
        >
          {/* Row 1: SECTEURS label + pills */}
          <div className="grid grid-cols-[auto_1fr] gap-x-4 sm:gap-x-6 gap-y-3 items-start">
            <span
              className="font-mono text-[0.7rem] tracking-[0.14em] uppercase font-bold pt-2"
              style={{ opacity: 0.55 }}
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

          {/* Row 2: search (left) + TRIER juste à côté. Tout groupé à gauche,
              hauteurs visuelles identiques (h-9), pas de gap béant. */}
          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un projet, un client…"
              className="w-full sm:w-64 h-9 px-4 rounded-full font-mono text-[0.7rem] tracking-[0.06em] outline-none transition-[background,border-color,box-shadow] placeholder:opacity-50 placeholder:font-mono placeholder:tracking-[0.06em] placeholder:uppercase placeholder:text-[0.7rem] focus:bg-[rgba(5,5,7,0.04)] focus:border-[var(--color-bravo)] focus:shadow-[0_0_0_3px_rgba(73,35,244,0.08)]"
              style={{
                background: 'rgba(5,5,7,0.03)',
                border: '1px solid rgba(5,5,7,0.14)',
                color: 'var(--color-ink)',
              }}
            />
            <div className="flex items-center gap-2 h-9">
              <span
                className="font-mono text-[0.7rem] tracking-[0.14em] uppercase font-bold"
                style={{ opacity: 0.55 }}
              >
                Trier
              </span>
              <SortButton active={sort === 'recent'} onClick={() => setSort('recent')} label="Récent" />
              <span className="font-mono text-[0.7rem]" style={{ opacity: 0.3 }}>|</span>
              <SortButton active={sort === 'az'} onClick={() => setSort('az')} label="A–Z" />
            </div>
          </div>
        </div>

        {/* Active filter / result count */}
        {(selectedSector || query) && (
          <div
            className="mt-4 font-mono text-[0.72rem] tracking-[0.12em] uppercase"
            style={{ color: 'var(--color-ink)', opacity: 0.55 }}
          >
            {filtered.length} {filtered.length <= 1 ? 'projet' : 'projets'}
            {selectedSector && (
              <>
                {' · secteur: '}
                <span style={{ color: 'var(--color-bravo)', opacity: 1 }}>
                  {sectors.find((s) => s.slug === selectedSector)?.title}
                </span>
              </>
            )}
            {query && (
              <>
                {' · recherche: '}
                <span style={{ color: 'var(--color-bravo)', opacity: 1 }}>{query}</span>
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
          ? 'bg-[var(--color-bravo)] text-[var(--color-paper)] border border-[var(--color-bravo)]'
          : 'bg-transparent text-[var(--color-ink)] border border-[rgba(5,5,7,0.14)] hover:border-[var(--color-bravo)] hover:text-[var(--color-bravo)]',
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
        active ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink)] opacity-45 hover:opacity-100',
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
        {featured && (
          <span
            className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full backdrop-blur-sm font-mono text-[0.62rem] tracking-[0.12em] uppercase font-medium border bg-[rgba(73,35,244,0.85)] border-[rgba(244,237,225,0.25)] text-[var(--color-paper)]"
          >
            ★ Featured
          </span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 items-end" style={{ color: 'var(--color-ink)' }}>
        <div className="font-mono text-[0.62rem] tracking-[0.14em] uppercase font-bold mb-1 col-span-full" style={{ color: 'var(--color-bravo)' }}>
          {String(project.year ?? '').padStart(2, '0')}
          {project.year && project.client && ` · ${project.client}`}
        </div>
        <h3 className="font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(1.6rem,2.2vw,2.2rem)]">
          {project.title}
        </h3>
        {project.services && project.services.length > 0 && (
          <span className="col-span-full font-mono text-[0.62rem] tracking-[0.12em] uppercase flex flex-wrap gap-x-2 mt-1" style={{ opacity: 0.55 }}>
            {serviceTitles(project.services).slice(0, 3).map((t, i) => (
              <React.Fragment key={t}>
                {i > 0 && <span style={{ opacity: 0.5 }}>·</span>}
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
      style={{ borderColor: 'rgba(5,5,7,0.14)', color: 'var(--color-ink)' }}
    >
      <div
        className="font-mono text-[0.72rem] tracking-[0.18em] uppercase font-semibold mb-3"
        style={{ color: 'var(--color-bravo)' }}
      >
        Aucun résultat
      </div>
      <p className="font-editorial italic text-[1.05rem] max-w-[40ch] mx-auto" style={{ opacity: 0.78 }}>
        Essaie un autre secteur, élargis ta recherche, ou retire les filtres pour voir l&apos;index complet.
      </p>
    </div>
  )
}
