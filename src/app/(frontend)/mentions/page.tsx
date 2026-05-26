import type { Metadata } from 'next'
import React from 'react'
import { LegalLayout, LegalTable } from '@/components/LegalLayout'

export const metadata: Metadata = {
  title: 'Mentions légales — BRAVO! Agency',
  description: 'Mentions légales et informations éditeur de bravo-agency.be.',
  robots: { index: true, follow: true },
}

export const dynamic = 'force-static'
export const revalidate = 3600

export default function MentionsPage() {
  return (
    <LegalLayout
      breadcrumb="Mentions légales"
      title={<>Mentions <span className="font-editorial italic font-normal normal-case tracking-[-0.02em]" style={{ color: 'var(--color-bravo-soft)' }}>légales.</span></>}
      subtitle="Informations légales relatives à l’éditeur, à l’hébergeur et à la propriété intellectuelle de ce site."
      lastUpdated="26 mai 2026"
    >
      <h2>Éditeur du site</h2>
      <LegalTable
        rows={[
          { k: 'Dénomination', v: <strong>BRAVO! Agency SRL</strong> },
          { k: 'Forme', v: 'Société à responsabilité limitée (SRL)' },
          { k: 'Siège social', v: <>Rue exemple 12<br />1000 Bruxelles<br />Belgique</> },
          { k: 'RPM', v: 'Bruxelles, francophone' },
          { k: 'TVA / BCE', v: 'BE 0XXX.XXX.XXX' },
          { k: 'Email', v: <a href="mailto:hello@bravo-agency.be">hello@bravo-agency.be</a> },
          {
            k: 'Responsable',
            v: 'Stephan Marly & Michael Vargiakakis, co-fondateurs',
          },
        ]}
      />

      <h2>Hébergement</h2>
      <LegalTable
        rows={[
          { k: 'Hébergeur', v: <strong>Infomaniak Network SA</strong> },
          { k: 'Siège', v: <>Rue Eugène Marziano 25<br />1227 Les Acacias<br />Suisse</> },
          { k: 'Site', v: <a href="https://www.infomaniak.com" rel="noreferrer noopener" target="_blank">infomaniak.com</a> },
        ]}
      />

      <h2>Propriété intellectuelle</h2>
      <p>
        Ce site, son arborescence, ses textes, son code source, son identité visuelle, ses images et toutes les œuvres qui le composent sont la propriété exclusive de BRAVO! Agency ou des partenaires ayant contribué aux projets présentés, sauf mention contraire.
      </p>
      <p>
        Toute reproduction, représentation, modification, publication ou adaptation, totale ou partielle, par quelque procédé que ce soit, est interdite sans l’accord écrit préalable de BRAVO! Agency. <strong>Toute exploitation non autorisée engagera la responsabilité de l’utilisateur.</strong>
      </p>
      <p>
        Les marques et logos des clients présentés dans la section « Travaux » restent la propriété exclusive de leurs détenteurs respectifs et apparaissent ici à titre de référence.
      </p>

      <h2>Crédits projets</h2>
      <p>
        Certains projets présentés ont été conçus par un membre de l’équipe BRAVO! alors qu’il exerçait dans une autre agence. Dans ce cas, la mention <em>« Création : [Nom] chez [Agence] »</em> apparaît clairement dans la fiche du projet. La distinction entre <strong>création</strong> du concept et <strong>réalisation</strong> opérée par BRAVO! est explicite sur chaque case study.
      </p>

      <h2>Responsabilité</h2>
      <p>
        BRAVO! Agency met tout en œuvre pour offrir aux utilisateurs des informations vérifiées. Le site peut néanmoins comporter des inexactitudes ou des omissions ; BRAVO! Agency ne saurait être tenue responsable de l’usage qui pourrait en être fait. L’utilisateur reconnaît utiliser ces informations sous sa responsabilité exclusive.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Les données transmises via le formulaire de contact (nom, e-mail, message) sont utilisées exclusivement pour répondre à votre demande. Elles ne sont ni vendues, ni cédées à des tiers. Conformément au <strong>RGPD</strong> et à la <strong>loi belge du 30 juillet 2018</strong>, vous disposez d’un droit d’accès, de rectification, de suppression et de portabilité de vos données.
      </p>
      <p>
        Pour exercer ces droits : <a href="mailto:hello@bravo-agency.be">hello@bravo-agency.be</a>.
      </p>
    </LegalLayout>
  )
}
