import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { FormBlock } from '@/blocks/Form/Component'
import { JsonLd } from '@/components/JsonLd'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-static'
export const revalidate = 600

export const metadata: Metadata = {
  title: 'Contact — BRAVO! Agency',
  description:
    "Discutons d'un projet. Bruxelles, Belgique. hello@bravo-agency.be — réponse sous 48h ouvrées.",
}

const STEPS = [
  {
    n: '01',
    label: 'Brief',
    body: "Tu nous envoies un mot, un PDF, une intuition — n'importe quoi qui résume ce que tu veux déclencher.",
  },
  {
    n: '02',
    label: 'Rencontre',
    body: 'On se voit (en vrai ou par appel) pour creuser le contexte, les contraintes, les ambitions cachées.',
  },
  {
    n: '03',
    label: 'Proposition',
    body: "On revient sous 7 à 10 jours avec une lecture, un cadrage, un planning, un ordre de grandeur de budget.",
  },
]

export default async function ContactPage() {
  // Try to find a "Contact" form from the plugin-form-builder, otherwise fall back to a simple section
  let contactForm: ContactForm = null
  try {
    contactForm = await findContactForm()
  } catch (_e) {
    contactForm = null
  }

  const siteUrl = getServerSideURL()

  return (
    <main className="surface-ink min-h-screen">
      {/* Schema.org ContactPage */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          '@id': `${siteUrl}/contact`,
          mainEntity: {
            '@type': 'Organization',
            name: 'BRAVO! Agency',
            url: siteUrl,
            email: 'hello@bravo-agency.be',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Rue exemple 12',
              postalCode: '1000',
              addressLocality: 'Bruxelles',
              addressCountry: 'BE',
            },
          },
        }}
      />

      {/* PAGE HERO */}
      <section className="px-6 sm:px-10 pt-32 sm:pt-44 pb-16 sm:pb-24 section-rule-bravo">
        <div
          className="mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12 items-end"
          style={{ maxWidth: '1640px' }}
        >
          <div>
            <div
              className="font-mono text-[0.72rem] tracking-[0.12em] uppercase mb-6 flex gap-2 items-center"
              style={{ color: 'var(--color-bravo-soft)' }}
            >
              <Link href="/" className="opacity-65 hover:opacity-100">
                Accueil
              </Link>
              <span className="opacity-40">/</span>
              <span>Contact</span>
            </div>
            <h1 className="font-display font-extrabold uppercase leading-[0.84] tracking-[-0.015em] text-[clamp(5rem,16vw,18rem)] text-[var(--color-paper)]">
              Premier<br />
              <span
                className="font-editorial italic font-normal normal-case tracking-[-0.02em]"
                style={{ color: 'var(--color-bravo-soft)' }}
              >
                pas.
              </span>
            </h1>
          </div>
          <p className="font-editorial italic text-[1.2rem] leading-[1.55] max-w-[38ch] opacity-92 text-[var(--color-paper)]">
            Un brief, une intuition, une commande spécifique — on lit{' '}
            <strong
              className="font-sans not-italic font-bold"
              style={{ color: 'var(--color-bravo-soft)' }}
            >
              tout
            </strong>{' '}
            et on répond sous 48h ouvrées.
          </p>
        </div>
      </section>

      {/* PROCESS — 3 steps */}
      <section className="surface-bravo bravo-atmosphere px-6 sm:px-10 py-24 sm:py-32">
        <div className="relative z-10 mx-auto" style={{ maxWidth: '1640px' }}>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-20 items-end mb-12 sm:mb-16">
            <span className="section-label" style={{ color: 'var(--color-paper)' }}>
              §01 · Comment on bosse
            </span>
            <h2 className="font-display font-extrabold uppercase leading-[0.92] tracking-[-0.005em] text-[clamp(2.4rem,6vw,5.5rem)] text-[var(--color-paper)]">
              Trois <span className="font-light">étapes</span> avant{' '}
              <span
                className="font-editorial italic font-normal normal-case tracking-[-0.02em]"
                style={{ opacity: 0.95 }}
              >
                le devis
              </span>
              .
            </h2>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t"
            style={{ borderColor: 'rgba(244,237,225,0.22)' }}
          >
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="py-10 pr-6 md:px-8 border-b md:border-b-0 md:border-r"
                style={{
                  borderColor: 'rgba(244,237,225,0.22)',
                  ...(i === STEPS.length - 1 ? { borderRightWidth: 0 } : {}),
                }}
              >
                <div
                  className="font-display font-extrabold uppercase tracking-[-0.02em] leading-[0.95] text-[clamp(3rem,5vw,4.5rem)] text-[var(--color-paper)]"
                  style={{ opacity: 0.95 }}
                >
                  {s.n}
                </div>
                <div
                  className="mt-3 font-mono text-[0.78rem] tracking-[0.16em] uppercase font-semibold text-[var(--color-paper)]"
                >
                  {s.label}
                </div>
                <p className="mt-3 font-sans text-[1rem] leading-[1.6] opacity-90 max-w-[32ch] text-[var(--color-paper)]">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT METHODS + FORM */}
      <section className="surface-ink section-rule-bravo py-20 sm:py-32 px-6 sm:px-10">
        <div
          className="mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20"
          style={{ maxWidth: '1640px' }}
        >
          {/* Left column — contact methods */}
          <div>
            <span className="section-label" style={{ color: 'var(--color-bravo-soft)' }}>
              §02 · Joindre le studio
            </span>
            <h2 className="mt-4 font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(2.2rem,4.5vw,4rem)] text-[var(--color-paper)]">
              On préfère{' '}
              <span
                className="font-editorial italic font-normal normal-case tracking-[-0.02em]"
                style={{ color: 'var(--color-bravo-soft)' }}
              >
                qu'on parle.
              </span>
            </h2>
            <p className="mt-6 font-editorial italic text-[1.05rem] leading-[1.55] opacity-85 max-w-[36ch] text-[var(--color-paper)]">
              Email ou rendez-vous direct au studio. Le formulaire à droite arrive aussi dans la même boîte mail.
            </p>

            <ul className="mt-10 grid gap-6 list-none">
              <Method
                k="Email"
                v={
                  <a
                    href="mailto:hello@bravo-agency.be"
                    className="font-display font-extrabold uppercase text-[clamp(1.4rem,2.2vw,2rem)] tracking-[-0.01em] leading-[1] hover:text-[var(--color-bravo-soft)] transition-colors break-all"
                  >
                    hello@bravo-agency.be
                  </a>
                }
              />
              <Method
                k="Téléphone"
                v={
                  <a
                    href="tel:+3220000000"
                    className="font-display font-extrabold uppercase text-[clamp(1.4rem,2.2vw,2rem)] tracking-[-0.01em] leading-[1] hover:text-[var(--color-bravo-soft)] transition-colors"
                  >
                    +32 2 000 00 00
                  </a>
                }
              />
              <Method
                k="Studio"
                v={
                  <span className="font-display font-extrabold uppercase text-[clamp(1.4rem,2.2vw,2rem)] tracking-[-0.01em] leading-[1.1] block">
                    Rue exemple 12<br />
                    <span className="font-editorial italic font-normal normal-case tracking-[-0.02em] text-[0.85em]" style={{ color: 'var(--color-bravo-soft)' }}>
                      1000 Bruxelles · Belgique
                    </span>
                  </span>
                }
              />
              <Method
                k="Réseaux"
                v={
                  <span className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.85rem] tracking-[0.14em] uppercase">
                    <a
                      href="https://instagram.com/"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="border-b border-current pb-px hover:text-[var(--color-bravo-soft)] hover:border-[var(--color-bravo-soft)]"
                    >
                      Instagram
                    </a>
                    <a
                      href="https://linkedin.com/"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="border-b border-current pb-px hover:text-[var(--color-bravo-soft)] hover:border-[var(--color-bravo-soft)]"
                    >
                      LinkedIn
                    </a>
                    <a
                      href="https://behance.net/"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="border-b border-current pb-px hover:text-[var(--color-bravo-soft)] hover:border-[var(--color-bravo-soft)]"
                    >
                      Behance
                    </a>
                  </span>
                }
              />
            </ul>
          </div>

          {/* Right column — form */}
          <div className="lg:pt-10">
            {contactForm ? (
              // Render Payload form-builder form when available
              <div className="border rounded-[28px] p-8 sm:p-10 bg-[var(--color-ink-2)] [&_form_label]:!text-[var(--color-paper)] [&_form_input]:!bg-[var(--color-ink)] [&_form_input]:!text-[var(--color-paper)] [&_form_input]:!border-[color:var(--color-rule-dark)] [&_form_textarea]:!bg-[var(--color-ink)] [&_form_textarea]:!text-[var(--color-paper)] [&_form_textarea]:!border-[color:var(--color-rule-dark)]" style={{ borderColor: 'var(--color-rule-dark)' }}>
                <span className="section-label" style={{ color: 'var(--color-bravo-soft)' }}>
                  §03 · Formulaire
                </span>
                <h3 className="mt-4 mb-6 font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(1.8rem,3vw,2.6rem)] text-[var(--color-paper)]">
                  Dites-nous{' '}
                  <span
                    className="font-editorial italic font-normal normal-case tracking-[-0.02em]"
                    style={{ color: 'var(--color-bravo-soft)' }}
                  >
                    tout.
                  </span>
                </h3>
                <FormBlock
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  form={contactForm as any}
                  enableIntro={false}
                />
              </div>
            ) : (
              <FormPlaceholder />
            )}
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="surface-paper px-6 sm:px-10 py-20 sm:py-28">
        <div
          className="mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10 md:gap-20 items-center"
          style={{ maxWidth: '1640px' }}
        >
          <div>
            <span className="section-label" style={{ color: 'var(--color-bravo)' }}>
              §04 · Le studio
            </span>
            <h2 className="mt-4 font-display font-extrabold uppercase leading-[0.92] tracking-[-0.005em] text-[clamp(2.4rem,5vw,4.5rem)]">
              On vous reçoit{' '}
              <span
                className="font-editorial italic font-normal normal-case tracking-[-0.02em]"
                style={{ color: 'var(--color-bravo)' }}
              >
                avec plaisir.
              </span>
            </h2>
            <p className="mt-6 font-editorial italic text-[1.15rem] leading-[1.55] opacity-85 max-w-[42ch]">
              Studio dans le centre de Bruxelles, à 5 minutes à pied de la gare centrale. Du lundi au
              vendredi, 9h–18h. Café offert.
            </p>
            <a
              href="https://www.openstreetmap.org/?mlat=50.846&mlon=4.3517&zoom=16"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-3 mt-8 px-6 py-3.5 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] font-sans font-bold text-sm hover:bg-[var(--color-bravo)] transition-colors"
            >
              Itinéraire <span>→</span>
            </a>
          </div>
          {/* Map placeholder — OpenStreetMap embed (Brussels city center) */}
          <div className="relative aspect-[5/4] overflow-hidden border" style={{ borderColor: 'var(--color-rule-light)' }}>
            <iframe
              title="Carte du studio à Bruxelles"
              src="https://www.openstreetmap.org/export/embed.html?bbox=4.3417%2C50.8410%2C4.3617%2C50.8510&layer=mapnik&marker=50.8460%2C4.3517"
              className="absolute inset-0 w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="surface-ink section-rule-bravo-top px-6 sm:px-10 py-24 sm:py-36 text-center relative overflow-hidden">
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, var(--color-bravo) 0%, transparent 60%)',
            filter: 'blur(150px)',
            opacity: 0.45,
          }}
        />
        <div className="relative z-10 mx-auto" style={{ maxWidth: '1100px' }}>
          <h2 className="font-display font-light uppercase leading-[0.92] tracking-[-0.005em] text-[clamp(2.8rem,8vw,8rem)] max-w-[18ch] mx-auto text-[var(--color-paper)]">
            On ne <span className="font-extrabold">vend pas</span><br />
            de réponses{' '}
            <span
              className="font-editorial italic font-normal normal-case tracking-[-0.02em]"
              style={{ color: 'var(--color-bravo-soft)' }}
            >
              à des questions
            </span><br />
            qui ne se posent pas.
          </h2>
        </div>
      </section>
    </main>
  )
}

/* ===========================================================
   Helpers
   =========================================================== */

function Method({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <li
      className="grid grid-cols-[110px_1fr] gap-4 sm:gap-6 items-baseline pt-4 border-t"
      style={{ borderColor: 'var(--color-rule-dark)' }}
    >
      <span
        className="font-mono text-[0.72rem] tracking-[0.16em] uppercase font-medium pt-1.5"
        style={{ color: 'var(--color-bravo-soft)' }}
      >
        {k}
      </span>
      <div className="text-[var(--color-paper)]">{v}</div>
    </li>
  )
}

function FormPlaceholder() {
  return (
    <div
      className="border rounded-[28px] p-8 sm:p-12 bg-[var(--color-ink-2)]"
      style={{ borderColor: 'var(--color-rule-dark)' }}
    >
      <span className="section-label" style={{ color: 'var(--color-bravo-soft)' }}>
        §03 · Formulaire
      </span>
      <h3 className="mt-4 font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(1.8rem,3vw,2.6rem)] text-[var(--color-paper)] mb-4">
        Formulaire{' '}
        <span
          className="font-editorial italic font-normal normal-case tracking-[-0.02em]"
          style={{ color: 'var(--color-bravo-soft)' }}
        >
          en préparation.
        </span>
      </h3>
      <p className="font-editorial italic text-[1.05rem] leading-[1.55] opacity-85 max-w-[42ch] text-[var(--color-paper)]">
        En attendant, écris-nous directement à{' '}
        <a
          href="mailto:hello@bravo-agency.be"
          className="not-italic font-sans font-bold border-b border-current pb-px hover:text-[var(--color-bravo-soft)]"
        >
          hello@bravo-agency.be
        </a>
        . Réponse sous 48h ouvrées.
      </p>
      <Link
        href="/admin/collections/forms/create"
        className="inline-block mt-8 px-5 py-3 rounded-full bg-[var(--color-paper)] text-[var(--color-ink)] font-sans font-bold text-sm hover:bg-[var(--color-bravo)] hover:text-[var(--color-paper)] transition-colors"
      >
        Créer un formulaire dans l'admin →
      </Link>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContactForm = any | null

/**
 * Look up a Payload form created via plugin-form-builder, by title containing "contact".
 * If you create a form named "Contact" in the admin, it will be picked up here automatically.
 */
async function findContactForm(): Promise<ContactForm> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'forms',
    where: {
      title: { like: 'Contact' },
    },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return result.docs?.[0] || null
}
