import Link from 'next/link'
import React from 'react'

/**
 * Shared layout for legal/static pages — /mentions, /cookies, /credits.
 * Sober BRAVO DNA: dark surface, page hero, content blocks with mono labels.
 */
export function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  breadcrumb,
  children,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  lastUpdated?: string
  breadcrumb: string
  children: React.ReactNode
}) {
  return (
    <main className="surface-ink min-h-screen">
      {/* PAGE HERO */}
      <section className="px-6 sm:px-10 pt-32 sm:pt-44 pb-12 sm:pb-16 section-rule-bravo">
        <div className="mx-auto" style={{ maxWidth: '1100px' }}>
          <div
            className="font-mono text-[0.72rem] tracking-[0.12em] uppercase mb-6 flex gap-2 items-center"
            style={{ color: 'var(--color-bravo-soft)' }}
          >
            <Link href="/" className="opacity-65 hover:opacity-100">
              Accueil
            </Link>
            <span className="opacity-40">/</span>
            <span>{breadcrumb}</span>
          </div>
          <h1 className="font-display font-extrabold uppercase leading-[0.92] tracking-[-0.005em] text-[clamp(3rem,8vw,7rem)] text-[var(--color-paper)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 font-editorial italic text-[1.1rem] leading-[1.55] opacity-85 max-w-[55ch] text-[var(--color-paper)]">
              {subtitle}
            </p>
          )}
          {lastUpdated && (
            <div
              className="mt-8 font-mono text-[0.7rem] tracking-[0.12em] uppercase opacity-55 text-[var(--color-paper)]"
            >
              Mise à jour : {lastUpdated}
            </div>
          )}
        </div>
      </section>

      {/* CONTENT */}
      <section className="px-6 sm:px-10 py-16 sm:py-24">
        <div
          className="mx-auto font-sans text-[1rem] leading-[1.7] text-[var(--color-paper)] [&_h2]:font-display [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:tracking-[-0.005em] [&_h2]:text-[clamp(1.6rem,3vw,2.4rem)] [&_h2]:leading-[0.95] [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-[var(--color-paper)] [&_h3]:font-display [&_h3]:font-bold [&_h3]:uppercase [&_h3]:text-[1.2rem] [&_h3]:tracking-[-0.005em] [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-[var(--color-paper)] [&_p]:my-3 [&_p]:opacity-90 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_li]:opacity-90 [&_li]:mb-1 [&_a]:underline [&_a]:decoration-[var(--color-bravo-soft)] [&_a:hover]:text-[var(--color-bravo-soft)] [&_strong]:font-bold [&_strong]:text-[var(--color-bravo-soft)]"
          style={{ maxWidth: '750px' }}
        >
          {children}
        </div>
      </section>

      {/* Back link */}
      <section className="px-6 sm:px-10 py-16 section-rule-bravo-top text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-current font-mono text-[0.78rem] tracking-[0.16em] uppercase font-semibold text-[var(--color-paper)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)] transition-colors"
        >
          ← Retour à l'accueil
        </Link>
      </section>
    </main>
  )
}

/** A definition-list style table for legal info rows. */
export function LegalTable({
  rows,
}: {
  rows: { k: string; v: React.ReactNode }[]
}) {
  return (
    <dl
      className="my-8 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-y-3 gap-x-6 border-t border-b py-6"
      style={{ borderColor: 'var(--color-rule-dark)' }}
    >
      {rows.map((r, i) => (
        <React.Fragment key={i}>
          <dt className="font-mono text-[0.7rem] tracking-[0.12em] uppercase opacity-55">
            {r.k}
          </dt>
          <dd className="text-[0.95rem] leading-[1.55] mb-2 sm:mb-0">{r.v}</dd>
        </React.Fragment>
      ))}
    </dl>
  )
}
