/**
 * BRAVO! Agency demo seeder
 *
 * Idempotent. Runs via:
 *   npm run seed:bravo
 *
 * For each project in PROJECTS_DATA, the script:
 *   1. Checks if the slug already exists in the `projects` collection
 *   2. If it exists, SKIP (your manual edits are preserved)
 *   3. If it doesn't, downloads the placeholder images from Unsplash,
 *      creates Media docs, then creates the Project with all fields filled.
 *
 * Same logic for the 2 Team members.
 *
 * Safe to re-run. Won't overwrite WWF / Eletheo you've already created.
 */

import type { Payload } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'

// ---------------------------------------------------------------------------
// RichText helpers — turn plain paragraphs into Payload Lexical state
// ---------------------------------------------------------------------------

type RichDoc = {
  root: {
    type: 'root'
    direction: 'ltr'
    format: ''
    indent: 0
    version: 1
    children: unknown[]
  }
}

/**
 * richText() — accepts a list of strings, each line can use light markdown:
 *   - "## Title" → h2 heading
 *   - "### Subtitle" → h3 heading
 *   - "**word**" → bold (strong)
 *   - "*word*" → italic (em)
 * Otherwise rendered as a paragraph.
 */
function richText(paragraphs: string[]): RichDoc {
  return {
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map((line) => {
        if (line.startsWith('# ')) return heading('h1', parseInlines(line.slice(2)))
        if (line.startsWith('## ')) return heading('h2', parseInlines(line.slice(3)))
        if (line.startsWith('### ')) return heading('h3', parseInlines(line.slice(4)))
        return paragraph(parseInlines(line))
      }),
    },
  }
}

// Inline parser — splits text into {plain | strong | em} runs.
// Strong is **...**, em is *...* (single star). No nesting, no escapes.
function parseInlines(text: string): Inline[] {
  const out: Inline[] = []
  let i = 0
  while (i < text.length) {
    // strong: **...**
    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2)
      if (end > i + 2) {
        out.push({ strong: text.slice(i + 2, end) })
        i = end + 2
        continue
      }
    }
    // em: *...* (but not **)
    if (text[i] === '*' && text[i + 1] !== '*') {
      const end = (() => {
        let j = i + 1
        while (j < text.length) {
          if (text[j] === '*' && text[j + 1] !== '*') return j
          j++
        }
        return -1
      })()
      if (end > i + 1) {
        out.push({ em: text.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }
    // Plain run — to the next ** or single *
    const idxStrong = text.indexOf('**', i)
    const idxEm = (() => {
      let j = i
      while (j < text.length) {
        if (text[j] === '*' && text[j + 1] !== '*' && (j === 0 || text[j - 1] !== '*')) return j
        j++
      }
      return -1
    })()
    let next = text.length
    if (idxStrong >= 0) next = Math.min(next, idxStrong)
    if (idxEm >= 0) next = Math.min(next, idxEm)
    const slice = text.slice(i, next)
    if (slice) out.push(slice)
    i = next
  }
  return out.length > 0 ? out : [text]
}

// -- Rich content DSL (rt) ---------------------------------------------------
// Build Lexical state with headings, strong, em.
//
//   rt([
//     { h2: ['Une marque qui ', { em: 'respire' }, '.'] },
//     ['Eletheo voulait ', { strong: 'tout reposer' }, '.'],
//     ['On a passé ', { em: 'six semaines' }, ' à écouter.'],
//   ])

type Inline = string | { em: string } | { strong: string }
type Block =
  | string
  | Inline[]
  | { h2: Inline | Inline[] }
  | { h3: Inline | Inline[] }

function inlineToText(i: Inline) {
  if (typeof i === 'string') {
    return { type: 'text', version: 1, text: i, format: 0, mode: 'normal', style: '', detail: 0 }
  }
  if ('em' in i) {
    return { type: 'text', version: 1, text: i.em, format: 2, mode: 'normal', style: '', detail: 0 }
  }
  return { type: 'text', version: 1, text: i.strong, format: 1, mode: 'normal', style: '', detail: 0 }
}

function paragraph(inlines: Inline[]) {
  return {
    type: 'paragraph',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: inlines.map(inlineToText),
  }
}

function heading(tag: 'h1' | 'h2' | 'h3', inlines: Inline[]) {
  return {
    type: 'heading',
    tag,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: inlines.map(inlineToText),
  }
}

function rt(blocks: Block[]): RichDoc {
  return {
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: blocks.map((b) => {
        if (typeof b === 'string') return paragraph([b])
        if (Array.isArray(b)) return paragraph(b)
        if ('h2' in b) return heading('h2', Array.isArray(b.h2) ? b.h2 : [b.h2])
        return heading('h3', Array.isArray(b.h3) ? b.h3 : [b.h3])
      }),
    },
  }
}

// ---------------------------------------------------------------------------
// Media upload helpers — fetch URL → Buffer → payload.create({ collection: 'media' })
// ---------------------------------------------------------------------------

// Known-working fallback Unsplash photos in case a specific photo ID returns 404
const FALLBACKS = [
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=2400&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2400&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=2400&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1559686043-aef1abad5805?w=2400&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2400&q=85&auto=format&fit=crop',
]
let fallbackIdx = 0

async function fetchBuffer(url: string): Promise<Buffer> {
  let res = await fetch(url)
  if (!res.ok) {
    // 404 / 403 / etc. — Unsplash photo missing or renamed. Pick a fallback.
    const fb = FALLBACKS[fallbackIdx++ % FALLBACKS.length]
    console.warn(`  ⚠ ${url} → ${res.status}; falling back to ${fb}`)
    res = await fetch(fb)
    if (!res.ok) throw new Error(`Fallback also failed (${fb}): ${res.status}`)
  }
  const arr = await res.arrayBuffer()
  return Buffer.from(arr)
}

async function uploadImage(
  payload: Payload,
  url: string,
  alt: string,
  name: string,
  caption?: string,
): Promise<number> {
  const data = await fetchBuffer(url)
  // Suffix with a short random hex to avoid filename collisions on re-runs
  const suffix = Math.random().toString(16).slice(2, 8)
  const mediaData: Record<string, unknown> = { alt }
  if (caption) mediaData.caption = richText([caption])
  const created = await payload.create({
    collection: 'media',
    data: mediaData as never,
    file: {
      data,
      mimetype: 'image/jpeg',
      name: `${name}-${suffix}.jpg`,
      size: data.byteLength,
    },
  })
  return created.id
}

// ---------------------------------------------------------------------------
// Taxonomies — Sectors & Services collections (admin-editable)
// ---------------------------------------------------------------------------

type Sector =
  | 'ong'
  | 'culture'
  | 'industry'
  | 'tech'
  | 'education'
  | 'health'
  | 'public'
  | 'other'

type Service =
  | 'brand-strategy'
  | 'visual-identity'
  | 'website'
  | 'campaign'
  | 'art-direction'
  | 'video'
  | 'print'
  | 'social'
  | 'events'
  | 'consulting'

const SECTORS_DATA: Array<{ slug: Sector; title: string; order: number }> = [
  { slug: 'ong', title: 'ONG / Engagement', order: 10 },
  { slug: 'culture', title: 'Culture', order: 20 },
  { slug: 'industry', title: 'Industrie', order: 30 },
  { slug: 'tech', title: 'Tech / Digital', order: 40 },
  { slug: 'education', title: 'Éducation', order: 50 },
  { slug: 'health', title: 'Santé', order: 60 },
  { slug: 'public', title: 'Public', order: 70 },
  { slug: 'other', title: 'Autre', order: 99 },
]

const SERVICES_DATA: Array<{ slug: Service; title: string; order: number }> = [
  { slug: 'brand-strategy', title: 'Stratégie de marque', order: 10 },
  { slug: 'visual-identity', title: 'Identité visuelle', order: 20 },
  { slug: 'website', title: 'Site web', order: 30 },
  { slug: 'campaign', title: 'Campagne', order: 40 },
  { slug: 'art-direction', title: 'Direction artistique', order: 50 },
  { slug: 'video', title: 'Production vidéo', order: 60 },
  { slug: 'print', title: 'Édition / Print', order: 70 },
  { slug: 'social', title: 'Réseaux sociaux', order: 80 },
  { slug: 'events', title: 'Événementiel', order: 90 },
  { slug: 'consulting', title: 'Conseil', order: 100 },
]

// ---------------------------------------------------------------------------
// Project data — every project the seeder will create if missing
// ---------------------------------------------------------------------------

type ProjectSeed = {
  slug: string
  title: string
  tagline: string
  client: string
  year: number
  sector: Sector
  services: Service[]
  featured?: boolean
  hero: string // Unsplash photo URL
  thumb: string
  contextImg?: string
  challengeImg?: string
  solutionImg?: string
  gallery?: string[]
  // Rich content — each string is a paragraph; supports light markdown:
  //   "## h2"  /  "### h3"  /  "**strong**"  /  "*em*"
  intro: string[]
  context: string[]
  challenge: string[]
  solution: string[]
  results?: { value: string; label: string; description?: string }[]
  testimonial?: { quote: string; author: string; role: string }
  creation?: { name: string; role?: string; agency?: string; agencyUrl?: string }[]
  partners?: { name: string; role?: string; url?: string }[]
}

const U = (id: string, q = 85, w = 2400) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=${q}&auto=format&fit=crop`

const PROJECTS_DATA: ProjectSeed[] = [
  // --- Client projects from the existing bravo-agency.be site ---
  {
    slug: 'bruxelles-formation',
    title: 'Bruxelles Formation',
    tagline: 'Apprendre un métier, retrouver un horizon.',
    client: 'Bruxelles Formation',
    year: 2023,
    sector: 'public',
    services: ['campaign', 'visual-identity', 'website'],
    featured: true,
    hero: U('1524178232363-1fb2b075b655'),
    thumb: U('1524178232363-1fb2b075b655', 85, 1400),
    contextImg: U('1454165804606-c3d57bc86b40'),
    challengeImg: U('1497486751825-1233686d5d80'),
    solutionImg: U('1531482615713-2afd69097998'),
    gallery: [U('1524178232363-1fb2b075b655'), U('1497486751825-1233686d5d80'), U('1531482615713-2afd69097998')],
    intro: [
      "## Refaire de l'organisme *un repère évident*.",
      "Bruxelles Formation accompagne chaque année **des milliers de demandeurs d'emploi** dans leur réorientation professionnelle. Notre mission : rendre l'organisme *parlant, désirable*, sans renier sa rigueur de service public.",
      "Une refonte qui devait parler aussi bien à un ancien soudeur en reconversion qu'à une responsable formation. Pari : *un seul ton*.",
    ],
    context: [
      "### Trop d'infos, *pas assez d'âme*.",
      "Avant notre intervention, la marque souffrait d'un défaut classique du public — **trop d'informations, trop peu d'âme**. Les supports d'inscription, les annonces, les réseaux : chacun racontait sa version.",
      "L'enjeu n'était pas cosmétique. *La perception conditionne la conversion*. Plus la marque inspire, plus les gens passent à l'acte.",
    ],
    challenge: [
      "### Donner envie *sans survendre*.",
      "Réconcilier l'institutionnel et l'humain. **Maintenir la rigueur** d'un service public tout en injectant l'énergie d'une promesse personnelle.",
    ],
    solution: [
      "### Une plateforme, *une phrase*.",
      "On a tout articulé autour d'une seule promesse : « **Apprendre un métier, retrouver un horizon** ». Une identité visuelle plus chaude, un système éditorial qui met les apprenants au centre, une refonte du site avec un parcours d'inscription *divisé par deux* en nombre de clics.",
      "Déploiement : campagne d'affichage métro, supports inscription, **kit RH partenaires**.",
    ],
    results: [
      { value: '+34%', label: 'inscriptions', description: 'Vs. année précédente, 6 mois après lancement.' },
      { value: '−47%', label: 'taux d\'abandon', description: 'Sur le formulaire d\'inscription en ligne.' },
      { value: '180k', label: 'vues OOH' },
      { value: '52', label: 'supports déclinés' },
    ],
    testimonial: {
      quote: "L'équipe BRAVO! a su faire bouger une institution en gardant son sérieux. C'est rare. Nos chiffres d'inscription parlent d'eux-mêmes.",
      author: 'Marie Lambert',
      role: 'Directrice Communication, Bruxelles Formation',
    },
    partners: [
      { name: 'Pixie Studio', role: 'Photographie' },
      { name: 'Atelier Type', role: 'Typographie sur mesure' },
    ],
  },
  {
    slug: 'horeca-bxl',
    title: 'Horeca BXL',
    tagline: 'Le métier de l\'accueil, raconté autrement.',
    client: 'Fédération Horeca Bruxelles',
    year: 2024,
    sector: 'industry',
    services: ['brand-strategy', 'visual-identity', 'campaign', 'website'],
    hero: U('1517248135467-4c7edcad34c4'),
    thumb: U('1517248135467-4c7edcad34c4', 85, 1400),
    contextImg: U('1559329007-40df8a9345d8'),
    challengeImg: U('1555396273-367ea4eb4db5'),
    solutionImg: U('1559339352-11d035aa65de'),
    gallery: [U('1559329007-40df8a9345d8'), U('1555396273-367ea4eb4db5'), U('1559339352-11d035aa65de')],
    intro: [
      "## Le métier de l'accueil, *raconté autrement*.",
      "La fédération Horeca de Bruxelles voulait **réhabiliter un secteur fatigué** par le COVID, les pénuries de main-d'œuvre, le bashing récurrent. Pari : reformuler ce que veut dire *« être accueillant »* en 2024.",
    ],
    context: [
      "### Une image *figée*.",
      "Après deux ans de crise, **les jeunes désertent l'horeca**. Les images d'Épinal — patron qui hurle en cuisine, service de minuit, salaires misérables — ont fini par recouvrir tout le reste.",
      "Or l'horeca bruxellois *embauche, forme, paie correctement*, et permet de monter vite. Le travail à faire : remettre cette réalité en lumière.",
    ],
    challenge: [
      "### Renverser, *sans défense*.",
      "Renverser l'image sans avoir l'air défensif. Ne pas « vendre » l'horeca comme une marque, mais **faire entendre la voix de ceux qui y travaillent** depuis dix ans et n'iraient nulle part ailleurs.",
    ],
    solution: [
      "### Vingt portraits, *vingt parcours*.",
      "Une série de portraits documentaires — **vingt professionnels, vingt parcours**. Pas d'acteurs, pas de mise en scène. Une campagne d'affichage + vidéos pour les réseaux qui circule autant chez les jeunes que dans les écoles hôtelières.",
      "Un micro-site avec annuaire des établissements partenaires et *calendrier des journées découvertes*.",
    ],
    results: [
      { value: '2,1M', label: 'vues vidéos' },
      { value: '+62%', label: 'candidatures', description: 'Sur les jobs publiés via le micro-site.' },
      { value: '20', label: 'portraits filmés' },
    ],
    partners: [
      { name: 'Anaïs De Smet', role: 'Réalisation' },
      { name: 'Iko Films', role: 'Production' },
    ],
  },
  {
    slug: 'oxfam',
    title: 'Oxfam',
    tagline: 'La solidarité comme infrastructure.',
    client: 'Oxfam Belgique',
    year: 2024,
    sector: 'ong',
    services: ['campaign', 'social', 'video'],
    featured: true,
    hero: U('1488521787991-ed7bbaae773c'),
    thumb: U('1488521787991-ed7bbaae773c', 85, 1400),
    contextImg: U('1469571486292-0ba58a3f068b'),
    challengeImg: U('1532629345422-7515f3d16bb6'),
    solutionImg: U('1517022812141-23620dba5c23'),
    gallery: [U('1469571486292-0ba58a3f068b'), U('1532629345422-7515f3d16bb6'), U('1517022812141-23620dba5c23')],
    intro: [
      "## La solidarité comme *infrastructure*.",
      "Pour la campagne de fin d'année d'Oxfam Belgique, on a **refusé le levier de la culpabilité**. La solidarité n'est pas une faveur — c'est une *infrastructure qui rend tout le reste possible*.",
    ],
    context: [
      "### L'urgence, *saturée*.",
      "Les campagnes ONG saturent les mêmes registres : urgence, peur, témoignage poignant. **Les taux de don ont chuté de 18%** en trois ans sur le marché belge.",
      "Oxfam voulait une voix qui *ne ressemble à aucune autre ONG*.",
    ],
    challenge: [
      "### Désirable, *pas ingrat*.",
      "Rendre désirable un acte ingrat. Faire comprendre que le don n'achète pas une bonne conscience, mais **une part d'un système qui tient**.",
    ],
    solution: [
      "### Pas de larmes, *des engrenages*.",
      "Une plateforme « **La solidarité comme infrastructure** » qui montre concrètement les chaînes logistiques, humaines, économiques qu'Oxfam fait tourner. *Pas de larmes, des engrenages*.",
      "Films, social, OOH gare centrale, **kit donateurs**.",
    ],
    results: [
      { value: '+27%', label: 'dons récurrents' },
      { value: '+38%', label: 'engagement social' },
      { value: '4,8M', label: 'impressions OOH' },
    ],
    testimonial: {
      quote: 'Sortir du registre émotionnel par la facilité, c\'était risqué. Ils l\'ont fait avec une grande maîtrise.',
      author: 'Pauline Geerts',
      role: 'Head of Fundraising, Oxfam Belgique',
    },
  },
  {
    slug: 'les-nations-unies',
    title: 'COP21 — Les Nations Unies',
    tagline: 'Un sommet, une promesse écrite par les citoyens.',
    client: 'United Nations / COP21',
    year: 2015,
    sector: 'ong',
    services: ['campaign', 'video', 'art-direction'],
    hero: U('1569163139394-de4798aa62b6'),
    thumb: U('1569163139394-de4798aa62b6', 85, 1400),
    contextImg: U('1465056836041-7f43ac27dcb5'),
    challengeImg: U('1494172961521-33799ddd43a5'),
    solutionImg: U('1500382017468-9049fed747ef'),
    gallery: [U('1465056836041-7f43ac27dcb5'), U('1494172961521-33799ddd43a5'), U('1500382017468-9049fed747ef')],
    intro: [
      "## Un sommet, une promesse *écrite par les citoyens*.",
      "Avant la COP21 de Paris, l'ONU voulait que **la voix citoyenne pèse autant** que les déclarations officielles. Notre rôle : *capter cette parole, la mettre en forme, l'amplifier*.",
    ],
    context: [
      "### Une parole *éparpillée*.",
      "À l'approche du sommet, **le discours officiel monopolisait les médias**. Les milliers d'initiatives locales — citoyennes, ONG, entreprises — *restaient invisibles*.",
    ],
    challenge: [
      "### Faire entrer la rue *dans la salle*.",
      "Faire entrer dans la salle de négociation une **parole décentralisée**. Choisir un format qui *résiste à l'institutionnalisation*.",
    ],
    solution: [
      "### 240 000 *promesses*.",
      "Une plateforme participative : chaque citoyen peut écrire **sa promesse climatique en une phrase**. Les promesses sont compilées, animées, diffusées sur les écrans du sommet.",
      "Au total : **240 000 promesses recueillies**. Une fresque éditoriale diffusée en streaming pendant les *11 jours du sommet*.",
    ],
    results: [
      { value: '240k', label: 'promesses', description: 'Recueillies en 6 semaines.' },
      { value: '11', label: 'jours streamés', description: 'En direct du Bourget.' },
    ],
    creation: [
      { name: 'Stephan Marly', role: 'Direction artistique', agency: 'Second Floor' },
    ],
    partners: [
      { name: 'Iko Films', role: 'Production' },
      { name: 'Studio Pluit', role: 'Identité animée' },
    ],
  },
  {
    slug: 'tomco',
    title: 'Tomco',
    tagline: 'Une marque industrielle qui respire à nouveau.',
    client: 'Tomco Industries',
    year: 2023,
    sector: 'industry',
    services: ['brand-strategy', 'visual-identity', 'website', 'print'],
    hero: U('1565008576549-57569a49371d'),
    thumb: U('1565008576549-57569a49371d', 85, 1400),
    contextImg: U('1581092334651-ddf26d9a09d0'),
    challengeImg: U('1487014679447-9f8336841d58'),
    solutionImg: U('1581092334651-ddf26d9a09d0'),
    gallery: [U('1581092334651-ddf26d9a09d0'), U('1487014679447-9f8336841d58')],
    intro: [
      "## Une marque industrielle *qui respire à nouveau*.",
      "Tomco, équipementier industriel installé en Belgique **depuis 40 ans**, voulait moderniser sa marque sans renier son ADN technique. *Refonte complète* — du logo au catalogue PDF.",
    ],
    context: [
      "### Une identité *figée en 1998*.",
      "L'entreprise n'avait pas touché à son identité **depuis 1998**. Le logo, fonctionnel, ne projetait plus *l'expertise R&D* acquise sur deux décennies.",
    ],
    challenge: [
      "### Deux publics, *un seul ton*.",
      "Rester crédible auprès des ingénieurs et des donneurs d'ordre tout en **parlant aux nouvelles générations** de techniciens qu'il faut *recruter*.",
    ],
    solution: [
      "### Un système, *pas un logo*.",
      "Identité visuelle resserrée autour d'un **wordmark robuste** et d'un système éditorial typographié. Site B2B refait avec *catalogue produits filtrable*. Plaquette commerciale grand format.",
    ],
    results: [
      { value: '+89%', label: 'leads qualifiés', description: 'Via le formulaire commercial.' },
      { value: '14j', label: 'time-to-quote', description: 'Réduit de 21 à 14 jours.' },
    ],
  },
  {
    slug: 'spark-oh',
    title: 'Spark OH!',
    tagline: 'Faire briller la science.',
    client: 'Spark OH! — Centre de découverte des sciences',
    year: 2023,
    sector: 'culture',
    services: ['visual-identity', 'campaign', 'print', 'social'],
    featured: true,
    hero: U('1419242902214-272b3f66ee7a'),
    thumb: U('1419242902214-272b3f66ee7a', 85, 1400),
    contextImg: U('1509869175650-a1d97972541a'),
    challengeImg: U('1451187580459-43490279c0fa'),
    solutionImg: U('1462331940025-496dfbfc7564'),
    gallery: [U('1509869175650-a1d97972541a'), U('1451187580459-43490279c0fa'), U('1462331940025-496dfbfc7564')],
    intro: [
      "## Faire briller *la science*.",
      "Spark OH! ouvre à Frameries comme **nouvelle référence des centres de science** en Wallonie. Notre mission : faire d'un samedi famille au musée des sciences *un événement aussi désirable qu'un concert*.",
    ],
    context: [
      "### Trois handicaps *en un seul lieu*.",
      "Les musées scientifiques cumulent les handicaps : **image scolaire, parcours linéaire, communication institutionnelle**. Spark OH! voulait *casser ce cliché* dès le lancement.",
    ],
    challenge: [
      "### Pas *la sortie scolaire*.",
      "Donner envie à des familles, des couples, des étudiants, des seniors — bref, **tout le monde sauf « les enfants en sortie scolaire »** — de venir *un dimanche*.",
    ],
    solution: [
      "### Pop, *presque festivalier*.",
      "Identité visuelle volontairement **pop, presque festivalière**. Campagne d'affichage régionale. Système de signalétique intérieur. *Édition d'un guide collector*.",
      "Stratégie social : reels de coulisses des manips, focus sur les médiateurs, **calendrier événementiel hebdo**.",
    ],
    results: [
      { value: '+38%', label: 'visiteurs', description: 'Vs. objectif première année.' },
      { value: '120k', label: 'visiteurs an 1' },
      { value: '4,7/5', label: 'satisfaction' },
    ],
    creation: [
      { name: 'Stephan Marly', role: 'Concept', agency: 'Second Floor' },
    ],
    partners: [
      { name: 'Studio Pluit', role: 'Animation' },
      { name: 'Atelier Print', role: 'Signalétique' },
    ],
  },
  {
    slug: 'noon',
    title: 'Noon',
    tagline: 'La cuisine du midi, sérieusement.',
    client: 'Noon',
    year: 2024,
    sector: 'industry',
    services: ['brand-strategy', 'visual-identity', 'website', 'print'],
    hero: U('1466637574441-749b8f19452f'),
    thumb: U('1466637574441-749b8f19452f', 85, 1400),
    contextImg: U('1504674900247-0877df9cc836'),
    challengeImg: U('1546069901-ba9599a7e63c'),
    solutionImg: U('1481833761820-0509d3217039'),
    gallery: [U('1504674900247-0877df9cc836'), U('1546069901-ba9599a7e63c'), U('1481833761820-0509d3217039')],
    intro: [
      "## La cuisine du midi, *sérieusement*.",
      "Noon est une jeune marque de **cuisine du midi à emporter**, à Bruxelles. Notre rôle : poser *une voix unique* au milieu d'une catégorie ultra-saturée.",
    ],
    context: [
      "### Une catégorie *surpopulée*.",
      "Le segment « lunch sain à emporter » est devenu **surpopulé**. Salade-bowl-poke-buddha-flatbread. Toutes les marques disent la même chose : *« fait maison, frais, local »*. Difficile de distinguer.",
    ],
    challenge: [
      "### Un nom, *pas une description*.",
      "Faire de Noon une marque que **les bureaux mentionnent par leur nom** — pas « le truc à côté » ou *« celui avec les bols »*.",
    ],
    solution: [
      "### Le sérieux culinaire, *pas l'ennui*.",
      "Plateforme de marque **« La cuisine du midi, sérieusement »** : on revendique le sérieux culinaire (pas le sérieux ennuyeux). Identité épurée, typographie éditoriale forte, *packaging modulaire* qui devient signature.",
      "Site click-and-collect avec **menu hebdo**, fidélité simple, *paiement express*.",
    ],
    results: [
      { value: '+54%', label: 'paniers moyens' },
      { value: '−18%', label: 'churn fidélité' },
    ],
  },
  {
    slug: 'beefeater',
    title: 'Beefeater',
    tagline: 'Un gin qui assume son siècle.',
    client: 'Beefeater Gin',
    year: 2022,
    sector: 'industry',
    services: ['campaign', 'social', 'art-direction'],
    hero: U('1514362545857-3bc16c4c7d1b'),
    thumb: U('1514362545857-3bc16c4c7d1b', 85, 1400),
    contextImg: U('1551538827-9c037cb4f32a'),
    challengeImg: U('1543007630-9710e4a00a20'),
    solutionImg: U('1571805529673-0f56b922b359'),
    gallery: [U('1551538827-9c037cb4f32a'), U('1543007630-9710e4a00a20'), U('1571805529673-0f56b922b359')],
    intro: [
      "## Un gin qui *assume son siècle*.",
      "Pour la sortie d'une édition limitée Beefeater en Belgique, on a écrit une campagne qui rappelle que **l'histoire d'un gin n'est pas un argument à recopier** — c'est *un point de départ*.",
    ],
    context: [
      "### Le premium *en mode chaos*.",
      "Le marché du gin premium est devenu **chaotique** : micro-distilleries, éditions limitées, gimmicks. *Les grandes marques historiques perdent du terrain* face à des inconnus.",
    ],
    challenge: [
      "### Un siècle, *sans poussière*.",
      "Faire valoir **un siècle d'histoire** sans tomber dans le piège du *discours patrimonial poussiéreux*.",
    ],
    solution: [
      "### Londres documentaire, *pas la carte postale*.",
      "Direction artistique inspirée du **Londres documentaire** — pas la carte postale. Des images de bars de quartier, de *barmen qui parlent vrai*, de cocktails sans tablier blanc.",
      "Activation bar à Bruxelles + social organique. **Pas un seul euro** en média payant.",
    ],
    results: [
      { value: '+22%', label: 'volume', description: 'Sur 3 mois post-activation.' },
      { value: '650k', label: 'vues social', description: 'Organique uniquement.' },
    ],
    creation: [
      { name: 'Michael Vargiakakis', role: 'Direction artistique', agency: 'Second Floor' },
    ],
  },

  // --- Internal BRAVO! projects ---
  {
    slug: 'bravo-le-jardin',
    title: 'Le jardin',
    tagline: 'Un projet auto-initié, trois saisons plus tard.',
    client: 'BRAVO! — projet interne',
    year: 2023,
    sector: 'other',
    services: ['art-direction', 'print', 'consulting'],
    hero: U('1416879595882-3373a0480b5b'),
    thumb: U('1416879595882-3373a0480b5b', 85, 1400),
    contextImg: U('1466692476868-aef1dfb1e735'),
    challengeImg: U('1417325384643-aac51acc9e5d'),
    solutionImg: U('1518531933037-91b2f5f229cc'),
    gallery: [U('1466692476868-aef1dfb1e735'), U('1417325384643-aac51acc9e5d'), U('1518531933037-91b2f5f229cc')],
    intro: [
      "## Un projet auto-initié, *trois saisons plus tard*.",
      "Le jardin est un **projet personnel** du studio. On y teste des écritures, des photos, des hypothèses qui *n'ont pas leur place chez un client*. Trois saisons plus tard, on en récolte.",
    ],
    context: [
      "### Pas un *side project*.",
      "Beaucoup d'agences ont leur « side project » qu'on retrouve trois mois plus tard *sur l'About page*. Pour nous, ça devait être **un vrai engagement éditorial**.",
    ],
    challenge: [
      "### Tenir, *sans brief*.",
      "Maintenir un **rythme de publication régulier** alors qu'aucun client ne nous attend. *Tenir la qualité* sans la pression d'un brief.",
    ],
    solution: [
      "### Trimestriel imprimé, *hebdo en ligne*.",
      "Une **publication trimestrielle imprimée** + un journal hebdo en ligne. Chaque édition explore un thème — *la lenteur, le geste, l'attention*.",
    ],
    results: [
      { value: 'III', label: 'éditions imprimées' },
      { value: '142', label: 'articles' },
    ],
  },
  {
    slug: 'bravo-machao',
    title: 'Machao',
    tagline: 'Le podcast d\'enquête sur les communications militantes.',
    client: 'BRAVO! — projet interne',
    year: 2024,
    sector: 'culture',
    services: ['art-direction', 'video', 'social'],
    hero: U('1478737270239-2f02b77fc618'),
    thumb: U('1478737270239-2f02b77fc618', 85, 1400),
    contextImg: U('1493225457124-a3eb161ffa5f'),
    challengeImg: U('1485579149621-3123dd979885'),
    solutionImg: U('1590602847861-f357a9332bbc'),
    gallery: [U('1493225457124-a3eb161ffa5f'), U('1485579149621-3123dd979885'), U('1590602847861-f357a9332bbc')],
    intro: [
      "## Le podcast d'enquête *sur les communications militantes*.",
      "Machao est **notre podcast d'enquête**. Six épisodes par saison sur les campagnes militantes qui ont marqué le siècle — *réussites, ratés, machineries*.",
    ],
    context: [
      "### Une parole *jamais donnée*.",
      "Le métier de la com militante est **rarement raconté de l'intérieur**. La parole, ce sont toujours *les marques ou les médias*.",
    ],
    challenge: [
      "### Faire parler *les muets*.",
      "Obtenir la parole de ceux qui ont conçu les campagnes — souvent liés à des **clauses de confidentialité** ou des *positions politiques sensibles*.",
    ],
    solution: [
      "### Un format, *monté serré*.",
      "Un **format documentaire sonore d'1h** par épisode, monté serré. *Interviews + archives audio*. Disponible sur toutes les plateformes podcast + transcripts sur notre site.",
    ],
    results: [
      { value: '12', label: 'épisodes' },
      { value: '48k', label: 'écoutes' },
    ],
  },
  {
    slug: 'bravo-lenfant-sauvage',
    title: "L'enfant sauvage",
    tagline: 'Une exposition itinérante sur l\'éducation et le commun.',
    client: 'BRAVO! — projet interne · partenariat UMons',
    year: 2022,
    sector: 'culture',
    services: ['art-direction', 'visual-identity', 'print', 'events'],
    hero: U('1551434678-e076c223a692'),
    thumb: U('1551434678-e076c223a692', 85, 1400),
    contextImg: U('1503454537195-1dcabb73ffb9'),
    challengeImg: U('1488521787991-ed7bbaae773c'),
    solutionImg: U('1485827404703-89b55fcc595e'),
    gallery: [U('1503454537195-1dcabb73ffb9'), U('1488521787991-ed7bbaae773c'), U('1485827404703-89b55fcc595e')],
    intro: [
      "## Une exposition itinérante *sur l'éducation et le commun*.",
      "L'enfant sauvage est une exposition itinérante qu'on a portée **avec l'UMons**. Trois ans de recherche éditoriale autour d'une question : *que devient le commun quand on grandit ?*",
    ],
    context: [
      "### D'un essai, *à une expo*.",
      "À l'origine, un essai de Michael paru dans **Le jardin**. Le sujet — *l'éducation, le sauvage qui survit en nous* — a appelé un format plus grand.",
    ],
    challenge: [
      "### Un propos d'auteur, *dans un cadre institutionnel*.",
      "Tenir un **propos d'auteur** dans un format institutionnel (musée, université) sans renoncer à *l'écriture libre*.",
    ],
    solution: [
      "### Quatre actes, *trois villes*.",
      "Une **scénographie en quatre actes**, conçue avec le studio Pluit. Un catalogue d'exposition (*192 pages, deux langues*). Trois conférences publiques à Mons, Bruxelles, Liège.",
    ],
    results: [
      { value: '18k', label: 'visiteurs' },
      { value: '3', label: 'villes' },
    ],
    partners: [
      { name: 'UMons', role: 'Partenariat scientifique', url: 'https://web.umons.ac.be' },
      { name: 'Studio Pluit', role: 'Scénographie' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Team data
// ---------------------------------------------------------------------------

type TeamSeed = {
  slug: string
  name: string
  role: string
  order: number
  photo: string
  bio: string[]
  email?: string
  links?: { label: string; url: string }[]
}

const TEAM_DATA: TeamSeed[] = [
  {
    slug: 'stephan-marly',
    name: 'Stephan Marly',
    role: 'Concept & Activation',
    order: 1,
    photo: U('1507003211169-0a1dd7228f2d', 85, 1400),
    bio: [
      "20 ans à transformer des briefs en idées qui survivent au premier comité de marque. Avant BRAVO!, direction de création chez Second Floor, où il a piloté les campagnes WWF Together for Tomorrow et la plateforme citoyenne de la COP21.",
      "Co-fondateur de BRAVO!. Anime nos rendez-vous de stratégie et toutes les phases d'activation. Apparaît dans le podcast Machao environ un épisode sur deux, qu'il aime ou non.",
    ],
    email: 'stephan@bravo-agency.be',
    links: [
      { label: 'LinkedIn', url: 'https://linkedin.com/in/stephanmarly' },
    ],
  },
  {
    slug: 'michael-vargiakakis',
    name: 'Michael Vargiakakis',
    role: 'Création & UX/UI Design',
    order: 2,
    photo: U('1500648767791-00dcc994a43e', 85, 1400),
    bio: [
      "Direction artistique, identité, design d'interfaces. Toujours du côté de la simplicité utile. Co-fondateur de BRAVO!.",
      "Avant : 6 ans chez Second Floor, puis freelance pour des marques engagées (Oxfam, WWF, plusieurs musées). Écrit Le jardin avec Stephan, et a porté la scénographie de L'enfant sauvage.",
    ],
    email: 'michael@bravo-agency.be',
    links: [
      { label: 'LinkedIn', url: 'https://linkedin.com/in/michaelvargiakakis' },
      { label: 'Behance', url: 'https://behance.net/michaelvargiakakis' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Posts / "Bonnes nouvelles" — éditoriaux courts du studio
// ---------------------------------------------------------------------------

type Category = 'edito' | 'carnet' | 'coulisses' | 'methode'

const CATEGORIES_DATA: Array<{ slug: Category; title: string }> = [
  { slug: 'edito', title: 'Édito' },
  { slug: 'carnet', title: 'Carnet' },
  { slug: 'coulisses', title: 'Coulisses' },
  { slug: 'methode', title: 'Méthode' },
]

type PostBodyItem =
  | string // markdown line ("##", "###", "**strong**", "*em*")
  | { img: string; alt: string; caption?: string } // mediaBlock injected mid-article
  | { quote: string } // editorial pull-quote
  | { hr: true } // horizontal section break

type PostSeed = {
  slug: string
  title: string
  hero: string
  categories: Category[]
  publishedAt: string // ISO date
  excerpt: string // → meta.description
  body: PostBodyItem[] // article body — mix of markdown strings and rich nodes
}

const POSTS_DATA: PostSeed[] = [
  {
    slug: 'fatigue-compassionnelle-ong',
    title: "La fatigue compassionnelle est une vraie menace pour les ONG",
    hero: U('1488521787991-ed7bbaae773c'),
    categories: ['edito'],
    publishedAt: '2026-04-12',
    excerpt:
      "On a comparé trois ans de campagnes WWF, Oxfam et MSF : la culpabilisation comme levier d'engagement s'épuise. Voici ce que les chiffres disent et ce qu'on en fait dans nos briefs.",
    body: [
      "## Trois ans, *un même réflexe*.",
      "Entre 2022 et 2025, on a regardé **plus de 120 campagnes** d'ONG belges et internationales. Le réflexe : montrer la victime, dramatiser la situation, demander un don. La logique semble évidente — *plus c'est douloureux, plus ça mobilise*.",
      "Sauf que les taux de réponse s'effondrent. **−18% de dons** chez les <35 ans en trois ans sur le marché belge (source : Donorinfo).",
      {
        img: U('1532012197267-da84d127e765', 85, 1800),
        alt: 'Image abstraite — gestes solidaires',
        caption: "120 campagnes analysées sur trois ans, toutes ONG confondues.",
      },
      { quote: "Ce n'est pas l'engagement qui diminue. C'est la capacité du cerveau à tenir l'attention émotionnelle quinze fois par jour." },
      "## Le **donneur** *aussi* est fatigué.",
      "Ce n'est pas l'engagement qui diminue, c'est la **capacité d'attention émotionnelle**. À force de voir des images de famine, de noyade, d'enfants en pleurs, le cerveau apprend à *détourner le regard*. C'est documenté, c'est mesurable, c'est notre boulot d'en tenir compte.",
      { hr: true },
      "Sur le projet Oxfam, on a refusé le levier de la culpabilité. La plateforme **« La solidarité comme infrastructure »** parle de chaînes logistiques, pas de larmes. Les résultats ont confirmé l'intuition.",
    ],
  },
  {
    slug: 'greenwashing-2026',
    title: 'Trois minutes pour comprendre le greenwashing en 2026',
    hero: U('1470770841072-f978cf4d019e'),
    categories: ['methode'],
    publishedAt: '2026-03-28',
    excerpt:
      "La nouvelle directive européenne Green Claims entre en vigueur. Ce qui change concrètement pour les marques — et les agences qui les conseillent.",
    body: [
      "## La directive *Green Claims*.",
      "Depuis mars 2026, l'UE encadre strictement les **allégations environnementales** sur les emballages, sites web et campagnes. Plus question d'écrire « éco-responsable » sans pouvoir le **prouver chiffres en main**.",
      {
        img: U('1518531933037-91b2f5f229cc', 85, 1800),
        alt: 'Visuel — feuilles et photographie',
        caption: 'Texte de loi UE 2026/543 — entrée en vigueur 27 mars 2026.',
      },
      "## Ce que ça change *pour nos clients*.",
      "Trois niveaux d'impact : (1) les claims vagues (« naturel », « vert », « bon pour la planète ») doivent être **justifiés ou retirés**, (2) les comparaisons (« moins polluant que X ») doivent référencer une méthodologie publique, (3) les logos d'auto-certification non régulés sont *interdits*.",
      { quote: "Une marque qui dit moins mais le prouve gagne plus en confiance qu'une marque qui pavoise." },
      "## Notre position.",
      "On accompagne nos clients à **substituer le claim vague par le fait vérifiable**. Pas par défensive — par hygiène. Une marque qui dit moins mais le prouve gagne plus en confiance qu'une marque qui pavoise.",
      { hr: true },
      {
        img: U('1466692476868-aef1dfb1e735', 85, 1800),
        alt: 'Détail nature — feuilles à contre-jour',
      },
      "Trois clients sont déjà passés à la version *prouvée* de leur claim depuis février. Les briefs qui suivent sont *plus simples à écrire*, paradoxalement.",
    ],
  },
  {
    slug: 'machao-saison-2',
    title: 'Machao saison 2 — ce qu\'on a appris en montant 12 épisodes',
    hero: U('1478737270239-2f02b77fc618'),
    categories: ['coulisses', 'carnet'],
    publishedAt: '2026-02-18',
    excerpt:
      "Notre podcast d'enquête sur les campagnes militantes boucle sa deuxième saison. Retour sur la méthode, les refus d'interview, les surprises et le format qu'on garde.",
    body: [
      "## Douze épisodes, *plus de quatre-vingts heures d'interviews*.",
      "On a interrogé **42 personnes** entre janvier 2025 et janvier 2026. Anciens directeurs de création, militants encartés, sociologues, et trois CEO d'ONG qui ont accepté de parler off-record (et on a respecté l'off-record).",
      {
        img: U('1493225457124-a3eb161ffa5f', 85, 1800),
        alt: 'Studio audio — micro et table de mixage',
        caption: 'Studio Machao — Bruxelles, montage saison 2.',
      },
      "## Les *refus* ont parlé autant que les acceptations.",
      "Sept refus formels, dont **deux marques de luxe** qui ont menacé d'une action en référé si leur nom apparaissait à côté du mot « militant ». On a respecté.",
      { quote: "La frontière entre com d'engagement et com de marque reste très défendue. Notre boulot, c'est aussi de la documenter." },
      "On en a tiré une conclusion : la frontière entre *com d'engagement* et *com de marque* reste très défendue.",
      { hr: true },
      "## Le format qu'on garde.",
      "**1h par épisode, deux voix montées serré, archives audio**. Pas de musique d'ambiance, pas d'effets. Le silence porte autant que la parole.",
      {
        img: U('1485579149621-3123dd979885', 85, 1800),
        alt: 'Plan rapproché — main qui ajuste un micro',
      },
      "On reconduit le format en saison 3. Premier épisode prévu pour **septembre 2026**.",
    ],
  },
  {
    slug: 'pourquoi-on-a-refuse-un-brief',
    title: "Pourquoi on a refusé un brief en 2025",
    hero: U('1517245386807-bb43f82c33c4'),
    categories: ['edito', 'coulisses'],
    publishedAt: '2026-01-22',
    excerpt:
      "Un brief de campagne pour une banque qu'on ne nommera pas. Refus argumenté. Voici la lettre qu'on leur a envoyée, anonymisée.",
    body: [
      "## Le brief.",
      "Une banque belge — top 5 du marché — nous demande une campagne de notoriété sur ses **fonds dits responsables**. Budget intéressant. Notoriété pour le studio. Belle équipe en face.",
      {
        img: U('1554224155-6726b3ff858f', 85, 1800),
        alt: 'Bâtiments de bureaux corporate',
        caption: "Quartier d'affaires — où se prennent les briefs qu'on accepte ou refuse.",
      },
      "## Le problème.",
      "On lit les fiches techniques des fonds en question. **Plusieurs lignes incluent des énergies fossiles** via des holdings intermédiaires (le standard de l'industrie, mais qui ne se voit pas dans la com).",
      "On demande au client de modifier le claim ou d'élargir la base. Pas de greenwashing, juste de la précision. **Refus** côté client.",
      { quote: "Pas un grand geste — juste un alignement avec ce qu'on défend dans Machao depuis deux ans." },
      "## Le refus.",
      "On a écrit une lettre de refus argumentée. La banque a trouvé une autre agence. *Le brief existe toujours*.",
      { hr: true },
      "## Pourquoi on en parle ici.",
      "Pas pour donner des leçons. Pour **rendre visible un arbitrage** qui se prend tous les ans dans toutes les agences, et qu'on ne raconte jamais.",
      {
        img: U('1450101499163-c8848c66ca85', 85, 1800),
        alt: "Lettres — bureau d'écriture",
      },
      "Si vous êtes briefé par un client, *posez-vous la question avant de signer*. Pas le contraire.",
    ],
  },
  {
    slug: 'cent-projets-patterns',
    title: 'On a relu nos 100 premiers projets — voici les patterns',
    hero: U('1497032628192-86f99bcd76bc'),
    categories: ['methode', 'carnet'],
    publishedAt: '2025-12-08',
    excerpt:
      "Sept ans de production, 100 livraisons. On a passé deux jours à les classer par succès, échec, regret. Cinq patterns qui reviennent.",
    body: [
      "## Pattern n°1 — *les briefs trop précis échouent plus souvent*.",
      "Contre-intuitif. Quand le client arrive avec **un livrable très défini**, on a moins de marge pour identifier le vrai problème. 60% de nos *échecs commerciaux* (clients pas reconduits) viennent de briefs sur-spécifiés.",
      {
        img: U('1542038784456-1ea8e935640e', 85, 1800),
        alt: 'Tableau blanc — esquisses de stratégie',
        caption: 'Mur de l\'atelier — mois 2 d\'un projet typique.',
      },
      "## Pattern n°2 — *les meilleurs projets ont eu une crise au milieu*.",
      "Sur 100 projets, **23 ont eu une crise majeure entre la mi-temps et la livraison** (changement de direction client, revirement stratégique, désaccord créatif). Ces 23 sont aussi 18 de nos 25 favoris.",
      { quote: "On a appris à facturer au juste prix, pas à la taille du client. Ça change tout le rapport au projet." },
      "## Pattern n°3 — *les petits clients sont plus exigeants que les gros*.",
      "Vrai. Et c'est très bien comme ça. On a appris à **facturer au juste prix**, pas à la taille du client.",
      { hr: true },
      {
        img: U('1559686043-aef1abad5805', 85, 1800),
        alt: 'Détail typographique — composition imprimée',
      },
      "## Pattern n°4 — *les projets auto-initiés rendent meilleurs sur les commerciaux*.",
      "Le jardin, Machao, L'enfant sauvage — trois projets *auto-initiés* — ont influencé environ **60% de nos décisions créatives** sur les briefs commerciaux qui ont suivi.",
      "## Pattern n°5 — *on est devenu bons à dire non*.",
      "Pas par snobisme. Par hygiène méthodologique. Voir l'édito précédent sur le refus.",
    ],
  },
]

// ---------------------------------------------------------------------------
// The seeder
// ---------------------------------------------------------------------------

async function seedBravo() {
  const payload = await getPayload({ config })

  payload.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  payload.logger.info('  BRAVO! demo seeder — idempotent, skips existing slugs')
  payload.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  let projectsCreated = 0
  let projectsSkipped = 0
  let teamCreated = 0
  let teamSkipped = 0
  let sectorsCreated = 0
  let servicesCreated = 0
  let categoriesCreated = 0
  let postsCreated = 0
  let postsSkipped = 0

  // --- Taxonomies: Sectors + Services (idempotent by slug) ---
  // Build slug → id maps so projects can reference these relationships.
  const sectorMap = new Map<Sector, number>()
  for (const s of SECTORS_DATA) {
    const existing = await payload.find({
      collection: 'sectors',
      where: { slug: { equals: s.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      sectorMap.set(s.slug, existing.docs[0].id as number)
    } else {
      const created = await payload.create({
        collection: 'sectors',
        data: { title: s.title, slug: s.slug, order: s.order },
      })
      sectorMap.set(s.slug, created.id as number)
      sectorsCreated++
    }
  }
  payload.logger.info(`✓ sectors: ${sectorsCreated} created, ${SECTORS_DATA.length - sectorsCreated} existed`)

  const serviceMap = new Map<Service, number>()
  for (const s of SERVICES_DATA) {
    const existing = await payload.find({
      collection: 'services',
      where: { slug: { equals: s.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      serviceMap.set(s.slug, existing.docs[0].id as number)
    } else {
      const created = await payload.create({
        collection: 'services',
        data: { title: s.title, slug: s.slug, order: s.order },
      })
      serviceMap.set(s.slug, created.id as number)
      servicesCreated++
    }
  }
  payload.logger.info(`✓ services: ${servicesCreated} created, ${SERVICES_DATA.length - servicesCreated} existed`)

  // --- Team members ---
  for (const m of TEAM_DATA) {
    const exists = await payload.find({
      collection: 'team',
      where: { slug: { equals: m.slug } },
      limit: 1,
    })
    if (exists.docs.length > 0) {
      payload.logger.info(`◌ skip team: ${m.name} (already exists)`)
      teamSkipped++
      continue
    }
    payload.logger.info(`+ team: ${m.name}`)
    const photoId = await uploadImage(payload, m.photo, `Portrait ${m.name}`, `team-${m.slug}`)
    await payload.create({
      collection: 'team',
      data: {
        name: m.name,
        slug: m.slug,
        role: m.role,
        order: m.order,
        photo: photoId,
        bio: richText(m.bio) as never,
        email: m.email || undefined,
        links: m.links?.map((l) => ({ label: l.label, url: l.url })),
        _status: 'published',
      },
    })
    teamCreated++
  }

  // --- Projects ---
  for (const p of PROJECTS_DATA) {
    const exists = await payload.find({
      collection: 'projects',
      where: { slug: { equals: p.slug } },
      limit: 1,
    })
    if (exists.docs.length > 0) {
      payload.logger.info(`◌ skip project: ${p.title} (already exists)`)
      projectsSkipped++
      continue
    }
    payload.logger.info(`+ project: ${p.title} — uploading media…`)

    // Upload all images for this project in parallel
    const [
      heroId,
      thumbId,
      ctxImgId,
      chalImgId,
      solImgId,
      ...galleryIds
    ] = await Promise.all([
      uploadImage(payload, p.hero, `${p.title} — Hero`, `${p.slug}-hero`),
      uploadImage(payload, p.thumb, `${p.title} — Thumbnail`, `${p.slug}-thumb`),
      p.contextImg ? uploadImage(payload, p.contextImg, `${p.title} — Contexte`, `${p.slug}-context`) : Promise.resolve(null),
      p.challengeImg ? uploadImage(payload, p.challengeImg, `${p.title} — Défi`, `${p.slug}-challenge`) : Promise.resolve(null),
      p.solutionImg ? uploadImage(payload, p.solutionImg, `${p.title} — Solution`, `${p.slug}-solution`) : Promise.resolve(null),
      ...(p.gallery || []).map((g, i) => uploadImage(payload, g, `${p.title} — Gallery ${i + 1}`, `${p.slug}-gallery-${i + 1}`)),
    ])

    payload.logger.info(`+ project: ${p.title} — creating doc…`)
    await payload.create({
      collection: 'projects',
      data: {
        title: p.title,
        slug: p.slug,
        tagline: p.tagline,
        client: p.client,
        year: p.year,
        sector: sectorMap.get(p.sector),
        services: p.services
          .map((slug) => serviceMap.get(slug))
          .filter((id): id is number => typeof id === 'number'),
        featured: p.featured || false,
        heroImage: heroId,
        thumbnail: thumbId,
        heroLayout: 'high',
        introduction: richText(p.intro) as never,
        context: richText(p.context) as never,
        challenge: richText(p.challenge) as never,
        solution: richText(p.solution) as never,
        ...(ctxImgId ? { contextImage: ctxImgId } : {}),
        ...(chalImgId ? { challengeImage: chalImgId } : {}),
        ...(solImgId ? { solutionImage: solImgId } : {}),
        gallery: galleryIds.length
          ? galleryIds.map((id, i) => ({
              image: id,
              layout: i === 0 ? 'full' : i === 1 ? 'half-left' : 'contained',
              fit: 'natural',
            }))
          : undefined,
        results: p.results,
        testimonial: p.testimonial,
        creation: p.creation,
        partners: p.partners,
        publishedAt: new Date().toISOString(),
        _status: 'published',
      },
    })
    projectsCreated++
    payload.logger.info(`✓ ${p.title}`)
  }

  // --- Home global ---
  // Populates the editorial copy used by the home page. Idempotent: re-running
  // overrides the global with these defaults (matches the previous hardcoded copy).
  // --- Categories + Posts ---
  const categoryMap = new Map<Category, number>()
  for (const c of CATEGORIES_DATA) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: c.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      categoryMap.set(c.slug, existing.docs[0].id as number)
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: { title: c.title, slug: c.slug },
      })
      categoryMap.set(c.slug, created.id as number)
      categoriesCreated++
    }
  }
  payload.logger.info(`✓ categories: ${categoriesCreated} created, ${CATEGORIES_DATA.length - categoriesCreated} existed`)

  for (const p of POSTS_DATA) {
    const exists = await payload.find({
      collection: 'posts',
      where: { slug: { equals: p.slug } },
      limit: 1,
    })
    if (exists.docs.length > 0) {
      payload.logger.info(`◌ skip post: ${p.title} (already exists)`)
      postsSkipped++
      continue
    }
    payload.logger.info(`+ post: ${p.title} — uploading hero…`)
    const heroId = await uploadImage(payload, p.hero, `${p.title} — Hero`, `post-${p.slug}-hero`)

    // Walk the body array: upload images, then build a Lexical document with
    // mixed paragraph / heading / quote / hr / mediaBlock nodes
    payload.logger.info(`+ post: ${p.title} — uploading body media…`)
    const children: unknown[] = []
    let imgIdx = 0
    for (const item of p.body) {
      if (typeof item === 'string') {
        if (item.startsWith('# ')) children.push(heading('h1', parseInlines(item.slice(2))))
        else if (item.startsWith('## ')) children.push(heading('h2', parseInlines(item.slice(3))))
        else if (item.startsWith('### ')) children.push(heading('h3', parseInlines(item.slice(4))))
        else children.push(paragraph(parseInlines(item)))
      } else if ('img' in item) {
        imgIdx++
        const mediaId = await uploadImage(
          payload,
          item.img,
          item.alt,
          `post-${p.slug}-body-${String(imgIdx).padStart(2, '0')}`,
          item.caption,
        )
        children.push({
          type: 'block',
          format: '',
          version: 2,
          fields: {
            blockName: '',
            blockType: 'mediaBlock',
            media: mediaId,
          },
        })
      } else if ('quote' in item) {
        children.push({
          type: 'quote',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [
            { type: 'text', text: item.quote, format: 0, mode: 'normal', style: '', detail: 0, version: 1 },
          ],
        })
      } else if ('hr' in item) {
        children.push({ type: 'horizontalrule', version: 1 })
      }
    }
    const content = {
      root: {
        type: 'root',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children,
      },
    }

    payload.logger.info(`+ post: ${p.title} — creating doc…`)
    await payload.create({
      collection: 'posts',
      data: {
        title: p.title,
        slug: p.slug,
        heroImage: heroId,
        content: content as never,
        categories: p.categories
          .map((slug) => categoryMap.get(slug))
          .filter((id): id is number => typeof id === 'number'),
        publishedAt: new Date(p.publishedAt).toISOString(),
        meta: {
          title: `${p.title} — BRAVO! Agency`,
          description: p.excerpt,
        },
        _status: 'published',
      },
      locale: 'fr',
      context: { disableRevalidate: true },
    })
    postsCreated++
    payload.logger.info(`✓ ${p.title}`)
  }

  payload.logger.info('+ home global — updating editorial copy…')
  await payload.updateGlobal({
    slug: 'home',
    data: {
      hero: {
        badge: 'Active · Bruxelles',
        yearRange: '2018 — 2026',
        title: richText([
          '# Les *idées*',
          '# en **actions**.',
        ]) as never,
      },
      marquee: [
        { text: 'Together for tomorrow' },
        { text: 'Porteurs de sens' },
        { text: "Déclencheurs d'actions" },
        { text: "Une goutte d'eau" },
      ],
      intro: {
        label: 'À propos · 01',
        title: richText([
          '## On accompagne',
          "## *l'engagement*",
          '## des marques.',
          '## **Pas leurs slogans.**',
        ]) as never,
      },
      projectsSection: {
        label: 'Travaux · Sélection 2026',
        title: richText([
          '## Quelques *projets*',
          '## **qui nous représentent**.',
        ]) as never,
        cta: 'Voir tous les projets',
      },
      manifesto: {
        label: 'Manifeste',
        title: richText([
          "## *Une* **goutte d'eau**",
          "## *peut-être.*",
          "## *Heureusement,*",
          "## **on n'est pas seuls**.",
        ]) as never,
      },
      studioSection: {
        label: 'Studio · Effectif',
        title: richText([
          '## Deux *têtes*,',
          '## **un écosystème**.',
        ]) as never,
        cta: 'Notre réseau',
      },
      cta: {
        label: 'Premier pas',
        title: richText([
          '## Allez,',
          '## *on en* **parle** ?',
        ]) as never,
        buttonLabel: 'Démarrer la conversation',
        buttonHref: '/contact',
      },
    },
  })
  payload.logger.info('✓ home global')

  payload.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  payload.logger.info(`  Done.`)
  payload.logger.info(`  Categories: ${categoriesCreated} created`)
  payload.logger.info(`  Posts  : ${postsCreated} created, ${postsSkipped} skipped`)
  payload.logger.info(`  Sectors: ${sectorsCreated} created`)
  payload.logger.info(`  Services: ${servicesCreated} created`)
  payload.logger.info(`  Team   : ${teamCreated} created, ${teamSkipped} skipped`)
  payload.logger.info(`  Projects: ${projectsCreated} created, ${projectsSkipped} skipped`)
  payload.logger.info(`  Home   : global updated`)
  payload.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

// Top-level await — required so `payload run` waits for the seeder to finish
// before tearing down the process (the bin script does `await import(scriptPath)`).
try {
  await seedBravo()
} catch (e) {
  console.error('Seed failed:', e)
  if (e && typeof e === 'object' && 'data' in e) {
    console.error('Error data:', JSON.stringify((e as { data: unknown }).data, null, 2))
  }
  process.exit(1)
}
