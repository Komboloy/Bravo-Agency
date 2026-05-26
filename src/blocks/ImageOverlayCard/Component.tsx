import React from 'react'
import RichText from '@/components/RichText'
import type { ImageOverlayCardBlock as Props, Media } from '@/payload-types'

function imageUrl(m: number | Media | null | undefined): string | null {
  if (!m || typeof m === 'number') return null
  return m.url || null
}

const POSITION_CLASSES: Record<NonNullable<Props['cardPosition']>, string> = {
  'bottom-left': 'items-end justify-start',
  'bottom-right': 'items-end justify-end',
  center: 'items-center justify-center',
  'top-left': 'items-start justify-start pt-24',
}

const WIDTH_CLASSES: Record<NonNullable<Props['cardWidth']>, string> = {
  compact: 'max-w-[480px]',
  medium: 'max-w-[620px]',
  large: 'max-w-[760px]',
}

export const ImageOverlayCardBlock: React.FC<Props> = ({
  image,
  cardPosition = 'bottom-left',
  cardWidth = 'medium',
  label,
  content,
}) => {
  const url = imageUrl(image)
  if (!url) return null

  return (
    <section className="relative min-h-screen overflow-hidden section-rule-bravo flex">
      <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${url})` }} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(5,5,7,0.25) 0%, transparent 40%, rgba(5,5,7,0.55) 100%), linear-gradient(180deg, rgba(5,5,7,0.35) 0%, transparent 30%, rgba(73,35,244,0.18) 100%)',
        }}
      />

      <div
        className={[
          'relative z-10 w-full mx-auto px-6 sm:px-10 py-12 sm:py-20 flex',
          POSITION_CLASSES[cardPosition || 'bottom-left'],
        ].join(' ')}
        style={{ maxWidth: '1640px' }}
      >
        <div
          className={[
            'p-8 sm:p-12 rounded-[28px] w-full text-[var(--color-paper)]',
            WIDTH_CLASSES[cardWidth || 'medium'],
          ].join(' ')}
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 55%), rgba(5, 5, 7, 0.42)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            border: '1px solid rgba(244, 237, 225, 0.22)',
            boxShadow:
              '0 28px 64px -12px rgba(5, 5, 7, 0.7), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 1px 0 rgba(255,255,255,0.25) inset',
          }}
        >
          {label && (
            <div
              className="font-mono text-[0.72rem] tracking-[0.16em] uppercase font-semibold mb-4"
              style={{ color: 'var(--color-bravo-soft)' }}
            >
              {label}
            </div>
          )}
          {content && (
            <div className="prose-bravo [&_h2]:font-display [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:leading-[0.95] [&_h2]:tracking-[-0.005em] [&_h2]:text-[clamp(2.4rem,5vw,4.5rem)] [&_h2]:mb-4 [&_h3]:font-display [&_h3]:font-bold [&_h3]:uppercase [&_h3]:text-[1.5rem] [&_h3]:mb-3 [&_p]:my-3 [&_p]:opacity-94 [&_p]:leading-[1.6] [&_em]:font-editorial [&_em]:italic [&_em]:font-medium [&_em]:not-italic-fix [&_em]:text-[var(--color-bravo-soft)] [&_strong]:font-bold [&_strong]:bg-[rgba(244,237,225,0.14)] [&_strong]:px-1 [&_strong]:rounded-sm">
              <RichText data={content} enableGutter={false} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
