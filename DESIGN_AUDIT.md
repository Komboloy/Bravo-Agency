# Design Audit — BRAVO! Agency

Inventaire complet de l'état actuel : pages, heroes, sections, classes CSS, conventions typographiques. À utiliser pour reprendre le contrôle de la cohérence après une phase d'accumulation. **Tu annotes directement dans ce fichier avec tes décisions** (✅ garder / 🔄 unifier / ❌ supprimer), je refactor ensuite.

Date de l'audit : 2026-05-28
État : `main` au commit `26154de` (avec /studio reverté localement à son hero centré 100vh atmosphere).

---

## 1) PAGES — état des heroes et sections

### Home (`/`)
- **Hero** : `<HeroCarousel>` — image carousel auto avec slides depuis les featured projects. Custom h1 "Les idées en actions" via richText du Home Global. ✅
- Sections : Hero → Marquee (BRAVO band) → Intro (paper) → Projects bands (ink) → Manifeste (BRAVO atmosphere) → Studio teaser (ink) → CTA (paper). ✅
- Typo : `prose-home-display` (em → font-light, strong → BRAVO accent). ✅

### Travaux (`/projets`)
- **Hero** : Split BRAVO + featured project image (h1 "Travaux — *index complet*."). ❌
- Sections : Hero → Counters strip (4 stats) → Filter bar (ProjectsExplorer client component) → Grid asymétrique 12-col.
- Typo : inline `font-display font-extrabold` + Fraunces italic pour le sous-titre.

### Case-study (`/projets/[slug]`) ✅
- **Hero** : Full-bleed image 100vh + meta-bar overlay en bas (date, client, sector, services, créa, partenaires).✅
- Sections : Hero → §01 Intro (`prose-bravo-intro`) → §02 Contexte (Block) → §03 Défi (ChallengeOverlay glass card) → §04 Solution (Block) → §05 Gallery → §06 Results → Testimonial → Related → Next. ✅
- Typo : **système surface/theme + CSS vars** (`--prose-fg`, `--prose-em-color`, `--prose-strong-color`...) avec `prose-bravo-intro/block/overlay`. ✅
- Convention typo case-study : em → **Fraunces italic** (var `--prose-em-color`), strong → **pastille BRAVO chip** (`--prose-strong-bg`).✅

### Posts index (`/posts`) 
- **Hero** : Split BRAVO + featured post image (h1 "Bonnes nouvelles."). ✅
- Sections : Hero → Grid des autres posts (PostCard) → Pagination placeholder.✅
- Typo : `prose-home-display` pour le h1.✅

### Article (`/posts/[slug]`)
- **Hero** : Split BRAVO + article hero image.
- Sections : Hero → Body (`surface-paper` + `prose-article`) → Related posts (ink) → Next.
- Typo article : **`prose-article`** — drop cap, h2 display avec barre BRAVO, em → Fraunces italic BRAVO, strong → highlight marker, blockquote → barre BRAVO + Fraunces.

### Studio (`/studio`)
- **Hero** : **Centré 100vh** atmosphere drift, h1 "Studio — *deux têtes*, **un écosystème**.". ❗ **Outlier — pas en split**.
- Sections : Hero → Manifesto (`surface-bravo bravo-atmosphere`) → Team grid (`surface-ink`) → Ecosystem CTA (`surface-paper`).
- Typo : `prose-home-display.wrap` pour les h1/h2.

### Contact (`/contact`)
- **Hero** : Split BRAVO + team member portrait.
- Sections : Hero → Process 3 steps (`surface-bravo`) → Contact methods (ink) → Form (paper) → CTA (ink).
- Typo : `prose-home-display` pour le h1.

---

## 2) PATTERNS DE HERO

| Pattern | Pages | Description |
|---|---|---|
| **A · HeroCarousel** | Home | Image carousel + h1 + meta + pagination. Cinematique. |
| **B · Split BRAVO + image** | Travaux, Posts, Article, Contact | 100vh split 45/55, BRAVO color block à gauche avec breadcrumb + h1 + lede, image à droite avec overlay meta. **4 pages** |
| **C · 100vh atmosphere centré** | Studio | Full-bleed atmosphere drift, contenu ancré en bas-centre avec grid title + lede. **Outlier** |
| **D · Full-bleed image + meta-bar** | Case-study `/projets/[slug]` | Image 100vh + glass meta-bar en bas (très spécifique au case-study) |

**🔴 Inconsistance #1** : Studio est seul dans le pattern C. Soit on aligne sur B (split), soit on remet d'autres pages en C. À trancher.

**🟢 Pattern D (case-study)** est OK isolé car les case-studies ont un usage différent (hero = image du projet, pas d'index).

---

## 3) CONVENTIONS TYPOGRAPHIQUES

Trois "prose" coexistent. Chacun gère em/strong différemment :

### `prose-bravo-intro / block / overlay` — case studies §01-§04
- `em` → **Fraunces italic** (font-editorial)
- `strong` → **pastille BRAVO chip** (background coloré sur fond paper, ou underline sur fond bravo)
- Paramétré par `--prose-*` CSS vars, change selon `surface-*` ou `theme-*` parent.
- Pensé pour du **texte éditorial long dans un case-study**.

### `prose-home-display` — heroes home/studio/posts/projets + sections home
- `em` → **font-light 300** (Big Shoulders, pas Fraunces)
- `strong` → **couleur d'accent** via `--display-accent`
- Pensé pour les **gros titres display** (h1, h2 oversize).
- Variantes : `.hero` (line-height tighter), `.wrap` (white-space normal).

### `prose-article` — body des articles `/posts/[slug]`
- `em` → **Fraunces italic BRAVO color**
- `strong` → **highlight marker** (background BRAVO transparent)
- Drop cap, h2 display avec barre BRAVO, blockquote BRAVO border.
- Pensé pour la **lecture d'un article éditorial sur fond paper**.

**🟡 Tension** : 3 conventions = 3 mental models pour qui édite. Mais chaque convention a un usage spécifique (gros titre vs paragraphe case-study vs article body). Question : on garde les 3 ou on fusionne ?

---

## 4) UTILITY CLASSES DANS `globals.css`

### Surface / Theme (couleur + variables prose)
- `.surface-ink` (sombre, défaut text paper)
- `.surface-paper` (crème, défaut text ink)
- `.surface-bravo` (violet, défaut text paper)
- `.surface-bravo-bright` (violet clair, défaut text paper)
- `.theme-ink/paper/bravo/bravo-bright` — mêmes CSS vars sans le `background` (pour cards translucides)

### Atmosphere (blobs animés)
- `.bravo-atmosphere` — blobs **statiques**, utilisé sur sections surface-bravo (home manifeste, contact process)
- `.atmosphere-bravo-drift` — blobs **animés** (7s+9s drift), utilisé sur heroes 100vh

### Glass cards
- `.liquid-glass` — BRAVO purple translucide (nav, overlays)
- `.dark-glass` — ink translucide (challenge overlay case-study)
- `.paper-glass` — paper translucide (variante section bg)
- `.bravo-glass` / `.bravo-bright-glass` — variantes BRAVO

### Section utilities
- `.section-rule-bravo` (border-bottom BRAVO)
- `.section-rule-bravo-top` (border-top BRAVO)

**🟡 79 sélecteurs CSS uniques dans globals.css.** Pas catastrophique mais beaucoup de variantes. Question : tout est-il utilisé ?

---

## 5) DÉCISIONS À PRENDRE (annoter ici)

### A. Pattern de hero unifié
- [ ] Aligner Studio sur **Split BRAVO** (cohérent avec les 4 autres)
- [ ] Revert les 4 autres pages vers **Centré atmosphere** comme Studio
- [ ] Autre proposition : ___

### B. Le hero de Home (`/`)
- [ ] Garder le **HeroCarousel** actuel (pattern A unique)
- [ ] Migrer aussi vers Split BRAVO + featured project
- [ ] Autre : ___

### C. Conventions typographiques
- [ ] Garder les **3 systèmes** (case-study / home-display / article) — chacun a un usage clair
- [ ] **Fusionner** home-display et case-study (em = Fraunces partout ? ou em = light partout ?)
- [ ] Autre : ___

### D. Couleurs des taglines / accents
- Sur le hero split BRAVO, le titre est en `prose-home-display` mais c'est mixé avec inline Fraunces italic pour le sous-titre (cf. /contact, /projets, /posts). Convention pas claire.
- [ ] Tout en `prose-home-display` (em = light, strong = paper)
- [ ] Mixage typo-display + Fraunces italic accepté (status actuel)
- [ ] Autre : ___

### E. Sections après le hero
Chaque page enchaîne sur des sections avec des couleurs alternées (ink/paper/bravo). Pas de règle unifiée — chaque page a son rythme propre.
- [ ] Définir une **convention de rythme par type de page** (listing, article, page éditoriale)
- [ ] Laisser libre par page comme actuellement
- [ ] Autre : ___

### F. Atmosphere drift
- [ ] Garder sur les 4 pages où elle est (Studio, /projets gauche-block, /posts gauche-block, /posts/[slug] gauche-block, /contact gauche-block)
- [ ] Limiter à 1-2 pages "phares"
- [ ] Autre : ___

---

## 6) PROCHAINES ÉTAPES (après tes annotations)

Une fois ces décisions prises, je refactor en **3 lots** :
1. **Hero coherence** — appliquer la convention choisie partout
2. **Typo cleanup** — supprimer les conventions non retenues, simplifier globals.css
3. **Sections rythme** — appliquer la convention de rythme par type de page

Estimation : 2-3h de refactor, 1 commit propre par lot, on retombe sur ses pattes.
