import type { Metadata } from 'next'
import React from 'react'
import { LegalLayout, LegalTable } from '@/components/LegalLayout'

export const metadata: Metadata = {
  title: 'Crédits — BRAVO! Agency',
  description: 'Crédits design, développement et ressources utilisées pour ce site.',
  robots: { index: true, follow: true },
}

export const dynamic = 'force-static'
export const revalidate = 3600

export default function CreditsPage() {
  return (
    <LegalLayout
      breadcrumb="Crédits"
      title={<><span className="font-editorial italic font-normal normal-case tracking-[-0.02em]" style={{ color: 'var(--color-bravo-soft)' }}>Crédits</span></>}
      subtitle="Les personnes, outils et ressources qui ont rendu ce site possible."
      lastUpdated="26 mai 2026"
    >
      <h2>Design & direction artistique</h2>
      <LegalTable
        rows={[
          { k: 'Direction', v: <strong>Michael Vargiakakis</strong> },
          { k: 'Stratégie', v: <strong>Stephan Marly</strong> },
          { k: 'Studio', v: 'BRAVO! Agency — Bruxelles' },
        ]}
      />

      <h2>Développement</h2>
      <LegalTable
        rows={[
          { k: 'Framework', v: <a href="https://nextjs.org" rel="noreferrer noopener" target="_blank">Next.js 16</a> },
          { k: 'CMS', v: <a href="https://payloadcms.com" rel="noreferrer noopener" target="_blank">Payload CMS 3</a> },
          { k: 'CSS', v: <a href="https://tailwindcss.com" rel="noreferrer noopener" target="_blance">Tailwind CSS 4</a> },
          { k: 'Base de données', v: <a href="https://neon.tech" rel="noreferrer noopener" target="_blank">Neon (Postgres)</a> },
          { k: 'Cartes', v: <a href="https://www.openstreetmap.org" rel="noreferrer noopener" target="_blank">OpenStreetMap</a> },
        ]}
      />

      <h2>Typographie</h2>
      <LegalTable
        rows={[
          {
            k: 'Raleway',
            v: <>Body et wordmark — par Matt McInerney, Pablo Impallari, Rodrigo Fuenzalida (<a href="https://fonts.google.com/specimen/Raleway" rel="noreferrer noopener" target="_blank">Google Fonts</a>, SIL OFL).</>,
          },
          {
            k: 'Big Shoulders Display',
            v: <>Titres impact condensés — par Patric King pour Chicago Design System (<a href="https://fonts.google.com/specimen/Big+Shoulders" rel="noreferrer noopener" target="_blank">Google Fonts</a>, SIL OFL).</>,
          },
          {
            k: 'Fraunces',
            v: <>Italiques éditoriaux — par Phaedra Charles, Flavia Zimbardi, David Berlow (Undercase Type, <a href="https://fonts.google.com/specimen/Fraunces" rel="noreferrer noopener" target="_blank">Google Fonts</a>, SIL OFL).</>,
          },
          {
            k: 'JetBrains Mono',
            v: <>Labels et metadata techniques — par JetBrains s.r.o. (<a href="https://www.jetbrains.com/lp/mono/" rel="noreferrer noopener" target="_blank">jetbrains.com</a>, SIL OFL).</>,
          },
        ]}
      />

      <h2>Iconographie & illustrations</h2>
      <p>
        <a href="https://lucide.dev" rel="noreferrer noopener" target="_blank">Lucide Icons</a> (ISC License). Illustrations sur mesure et compositions CSS originales — <em>BRAVO! Agency</em>.
      </p>

      <h2>Photographies projets</h2>
      <p>
        Les photographies présentées dans les case studies appartiennent à BRAVO! Agency, à ses clients respectifs, ou aux <strong>partenaires</strong> mentionnés sur chaque fiche projet (production, réalisation, photographie). La distribution complète des crédits par projet apparaît dans la meta-bar de chaque case study, section <em>« Partenaires »</em>.
      </p>

      <h2>Sources d’images de démonstration</h2>
      <p>
        En attendant l’upload des visuels définitifs, certaines images placeholder proviennent de <a href="https://unsplash.com" rel="noreferrer noopener" target="_blank">Unsplash</a> (Unsplash License, gratuite). Ces images sont remplacées au fur et à mesure par les vraies productions de l’agence.
      </p>

      <h2>Open source — merci</h2>
      <p>
        Ce site repose sur un écosystème open source vaste. Nous tenons à remercier les communautés de <strong>React</strong>, <strong>TypeScript</strong>, <strong>Vercel</strong>, <strong>Motion</strong>, <strong>Lenis</strong>, <strong>Radix UI</strong>, ainsi que tous les mainteneurs de packages npm impliqués.
      </p>
      <p>
        Une partie du code initial est dérivée du <a href="https://github.com/payloadcms/payload/tree/main/templates/website" rel="noreferrer noopener" target="_blank">template Website officiel de Payload</a> (MIT License) — adapté et fortement personnalisé pour les besoins de BRAVO!.
      </p>
    </LegalLayout>
  )
}
