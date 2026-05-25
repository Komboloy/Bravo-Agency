import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Media, Project } from '@/payload-types'
import { HeroCarousel, type HeroSlide } from '@/components/HeroCarousel'

export const dynamic = 'force-static'
export const revalidate = 600

const SERVICE_LABELS: Record<string, string> = {
  'brand-strategy': 'Stratégie',
  'visual-identity': 'Identité',
  website: 'Web',
  campaign: 'Campagne',
  'art-direction': 'Direction artistique',
  video: 'Vidéo',
  print: 'Print',
  social: 'Social',
  events: 'Événementiel',
  consulting: 'Conseil',
}

function imageUrl(m: number | Media | null | undefined): string | null {
  if (!m || typeof m === 'number') return null
  return m.url || null
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

  const heroSlides: HeroSlide[] = featured.docs.length > 0
    ? (featured.docs as Project[]).map((p) => ({
        imageUrl: imageUrl(p.heroImage) || imageUrl(p.thumbnail),
        title: p.tagline || '',
        client: p.client,
        year: p.year ?? null,
        tags: (p.services || []).slice(0, 3).map((s) => SERVICE_LABELS[s] || s),
        href: `/projets/${p.slug}`,
      }))
    : DEMO_SLIDES

  const projects = (featured.docs as Project[]).length > 0
    ? (featured.docs as Project[])
    : null

  return (
    <main className="surface-ink">
      {/* HERO carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* MARQUEE — BRAVO color band */}
      <div className="surface-bravo overflow-hidden py-3.5 border-y" style={{ borderColor: 'var(--color-bravo-bright)' }}>
        <div className="flex gap-12 whitespace-nowrap font-mono font-medium text-[0.78rem] tracking-[0.18em] uppercase animate-[marquee_38s_linear_infinite]">
          {Array.from({ length: 2 }).map((_, k) => (
            <React.Fragment key={k}>
              <span>Together for tomorrow</span>
              <span style={{ color: 'var(--color-bravo-soft)' }}>✦</span>
              <span>Porteurs de sens</span>
              <span style={{ color: 'var(--color-bravo-soft)' }}>✦</span>
              <span>Déclencheurs d'actions</span>
              <span style={{ color: 'var(--color-bravo-soft)' }}>✦</span>
              <span>Une goutte d'eau</span>
              <span style={{ color: 'var(--color-bravo-soft)' }}>✦</span>
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
            À propos · 01
          </span>
          <h2 className="font-display font-extrabold uppercase leading-[0.92] tracking-[-0.01em] text-[clamp(2.8rem,8vw,8.5rem)] max-w-[16ch]">
            On accompagne<br />
            <span className="font-light">l'engagement</span>
            <br />
            des marques.
            <br />
            <span style={{ color: 'var(--color-bravo)' }}>Pas leurs slogans.</span>
          </h2>
        </div>
      </section>

      {/* PROJECTS BANDS — full bleed */}
      <section className="surface-ink pt-20 sm:pt-32" id="travaux">
        <div className="px-6 sm:px-10 grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-8 mb-12 sm:mb-20 mx-auto" style={{ maxWidth: '1640px' }}>
          <div>
            <span className="section-label" style={{ color: 'var(--color-bravo-bright)' }}>
              Travaux · Sélection 2026
            </span>
            <h2 className="mt-5 font-display font-extrabold uppercase leading-[0.92] tracking-[-0.01em] text-[clamp(2.8rem,7vw,7rem)] max-w-[14ch] text-[var(--color-paper)]">
              Quelques <span className="font-light">projets</span>
              <br />
              <span className="font-editorial italic font-normal normal-case tracking-[-0.02em]" style={{ color: 'var(--color-bravo-bright)' }}>
                qui nous représentent
              </span>
              .
            </h2>
          </div>
          <Link
            href="/projets"
            className="inline-flex items-center gap-2 font-mono text-[0.78rem] tracking-[0.14em] uppercase font-semibold border-b border-current pb-1 text-[var(--color-paper)] hover:text-[var(--color-bravo-bright)] transition-colors"
          >
            Voir tous les projets <span>→</span>
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
          <span
            className="inline-block font-mono text-[0.72rem] tracking-[0.32em] uppercase font-semibold mb-8 opacity-85"
          >
            Manifeste
          </span>
          <h2 className="font-display font-light uppercase leading-[0.92] tracking-[-0.005em] text-[clamp(2.8rem,9vw,9rem)] max-w-[16ch] mx-auto text-[var(--color-paper)]">
            Une <span className="font-extrabold">goutte d'eau</span>
            <br />
            peut-être.
            <br />
            Heureusement,
            <br />
            <span className="font-extrabold">on n'est pas seuls</span>.
          </h2>
        </div>
      </section>

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
            Premier pas
            <span className="inline-block w-10 h-px bg-current" />
          </span>
          <h2 className="font-display font-extrabold uppercase leading-[0.88] tracking-[-0.015em] text-[clamp(3.5rem,12vw,14rem)] max-w-[12ch] mx-auto mb-12">
            Allez,
            <br />
            <span className="font-light">on en</span>{' '}
            <span className="font-editorial italic font-normal normal-case tracking-[-0.02em]" style={{ color: 'var(--color-bravo)' }}>
              parle
            </span>
            <span className="font-light">?</span>
          </h2>
          <a
            href="mailto:hello@bravo-agency.be"
            className="inline-flex items-center gap-3 px-8 py-5 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-sans font-bold text-[1rem] hover:bg-[var(--color-bravo)] hover:gap-5 transition-[background,gap,transform] hover:-translate-y-0.5"
          >
            hello@bravo-agency.be <span>→</span>
          </a>
        </div>
      </section>
    </main>
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
              <span className="font-editorial italic font-normal normal-case tracking-[-0.02em]">{project.tagline}</span>
            </>
          )}
        </h3>
      </div>
    </Link>
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
