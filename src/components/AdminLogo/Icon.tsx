import React from 'react'

/** Compact icon shown in the Payload admin nav bar (top-left). */
export default function Icon() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 6,
        background: '#4923F4',
        color: '#fff',
        fontFamily: '"Source Serif 4", "Source Serif Pro", Georgia, serif',
        fontWeight: 700,
        fontSize: 18,
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}
      aria-label="BRAVO!"
    >
      B
    </div>
  )
}
