import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  /** Switch to dark surface (white text). Defaults to `false` (color on light). */
  inverted?: boolean
}

/**
 * BRAVO! wordmark — temporary text logo using the brand typography.
 * Swap with an SVG drop-in once the real logo asset is available
 * (place file at `public/logo.svg` and replace this component).
 */
export const Logo = ({ className, inverted = false }: Props) => {
  return (
    <span
      aria-label="BRAVO! Agency"
      className={clsx(
        'inline-flex items-baseline font-serif font-bold tracking-tight leading-none select-none',
        'text-2xl md:text-3xl',
        inverted ? 'text-white' : 'text-bravo',
        className,
      )}
    >
      BRAVO
      <span className={clsx('ml-0.5', inverted ? 'text-white' : 'text-bravo')}>!</span>
    </span>
  )
}
