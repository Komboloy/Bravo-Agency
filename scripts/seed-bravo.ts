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

function richText(paragraphs: string[]): RichDoc {
  return {
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map((p) => ({
        type: 'paragraph',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: [
          { type: 'text', version: 1, text: p, format: 0, mode: 'normal', style: '', detail: 0 },
        ],
      })),
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

async function uploadImage(payload: Payload, url: string, alt: string, name: string): Promise<number> {
  const data = await fetchBuffer(url)
  // Suffix with a short random hex to avoid filename collisions on re-runs
  const suffix = Math.random().toString(16).slice(2, 8)
  const created = await payload.create({
    collection: 'media',
    data: { alt },
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
// Project data — every project the seeder will create if missing
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
      "Bruxelles Formation accompagne chaque année des milliers de demandeurs d'emploi dans leur réorientation professionnelle. Notre mission : refaire de l'organisme un repère évident, parlant, désirable.",
      "Une refonte qui devait parler aussi bien à un ancien soudeur en reconversion qu'à une responsable formation d'institution. Pari : un seul ton.",
    ],
    context: [
      "Avant notre intervention, la marque souffrait d'un défaut classique du public — trop d'informations, trop peu d'âme. Les supports d'inscription, les annonces, les réseaux : chacun racontait sa version.",
      "L'enjeu n'était pas cosmétique. La perception de l'organisme conditionne le taux de conversion vers l'inscription. Plus la marque inspire, plus les gens passent à l'acte.",
    ],
    challenge: [
      "Réconcilier l'institutionnel et l'humain. Donner envie sans survendre. Maintenir la rigueur d'un service public tout en injectant l'énergie d'une promesse personnelle.",
    ],
    solution: [
      "Une plateforme de marque articulée autour d'une seule phrase : « Apprendre un métier, retrouver un horizon ». Une identité visuelle plus chaude, un système éditorial qui met les apprenants au centre, une refonte du site avec un parcours d'inscription divisé par deux en nombre de clics.",
      "Déploiement : campagne d'affichage métro, supports inscription, kit RH partenaires.",
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
      "La fédération Horeca de Bruxelles voulait réhabiliter un secteur fatigué par le COVID, les pénuries de main-d'œuvre, le bashing récurrent. Pari : reformuler ce que veut dire « être accueillant » en 2024.",
    ],
    context: [
      'Après deux ans de crise, les jeunes désertent l\'horeca. Les images d\'Épinal — patron qui hurle en cuisine, service de minuit, salaires misérables — ont fini par recouvrir tout le reste.',
      'Or l\'horeca bruxellois embauche, forme, paie correctement, et permet de monter vite. Le travail à faire : remettre cette réalité en lumière.',
    ],
    challenge: [
      "Renverser l'image sans avoir l'air défensif. Ne pas \"vendre\" l'horeca comme une marque, mais faire entendre la voix de ceux qui y travaillent depuis dix ans et n'iraient nulle part ailleurs.",
    ],
    solution: [
      "Une série de portraits documentaires — vingt professionnels, vingt parcours. Pas d\'acteurs, pas de mise en scène. Une campagne d\'affichage + vidéos pour les réseaux qui circule autant chez les jeunes que dans les écoles hôtelières.",
      'Un micro-site avec annuaire des établissements partenaires et calendrier des journées découvertes.',
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
      "Pour la campagne de fin d'année d'Oxfam Belgique, on a refusé le levier de la culpabilité. La solidarité n'est pas une faveur — c'est une infrastructure qui rend tout le reste possible.",
    ],
    context: [
      'Les campagnes ONG saturent les mêmes registres : urgence, peur, témoignage poignant. Les taux de don ont chuté de 18% en trois ans sur le marché belge.',
      'Oxfam voulait une voix qui ne ressemble à aucune autre ONG.',
    ],
    challenge: [
      'Rendre désirable un acte ingrat. Faire comprendre que le don n\'achète pas une bonne conscience, mais une part d\'un système qui tient.',
    ],
    solution: [
      "Une plateforme « La solidarité comme infrastructure » qui montre concrètement les chaînes logistiques, humaines, économiques qu'Oxfam fait tourner. Pas de larmes, des engrenages.",
      'Films, social, OOH gare centrale, kit donateurs.',
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
      "Avant la COP21 de Paris, l'ONU voulait que la voix citoyenne pèse autant que les déclarations officielles. Notre rôle : capter cette parole, la mettre en forme, l'amplifier.",
    ],
    context: [
      "À l'approche du sommet, le discours officiel monopolisait les médias. Les milliers d'initiatives locales — citoyennes, ONG, entreprises — restaient invisibles.",
    ],
    challenge: [
      "Faire entrer dans la salle de négociation une parole décentralisée. Choisir un format qui résiste à l'institutionnalisation.",
    ],
    solution: [
      "Une plateforme participative : chaque citoyen peut écrire sa promesse climatique en une phrase. Les promesses sont compilées, animées, diffusées sur les écrans du sommet.",
      'Au total : 240 000 promesses recueillies. Une fresque éditoriale diffusée en streaming pendant les 11 jours du sommet.',
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
      'Tomco, équipementier industriel installé en Belgique depuis 40 ans, voulait moderniser sa marque sans renier son ADN technique. Refonte complète — du logo au catalogue PDF.',
    ],
    context: [
      "L'entreprise n'avait pas touché à son identité depuis 1998. Le logo, fonctionnel, ne projetait plus l'expertise R&D acquise sur deux décennies.",
    ],
    challenge: [
      'Rester crédible auprès des ingénieurs et des donneurs d\'ordre tout en parlant aux nouvelles générations de techniciens qu\'il faut recruter.',
    ],
    solution: [
      'Identité visuelle resserrée autour d\'un wordmark robuste et d\'un système éditorial typographié. Site B2B refait avec catalogue produits filtrable. Plaquette commerciale grand format.',
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
      'Spark OH! ouvre à Frameries comme nouvelle référence des centres de science en Wallonie. Notre mission : faire d\'un samedi famille au musée des sciences un événement aussi désirable qu\'un concert.',
    ],
    context: [
      'Les musées scientifiques cumulent les handicaps : image scolaire, parcours linéaire, communication institutionnelle. Spark OH! voulait casser ce cliché dès le lancement.',
    ],
    challenge: [
      'Donner envie à des familles, des couples, des étudiants, des seniors — bref, tout le monde sauf "les enfants en sortie scolaire" — de venir un dimanche.',
    ],
    solution: [
      'Identité visuelle volontairement pop, presque festivalière. Campagne d\'affichage régionale. Système de signalétique intérieur. Édition d\'un guide collector.',
      'Stratégie social : reels de coulisses des manips, focus sur les médiateurs, calendrier événementiel hebdo.',
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
      'Noon est une jeune marque de cuisine du midi à emporter, à Bruxelles. Notre rôle : poser une voix unique au milieu d\'une catégorie ultra-saturée.',
    ],
    context: [
      'Le segment "lunch sain à emporter" est devenu surpopulé. Salade-bowl-poke-buddha-flatbread. Toutes les marques disent la même chose : "fait maison, frais, local". Difficile de distinguer.',
    ],
    challenge: [
      'Faire de Noon une marque que les bureaux mentionnent par leur nom — pas "le truc à côté" ou "celui avec les bols".',
    ],
    solution: [
      'Plateforme de marque "La cuisine du midi, sérieusement" : on revendique le sérieux culinaire (pas le sérieux ennuyeux). Identité épurée, typographie éditoriale forte, packaging modulaire qui devient signature.',
      'Site click-and-collect avec menu hebdo, fidélité simple, paiement express.',
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
      "Pour la sortie d'une édition limitée Beefeater en Belgique, on a écrit une campagne qui rappelle que l'histoire d'un gin n'est pas un argument à recopier — c'est un point de départ.",
    ],
    context: [
      'Le marché du gin premium est devenu chaotique : micro-distilleries, éditions limitées, gimmicks. Les grandes marques historiques perdent du terrain face à des inconnus.',
    ],
    challenge: [
      "Faire valoir un siècle d'histoire sans tomber dans le piège du discours patrimonial poussiéreux.",
    ],
    solution: [
      "Direction artistique inspirée du Londres documentaire — pas la carte postale. Des images de bars de quartier, de barmen qui parlent vrai, de cocktails sans tablier blanc.",
      'Activation bar à Bruxelles + social organique. Pas un seul euro en média payant.',
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
      "Le jardin est un projet personnel du studio. On y teste des écritures, des photos, des hypothèses qui n'ont pas leur place chez un client. Trois saisons plus tard, on en récolte.",
    ],
    context: [
      "Beaucoup d'agences ont leur \"side project\" qu'on retrouve trois mois plus tard sur l'About page. Pour nous, ça devait être un vrai engagement éditorial.",
    ],
    challenge: [
      "Maintenir un rythme de publication régulier alors qu'aucun client ne nous attend. Tenir la qualité sans la pression d'un brief.",
    ],
    solution: [
      'Une publication trimestrielle imprimée + un journal hebdo en ligne. Chaque édition explore un thème — la lenteur, le geste, l\'attention.',
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
      'Machao est notre podcast d\'enquête. Six épisodes par saison sur les campagnes militantes qui ont marqué le siècle — réussites, ratés, machineries.',
    ],
    context: [
      "Le métier de la com militante est rarement raconté de l'intérieur. La parole, ce sont toujours les marques ou les médias.",
    ],
    challenge: [
      'Obtenir la parole de ceux qui ont conçu les campagnes — souvent liés à des clauses de confidentialité ou des positions politiques sensibles.',
    ],
    solution: [
      'Un format documentaire sonore d\'1h par épisode, monté serré. Interviews + archives audio. Disponible sur toutes les plateformes podcast + transcripts sur notre site.',
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
      "L'enfant sauvage est une exposition itinérante qu'on a portée avec l'UMons. Trois ans de recherche éditoriale autour d'une question : que devient le commun quand on grandit ?",
    ],
    context: [
      'À l\'origine, un essai de Michael paru dans Le jardin. Le sujet — l\'éducation, le sauvage qui survit en nous — a appelé un format plus grand.',
    ],
    challenge: [
      "Tenir un propos d'auteur dans un format institutionnel (musée, université) sans renoncer à l'écriture libre.",
    ],
    solution: [
      "Une scénographie en quatre actes, conçue avec le studio Pluit. Un catalogue d'exposition (192 pages, deux langues). Trois conférences publiques à Mons, Bruxelles, Liège.",
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
        sector: p.sector,
        services: p.services as never,
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

  payload.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  payload.logger.info(`  Done.`)
  payload.logger.info(`  Team   : ${teamCreated} created, ${teamSkipped} skipped`)
  payload.logger.info(`  Projects: ${projectsCreated} created, ${projectsSkipped} skipped`)
  payload.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

// Top-level await — required so `payload run` waits for the seeder to finish
// before tearing down the process (the bin script does `await import(scriptPath)`).
try {
  await seedBravo()
} catch (e) {
  console.error('Seed failed:', e)
  process.exit(1)
}
