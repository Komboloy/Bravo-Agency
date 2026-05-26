import type { Metadata } from 'next'
import React from 'react'
import { LegalLayout, LegalTable } from '@/components/LegalLayout'

export const metadata: Metadata = {
  title: 'Politique cookies — BRAVO! Agency',
  description: 'Cookies utilisés sur bravo-agency.be et comment les gérer.',
  robots: { index: true, follow: true },
}

export const dynamic = 'force-static'
export const revalidate = 3600

export default function CookiesPage() {
  return (
    <LegalLayout
      breadcrumb="Politique cookies"
      title={<>Politique <span className="font-editorial italic font-normal normal-case tracking-[-0.02em]" style={{ color: 'var(--color-bravo-soft)' }}>cookies.</span></>}
      subtitle="Ce que sont les cookies, comment nous les utilisons (très peu), et comment vous pouvez les désactiver."
      lastUpdated="26 mai 2026"
    >
      <h2>Qu’est-ce qu’un cookie ?</h2>
      <p>
        Un <strong>cookie</strong> est un petit fichier texte déposé sur votre appareil lorsque vous visitez un site web. Il permet au site de mémoriser vos actions et préférences (langue, taille de police, etc.) sur une durée déterminée.
      </p>

      <h2>Notre approche</h2>
      <p>
        <strong>Sur bravo-agency.be, nous n’utilisons pas de cookies de tracking publicitaire ni de profilage.</strong> Aucun script tiers (Google Analytics, Meta Pixel, etc.) n’est embarqué sur ce site. Notre politique est de respecter votre attention par défaut.
      </p>

      <h2>Cookies effectivement utilisés</h2>
      <LegalTable
        rows={[
          {
            k: 'Préférence langue',
            v: <>Stocke votre choix entre <em>fr / nl / en</em>. Durée : 1 an. Finalité : confort utilisateur.</>,
          },
          {
            k: 'Session admin',
            v: <>Utilisé uniquement sur <code>/admin</code> pour authentifier les éditeurs du site. Durée : session. Tiers : aucun.</>,
          },
          {
            k: 'CSRF / preview',
            v: <>Sécurité du formulaire de contact et du mode preview Payload. Durée : session.</>,
          },
        ]}
      />

      <p>
        Aucun de ces cookies n’est <strong>nécessaire</strong> au sens du règlement RGPD pour le simple acte de consulter le site. Ils ne quittent pas notre domaine et ne sont pas partagés avec des tiers.
      </p>

      <h2>Cookies tiers</h2>
      <p>
        Le formulaire d’itinéraire vers notre studio embarque une carte <strong>OpenStreetMap</strong> (open-source, sans tracking publicitaire). Aucun autre service tiers susceptible de déposer un cookie n’est utilisé.
      </p>
      <p>
        Si à l’avenir nous ajoutons un service de mesure d’audience (statistiques minimales, type <strong>Plausible</strong> ou <strong>Burst Statistics</strong> auto-hébergé), il sera explicitement listé ici et restera respectueux de votre vie privée par défaut.
      </p>

      <h2>Gérer / supprimer les cookies</h2>
      <p>
        Vous pouvez bloquer ou supprimer les cookies via les réglages de votre navigateur. Les liens ci-dessous vous redirigent vers la documentation officielle :
      </p>
      <ul>
        <li>
          <a href="https://support.google.com/chrome/answer/95647" rel="noreferrer noopener" target="_blank">Chrome</a>
        </li>
        <li>
          <a href="https://support.mozilla.org/fr/kb/cookies-informations-sites-enregistrent" rel="noreferrer noopener" target="_blank">Firefox</a>
        </li>
        <li>
          <a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" rel="noreferrer noopener" target="_blank">Safari</a>
        </li>
        <li>
          <a href="https://support.microsoft.com/fr-fr/windows/g%C3%A9rer-les-cookies-dans-microsoft-edge-168dab11-0753-043d-7c16-ede5947fc64d" rel="noreferrer noopener" target="_blank">Edge</a>
        </li>
      </ul>

      <h2>Une question ?</h2>
      <p>
        Écrivez-nous : <a href="mailto:hello@bravo-agency.be">hello@bravo-agency.be</a>.
      </p>
    </LegalLayout>
  )
}
