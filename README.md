# BRAVO! Agency — Site web

Refonte du site de l'agence BRAVO! (bravo-agency.be).

**Stack :** Next.js 16 · Payload CMS 3 · PostgreSQL (Neon) · Tailwind CSS 4 · Motion (Framer) · Lenis

---

## Démarrage rapide

### 1. Prérequis

- **Node.js** ≥ 20 (testé sur 25)
- **PostgreSQL** accessible — recommandé : [Neon](https://neon.tech) (free tier, région Frankfurt)

### 2. Configuration

```bash
cp .env.example .env
```

Remplir `.env` :
- `DATABASE_URL` → connection string Neon (`postgresql://...`)
- `PAYLOAD_SECRET` → secret aléatoire (`openssl rand -base64 32`)
- `NEXT_PUBLIC_SERVER_URL` → `http://localhost:3000` en local

### 3. Lancer

```bash
npm install
npm run dev
```

- Front : http://localhost:3000
- Admin Payload : http://localhost:3000/admin

Au premier lancement, créer un compte admin.

### 4. Générer les types TypeScript après modif du schéma

```bash
npm run generate:types
```

---

## Structure

```
src/
├── app/
│   ├── (frontend)/    # Pages publiques Next.js
│   └── (payload)/     # Admin Payload (auto-géré)
├── collections/       # Schémas de contenu (Pages, Posts, Media, Users, Categories)
├── blocks/            # Composants de page réutilisables (Hero, Content, Media, CTA, Form, etc.)
├── heros/             # 3 variantes de Hero (HighImpact, MediumImpact, LowImpact)
├── Header/, Footer/   # Globaux Payload
├── plugins/           # Configuration plugins Payload (SEO, Search, Form Builder, Redirects)
├── payload.config.ts  # Config principale Payload (i18n FR/NL/EN, DB, etc.)
└── payload-types.ts   # Types TS auto-générés
```

---

## Identité visuelle

- **Couleur principale :** `#4923F4` (variable Tailwind `bg-bravo`, `text-bravo`)
- **Typo body :** Raleway (auto-hébergée via `next/font`)
- **Typo titres / éditorial :** Source Serif 4

---

## Multilingue

Locales configurées dans `src/payload.config.ts` :
- `fr` (défaut)
- `nl`
- `en`

Marquer un champ comme localisé : `localized: true` dans le schéma de la collection. Le fallback est activé : si une traduction manque, la version par défaut s'affiche.

---

## Live Preview

Le Live Preview est configuré dans l'admin Payload (`src/payload.config.ts`) avec 3 breakpoints (mobile/tablet/desktop). Disponible sur les Pages et Posts.

---

## Commandes utiles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre le dev server |
| `npm run build` | Build de production |
| `npm start` | Lance le build de prod |
| `npm run generate:types` | Régénère les types TS depuis le schéma Payload |
| `npm run generate:importmap` | Régénère l'import map (admin custom components) |
| `npm run lint` | Lint ESLint |
| `npm test` | Tests unitaires (Vitest) + E2E (Playwright) |

---

## Déploiement

Compatible avec tout hébergeur Node.js :
- **Vercel** (recommandé pour preview/prod, free tier généreux)
- **Infomaniak Cloud Server / Jelastic / Node.js Hosting**
- Railway, Render, fly.io
- VPS classique avec PM2

La DB Postgres (Neon) est cloud-agnostic et accessible depuis n'importe où.
