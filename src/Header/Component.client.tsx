'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header as HeaderType, Page, Post, Project } from '@/payload-types'

interface HeaderClientProps {
  data: HeaderType
}

// Fallback menu items — used when the user has not yet filled the Payload `header` global
const FALLBACK_MENU = [
  { label: 'Travaux', href: '/projets' },
  { label: 'Studio', href: '/studio' },
  { label: 'News', href: '/posts' },
  { label: 'Contact', href: '/#contact' },
] as const

const LOCALES = ['fr', 'nl', 'en'] as const

type NavLink = { label: string; href: string; newTab?: boolean }

/** Resolve a Payload navItem to a renderable {label, href, newTab}. */
function resolveNavItem(item: NonNullable<HeaderType['navItems']>[number]): NavLink | null {
  const link = item?.link
  if (!link) return null
  const label = link.label
  if (!label) return null
  const newTab = link.newTab || false

  if (link.type === 'custom' && link.url) {
    return { label, href: link.url, newTab }
  }

  if (link.type === 'reference' && link.reference) {
    const { relationTo, value } = link.reference
    // value is either a number (just the id) or the populated doc
    if (typeof value !== 'object' || value === null) return null
    const slug = (value as Page | Post | Project).slug
    if (!slug) return null
    if (relationTo === 'pages') return { label, href: `/${slug}`, newTab }
    if (relationTo === 'posts') return { label, href: `/posts/${slug}`, newTab }
    if (relationTo === 'projects') return { label, href: `/projets/${slug}`, newTab }
  }

  return null
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Build the menu from Payload's `header` global. Fall back to defaults if empty.
  const cmsMenu: NavLink[] = (data?.navItems || [])
    .map(resolveNavItem)
    .filter((x): x is NavLink => x !== null)
  const MENU = cmsMenu.length > 0 ? cmsMenu : (FALLBACK_MENU as readonly NavLink[])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Scroll detection for the liquid glass morph
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMenuOpen(false)
      }
      document.addEventListener('keydown', onKey)
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', onKey)
      }
    }
  }, [menuOpen])

  // Auto-close on resize above tablet breakpoint
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1024) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <>
      <nav
        aria-label="Navigation principale"
        className={[
          'fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full',
          'grid grid-cols-[auto_1fr_auto] items-center gap-6',
          'font-mono text-[0.72rem] tracking-[0.08em] uppercase font-medium',
          'transition-[background,border-color,max-width,width,box-shadow,padding,border-radius,top,backdrop-filter]',
          'duration-500',
          scrolled
            ? // Liquid glass scrolled pill
              [
                'top-4 max-w-[1100px] w-[calc(100%-2rem)]',
                'rounded-full',
                'px-5 py-2.5 sm:px-6 sm:py-3',
                'border border-[rgba(244,237,225,0.22)]',
                'backdrop-blur-[28px] saturate-[1.7]',
                'shadow-[0_22px_56px_-10px_rgba(73,35,244,0.55),0_6px_18px_-6px_rgba(5,5,7,0.4),0_1px_0_rgba(255,255,255,0.22)_inset,0_0_0_1px_rgba(255,255,255,0.05)_inset]',
                'text-[var(--color-paper)]',
              ].join(' ')
            : // Initial transparent full-width state
              [
                'max-w-full',
                'px-6 sm:px-10 py-5',
                'border border-transparent',
                'rounded-none',
                'text-[var(--color-paper)]',
              ].join(' '),
          // Background tinted gradient ONLY when scrolled (the BRAVO liquid glass)
          scrolled &&
            'bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_55%),rgba(73,35,244,0.55)]',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="BRAVO! Agency"
          className="font-sans font-black text-2xl leading-none tracking-[-0.02em] text-[var(--color-paper)]"
        >
          BRAVO!
        </Link>

        {/* Center nav links — hidden on tablet/mobile */}
        <ul className="hidden lg:flex justify-center gap-8 list-none">
          {MENU.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                {...(item.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="relative pb-1 transition-colors after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-px after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side: lang + CTA + hamburger */}
        <div className="flex items-center gap-3 sm:gap-5 justify-end">
          <div className="hidden sm:flex gap-2">
            {LOCALES.map((loc) => (
              <span
                key={loc}
                className={loc === 'fr' ? '' : 'opacity-45'}
              >
                {loc.toUpperCase()}
              </span>
            ))}
          </div>
          <Link
            href="/#contact"
            className="hidden xs:inline-block px-4 py-2 rounded-full border border-current font-sans font-semibold whitespace-nowrap transition-colors hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)] max-[460px]:hidden max-[640px]:text-[0.68rem] max-[640px]:px-3.5 max-[640px]:py-1.5"
          >
            On en parle
          </Link>

          {/* Hamburger — visible below lg */}
          <button
            type="button"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            aria-controls="mobileMenu"
            onClick={() => setMenuOpen((o) => !o)}
            className="lg:hidden relative w-[38px] h-[38px] cursor-pointer text-current"
          >
            <span
              className={[
                'absolute left-[9px] right-[9px] h-[2px] bg-current rounded-[1px]',
                'transition-[transform,opacity,top] duration-300',
                menuOpen ? 'top-[18px] rotate-45' : 'top-[13px]',
              ].join(' ')}
            />
            <span
              className={[
                'absolute left-[9px] right-[9px] top-[18px] h-[2px] bg-current rounded-[1px]',
                'transition-[transform,opacity] duration-300',
                menuOpen ? 'opacity-0 scale-x-0' : '',
              ].join(' ')}
            />
            <span
              className={[
                'absolute left-[9px] right-[9px] h-[2px] bg-current rounded-[1px]',
                'transition-[transform,opacity,top] duration-300',
                menuOpen ? 'top-[18px] -rotate-45' : 'top-[23px]',
              ].join(' ')}
            />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY — liquid glass BRAVO color full-screen */}
      <div
        id="mobileMenu"
        aria-hidden={!menuOpen}
        className={[
          'fixed inset-0 z-40 overflow-hidden transition-opacity duration-500',
          'bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_30%),rgba(73,35,244,0.92)]',
          'backdrop-blur-[36px] saturate-[1.7]',
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        {/* Atmospheric blobs */}
        <div
          aria-hidden
          className="absolute -left-[25vw] -top-[25vw] w-[70vw] h-[70vw] rounded-full pointer-events-none"
          style={{ background: 'var(--color-bravo-bright)', opacity: 0.5, filter: 'blur(140px)' }}
        />
        <div
          aria-hidden
          className="absolute -right-[25vw] -bottom-[25vw] w-[70vw] h-[70vw] rounded-full pointer-events-none"
          style={{ background: 'var(--color-ink)', opacity: 0.3, filter: 'blur(140px)' }}
        />
        <span className="absolute top-6 left-6 sm:left-10 z-10 font-sans font-black text-2xl tracking-[-0.02em] text-[var(--color-paper)]">
          BRAVO!
        </span>

        <div className="relative z-10 h-full px-6 sm:px-10 pt-28 pb-10 flex flex-col justify-between gap-8 text-[var(--color-paper)]">
          <ul className="flex flex-col gap-2 list-none">
            {MENU.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  {...(item.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    'flex items-baseline gap-4',
                    'font-display font-extrabold uppercase tracking-[-0.01em]',
                    'text-[clamp(2.4rem,9vw,5.5rem)] leading-[0.95]',
                    'transition-[opacity,transform,color] duration-[450ms] ease-[cubic-bezier(.2,.7,.2,1)]',
                    menuOpen
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-6',
                    'hover:text-[var(--color-bravo-soft)]',
                  ].join(' ')}
                  style={{
                    transitionDelay: menuOpen ? `${100 + i * 60}ms` : '0ms',
                  }}
                >
                  <span
                    className="font-mono font-medium text-sm tracking-[0.15em] opacity-70 -translate-y-[0.6em]"
                    style={{ color: 'var(--color-bravo-soft)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div
            className={[
              'flex justify-between items-center gap-6 flex-wrap',
              'pt-6 border-t border-[rgba(244,237,225,0.18)]',
              'transition-[opacity,transform] duration-[400ms] ease-out',
              menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
            ].join(' ')}
            style={{ transitionDelay: menuOpen ? '350ms' : '0ms' }}
          >
            <div className="flex gap-2.5 font-mono text-xs tracking-[0.16em] uppercase">
              {LOCALES.map((loc) => (
                <span
                  key={loc}
                  className={loc === 'fr' ? '' : 'opacity-55'}
                >
                  {loc.toUpperCase()}
                </span>
              ))}
            </div>
            <Link
              href="/#contact"
              onClick={() => setMenuOpen(false)}
              className="px-5 py-3 rounded-full bg-[var(--color-paper)] text-[var(--color-ink)] font-sans font-bold text-sm transition-[background,color,transform] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:-translate-y-0.5"
            >
              On en parle →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
