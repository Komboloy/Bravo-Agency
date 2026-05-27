import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Home as HomeGlobal, Media, Project, Service, Team } from '@/payload-types'
import { HeroCarousel, type HeroSlide } from '@/components/HeroCarousel'
import RichText from '@/components/RichText'

export const dynamic = 'force-static'
export const revalidate = 600

function imageUrl(m: number | Media | null | undefined): string | null {
  if (!m || typeof m === 'number') return null
  return m.url || null
}

/** Extract a service title from a populated (depth>=1) relationship, ignoring bare IDs. */
function serviceTitle(s: number | Service | null | undefined): string {
  return typeof s === 'object' && s !== null ? s.title : ''
}

export const metadata: Metadata = {
  title: 'BRAVO! Agency — Les idées en actions',
  description:
    "Agence de communication multidisciplinaire à Bruxelles. On accompagne l'engagement des marques et on déclenche des transformations.",
}

export default async function Home() {
  const payload = await getPayload({ config: configPromise })

  // Featured projects for the hero carousel + section
  const featured = await payload.find({
    collection: 'projects',
    where: { featured: { equals: true } },
    depth: 1,
    limit: 3,
    sort: '-year',
    overrideAccess: false,
  })

  // Team members for the home Studio teaser (max 2 — design matches V7)
  const teamResult = await payload.find({
    collection: 'team',
    depth: 1,
    limit: 2,
    sort: 'order',
    overrideAccess: false,
    where: { _status: { equals: 'published' } },
  })
  const members = teamResult.docs as Team[]

  // Home Global — all editorial text. Falls back to hardcoded defaults if the global
  // hasn't been populated yet (fresh DB or never opened in admin).
  const home = (await payload.findGlobal({
    slug: 'home',
    depth: 1,
    overrideAccess: false,
  })) as HomeGlobal

  const heroSlides: HeroSlide[] = featured.docs.length > 0
    ? (featured.docs as Project[]).map((p) => ({
        imageUrl: imageUrl(p.heroImage) || imageUrl(p.thumbnail),
        title: p.tagline || '',
        client: p.client,
        year: p.year ?? null,
        tags: (p.services || []).slice(0, 3).map(serviceTitle).filter(Boolean),
        href: `/projets/${p.slug}`,
      }))
    : DEMO_SLIDES

  const projects = (featured.docs as Project[]).length > 0
    ? (featured.docs as Project[])
    : null

  const marqueeItems = (home?.marquee && home.marquee.length > 0
    ? home.marquee
    : [
        { text: 'Together for tomorrow' },
        { text: 'Porteurs de sens' },
        { text: "Déclencheurs d'actions" },
        { text: "Une goutte d'eau" },
      ]) as { text: string; id?: string | null }[]

  return (
    <main className="surface-ink">
      {/* HERO carousel — title/badge/year from Home Global */}
      <HeroCarousel
        slides={heroSlides}
        title={home?.hero?.title ? <RichText data={home.hero.title} enableGutter={false} /> : undefined}
        badge={home?.hero?.badge || undefined}
        yearRange={home?.hero?.yearRange || undefined}
      />

      {/* MARQUEE — BRAVO color band */}
      <div className="surface-bravo overflow-hidden py-3.5 border-y" style={{ borderColor: 'var(--color-bravo-bright)' }}>
        <div className="flex gap-12 whitespace-nowrap font-mono font-medium text-[0.78rem] tracking-[0.18em] uppercase animate-[marquee_38s_linear_infinite]">
          {Array.from({ length: 2 }).map((_, k) => (
            <React.Fragment key={k}>
              {marqueeItems.map((item, j) => (
                <React.Fragment key={`${k}-${j}`}>
                  <span>{item.text}</span>
                  <span style={{ color: 'var(--color-bravo-soft)' }}>✦</span>
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </div>
        <style>{`@keyframes marquee { to { transform: translateX(-50%); } }`}</style>
      </div>

      {/* INTRO STATEMENT — paper */}
      <section className="surface-paper px-6 sm:px-10 py-24 sm:py-40">
        <div
          className="mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8 md:gap-24 items-end"
          style={{ maxWidth: '1640px' }}
        >
          <span className="section-label" style={{ color: 'var(--color-bravo)' }}>
            {home?.intro?.label || 'À propos · 01'}
          </span>
          <div
            className="prose-home-display"
            style={
              {
                '--display-size': 'clamp(2.8rem,8vw,8.5rem)',
                '--display-color': 'var(--color-ink)',
                '--display-accent': 'var(--color-bravo)',
              } as React.CSSProperties
            }
          >
            {home?.intro?.title ? (
              <RichText data={home.intro.title} enableGutter={false} />
            ) : (
              <>
                <h2>On accompagne</h2>
                <h2><em>l&apos;engagement</em></h2>
                <h2>des marques.</h2>
                <h2><strong>Pas leurs slogans.</strong></h2>
              </>
            )}
          </div>
        </div>
      </section>

      {/* PROJECTS BANDS — full bleed */}
      <section className="surface-ink pt-20 sm:pt-32" id="travaux">
        <div className="px-6 sm:px-10 grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-8 mb-12 sm:mb-20 mx-auto" style={{ maxWidth: '1640px' }}>
          <div>
            <span className="section-label" style={{ color: 'var(--color-bravo-bright)' }}>
              {home?.projectsSection?.label || 'Travaux · Sélection 2026'}
            </span>
            <div
              className="mt-5 prose-home-display"
              style={
                {
                  '--display-size': 'clamp(2.8rem,7vw,7rem)',
                  '--display-color': 'var(--color-paper)',
                  '--display-accent': 'var(--color-bravo-bright)',
                } as React.CSSProperties
              }
            >
              {home?.projectsSection?.title ? (
                <RichText data={home.projectsSection.title} enableGutter={false} />
              ) : (
                <>
                  <h2>Quelques <em>projets</em></h2>
                  <h2><strong>qui nous représentent</strong>.</h2>
                </>
              )}
            </div>
          </div>
          <Link
            href="/projets"
            className="inline-flex items-center gap-2 font-mono text-[0.78rem] tracking-[0.14em] uppercase font-semibold border-b border-current pb-1 text-[var(--color-paper)] hover:text-[var(--color-bravo-bright)] transition-colors"
          >
            {home?.projectsSection?.cta || 'Voir tous les projets'} <span>→</span>
          </Link>
        </div>

        {projects ? (
          projects.map((p, i) => <ProjectBand key={p.id} project={p} num={i + 1} />)
        ) : (
          <DemoProjects />
        )}
      </section>

      {/* BRAVO BREATH — manifesto full bleed */}
      <section className="surface-bravo bravo-atmosphere px-6 sm:px-10 py-32 sm:py-56 text-center">
        <div className="relative z-10 mx-auto" style={{ maxWidth: '1100px' }}>
          <span className="inline-block font-mono text-[0.72rem] tracking-[0.32em] uppercase font-semibold mb-8 opacity-85">
            {home?.manifesto?.label || 'Manifeste'}
          </span>
          <div
            className="prose-home-display flex flex-col items-center text-center mx-auto"
            style={
              {
                '--display-size': 'clamp(2.4rem,6vw,5.5rem)',
                '--display-color': 'var(--color-paper)',
                '--display-accent': 'var(--color-paper)',
              } as React.CSSProperties
            }
          >
            {home?.manifesto?.title ? (
              <RichText data={home.manifesto.title} enableGutter={false} />
            ) : (
              <>
                <h2><em>Une</em> <strong>goutte d&apos;eau</strong></h2>
                <h2><em>peut-être.</em></h2>
                <h2><em>Heureusement,</em></h2>
                <h2><strong>on n&apos;est pas seuls</strong>.</h2>
              </>
            )}
          </div>
        </div>
      </section>

      {/* STUDIO TEASER — 2 members preview, deep link to /studio (matches V7 ordering: after BREATH, before CTA) */}
      {members.length > 0 && (
        <StudioTeaser
          members={members}
          label={home?.studioSection?.label || 'Studio · Effectif'}
          titleRich={home?.studioSection?.title}
          ctaLabel={home?.studioSection?.cta || 'Notre réseau'}
        />
      )}

      {/* CTA */}
      <section className="surface-paper relative overflow-hidden px-6 sm:px-10 py-32 sm:py-56 text-center" id="contact">
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, var(--color-bravo) 0%, transparent 55%)',
            filter: 'blur(150px)',
            opacity: 0.32,
          }}
        />
        <div className="relative z-10">
          <span
            className="inline-flex items-center gap-3 font-mono text-[0.72rem] tracking-[0.32em] uppercase font-bold mb-8"
            style={{ color: 'var(--color-bravo)' }}
          >
            <span className="inline-block w-10 h-px bg-current" />
            {home?.cta?.label || 'Premier pas'}
            <span className="inline-block w-10 h-px bg-current" />
          </span>
          <div
            className="prose-home-display flex flex-col items-center text-center mx-auto"
            style={
              {
                '--display-size': 'clamp(3rem,10vw,11rem)',
                '--display-color': 'var(--color-ink)',
                '--display-accent': 'var(--color-bravo)',
                paddingBottom: '1rem',
                marginBottom: '7.5rem',
              } as React.CSSProperties
            }
          >
            {home?.cta?.title ? (
              <RichText data={home.cta.title} enableGutter={false} />
            ) : (
              <>
                <h2>Allez,</h2>
                <h2><em>on en</em> <strong>parle</strong>?</h2>
              </>
            )}
          </div>
          <Link
            href={home?.cta?.buttonHref || '/contact'}
            className="inline-flex items-center gap-3 px-8 py-5 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-sans font-bold text-[1rem] hover:bg-[var(--color-bravo)] hover:gap-5 transition-[background,gap,transform] hover:-translate-y-0.5"
          >
            {home?.cta?.buttonLabel || 'Démarrer la conversation'} <span>→</span>
          </Link>
        </div>
      </section>
    </main>
  )
}

/**
 * Render a single-line string with light markdown :
 *   - `*italic*` → `<em>` (mapped to font-light via prose-home-display)
 *   - `**bold**` → `<strong>` (mapped to BRAVO accent via prose-home-display)
 * Used for project tagline so a non-tech user can type "Together *for* tomorrow"
 * in the admin and get the V7 weight-mix.
 */
function FormattedInline({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  let i = 0
  let key = 0
  while (i < text.length) {
    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2)
      if (end !== -1) {
        parts.push(<strong key={key++}>{text.slice(i + 2, end)}</strong>)
        i = end + 2
        continue
      }
    }
    if (text[i] === '*') {
      const end = text.indexOf('*', i + 1)
      if (end !== -1) {
        parts.push(<em key={key++}>{text.slice(i + 1, end)}</em>)
        i = end + 1
        continue
      }
    }
    // plain run — find next marker
    let j = i + 1
    while (j < text.length && text[j] !== '*') j++
    parts.push(<React.Fragment key={key++}>{text.slice(i, j)}</React.Fragment>)
    i = j
  }
  return <>{parts}</>
}

function ProjectBand({ project, num }: { project: Project; num: number }) {
  const img = imageUrl(project.heroImage) || imageUrl(project.thumbnail)
  const tags = (project.services || []).slice(0, 3).map(serviceTitle).filter(Boolean)
  return (
    <Link
      href={`/projets/${project.slug}`}
      className="group relative block h-[90vh] min-h-[600px] overflow-hidden"
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
        className="relative z-10 h-full px-6 sm:px-10 pb-10 sm:pb-16 flex flex-col justify-end mx-auto text-[var(--color-paper)]"
        style={{ maxWidth: '1640px' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:gap-12 items-end">
          {/* Left: num + h3 (tagline with light/heavy markdown). The tagline can
              contain `*em*` (→ font-light) and `**strong**` (→ BRAVO accent) for
              the V7 weight-mix effect (e.g. "Together *for* tomorrow"). */}
          <div className="max-w-[56ch]">
            <div
              className="font-mono text-[0.75rem] tracking-[0.18em] uppercase font-semibold mb-4"
              style={{ color: 'var(--color-bravo-bright)' }}
            >
              {String(num).padStart(2, '0')}
              {project.year && ` — ${project.year}`} · {project.client}
            </div>
            <div
              className="prose-home-display wrap"
              style={
                {
                  '--display-size': 'clamp(2.6rem,6vw,5.5rem)',
                  '--display-color': 'var(--color-paper)',
                  '--display-accent': 'var(--color-bravo-bright)',
                } as React.CSSProperties
              }
            >
              <h3>
                <FormattedInline text={project.tagline || project.title} />
              </h3>
            </div>
          </div>

          {/* Right: tags + pill button */}
          <div className="flex flex-col gap-3 items-start md:items-end">
            {tags.length > 0 && (
              <div className="flex gap-3 font-mono text-[0.7rem] tracking-[0.12em] uppercase opacity-85">
                {tags.map((t, i) => (
                  <React.Fragment key={t}>
                    {i > 0 && <span>·</span>}
                    <span>{t}</span>
                  </React.Fragment>
                ))}
              </div>
            )}
            <span
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[var(--color-paper)] text-[var(--color-ink)] font-sans font-bold text-[0.85rem] tracking-[0.02em] transition-[background,color,transform,gap] duration-[300ms] group-hover:bg-[var(--color-bravo)] group-hover:text-[var(--color-paper)] group-hover:gap-4 group-hover:-translate-y-0.5"
            >
              Voir le projet <span>→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

type StudioSection = NonNullable<HomeGlobal['studioSection']>
type StudioTitle = StudioSection['title']

function StudioTeaser({
  members,
  label,
  titleRich,
  ctaLabel,
}: {
  members: Team[]
  label: string
  titleRich?: StudioTitle | null
  ctaLabel: string
}) {
  return (
    <section className="surface-ink px-6 sm:px-10 py-20 sm:py-36" id="studio">
      <div className="mx-auto" style={{ maxWidth: '1640px' }}>
        {/* Head */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end mb-12 sm:mb-20">
          <div className="flex flex-col gap-5">
            <span
              className="font-mono text-[0.7rem] tracking-[0.16em] uppercase font-bold inline-flex items-center gap-3"
              style={{ color: 'var(--color-bravo-bright)' }}
            >
              <span className="inline-block w-10 h-px bg-current" />
              {label}
            </span>
            <div
              className="prose-home-display"
              style={
                {
                  '--display-size': 'clamp(2.8rem,6vw,6rem)',
                  '--display-color': 'var(--color-paper)',
                  '--display-accent': 'var(--color-bravo-bright)',
                } as React.CSSProperties
              }
            >
              {titleRich ? (
                <RichText data={titleRich} enableGutter={false} />
              ) : (
                <>
                  <h2>Deux <em>têtes</em>,</h2>
                  <h2><strong>un écosystème</strong>.</h2>
                </>
              )}
            </div>
          </div>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 font-mono text-[0.78rem] tracking-[0.14em] uppercase font-semibold pb-1 border-b border-current text-[var(--color-paper)] hover:text-[var(--color-bravo-bright)] transition-colors"
          >
            {ctaLabel} <span>→</span>
          </Link>
        </div>

        {/* Member grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {members.map((m, i) => {
            const photo = imageUrl(m.photo)
            return (
              <Link
                key={m.id}
                href="/studio"
                className="group relative block h-[70vh] min-h-[480px] overflow-hidden rounded-[24px]"
              >
                {photo && (
                  <div
                    className="absolute inset-0 bg-center bg-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.04]"
                    style={{ backgroundImage: `url(${photo})` }}
                  />
                )}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(5,5,7,0.18) 0%, transparent 30%, transparent 55%, rgba(5,5,7,0.85) 100%)',
                  }}
                />
                <div className="relative z-10 h-full p-7 sm:p-9 flex flex-col justify-end text-[var(--color-paper)]">
                  <div className="flex items-end justify-between gap-6">
                    <div>
                      <h3 className="font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(1.8rem,3vw,2.6rem)] mb-2">
                        {m.name}
                      </h3>
                      <div
                        className="font-mono text-[0.72rem] tracking-[0.16em] uppercase font-semibold"
                        style={{ color: 'var(--color-bravo-soft)' }}
                      >
                        {m.role}
                      </div>
                    </div>
                    <div
                      className="font-display font-light text-[clamp(2.2rem,4vw,3.4rem)] leading-none opacity-65"
                      style={{ color: 'var(--color-bravo-soft)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ===========================================================
   Demo fallback content — used when no projects exist yet in Payload
   =========================================================== */

const DEMO_SLIDES: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=2400&q=85&auto=format',
    title: 'Together for tomorrow',
    client: 'WWF Belgium',
    year: 2024,
    tags: ['Campagne', 'Identité'],
    href: '/projets',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=2400&q=85&auto=format',
    title: 'Une marque qui respire',
    client: 'Eletheo',
    year: 2024,
    tags: ['Stratégie', 'Identité', 'Web'],
    href: '/projets',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2400&q=85&auto=format',
    title: 'Faire briller la science',
    client: 'Spark OH!',
    year: 2023,
    tags: ['Identité', 'Campagne'],
    href: '/projets',
  },
]

function DemoProjects() {
  return (
    <div className="px-6 sm:px-10 pb-12 mx-auto" style={{ maxWidth: '1640px' }}>
      <div
        className="border border-[color:var(--color-rule-dark)] rounded-[28px] p-12 sm:p-16 text-center"
      >
        <div
          className="font-mono text-[0.72rem] tracking-[0.18em] uppercase font-semibold mb-4"
          style={{ color: 'var(--color-bravo-soft)' }}
        >
          En préparation
        </div>
        <h3 className="font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(2rem,4vw,3.5rem)] mb-3 text-[var(--color-paper)]">
          Aucun projet <span className="font-editorial italic font-normal normal-case" style={{ color: 'var(--color-bravo-soft)' }}>en vedette</span> pour l'instant.
        </h3>
        <p className="font-editorial italic text-[1.05rem] opacity-80 max-w-[42ch] mx-auto text-[var(--color-paper)]">
          Crée un projet dans l'admin et coche « Mettre en avant » pour le faire apparaître ici.
        </p>
        <Link
          href="/admin/collections/projects/create"
          className="inline-block mt-8 px-5 py-3 rounded-full bg-[var(--color-paper)] text-[var(--color-ink)] font-sans font-bold text-sm hover:bg-[var(--color-bravo)] hover:text-[var(--color-paper)] transition-colors"
        >
          Créer un projet →
        </Link>
      </div>
    </div>
  )
}
