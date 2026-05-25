import Link from 'next/link'
import React from 'react'

/**
 * BRAVO! Footer — matches the design system established in mockups v7/v8/v9.
 * Static for now (4 columns: identity, studio, suivez, contact).
 * TODO: read from Payload `footer` global when the user fills it.
 */
export async function Footer() {
  return (
    <footer className="surface-ink relative border-t border-[color:var(--color-rule-dark)]">
      <div className="mx-auto max-w-[1640px] px-6 sm:px-10 pt-12 pb-8 grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8 items-start">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link
            href="/"
            className="font-sans font-black text-[2.4rem] leading-none tracking-[-0.02em] inline-block text-[var(--color-paper)]"
            aria-label="BRAVO! Agency"
          >
            BRAVO<span style={{ color: 'var(--color-bravo-bright)' }}>!</span>
          </Link>
          <p className="mt-4 text-[0.88rem] leading-[1.55] max-w-[28ch] opacity-65 text-[var(--color-paper)]">
            Agence de communication multidisciplinaire à Bruxelles. Engagement, sens, déclenchements.
          </p>
        </div>

        {/* Studio links */}
        <div>
          <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase font-bold opacity-55 mb-3 text-[var(--color-paper)]">
            Studio
          </div>
          <ul className="list-none grid gap-2 text-sm text-[var(--color-paper)]">
            <li>
              <Link href="/projets" className="hover:text-[var(--color-bravo-bright)] transition-colors">
                Travaux
              </Link>
            </li>
            <li>
              <Link href="/studio" className="hover:text-[var(--color-bravo-bright)] transition-colors">
                Équipe
              </Link>
            </li>
            <li>
              <Link href="/posts" className="hover:text-[var(--color-bravo-bright)] transition-colors">
                News
              </Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase font-bold opacity-55 mb-3 text-[var(--color-paper)]">
            Suivez
          </div>
          <ul className="list-none grid gap-2 text-sm text-[var(--color-paper)]">
            <li>
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-[var(--color-bravo-bright)] transition-colors"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com/"
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-[var(--color-bravo-bright)] transition-colors"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://behance.net/"
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-[var(--color-bravo-bright)] transition-colors"
              >
                Behance
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase font-bold opacity-55 mb-3 text-[var(--color-paper)]">
            Contact
          </div>
          <ul className="list-none grid gap-2 text-sm text-[var(--color-paper)]">
            <li>
              <a
                href="mailto:hello@bravo-agency.be"
                className="hover:text-[var(--color-bravo-bright)] transition-colors"
              >
                hello@bravo-agency.be
              </a>
            </li>
            <li className="opacity-75">Rue exemple 12, 1000 Bruxelles</li>
          </ul>
        </div>

        {/* Copy / legal — full width */}
        <div className="col-span-full pt-8 mt-8 border-t border-[color:var(--color-rule-dark)] flex justify-between flex-wrap gap-4 font-mono text-[0.7rem] tracking-[0.1em] uppercase opacity-55 text-[var(--color-paper)]">
          <div>© BRAVO! · 2026 — Bruxelles</div>
          <div className="flex gap-3">
            <Link href="/mentions" className="hover:opacity-100">Mentions</Link>
            <span aria-hidden>·</span>
            <Link href="/cookies" className="hover:opacity-100">Cookies</Link>
            <span aria-hidden>·</span>
            <Link href="/credits" className="hover:opacity-100">Crédits</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
