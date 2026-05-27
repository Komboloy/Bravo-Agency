import type { Metadata } from 'next/types'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Category, Media, Post } from '@/payload-types'

export const dynamic = 'force-static'
export const revalidate = 600

const PAGE_LIMIT = 13 // 1 featured + 12 grid

function imageUrl(m: number | Media | null | undefined): string | null {
  if (!m || typeof m === 'number') return null
  return m.url || null
}

function categoriesLabel(cats: Post['categories']): string {
  if (!cats || cats.length === 0) return ''
  return cats
    .map((c) => (typeof c === 'object' && c !== null ? (c as Category).title : null))
    .filter(Boolean)
    .join(' · ')
}

function formatDate(iso?: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('fr-BE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export const metadata: Metadata = {
  title: 'Bonnes nouvelles — BRAVO! Agency',
  description:
    "Édito, retours d'expérience et carnets de bord du studio BRAVO! Agency. Quelques gouttes d'eau dans l'océan.",
}

export default async function PostsPage() {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: PAGE_LIMIT,
    overrideAccess: false,
    sort: '-publishedAt',
    where: {
      _status: { equals: 'published' },
    },
  })

  const posts = result.docs as Post[]
  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <main className="surface-ink min-h-screen">
      {/* PAGE HERO — 100vh full-bleed with animated BRAVO atmosphere blobs */}
      <section className="relative min-h-screen flex items-end atmosphere-bravo-drift px-6 sm:px-10 pt-32 sm:pt-44 pb-[15vh] sm:pb-[18vh] section-rule-bravo">
        <div
          className="relative z-10 mx-auto w-full grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12 items-end"
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
              <span>News</span>
            </div>
            <div
              className="prose-home-display wrap"
              style={
                {
                  '--display-size': 'clamp(4.5rem,15vw,16rem)',
                  '--display-color': 'var(--color-paper)',
                  '--display-accent': 'var(--color-bravo-bright)',
                } as React.CSSProperties
              }
            >
              <h1>Bonnes</h1>
              <h1><strong>nouvelles</strong>.</h1>
            </div>
          </div>
          <p className="font-editorial italic text-[1.2rem] leading-[1.5] max-w-[38ch] opacity-92 text-[var(--color-paper)]">
            Quelques{' '}
            <strong className="font-sans not-italic font-bold" style={{ color: 'var(--color-bravo-soft)' }}>
              gouttes d'eau
            </strong>{' '}
            dans l'océan pour étancher la soif de changement, garder la tête hors de l'eau, éteindre les incendies.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      {posts.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="mx-auto px-6 sm:px-10 py-12 sm:py-20" style={{ maxWidth: '1640px' }}>
          {featured && <FeaturedPost post={featured} />}

          {rest.length > 0 && (
            <div className="mt-12 sm:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {rest.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}

          {result.totalPages > 1 && (
            <div className="mt-16 pt-8 border-t flex justify-between items-center font-mono text-[0.78rem] tracking-[0.14em] uppercase opacity-75" style={{ borderColor: 'var(--color-rule-dark)' }}>
              <span>
                Page 01 / {String(result.totalPages).padStart(2, '0')} · {result.totalDocs} articles
              </span>
              <span className="text-[var(--color-bravo-soft)]">Pagination à venir →</span>
            </div>
          )}
        </section>
      )}
    </main>
  )
}

/* ===========================================================
   Featured (most recent) — wide editorial card
   =========================================================== */

function FeaturedPost({ post }: { post: Post }) {
  const img = imageUrl(post.heroImage) || imageUrl(post.meta?.image)
  const cats = categoriesLabel(post.categories)
  return (
    <Link href={`/posts/${post.slug}`} className="group grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 sm:gap-10 items-stretch">
      <div className="relative overflow-hidden aspect-[16/10] bg-[var(--color-ink-2)]">
        {img && (
          <div
            className="absolute inset-0 bg-center bg-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.04]"
            style={{ backgroundImage: `url(${img})` }}
          />
        )}
        <span
          className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full font-mono text-[0.65rem] tracking-[0.18em] uppercase font-bold"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%), rgba(73, 35, 244, 0.55)',
            color: 'var(--color-paper)',
            backdropFilter: 'blur(12px) saturate(170%)',
            WebkitBackdropFilter: 'blur(12px) saturate(170%)',
            border: '1px solid rgba(244,237,225,0.22)',
          }}
        >
          ● À la une
        </span>
      </div>
      <div className="flex flex-col gap-4 justify-end">
        <div
          className="font-mono text-[0.72rem] tracking-[0.16em] uppercase font-medium flex flex-wrap gap-3"
          style={{ color: 'var(--color-bravo-soft)' }}
        >
          <span>{formatDate(post.publishedAt)}</span>
          {cats && <><span className="opacity-50">·</span><span>{cats}</span></>}
        </div>
        <h2 className="font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(2.2rem,4.5vw,4rem)] text-[var(--color-paper)]">
          {post.title}
        </h2>
        {post.meta?.description && (
          <p className="font-editorial italic text-[1.1rem] leading-[1.55] opacity-90 max-w-[48ch] text-[var(--color-paper)]">
            {post.meta.description}
          </p>
        )}
        <span
          className="mt-2 inline-flex items-center gap-1.5 font-mono text-[0.72rem] tracking-[0.12em] uppercase font-semibold pb-1 border-b border-current self-start text-[var(--color-paper)] group-hover:text-[var(--color-bravo-soft)] transition-colors"
        >
          Lire l'article <span>→</span>
        </span>
      </div>
    </Link>
  )
}

/* ===========================================================
   Card (smaller posts)
   =========================================================== */

function PostCard({ post }: { post: Post }) {
  const img = imageUrl(post.heroImage) || imageUrl(post.meta?.image)
  const cats = categoriesLabel(post.categories)
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <div className="relative overflow-hidden aspect-[4/5] bg-[var(--color-ink-2)]">
        {img ? (
          <div
            className="absolute inset-0 bg-center bg-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.05]"
            style={{ backgroundImage: `url(${img})` }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, var(--color-ink-2), var(--color-bravo-deep))',
            }}
          />
        )}
      </div>
      <div className="mt-4">
        <div
          className="font-mono text-[0.7rem] tracking-[0.14em] uppercase font-medium mb-2 flex flex-wrap gap-2"
          style={{ color: 'var(--color-bravo-soft)' }}
        >
          <span>{formatDate(post.publishedAt)}</span>
          {cats && <><span className="opacity-50">·</span><span className="opacity-85">{cats}</span></>}
        </div>
        <h3 className="font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(1.6rem,2.2vw,2.1rem)] text-[var(--color-paper)] group-hover:text-[var(--color-bravo-soft)] transition-colors">
          {post.title}
        </h3>
        {post.meta?.description && (
          <p className="mt-2 font-sans text-[0.95rem] leading-[1.55] opacity-75 max-w-[46ch] text-[var(--color-paper)] line-clamp-3">
            {post.meta.description}
          </p>
        )}
      </div>
    </Link>
  )
}

/* ===========================================================
   Empty state
   =========================================================== */

function EmptyState() {
  return (
    <section className="mx-auto px-6 sm:px-10 py-20" style={{ maxWidth: '1640px' }}>
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
        <h2 className="font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(2rem,4vw,3.5rem)] text-[var(--color-paper)] mb-4">
          Aucune{' '}
          <span
            className="font-editorial italic font-normal normal-case"
            style={{ color: 'var(--color-bravo-soft)' }}
          >
            bonne nouvelle
          </span>{' '}
          publiée pour l'instant.
        </h2>
        <p className="font-editorial italic text-[1.05rem] opacity-80 max-w-[42ch] mx-auto text-[var(--color-paper)]">
          Ajoute un article dans l'admin Payload (collection « Bonnes nouvelles ») pour le voir apparaître ici.
        </p>
        <Link
          href="/admin/collections/posts/create"
          className="inline-block mt-8 px-5 py-3 rounded-full bg-[var(--color-paper)] text-[var(--color-ink)] font-sans font-bold text-sm hover:bg-[var(--color-bravo)] hover:text-[var(--color-paper)] transition-colors"
        >
          Écrire un article →
        </Link>
      </div>
    </section>
  )
}
