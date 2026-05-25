import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Media, Team } from '@/payload-types'
import RichText from '@/components/RichText'
import { JsonLd } from '@/components/JsonLd'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-static'
export const revalidate = 600

function imageUrl(m: number | Media | null | undefined): string | null {
  if (!m || typeof m === 'number') return null
  return m.url || null
}

export const metadata: Metadata = {
  title: 'Studio — BRAVO! Agency',
  description:
    "L'équipe BRAVO! et son écosystème. Deux têtes resserrées au studio à Bruxelles, et autour de nous un réseau de partenaires précis et fidèles.",
}

export default async function StudioPage() {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'team',
    depth: 1,
    limit: 50,
    overrideAccess: false,
    sort: 'order',
    where: {
      _status: { equals: 'published' },
    },
  })

  const members = result.docs as Team[]
  const siteUrl = getServerSideURL()

  return (
    <main className="surface-ink min-h-screen">
      {/* Schema.org AboutPage with the team as members */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          '@id': `${siteUrl}/studio`,
          mainEntity: {
            '@type': 'Organization',
            name: 'BRAVO! Agency',
            url: siteUrl,
            employee: members.map((m) => ({
              '@type': 'Person',
              name: m.name,
              jobTitle: m.role,
              ...(m.email && { email: m.email }),
              ...(imageUrl(m.photo) && {
                image: imageUrl(m.photo)?.startsWith('http')
                  ? imageUrl(m.photo)
                  : `${siteUrl}${imageUrl(m.photo)}`,
              }),
              ...(m.links && m.links.length > 0 && {
                sameAs: m.links.map((l) => l.url),
              }),
            })),
          },
        }}
      />

      {/* PAGE HERO */}
      <section className="px-6 sm:px-10 pt-32 sm:pt-44 pb-16 sm:pb-24 section-rule-bravo">
        <div
          className="mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12 items-end"
          style={{ maxWidth: '1640px' }}
        >
          <div>
            <div
              className="font-mono text-[0.72rem] tracking-[0.12em] uppercase mb-6 flex gap-2 items-center"
              style={{ color: 'var(--color-bravo-soft)' }}
            >
              <Link href="/" className="opacity-65 hover:opacity-100">
                Accueil
              </Link>
              <span className="opacity-40">/</span>
              <span>Studio</span>
            </div>
            <h1 className="font-display font-extrabold uppercase leading-[0.84] tracking-[-0.015em] text-[clamp(5rem,16vw,18rem)] text-[var(--color-paper)]">
              Studio<br />
              <span
                className="font-editorial italic font-normal normal-case tracking-[-0.02em]"
                style={{ color: 'var(--color-bravo-soft)' }}
              >
                — deux têtes, un écosystème.
              </span>
            </h1>
          </div>
          <p className="font-editorial italic text-[1.2rem] leading-[1.5] max-w-[38ch] opacity-92 text-[var(--color-paper)]">
            <strong
              className="font-sans not-italic font-bold"
              style={{ color: 'var(--color-bravo-soft)' }}
            >
              {members.length} {members.length <= 1 ? 'co-fondateur' : 'co-fondateurs'}
            </strong>{' '}
            au studio à Bruxelles, et autour de nous un réseau de partenaires précis,
            choisis pour ce qu'ils font de mieux.
          </p>
        </div>
      </section>

      {/* MANIFESTO — BRAVO color band */}
      <section className="surface-bravo bravo-atmosphere px-6 sm:px-10 py-24 sm:py-36">
        <div
          className="relative z-10 mx-auto grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-20 items-end"
          style={{ maxWidth: '1640px' }}
        >
          <span className="section-label" style={{ color: 'var(--color-paper)' }}>
            §01 · Manifesto
          </span>
          <div className="text-[var(--color-paper)]">
            <h2 className="font-display font-extrabold uppercase leading-[0.92] tracking-[-0.005em] text-[clamp(2.4rem,6vw,6rem)]">
              Porteurs <span className="font-light">de</span> sens.
              <br />
              <span
                className="font-editorial italic font-normal normal-case tracking-[-0.02em]"
                style={{ opacity: 0.92 }}
              >
                Déclencheurs
              </span>{' '}
              <span className="font-light">d'actions.</span>
            </h2>
            <p className="mt-8 font-sans text-[1.05rem] leading-[1.65] max-w-[56ch] opacity-94">
              On ne sait pas tout faire — et c'est tant mieux. Notre force, c'est de tracer
              une intention claire, puis d'orchestrer les meilleurs partenaires autour d'elle :
              stratèges, photographes, motion designers, développeurs, sociologues. Chacun
              choisi pour ce qu'il fait de mieux.
            </p>
          </div>
        </div>
      </section>

      {/* TEAM GRID */}
      <section
        className="surface-ink section-rule-bravo py-20 sm:py-32 px-6 sm:px-10"
        id="team"
      >
        <div className="mx-auto" style={{ maxWidth: '1640px' }}>
          <div
            className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end mb-12 sm:mb-16 pb-6 border-b"
            style={{ borderColor: 'var(--color-rule-dark)' }}
          >
            <div>
              <span className="section-label" style={{ color: 'var(--color-bravo-soft)' }}>
                §02 · Équipe · Effectif
              </span>
              <h2 className="mt-4 font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(2.4rem,5.5vw,5rem)] text-[var(--color-paper)]">
                Les{' '}
                <span
                  className="font-editorial italic font-normal normal-case tracking-[-0.02em]"
                  style={{ color: 'var(--color-bravo-soft)' }}
                >
                  visages
                </span>{' '}
                derrière le travail.
              </h2>
            </div>
            <span
              className="font-mono text-[0.78rem] tracking-[0.14em] uppercase font-semibold"
              style={{ color: 'var(--color-bravo-soft)' }}
            >
              {members.length.toString().padStart(2, '0')} ·{' '}
              {members.length <= 1 ? 'Co-fondateur' : 'Co-fondateurs'}
            </span>
          </div>

          {members.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              {members.map((m, i) => (
                <MemberCard key={m.id} member={m} index={i + 1} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ECOSYSTEM CTA */}
      <section className="surface-paper relative overflow-hidden px-6 sm:px-10 py-32 sm:py-44 text-center">
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, var(--color-bravo) 0%, transparent 55%)',
            filter: 'blur(150px)',
            opacity: 0.28,
          }}
        />
        <div className="relative z-10 mx-auto" style={{ maxWidth: '1100px' }}>
          <span
            className="inline-flex items-center gap-3 font-mono text-[0.72rem] tracking-[0.32em] uppercase font-bold mb-8"
            style={{ color: 'var(--color-bravo)' }}
          >
            <span className="inline-block w-10 h-px bg-current" />
            Notre réseau
            <span className="inline-block w-10 h-px bg-current" />
          </span>
          <h2 className="font-display font-light uppercase leading-[0.92] tracking-[-0.005em] text-[clamp(2.8rem,8vw,8rem)] max-w-[16ch] mx-auto">
            On <span className="font-extrabold">orchestre</span>,
            <br />
            on ne{' '}
            <span
              className="font-editorial italic font-normal normal-case tracking-[-0.02em]"
              style={{ color: 'var(--color-bravo)' }}
            >
              sous-traite
            </span>{' '}
            pas.
          </h2>
          <p className="mt-8 font-editorial italic text-[1.15rem] leading-[1.55] opacity-85 max-w-[52ch] mx-auto">
            Pour chaque projet, on assemble l'équipe qu'il mérite — pas celle qu'on a sous la
            main. C'est ce qui fait que nos livrables ne se ressemblent pas tous.
          </p>
          <a
            href="mailto:hello@bravo-agency.be"
            className="inline-flex items-center gap-3 mt-10 px-8 py-5 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-sans font-bold text-[1rem] hover:bg-[var(--color-bravo)] hover:gap-5 transition-[background,gap,transform] hover:-translate-y-0.5"
          >
            Discutons d'un projet <span>→</span>
          </a>
        </div>
      </section>
    </main>
  )
}

/* ===========================================================
   Member card
   =========================================================== */

function MemberCard({ member, index }: { member: Team; index: number }) {
  const photo = imageUrl(member.photo)
  const photoHover = imageUrl(member.photoHover)
  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-ink-2)]">
        {photo && (
          <div
            className="absolute inset-0 bg-center bg-cover transition-opacity duration-700"
            style={{ backgroundImage: `url(${photo})` }}
          />
        )}
        {photoHover && (
          <div
            className="absolute inset-0 bg-center bg-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ backgroundImage: `url(${photoHover})` }}
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, transparent 50%, rgba(5,5,7,0.78) 100%)',
          }}
        />
        <div className="absolute left-6 right-6 bottom-6 z-10 grid grid-cols-[1fr_auto] gap-3 items-end text-[var(--color-paper)]">
          <div>
            <h3 className="font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(2rem,3vw,2.8rem)]">
              {member.name}
            </h3>
            <div
              className="font-mono text-[0.7rem] tracking-[0.16em] uppercase font-medium opacity-85 mt-1"
            >
              {member.role}
            </div>
          </div>
          <span
            className="font-mono text-base font-bold"
            style={{ color: 'var(--color-bravo-soft)' }}
          >
            {String(index).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Bio + links */}
      {(member.bio || member.email || (member.links && member.links.length > 0)) && (
        <div className="mt-6 text-[var(--color-paper)] grid gap-4">
          {member.bio && (
            <div className="font-sans text-[0.98rem] leading-[1.65] opacity-90 max-w-[55ch] prose-bravo">
              <RichText data={member.bio} enableGutter={false} />
            </div>
          )}
          {(member.email || (member.links && member.links.length > 0)) && (
            <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.72rem] tracking-[0.12em] uppercase">
              {member.links?.map((l) => (
                <a
                  key={l.id || l.url}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="border-b pb-px hover:text-[var(--color-bravo-soft)] hover:border-[var(--color-bravo-soft)] transition-colors"
                  style={{ borderColor: 'currentColor' }}
                >
                  {l.label}
                </a>
              ))}
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="border-b pb-px hover:text-[var(--color-bravo-soft)] hover:border-[var(--color-bravo-soft)] transition-colors"
                  style={{ borderColor: 'currentColor' }}
                >
                  Email
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  )
}

function EmptyState() {
  return (
    <div
      className="border rounded-[28px] p-12 sm:p-16 text-center max-w-3xl mx-auto"
      style={{ borderColor: 'var(--color-rule-dark)' }}
    >
      <div
        className="font-mono text-[0.72rem] tracking-[0.18em] uppercase font-semibold mb-4"
        style={{ color: 'var(--color-bravo-soft)' }}
      >
        En préparation
      </div>
      <h3 className="font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(2rem,4vw,3.5rem)] mb-4 text-[var(--color-paper)]">
        Aucun{' '}
        <span
          className="font-editorial italic font-normal normal-case"
          style={{ color: 'var(--color-bravo-soft)' }}
        >
          membre
        </span>{' '}
        publié pour l'instant.
      </h3>
      <p className="font-editorial italic text-[1.05rem] opacity-80 max-w-[42ch] mx-auto text-[var(--color-paper)]">
        Ajoute un membre dans l'admin Payload (collection « L'équipe ») pour le voir apparaître ici.
      </p>
      <Link
        href="/admin/collections/team/create"
        className="inline-block mt-8 px-5 py-3 rounded-full bg-[var(--color-paper)] text-[var(--color-ink)] font-sans font-bold text-sm hover:bg-[var(--color-bravo)] hover:text-[var(--color-paper)] transition-colors"
      >
        Ajouter un membre →
      </Link>
    </div>
  )
}
