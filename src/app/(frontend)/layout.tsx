import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import {
  Raleway,
  Big_Shoulders,
  Fraunces,
  JetBrains_Mono,
} from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { JsonLd } from '@/components/JsonLd'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

// Body & wordmark — exposed as --font-raleway, mapped to Tailwind `font-sans` via @theme
const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-raleway',
  display: 'swap',
})

// Display headlines — condensed all-caps. Tailwind class: `font-display`
const bigShoulders = Big_Shoulders({
  subsets: ['latin'],
  weight: ['300', '400', '700', '800', '900'],
  variable: '--font-big-shoulders',
  display: 'swap',
})

// Editorial italic accents — used sparingly on 1-2 words per title. Tailwind class: `font-editorial`
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['italic'],
  variable: '--font-fraunces',
  display: 'swap',
})

// Technical labels, metadata, section numbers. Tailwind class: `font-mono`
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html
      className={cn(
        raleway.variable,
        bigShoulders.variable,
        fraunces.variable,
        jetbrainsMono.variable,
      )}
      lang="fr"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/favicon.ico" rel="alternate icon" sizes="32x32" />
        <link href="/favicon.svg" rel="apple-touch-icon" />
        <link href="/manifest.webmanifest" rel="manifest" />
        <meta name="theme-color" content="#4923F4" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#050507" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-title" content="BRAVO!" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Schema.org Organization — sitewide */}
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'BRAVO! Agency',
            alternateName: 'BRAVO!',
            url: getServerSideURL(),
            logo: `${getServerSideURL()}/favicon.svg`,
            description:
              "Agence de communication multidisciplinaire à Bruxelles. On accompagne l'engagement des marques et on déclenche des transformations.",
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Bruxelles',
              addressRegion: 'Bruxelles-Capitale',
              addressCountry: 'BE',
            },
            sameAs: [
              'https://www.linkedin.com/company/bravo-agency',
              'https://www.instagram.com/bravo.agency',
            ],
            email: 'hello@bravo-agency.be',
            foundingDate: '2018',
          }}
        />
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    default: 'BRAVO! Agency — Les idées en actions',
    template: '%s — BRAVO! Agency',
  },
  description:
    "Agence de communication multidisciplinaire à Bruxelles. On accompagne l'engagement des marques et on déclenche des transformations.",
  applicationName: 'BRAVO! Agency',
  authors: [{ name: 'BRAVO! Agency' }],
  creator: 'BRAVO! Agency',
  publisher: 'BRAVO! Agency',
  openGraph: mergeOpenGraph({
    siteName: 'BRAVO! Agency',
    locale: 'fr_BE',
  }),
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    languages: {
      'fr-BE': '/',
      'nl-BE': '/nl',
      'en': '/en',
    },
  },
}
