# DIAO SHOP — PHASE 3 : DESIGN SYSTEM ET DIRECTION ARTISTIQUE

**Projet :** Diao Shop — Boutique e-commerce premium de maillots de football
**Phase :** 3 / 10 — Design system et direction artistique
**Date :** 15 septembre 2026
**Nature :** Spécification de design + aperçu statique de validation — aucun développement applicatif
**Statut :** Livré — en attente de validation client

---

## 0. Décisions complémentaires enregistrées (15/09/2026)

| # | Décision | Valeur |
|---|---|---|
| 1 | Favoris | **Persistance locale (localStorage)** en V1 |
| 2 | Messages de contact | **Table admin + envoi email/WhatsApp configurable** (→ 9ᵉ table `contact_messages`) |
| 3 | Prix de démonstration | Valeurs FCFA placeholder marquées DÉMO |
| 4 | Aperçu statique | `docs/apercu-design-system.html` fourni pour validation visuelle (polices système, le site réel utilisera Outfit auto-hébergée) |

---

## 1. Principes du design system

1. **Tout est thématique ou structurel** — deux niveaux de tokens :
   - **Tokens structurels** (invariants) : espacements, rayons, durées, neutres d'utilité (succès, erreur, info), polices ;
   - **Tokens de thème** (variables par produit) : les 12 variables `--ds-*` alimentées depuis `product_themes` ;
2. **Aucune couleur codée en dur** dans un composant : chaque couleur utilisée provient d'un token ;
3. **Le texte reste roi** : chaque thème garantit le contraste avant tout effet décoratif ;
4. **Motion sobre** : les couleurs transitent en CSS, le mouvement en Framer Motion, tout s'éteint sous `prefers-reduced-motion`.

---

## 2. Couleurs structurelles (invariables)

| Token | Valeur | Usage |
|---|---|---|
| `--ds-brand-gold` | `#F0A62B` | Or « Diao » de référence (thème de secours, favicon) |
| `--ds-success` | `#3DD68C` | Toasts de succès, confirmations |
| `--ds-danger` | `#FF5C5C` | Erreurs, suppressions, rupture de stock |
| `--ds-info` | `#5CA8FF` | Informations, aides |
| `--ds-skeleton` | `rgba(255,255,255,.08)` (+shimmer `.16`) | Squelettes de chargement (mode clair : `rgba(11,27,51,.08)`) |

**Thème de secours** (produit sans thème enregistré) — neutre premium :

```
background #101319 · surface #171A22→#101319 · primary #F0A62B · secondary #232733
accent #F0A62B · text #FFFFFF · muted #B8BDC9 · button #F0A62B (texte #14161D calculé)
glow #F0A62B · intensité 0.4 · border rgba(240,166,43,.25) · mode dark
```

---

## 3. Les 6 thèmes de démonstration (données `product_themes`)

> Valeurs extraites des affiches, affinées pour le contraste. **Modifiables intégralement depuis le back-office** — ce sont des données de démonstration, pas des couleurs figées.

### T1 — Maillot RDC · Édition Lion 2026 *(mis en avant)* — orange/or, mode sombre

| Variable | Valeur |
|---|---|
| `background_color` | `#F59200` |
| `gradient` (surface) | `linear-gradient(135deg, #3D1F05 0%, #1C0E02 55%, #4A2708 100%)` |
| `primary_color` | `#EFA32B` |
| `secondary_color` | `#8A4A0D` |
| `accent_color` | `#F5B62E` |
| `text_color` | `#FFFFFF` |
| `muted_text_color` | `#F2D9B3` |
| `button_color` | `#F0A62B` → texte calculé `#1C0E02` |
| `glow_color` / `intensité` | `#FFA424` / `0.6` |
| `border_color` | `rgba(255,164,36,.40)` |
| `appearance_mode` | `dark` |

### T2 — Maillot FC Barcelona · Édition 2025 — clair irisé, **mode clair**

`background #DFE6EF` · surface `linear-gradient(135deg, #FFFFFF, #E9EDF4)` · primary `#0B1B33` · secondary `#5C6B84` · accent `#3FB0D8` · text `#0B1B33` · muted `#5C6B84` · button `#FFFFFF` (bordure accent, texte `#0B1B33` calculé) · glow `#C9D8F0` + halo secondaire rose `#F3CBE4` / `0.45` · border `rgba(11,27,51,.10)` · **mode `light`**

### T3 — Maillot Arsenal · Édition 2025 — violet/magenta, sombre

`background #150820` · surface `linear-gradient(135deg, #230B34, #140719 60%, #3A1150)` · primary `#8B36D9` · secondary `#2A0E3E` · accent `#E85BD0` · text `#FFFFFF` · muted `#D9BFE8` · button `#D944C8` (texte blanc calculé) · glow `#D63BC8` / `0.65` · border `rgba(232,91,208,.30)` · mode `dark`

### T4 — Maillot Manchester City · Édition 2025 — bleu ciel, sombre

`background #06122E` · surface `linear-gradient(135deg, #0E2B6B, #0A1C44 55%, #154CB0)` · primary `#6CABDD` · secondary `#0A1C44` · accent `#7EC8F0` · text `#FFFFFF` · muted `#C3D9F2` · button `#6CABDD` (texte `#06122E` calculé) · glow `#4FA3E8` / `0.55` · border `rgba(126,200,240,.30)` · mode `dark`

### T5 — Maillot Stade de Reims — noir/rouge, sombre

`background #1A0505` · surface `linear-gradient(135deg, #2B0A0A, #120303 60%, #3A0D0D)` · primary `#E5322B` · secondary `#3A0D0D` · accent `#FF4B42` · text `#FFFFFF` · muted `#F0C9C7` · button `#E5322B` (texte blanc) · glow `#E5322B` / `0.7` · border `rgba(229,50,43,.35)` · mode `dark`

### T6 — Maillot Stade Rennais · Édition 2025 — noir/rouge profond, sombre

`background #200606` · surface `linear-gradient(135deg, #260808, #0E0303 60%, #38100E)` · primary `#E23A2E` · secondary `#38100E` · accent `#FF6A5E` · text `#FFFFFF` · muted `#F2CFC9` · button `#E23A2E` (texte blanc) · glow `#FF3B30` / `0.65` · border `rgba(255,106,94,.30)` · mode `dark`

**Convention d'arrière-plan extérieur :** `background_color` + traitement « rayons/halo » généré en CSS (dégradés radiaux dérivés automatiquement de la même couleur — aucun champ supplémentaire à administrer). `gradient` = dégradé de la carte (surface).

---

## 4. Typographie

- **Famille unique : Outfit** (géométrique moderne, très proche des affiches) — **auto-hébergée** `next/font/local`, graisses 400/500/700/800, fallback `system-ui` ;
- Prix en `font-variant-numeric: tabular-nums` (alignement parfait) ;
- Format des prix : français, devise administrable — « 25 000 FCFA », « 49,99 € ».

| Token | Desktop / Mobile | Graisse | Interligne | Usage |
|---|---|---|---|---|
| `ds-display` | 56 / 34 px | 800 | 1.05 | Titre produit héro (ligne 1 `--ds-text`, ligne 2 `--ds-accent`) |
| `ds-h1` | 44 / 30 | 800 | 1.1 | Titres de pages |
| `ds-h2` | 32 / 24 | 700 | 1.15 | Sections |
| `ds-h3` | 24 / 19 | 700 | 1.25 | Sous-sections, titres de cartes |
| `ds-price` | 48 / 34 | 800 | 1 | Prix courant |
| `ds-price-old` | 22 / 18 | 500 | 1 | Ancien prix, barré `--ds-muted` |
| `ds-body-lg` | 18 / 16 | 400 | 1.6 | Descriptions |
| `ds-body` | 16 / 15 | 400 | 1.6 | Texte courant |
| `ds-sm` | 14 / 13 | 500 | 1.45 | Labels, aides |
| `ds-xs` | 12 / 11 | 500 | 1.3 | Badges, légendes |
| `ds-label` | 14 | 600 | 1.3 | Label catégorie (pastille `--ds-accent` 8 px + texte `--ds-text`) |

Titres : `letter-spacing -0.02em` ; labels : `+0.01em`.

---

## 5. Espacements (base 4)

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 64 · 80 · 96` (tokens `ds-1` → `ds-24`)

Règles clés : carte héro `padding 48px` desktop / `24px` mobile ; gouttières page `24px` / `16px` ; grille héro desktop : `300px | 1fr | 300px`, `gap 48px`.

---

## 6. Rayons

| Token | Valeur | Usage |
|---|---|---|
| `ds-r-card` | 48 px / 28 px (mobile) | Carte principale héro |
| `ds-r-panel` | 24 px | Cartes produit, panneaux admin |
| `ds-r-mini` | 20 px | Mini-carte « produit suivant » |
| `ds-r-thumb` | 18 px | Miniatures |
| `ds-r-input` | 14 px | Champs, sélecteurs |
| `ds-r-pill` | 999 px | Navigation, CTA, tailles, badges |

---

## 7. Ombres et effets lumineux

| Token | Valeur |
|---|---|
| `ds-shadow-card` | `0 40px 90px -30px rgb(0 0 0 / .55), 0 18px 40px -20px rgb(0 0 0 / .40)` |
| `ds-shadow-product` | Ellipse floue sous le maillot (div 70 % de largeur, `blur 24px`, opacité liée au mode) |
| `ds-shadow-cta` | `0 10px 28px -8px color-mix(in srgb, var(--ds-button) 55%, transparent)` |
| `ds-glow` | Halo radial derrière le produit : `color-mix(in srgb, var(--ds-glow) calc(var(--ds-glow-intensity) * 55%), transparent)` |
| `ds-border-lumière` | `1px solid var(--ds-border)` + reflet interne `inset 0 1px 0 rgb(255 255 255 / .06)` (mode sombre) |

---

## 8. Boutons

### 8.1 CTA principal « Ajouter au panier »
Pilule · hauteur **56 px** desktop / 52 mobile · padding-inline 28 · gap 12 · contenu : icône panier (20 px) + libellé + flèche → · fond `var(--ds-button)` · **texte à contraste calculé** (luminance WCAG, bascule noir/blanc automatique — aucun champ admin supplémentaire).

États : `hover` luminosité +6 % + élévation -1 px + `ds-shadow-cta` · `active` scale .985 · `focus-visible` anneau 2 px `--ds-accent` décalé 3 px · `disabled` opacité .45 · `loading` icône → spinner, libellé conservé, anti double-clic.

### 8.2 Boutons icônes (en-tête)
44×44 · pilule/cercle · fond translucide `color-mix(surface 55 %, transparent)` + `backdrop-blur 8px` · bordure `--ds-border` · badge compteur : 18 px, fond `--ds-accent`, texte contrasté, coin supérieur droit. Cibles tactiles ≥ 44 px **toujours**.

### 8.3 Flèches carrousel ‹ ›
44×44, même style que les icônes ; désactivées en bout de liste (opacité .4).

### 8.4 Secondaire / outline (favoris sur fiche produit)
Bordure 1.5 px `--ds-border` · fond transparent · icône cœur (plein `--ds-accent` si actif) · hover : fond 8 %.

---

## 9. Cartes

### 9.1 Carte héro (page d'accueil)
Largeur `min(1240px, 92vw)` centrée · `min-height 660px` desktop · radius `ds-r-card` · surface = `var(--ds-gradient)` · bordure lumière · `ds-shadow-card` · grille interne : en-tête / zone principale 3 colonnes / pied (social · slogan · miniatures).

### 9.2 Carte produit (catalogue)
Radius `ds-r-panel` · fond `color-mix(surface 70 %, transparent)` · padding 16 · image ratio 1:1 `object-contain` (jamais déformée) · nom (1 ligne, ellipsis) · équipe en `ds-xs` `--ds-muted` · prix en gras `--ds-accent` · `hover` : translateY(-4px) + ombre · rupture : image `grayscale(.7)` + badge « Épuisé » `--ds-danger`.

### 9.3 Miniatures (héro)
72×84 desktop / 56×66 mobile · radius `ds-r-thumb` · bordure 2 px transparente · **active** : bordure `--ds-accent` + indicateur 26×3 sous la miniature · hover : scale 1.05 · navigation au clavier (flèches).

### 9.4 Mini-carte « produit suivant »
200×72 · radius `ds-r-mini` · miniature 48 px + chevrons ‹ › · clique = produit suivant.

---

## 10. États UI obligatoires

| État | Spécification |
|---|---|
| Loading | Squelettes animés (shimmer 1.4 s, désactivé en reduced-motion → opacité pulsée lente) |
| Empty | Icône 48 px `--ds-muted` + titre `ds-h3` + texte `ds-body` + CTA de sortie (ex. « Voir la boutique ») |
| Error | Message français générique + code court + bouton « Réessayer » ; détails techniques en logs serveur uniquement |
| Success | Toast 4 s auto-dismiss, `aria-live="polite"`, bordure `--ds-success` |
| Disabled | Opacité .45 + curseur `not-allowed` + aucune animation |
| Focus | `:focus-visible` global anneau 2 px `--ds-accent`, jamais supprimé |
| Indisponible | Badge « Épuisé » + tailles injoignables (barrées, non cliquables) |

---

## 11. Moteur de thèmes dynamiques (spécification finale)

1. Chaque composant consomme **uniquement** les variables : `--ds-bg · --ds-gradient · --ds-primary · --ds-secondary · --ds-accent · --ds-text · --ds-muted · --ds-button · --ds-glow · --ds-glow-intensity · --ds-border` + attribut `data-mode="light|dark"` sur le conteneur ;
2. Changement de produit : mise à jour des variables sur le conteneur racine → **transitions CSS** `400 ms cubic-bezier(.4,0,.2,1)` sur `background-color · color · border-color · box-shadow · background-image` (fondu sans flash blanc) ;
3. Image produit : crossfade 300 ms + translateY 8 px (Framer Motion, `AnimatePresence`) ; textes : fondu 200 ms ; **layout : jamais animé** ;
4. Thème initial rendu **en SSR** avec le produit mis en avant → aucun flash au premier chargement ;
5. Thème de secours automatique si `product_themes` absent (§2) ;
6. **Contrôle de contraste dans l'éditeur admin** : calcul WCAG des ratios (texte/fond ≥ 4.5:1, grands titres ≥ 3:1, bouton/texte-bouton ≥ 4.5:1) avec avertissement visuel avant enregistrement ;
7. `prefers-reduced-motion: reduce` → durées à 0 ms, apparitions remplacées par affichage direct, aucune parallaxe.

---

## 12. Structure responsive

| Palier | Largeur | Composition héro |
|---|---|---|
| `lg` | ≥ 1024 px | Composition affiche complète : 3 colonnes (infos 300 px · scène · achat 300 px) + pied 3 zones |
| `md` | 768–1023 px | 2 colonnes (infos · scène) ; panneau d'achat en flux sous la scène (prix + tailles + CTA alignés) ; miniatures en scroll horizontal |
| `sm` | < 768 px | Colonne unique : en-tête compact (logo + icônes panier/favoris + menu), label + titre, scène (flèches superposées), prix + tailles + CTA pleine largeur (52 px), réassurance compacte, miniatures scrollables, slogan + réseaux en pied de carte |

**Anti-débordement (obligatoire)** : `overflow-x: clip` sur la page et la scène ; `min-width: 0` sur tous les enfants de grilles ; images `max-width: 100%` ; titres avec `line-clamp` contrôlé ; **aucun scroll horizontal à 320 px**.

**Points de test** : 320 · 360 · 390 · 414 · 768 · 1024 · 1280 · 1440 · 1920 px + mobile paysage (hauteur réduite → la carte défile verticalement, la scène ne déborde jamais).

> Observation Phase 1 tranchée : la barre de miniatures reste **horizontale en bas** à tous les paliers (cohérence avec la référence canonique) ; la variante verticale des maquettes réduites n'est pas retenue.

---

## 13. Accessibilité

Contrastes AA garantis (et contrôlables dans l'éditeur) · H1 unique par page · `alt` obligatoires (champ admin) · labels sur tous les champs · navigation clavier complète (miniatures = tablist/flèches) · `aria-label` sur boutons icône · `aria-live` pour panier et toasts · cibles ≥ 44 px · focus toujours visible.

---

## 14. Livrable visuel de validation

**`docs/apercu-design-system.html`** — aperçu statique autonome (aucune ressource externe) montrant : tokens structurels, typographie, espacements, rayons, boutons et états, champs, états UI, cartes, puis **les 7 spécimens de thème** (6 produits + secours) appliqués à un échantillon de composition (label, titre bicolore, description, CTA, prix, tailles, miniatures, glow). Il s'agit d'un **spécimen de tokens** — la composition réelle de la page d'accueil est le livrable de la Phase 4. Les polices définitives (Outfit) se chargeront sur le site réel ; l'aperçu utilise la pile système.
