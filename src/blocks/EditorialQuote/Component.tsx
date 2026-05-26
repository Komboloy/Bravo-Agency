import React from 'react'
import type { EditorialQuoteBlock as EditorialQuoteBlockProps, Media } from '@/payload-types'

function imageUrl(m: number | Media | null | undefined): string | null {
  if (!m || typeof m === 'number') return null
  return m.url || null
}

/** Renders a quote, splitting *word* markers into italic accent spans. */
function renderQuote(text: string): React.ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean)
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      const inner = part.slice(1, -1)
      return (
        <span
          key={i}
          className="font-normal"
          style={{ color: 'var(--color-paper)', textDecoration: 'underline', textDecorationColor: 'rgba(244,237,225,0.55)', textUnderlineOffset: '0.18em', textDecorationThickness: '1px' }}
        >
          {inner}
        </span>
      )
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

export const EditorialQuoteBlock: React.FC<EditorialQuoteBlockProps> = ({
  background = 'bravo',
  quote,
  author,
  role,
  photo,
}) => {
  if (!quote) return null
  const photoSrc = imageUrl(photo)

  const isBravo = background === 'bravo'
  const isInk = background === 'ink'
  const surfaceClass = isBravo ? 'surface-bravo' : isInk ? 'surface-ink' : 'surface-paper'
  const textColor = isBravo || isInk ? 'var(--color-paper)' : 'var(--color-ink)'
  const accentColor = isBravo || isInk ? 'var(--color-bravo-soft)' : 'var(--color-bravo)'

  return (
    <section
      className={`${surfaceClass} relative overflow-hidden py-24 sm:py-44 px-6 sm:px-10`}
      style={{ color: textColor }}
    >
      {isBravo && (
        <>
          {/* Top cream spotlight */}
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              top: '-20%',
              width: '110%',
              height: '80%',
              background:
                'radial-gradient(ellipse at center, rgba(244,237,225,0.18) 0%, rgba(244,237,225,0.04) 40%, transparent 70%)',
            }}
          />
          {/* Bottom-left bravo-bright blob */}
          <div
            aria-hidden
            className="absolute pointer-events-none rounded-full"
            style={{
              left: '-10vw',
              bottom: '-25vw',
              width: '80vw',
              height: '80vw',
              background: 'radial-gradient(circle, var(--color-bravo-bright) 0%, transparent 60%)',
              filter: 'blur(140px)',
              opacity: 0.55,
            }}
          />
        </>
      )}

      <div className="relative z-10 mx-auto text-center" style={{ maxWidth: '1100px' }}>
        <span
          className="inline-block font-editorial italic font-normal text-[8rem] leading-[0.7] mb-4"
          style={{ color: textColor, opacity: 0.5 }}
          aria-hidden
        >
          &ldquo;
        </span>
        <blockquote
          className="font-editorial italic font-normal text-[clamp(1.6rem,3.5vw,3rem)] leading-[1.25] tracking-[-0.02em] max-w-[26ch] mx-auto mb-10"
          style={{ color: textColor }}
        >
          {renderQuote(quote)}
        </blockquote>
        {(author || role) && (
          <div className="inline-flex items-center gap-4 font-sans">
            {photoSrc && (
              <span
                className="w-14 h-14 rounded-full bg-center bg-cover"
                style={{
                  backgroundImage: `url(${photoSrc})`,
                  boxShadow:
                    '0 0 0 1px rgba(244,237,225,0.3), 0 8px 24px rgba(5,5,7,0.25)',
                }}
              />
            )}
            <div className="text-left">
              {author && (
                <div
                  className="font-bold text-[1.05rem]"
                  style={{ color: textColor }}
                >
                  {author}
                </div>
              )}
              {role && (
                <div
                  className="font-mono text-[0.72rem] tracking-[0.1em] uppercase opacity-80 mt-1"
                  style={{ color: textColor }}
                >
                  {role}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Unused for now, but reserved for future use */}
        {false && <span style={{ color: accentColor }} />}
      </div>
    </section>
  )
}
