import Link from 'next/link'
import React from 'react'

import type { Footer as FooterType, Page, Post, Project } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'

type SimpleLink = { label: string; href: string; newTab?: boolean }

// Resolve a Payload `link` field to a {label, href} renderable
type PayloadNavItem = NonNullable<FooterType['navItems']>[number]
type PayloadLink = PayloadNavItem['link']

function resolveLink(link: PayloadLink | undefined | null): SimpleLink | null {
  if (!link || !link.label) return null
  const newTab = link.newTab || false

  if (link.type === 'custom' && link.url) {
    return { label: link.label, href: link.url, newTab }
  }
  if (link.type === 'reference' && link.reference) {
    const { relationTo, value } = link.reference
    if (typeof value !== 'object' || value === null) return null
    const slug = (value as Page | Post | Project).slug
    if (!slug) return null
    if (relationTo === 'pages') return { label: link.label, href: `/${slug}`, newTab }
    if (relationTo === 'posts') return { label: link.label, href: `/posts/${slug}`, newTab }
    if (relationTo === 'projects') return { label: link.label, href: `/projets/${slug}`, newTab }
  }
  return null
}

// Defaults — used when the user has not filled the Payload `footer` global
const DEFAULT_TAGLINE =
  'Agence de communication multidisciplinaire à Bruxelles. Engagement, sens, déclenchements.'
const DEFAULT_COLUMNS: { title: string; links: SimpleLink[] }[] = [
  {
    title: 'Studio',
    links: [
      { label: 'Travaux', href: '/projets' },
      { label: 'Équipe', href: '/studio' },
      { label: 'News', href: '/posts' },
    ],
  },
  {
    title: 'Suivez',
    links: [
      { label: 'Instagram', href: 'https://instagram.com/', newTab: true },
      { label: 'LinkedIn', href: 'https://linkedin.com/', newTab: true },
      { label: 'Behance', href: 'https://behance.net/', newTab: true },
    ],
  },
]
const DEFAULT_LEGAL: SimpleLink[] = [
  { label: 'Mentions', href: '/mentions' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Crédits', href: '/credits' },
]
const DEFAULT_CONTACT = {
  email: 'hello@bravo-agency.be',
  phone: '',
  address: 'Rue exemple 12\n1000 Bruxelles · Belgique',
}

export async function Footer() {
  let data: FooterType | null = null
  try {
    data = (await getCachedGlobal('footer', 1)()) as FooterType
  } catch (_e) {
    data = null
  }

  const tagline = data?.tagline || DEFAULT_TAGLINE

  // Resolve columns (with fallback)
  const cmsColumns = (data?.columns || [])
    .map((c) => {
      const links = (c.links || [])
        .map((li) => resolveLink(li.link))
        .filter((x): x is SimpleLink => x !== null)
      if (!c.title || links.length === 0) return null
      return { title: c.title, links }
    })
    .filter((x): x is { title: string; links: SimpleLink[] } => x !== null)
  const columns = cmsColumns.length > 0 ? cmsColumns : DEFAULT_COLUMNS

  // Contact (with fallback)
  const contact = {
    email: data?.contact?.email || DEFAULT_CONTACT.email,
    phone: data?.contact?.phone || DEFAULT_CONTACT.phone,
    address: data?.contact?.address || DEFAULT_CONTACT.address,
  }

  // Legal links (with fallback)
  const cmsLegal = (data?.legalLinks || [])
    .map((li) => resolveLink(li.link))
    .filter((x): x is SimpleLink => x !== null)
  const legal = cmsLegal.length > 0 ? cmsLegal : DEFAULT_LEGAL

  return (
    <footer className="surface-ink relative border-t" style={{ borderColor: 'var(--color-rule-dark)' }}>
      <div
        className="mx-auto px-6 sm:px-10 pt-12 pb-8 grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8 items-start"
        style={{ maxWidth: '1640px' }}
      >
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link
            href="/"
            className="font-sans font-black text-[2.4rem] leading-none tracking-[-0.02em] inline-block text-[var(--color-paper)]"
            aria-label="BRAVO! Agency"
          >
            BRAVO<span style={{ color: 'var(--color-bravo-bright)' }}>!</span>
          </Link>
          <p className="mt-4 text-[0.88rem] leading-[1.55] max-w-[28ch] opacity-65 text-[var(--color-paper)] whitespace-pre-line">
            {tagline}
          </p>
        </div>

        {/* Columns 1-2 (Studio + Suivez or whatever the user defined) */}
        {columns.slice(0, 2).map((col, i) => (
          <FooterColumn key={i} title={col.title} links={col.links} />
        ))}

        {/* Contact column (always last, with structured info) */}
        <FooterContactColumn contact={contact} />

        {/* Bottom legal strip — full width */}
        <div
          className="col-span-full pt-8 mt-8 border-t flex justify-between flex-wrap gap-4 font-mono text-[0.7rem] tracking-[0.1em] uppercase opacity-55 text-[var(--color-paper)]"
          style={{ borderColor: 'var(--color-rule-dark)' }}
        >
          <div>© BRAVO! · {new Date().getFullYear()} — Bruxelles</div>
          {legal.length > 0 && (
            <div className="flex gap-3 items-center flex-wrap">
              {legal.map((l, i) => (
                <React.Fragment key={l.href + i}>
                  {i > 0 && <span aria-hidden>·</span>}
                  <Link
                    href={l.href}
                    {...(l.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="hover:opacity-100 transition-opacity"
                  >
                    {l.label}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: SimpleLink[] }) {
  return (
    <div>
      <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase font-bold opacity-55 mb-3 text-[var(--color-paper)]">
        {title}
      </div>
      <ul className="list-none grid gap-2 text-sm text-[var(--color-paper)]">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              {...(l.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="hover:text-[var(--color-bravo-bright)] transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FooterContactColumn({ contact }: { contact: { email: string; phone: string; address: string } }) {
  return (
    <div>
      <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase font-bold opacity-55 mb-3 text-[var(--color-paper)]">
        Contact
      </div>
      <ul className="list-none grid gap-2 text-sm text-[var(--color-paper)]">
        {contact.email && (
          <li>
            <a
              href={`mailto:${contact.email}`}
              className="hover:text-[var(--color-bravo-bright)] transition-colors"
            >
              {contact.email}
            </a>
          </li>
        )}
        {contact.phone && (
          <li>
            <a
              href={`tel:${contact.phone.replace(/\s/g, '')}`}
              className="hover:text-[var(--color-bravo-bright)] transition-colors"
            >
              {contact.phone}
            </a>
          </li>
        )}
        {contact.address && (
          <li className="opacity-75 whitespace-pre-line">{contact.address}</li>
        )}
      </ul>
    </div>
  )
}
