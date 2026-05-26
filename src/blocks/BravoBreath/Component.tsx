import React from 'react'
import RichText from '@/components/RichText'
import type { BravoBreathBlock as BravoBreathBlockProps } from '@/payload-types'

export const BravoBreathBlock: React.FC<BravoBreathBlockProps> = ({ label, heading }) => {
  return (
    <section className="surface-bravo bravo-atmosphere px-6 sm:px-10 py-24 sm:py-44 text-center">
      <div className="relative z-10 mx-auto" style={{ maxWidth: '1100px' }}>
        {label && (
          <span className="inline-block font-mono text-[0.72rem] tracking-[0.32em] uppercase font-semibold mb-8 opacity-85 text-[var(--color-paper)]">
            {label}
          </span>
        )}
        {heading && (
          <div className="font-display font-light uppercase leading-[0.92] tracking-[-0.005em] text-[clamp(2.8rem,9vw,9rem)] max-w-[18ch] mx-auto text-[var(--color-paper)] [&_strong]:font-extrabold [&_em]:font-editorial [&_em]:italic [&_em]:font-normal [&_em]:normal-case [&_em]:tracking-[-0.02em] [&_em]:text-[var(--color-paper)] [&_em]:opacity-95">
            <RichText data={heading} enableGutter={false} />
          </div>
        )}
      </div>
    </section>
  )
}
