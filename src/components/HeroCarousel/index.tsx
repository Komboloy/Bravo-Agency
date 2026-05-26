'use client'
import React, { useEffect, useState } from 'react'

export type HeroSlide = {
  imageUrl: string | null
  title: string
  client: string
  year: number | null
  tags: string[]
  href: string
}

const FALLBACK_URLS = [
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=2400&q=85&auto=format',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=2400&q=85&auto=format',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2400&q=85&auto=format',
]

type HeroCarouselProps = {
  slides: HeroSlide[]
  /** Pre-rendered h1 — pass `<RichText data={home.hero.title} />` from a server component. */
  title?: React.ReactNode
  badge?: string
  yearRange?: string
}

export function HeroCarousel({ slides, title, badge, yearRange }: HeroCarouselProps) {
  const [idx, setIdx] = useState(0)
  const count = slides.length || 1

  useEffect(() => {
    if (count <= 1) return
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 5500)
    return () => clearInterval(t)
  }, [count])

  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden bg-[var(--color-ink)]">
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={[
            'absolute inset-0 transition-opacity duration-[1.4s] ease-[cubic-bezier(.4,.2,.2,1)]',
            i === idx ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage: `url(${s.imageUrl || FALLBACK_URLS[i % FALLBACK_URLS.length]})`,
              transform: i === idx ? 'scale(1)' : 'scale(1.08)',
              transition: 'transform 8s linear',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(5,5,7,0.45) 0%, transparent 22%, transparent 50%, rgba(5,5,7,0.92) 100%), linear-gradient(135deg, rgba(73,35,244,0.16), transparent 50%)',
            }}
          />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 z-10 px-6 sm:px-10 pt-28 sm:pt-32 pb-10 sm:pb-14 grid grid-rows-[auto_1fr_auto] gap-6 text-[var(--color-paper)]">
        {/* Top badge */}
        <div className="flex justify-between items-start font-mono text-[0.72rem] tracking-[0.12em] uppercase font-medium">
          <span
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md border"
            style={{
              background: 'rgba(255,255,255,0.08)',
              borderColor: 'rgba(255,255,255,0.18)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--color-bravo-bright)' }}
            />
            {badge || 'Active · Bruxelles'}
          </span>
          <span className="opacity-70">{yearRange || '2018 — 2026'}</span>
        </div>

        {/* Title — supplied by parent (server component) as pre-rendered RichText,
            mapped through `.prose-home-display.hero`. Fallback hardcoded if global
            content is empty. The display-* CSS vars drive size + accent color. */}
        <div
          className="self-end prose-home-display hero"
          style={
            {
              '--display-color': 'var(--color-paper)',
              '--display-accent': 'var(--color-bravo-bright)',
            } as React.CSSProperties
          }
        >
          {title || (
            <>
              <h1>Les <em>idées</em></h1>
              <h1>en <strong>actions</strong>.</h1>
            </>
          )}
        </div>

        {/* Bottom: annotation + pagination */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-end">
          {slides[idx] && slides[idx].client && (
            <div className="max-w-[36ch]">
              <div className="font-mono text-[0.7rem] tracking-[0.12em] uppercase opacity-65 mb-2">
                Featured · {String(idx + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </div>
              <div className="font-sans font-bold text-[1.1rem] leading-[1.3] tracking-[-0.01em] mb-1.5">
                {slides[idx].client}
                {slides[idx].title && (
                  <>
                    {' — '}
                    <span className="font-editorial italic font-normal">{slides[idx].title}</span>
                  </>
                )}
              </div>
              <div className="font-mono text-[0.68rem] tracking-[0.06em] uppercase opacity-75 flex gap-2 flex-wrap">
                {slides[idx].year && <span>{slides[idx].year}</span>}
                {slides[idx].tags.map((t, i) => (
                  <React.Fragment key={t}>
                    <span>·</span>
                    <span>{t}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <div className="hidden md:block text-center font-mono text-[0.65rem] tracking-[0.18em] uppercase opacity-80">
            Scroll
            <span
              className="block w-px h-9 mx-auto mt-3"
              style={{
                background: 'var(--color-paper)',
                animation: 'scrolldown 2.2s ease-in-out infinite',
              }}
            />
          </div>

          {count > 1 && (
            <div className="md:justify-self-end flex flex-col gap-2">
              {slides.map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setIdx(i)}
                  className="grid grid-cols-[2.4rem_1fr] gap-3 items-center text-left font-mono text-[0.7rem] tracking-[0.08em] cursor-pointer transition-opacity"
                  style={{
                    opacity: i === idx ? 1 : 0.45,
                    color: i === idx ? 'var(--color-bravo-bright)' : 'var(--color-paper)',
                  }}
                >
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span
                    className="block w-full transition-[height,opacity]"
                    style={{
                      height: i === idx ? '2px' : '1px',
                      opacity: i === idx ? 1 : 0.5,
                      background: 'currentColor',
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes scrolldown { 0% { transform: scaleY(0); transform-origin: top; } 50% { transform: scaleY(1); transform-origin: top; } 50.001% { transform-origin: bottom; } 100% { transform: scaleY(0); transform-origin: bottom; } }`}</style>
    </section>
  )
}
