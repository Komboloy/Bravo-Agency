import React from 'react'
import type { StatsGridBlock as StatsGridBlockProps } from '@/payload-types'

export const StatsGridBlock: React.FC<StatsGridBlockProps> = ({ label, heading, stats }) => {
  if (!stats || stats.length === 0) return null
  const cols = Math.min(stats.length, 4)

  return (
    <section className="surface-ink section-rule-bravo py-20 sm:py-32">
      <div className="mx-auto px-6 sm:px-10 pb-10 sm:pb-16" style={{ maxWidth: '1640px' }}>
        {label && (
          <span className="section-label" style={{ color: 'var(--color-bravo-soft)' }}>
            {label}
          </span>
        )}
        {heading && (
          <h2 className="mt-4 font-display font-extrabold uppercase leading-[0.92] tracking-[-0.005em] text-[clamp(2.5rem,6vw,6rem)] text-[var(--color-paper)] max-w-[20ch]">
            {heading}
          </h2>
        )}
      </div>

      <div
        className="mx-auto px-6 sm:px-10 grid grid-cols-2 border-t"
        style={{
          maxWidth: '1640px',
          borderColor: 'var(--color-rule-dark)',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {stats.map((s, i) => (
          <div
            key={s.id || i}
            className="py-10 pr-6"
            style={{
              borderRight: ((i + 1) % cols === 0) ? 'none' : '1px solid var(--color-rule-dark)',
              borderBottom: '1px solid var(--color-rule-dark)',
            }}
          >
            <div
              className="font-display font-extrabold uppercase tracking-[-0.02em] leading-[0.95] text-[clamp(3.5rem,8vw,7rem)]"
              style={{ color: 'var(--color-bravo-bright)' }}
            >
              {s.value}
            </div>
            <div className="mt-2 font-sans font-bold text-[1.05rem] tracking-[-0.01em] text-[var(--color-paper)]">
              {s.label}
            </div>
            {s.description && (
              <p className="mt-1 font-editorial italic text-[0.92rem] leading-[1.5] opacity-75 max-w-[30ch] text-[var(--color-paper)]">
                {s.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
