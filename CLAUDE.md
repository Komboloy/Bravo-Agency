# BRAVO! Agency — notes de projet

Site refonte de **bravo-agency.be**. Agence de pub bruxelloise, 2 co-fondateurs. Objectifs : démontrer le savoir-faire créatif, générer des leads, améliorer le SEO.

## Stack

- **Next.js 16** App Router, TypeScript, Turbopack
- **Payload CMS 3** intégré dans le projet Next.js (même repo, même deploy)
- **SQLite via `@payloadcms/db-sqlite`** — fichier `payload.db` à la racine, gitignored. Adapter officiel Payload, pas besoin de DB externe.
- **Tailwind CSS 4** (config via `@theme` dans `globals.css`)
- **Node 22 LTS** pinné via `.nvmrc` (Node 25+ casse `@edge-runtime/primitives`)
- **i18n FR/NL/EN** déclaré dans `payload.config.ts`, à activer field-par-field via `localized: true`

## Cible déploiement

**Infomaniak Web Hosting Node.js** (plan existant du client, ~5,75 €/mo, payé jusqu'à 2027-02). Node.js 24 disponible. Filesystem persistant donc SQLite OK. Pas besoin de service managé externe — l'idée est de tenir l'infra dans le plan existant sans tripler la facture.

## Conventions design

### Typographie
- **Display** : `Big Shoulders` (next/font/google) — heavy 800 par défaut, light 300 pour `*em*`, BRAVO color pour `**strong**`
- **Sans** : `Raleway` (body + wordmark BRAVO! en 900)
- **Editorial** : `Fraunces` italic — accents éditoriaux dans les case studies
- **Mono** : `JetBrains Mono` — labels, numéros, technical metadata

### Couleurs (CSS vars dans `globals.css`)
- `--color-bravo` : `#4923F4` (signature deep purple)
- `--color-bravo-bright` : `#6843ff` (accent plus clair)
- `--color-bravo-soft` : `#c0b6ff` (accents typo)
- `--color-paper` : `#f4ede1` (cream)
- `--color-ink` : `#050507` / `--color-ink-2` : `#0f1014` (dark surfaces)

### Classes utilitaires importantes
- **`.surface-{ink,paper,bravo,bravo-bright}`** — bg opaque + couleur texte + `--prose-*` vars (sections pleine largeur)
- **`.theme-{ink,paper,bravo,bravo-bright}`** — uniquement les `--prose-*` vars (pour cards translucides genre glass)
- **`.prose-bravo-{intro,block,overlay}`** — typo des case studies (cf. `bravo_typography_pattern.md` en mémoire)
- **`.prose-home-display`** — typo display home/studio/posts (cf. mémoire)
- **`.atmosphere-bravo-drift`** — blobs violets animés pour fond ink "vide" (Studio hero, Travaux hero)
- **`.bravo-atmosphere`** — variante statique pour sections surface-bravo (manifeste home)

### Pattern hero 100vh (Studio + Travaux)
```jsx
<section className="relative min-h-screen flex items-end atmosphere-bravo-drift px-6 sm:px-10 pt-32 sm:pt-44 pb-[15vh] sm:pb-[18vh] section-rule-bravo">
  <div className="relative z-10 mx-auto w-full ...">...</div>
</section>
```

## Architecture Payload

### Collections
- **`projects`** (case studies) — heroImage, tagline, sector (relation → sectors), services (relation → services hasMany), intro/context/challenge/solution (richText), gallery (array)
- **`sectors`** — taxonomie éditable, sidebar admin → "Secteurs"
- **`services`** — taxonomie éditable, sidebar admin → "Services"
- **`team`** — membres équipe (name, role, photo, bio)
- **`posts`** — "Bonnes nouvelles"
- **`pages`** — pages dynamiques via Payload layout builder
- **`media`** — uploads, **hook `afterRead` rewrite `url` vers `/media/<file>`** (Next static serve)
- **`categories`** — taxonomie posts

### Globals
- **`home`** — tous les textes éditoriaux de la home (hero, marquee, intro, projects section, manifeste, studio teaser, CTA). Rich text avec fallbacks hardcodés
- **`header`** — navItems, language switcher
- **`footer`** — colonnes, copyright

### Conventions code
- **Toujours fetch avec `depth: 1`** pour que les relationships (sectors, services, media) soient populées en objets
- **Helper standard** :
  ```ts
  function relTitle(r: number | { title?: string|null } | null | undefined): string {
    return typeof r === 'object' && r !== null ? r.title || '' : ''
  }
  ```
- **`bravoSlug({ position: undefined })`** au lieu du `slugField` stock de Payload (bug autosave qui locke le slug à la première lettre)
- **Schéma push automatique en dev** — quand on change le schéma, kill dev server + restart. Si gros changement (type → relationship), `rm payload.db*` + relancer + `npm run seed:bravo`
- **Toujours `npm run generate:types`** après changement de collection

## Commandes utiles
```bash
nvm use            # active Node 22 (cf. .nvmrc)
npm run dev        # Next + Payload (turbopack)
npm run seed:bravo # seed idempotent : sectors, services, team, projects, home global
npm run generate:types
npx tsc --noEmit   # type check sans build
```

## Repo + hosting

- **GitHub** : https://github.com/Komboloy/Bravo-Agency (privé), branche `main`
- **Mockups statiques** : `public/design/` (v1..v9 + index.html, design system + previews). Toujours utile pour partage rapide avec Stephan ou comme référence visuelle V7/V8/V9.

## Pour le futur Claude qui reprend ce projet

- Lire d'abord la mémoire dans `~/.claude/projects/-Users-...-BravoAgency/memory/` (notamment `bravo_typography_pattern.md`, `bravo_taxonomies.md`, `feedback_infra_budget.md`, `feedback_keep_memory_current.md`)
- Le client (Michael) est designer/UX, communique en français, déteste les sites "stock photo agency". Préfère l'éditorial brutalist avec typo display heavy + Fraunces italic accents
- **Toujours préférer les fixes peu invasifs** — pas de rebuild d'archi sans validation explicite
- **Toujours questionner le coût avant d'ajouter du managed** — le client veut tenir dans son plan Infomaniak existant
- Quand on change un truc fondamental, **update la mémoire ET ce CLAUDE.md** dans la foulée (règle posée par le client)
