import React from 'react'

/** Full wordmark shown on the Payload login screen. */
export default function Logo() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '0.05em',
        fontFamily: '"Source Serif 4", "Source Serif Pro", Georgia, serif',
        fontWeight: 700,
        fontSize: '3rem',
        lineHeight: 1,
        color: '#4923F4',
        letterSpacing: '-0.02em',
      }}
    >
      <span>BRAVO</span>
      <span>!</span>
    </div>
  )
}
