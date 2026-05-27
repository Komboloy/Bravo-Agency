import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import type { Category, Media, Post } from '@/payload-types'
import RichText from '@/components/RichText'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { JsonLd } from '@/components/JsonLd'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { getServerSideURL } from '@/utilities/getURL'

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
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return posts.docs.filter((p) => p.slug).map(({ slug }) => ({ slug: slug as string }))
}

type Args = { params: Promise<{ slug?: string }> }

export default async function PostPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  const img = imageUrl(post.heroImage) || imageUrl(post.meta?.image)
  const cats = categoriesLabel(post.categories)
  const siteUrl = getServerSideURL()
  const canonicalUrl = `${siteUrl}${url}`

  const related = (post.relatedPosts || []).filter(
    (p): p is Post => typeof p === 'object' && p !== null,
  )

  return (
    <article className="surface-ink min-h-screen">
      {draft && <LivePreviewListener />}
      <PayloadRedirects disableNotFound url={url} />

      {/* Schema.org Article */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          '@id': canonicalUrl,
          headline: post.title,
          url: canonicalUrl,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          inLanguage: 'fr-BE',
          image: img ? (img.startsWith('http') ? img : `${siteUrl}${img}`) : undefined,
          description: post.meta?.description || undefined,
          publisher: {
            '@type': 'Organization',
            name: 'BRAVO! Agency',
            url: siteUrl,
          },
        }}
      />

      {/* HERO — split image + title */}
      <section className="px-6 sm:px-10 pt-32 sm:pt-40 pb-12 sm:pb-16 section-rule-bravo">
        <div className="mx-auto" style={{ maxWidth: '1640px' }}>
          <div
            className="font-mono text-[0.72rem] tracking-[0.12em] uppercase mb-6 flex gap-2 items-center"
            style={{ color: 'var(--color-bravo-soft)' }}
          >
            <Link href="/" className="opacity-65 hover:opacity-100">
              Accueil
            </Link>
            <span className="opacity-40">/</span>
            <Link href="/posts" className="opacity-65 hover:opacity-100 border-b border-current pb-px">
              Bonnes nouvelles
            </Link>
            <span className="opacity-40">/</span>
            <span>{post.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 sm:gap-12 items-end">
            <div>
              <div
                className="font-mono text-[0.72rem] tracking-[0.16em] uppercase mb-6 flex flex-wrap gap-3"
                style={{ color: 'var(--color-bravo-soft)' }}
              >
                <span>{formatDate(post.publishedAt)}</span>
                {cats && (
                  <>
                    <span className="opacity-50">·</span>
                    <span>{cats}</span>
                  </>
                )}
              </div>
              <div
                className="prose-home-display wrap"
                style={
                  {
                    '--display-size': 'clamp(2.5rem,6vw,6rem)',
                    '--display-color': 'var(--color-paper)',
                    '--display-accent': 'var(--color-bravo-bright)',
                  } as React.CSSProperties
                }
              >
                <h1>{post.title}</h1>
              </div>
              {post.meta?.description && (
                <p className="mt-6 font-editorial italic text-[1.2rem] leading-[1.55] opacity-90 max-w-[48ch] text-[var(--color-paper)]">
                  {post.meta.description}
                </p>
              )}
            </div>
            {img && (
              <div className="relative aspect-[5/4] overflow-hidden bg-[var(--color-ink-2)]">
                <div
                  className="absolute inset-0 bg-center bg-cover"
                  style={{ backgroundImage: `url(${img})` }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ARTICLE CONTENT — paper bg for proper reading mood, after dark cinematic hero */}
      <section className="surface-paper px-6 sm:px-10 py-20 sm:py-32">
        <div className="mx-auto max-w-[48rem]">
          {/* Lede — meta description in editorial italic */}
          {post.meta?.description && (
            <p
              className="font-editorial italic text-[clamp(1.4rem,2.2vw,1.95rem)] leading-[1.45] mb-12 sm:mb-16 pb-10 sm:pb-14 border-b"
              style={{
                color: 'var(--color-ink)',
                borderColor: 'rgba(5,5,7,0.15)',
              }}
            >
              {post.meta.description}
            </p>
          )}

          {/* Body — drop cap on the first paragraph + display h2/h3, BRAVO accents.
              `enableProse={false}` to bypass Tailwind Typography defaults and let
              `.prose-article` rules drive the typography fully. */}
          <div className="prose-article">
            <RichText data={post.content} enableGutter={false} enableProse={false} />
          </div>
        </div>
      </section>

      {/* RELATED POSTS */}
      {related.length > 0 && (
        <section className="surface-ink section-rule-bravo py-20 sm:py-28 px-6 sm:px-10">
          <div className="mx-auto" style={{ maxWidth: '1640px' }}>
            <div
              className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end mb-10 pb-4 border-b"
              style={{ borderColor: 'var(--color-rule-dark)' }}
            >
              <h2 className="font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(2.4rem,5vw,4.5rem)] text-[var(--color-paper)]">
                À lire{' '}
                <span className="font-editorial italic font-normal normal-case tracking-[-0.02em]" style={{ color: 'var(--color-bravo-soft)' }}>
                  ensuite.
                </span>
              </h2>
              <Link
                href="/posts"
                className="inline-flex items-center gap-1.5 font-mono text-[0.78rem] tracking-[0.14em] uppercase font-semibold border-b border-current pb-1 text-[var(--color-paper)] hover:text-[var(--color-bravo-bright)] transition-colors"
              >
                Toutes les nouvelles <span>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
              {related.slice(0, 3).map((r) => {
                const rImg = imageUrl(r.heroImage) || imageUrl(r.meta?.image)
                return (
                  <Link key={r.id} href={`/posts/${r.slug}`} className="group block">
                    <div className="aspect-[4/5] overflow-hidden bg-[var(--color-ink-2)] relative">
                      {rImg && (
                        <div
                          className="absolute inset-0 bg-center bg-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.05]"
                          style={{ backgroundImage: `url(${rImg})` }}
                        />
                      )}
                    </div>
                    <div className="mt-4">
                      <div
                        className="font-mono text-[0.7rem] tracking-[0.1em] uppercase mb-2"
                        style={{ color: 'var(--color-bravo-soft)' }}
                      >
                        {formatDate(r.publishedAt)}
                      </div>
                      <h3 className="font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[1.6rem] text-[var(--color-paper)]">
                        {r.title}
                      </h3>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Back to index */}
      <section className="px-6 sm:px-10 py-16 sm:py-20 section-rule-bravo-top text-center">
        <Link
          href="/posts"
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-current font-mono text-[0.78rem] tracking-[0.16em] uppercase font-semibold text-[var(--color-paper)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)] transition-colors"
        >
          ← Toutes les bonnes nouvelles
        </Link>
      </section>
    </article>
  )
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    depth: 2,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })
  return (result.docs?.[0] as Post | undefined) || null
})

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })
  return generateMeta({ doc: post })
}
