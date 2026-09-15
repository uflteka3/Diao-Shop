# DIAO SHOP — PHASE 9 : ANIMATIONS, PERFORMANCES, SEO (RAPPORT)

**Phase :** 9 / 10 — Animations, performances, SEO, accessibilité
**Date :** 15 septembre 2026
**Statut :** Livrée et testée — en attente de validation client

---

## 1. Travail réalisé

### SEO technique
- **`sitemap.xml` dynamique** : 5 pages + 8 fiches produits, `lastModified` réels, priorités
  (accueil 1, boutique 0,9, produits 0,8…) — toujours à jour car piloté par le back-office
  (`force-dynamic`) ;
- **`robots.txt`** : exploration autorisée sauf `/admin`, `/api`, `/commande`, `/panier` ;
  référence le sitemap ;
- **Données structurées JSON-LD** :
  - accueil → `Organization` (nom, logo) + `WebSite` (fr) ;
  - fiche produit → `Product` complet : nom, description, image absolue, SKU, marque,
    `Offer` en **XOF** (devise du cahier des charges), `InStock/OutOfStock` calculé depuis
    les **stocks réels**, état « neuf » ;
- **Open Graph & Twitter** : image de marque par défaut **1200×630 générée dans le style de
  l'affiche** (couronne + « Diao shop » + maillot RDC, aucun texte commercial inventé —
  102 Ko), `og:image` spécifique à chaque produit, cartes `summary_large_image`,
  `robots: index,follow` ;
- **URLs canoniques** sur les fiches produits (déduplication SEO) ;
- Titres/descriptions uniques par page (structure existante conservée, `metadataBase` OK).

### Accessibilité (WCAG)
- **Lien d'évitement « Aller au contenu »** dans l'en-tête (invisible au repos, premier Tab,
  ciblé sur `#contenu`) — présent sur les 9 conteneurs de pages publiques ;
- Cibles tactiles ≥ 44 px et focus visibles conservés (phases précédentes) ;
- `prefers-reduced-motion` respecté partout (voir animations) ;
- Vérifié au clavier : le premier Tab focus bien le lien d'évitement.

### Animations (fidélité affiches, sans excès)
- **Entrée en cascade des cartes produit** (boutique, grille d'accueil) : fondu + montée
  douce à l'apparition (`whileInView`, déclenchement unique, décalage 50 ms par carte,
  plafonné à 300 ms) via Framer Motion ;
- **`prefers-reduced-motion: reduce` → aucune animation** (cartes visibles immédiatement —
  testé dans un contexte navigateur dédié) ;
- Transitions de thème sans flash et carrousel conservés (Phases 4-6).

### Performances
- **Optimisation des 8 images produit** : quantification 256 couleurs + tramage —
  **3 655 Ko → 720 Ko (−80 %)**, transparence et détails préservés (contrôle visuel
  Real Madrid : broderies et dégradés intacts) ; mêmes chemins de fichiers → aucune
  migration de données ;
- **Poids accueil mobile : 2 962 Ko → 576 Ko (−81 %)** ;
- Temps de chargement mesurés (headless local) : **accueil 390 px = 242 ms** (évènement
  load), boutique desktop = 256 ms, HTML accueil = 40 Ko ;
- **Lazy-loading** : 8/8 images de la grille boutique ; héros en `fetchpriority=high`
  (préchargé) ; police Outfit **auto-hébergée et préchargée** (32 Ko, cache immuable 1 an) ;
- Remarque de méthode : Lighthouse CLI est incompatible avec le navigateur headless du
  bac à sable — les métriques ci-dessus sont mesurées directement (Performance API +
  volumes réseau), équivalentes Core Web Vitals.

### Régression maîtrisée
- Zéro débordement horizontal re-vérifié à 320 px sur 7 pages publiques (accueil, boutique,
  fiche, panier, favoris, contact, à propos) ;
- Parcours complets re-testés après optimisations : boutique → fiche → admin (connexion
  Supabase Auth OK) ;
- Persistance Supabase inchangée (« données existantes chargées » au démarrage).

## 2. Fichiers créés

- `src/app/sitemap.ts` — plan du site dynamique (pages + produits publiés) ;
- `src/app/robots.txt` via `src/app/robots.ts` — règles d'exploration + sitemap ;
- `public/images/brand/og.jpg` — image Open Graph de marque 1200×630 (style affiche).

## 3. Fichiers modifiés

- `src/app/layout.tsx` — Open Graph image par défaut, Twitter cards, robots meta ;
- `src/app/page.tsx` — JSON-LD Organization + WebSite ;
- `src/app/produit/[slug]/page.tsx` — JSON-LD Product (XOF, stock réel), canonical,
  og:image produit, ancre `#contenu` ;
- `src/components/layout/SiteHeader.tsx` — lien d'évitement « Aller au contenu » ;
- Conteneurs `id="contenu"` : boutique, favoris, panier, commande, confirmation, contact,
  à propos, accueil, fiche produit ;
- `src/components/catalogue/ProductCard.tsx` — `motion.div` (entrée en cascade, respect
  `prefers-reduced-motion`, prop `index`) ;
- `src/components/catalogue/CatalogueClient.tsx` — index de cascade passé aux cartes ;
- `public/images/demo/*.png` — optimisation −80 % (mêmes noms de fichiers).

## 4. Tests effectués

- **robots.txt** : User-Agent *, Allow /, Disallow admin/api/commande/panier, Sitemap ✓ ;
- **sitemap.xml** : 13 URLs (5 pages + 8 produits), lastmod/priorités correctes ✓ ;
- **JSON-LD** : accueil `['Organization','WebSite']` ; produit `Product | XOF 25000 |
  InStock` ✓ ;
- **OG/Twitter** : `og:image` → `/images/brand/og.jpg` (1200×630), `twitter:card`
  `summary_large_image`, canonical produit ✓ ;
- **Skip link** : premier Tab → « Aller au contenu » focusé ✓ ;
- **Animations** : opacité finale des cartes = 1 (cascade jouée) ; contexte
  `reduced_motion=reduce` → cartes visibles immédiatement ✓ ;
- **Lazy/priority** : grille 8/8 lazy ; héros `fetchpriority=high` ; police `.s.p.woff2`
  préchargée, 32 Ko, cache immuable ✓ ;
- **Poids** : accueil mobile 576 Ko (−81 %) ; images produit −80 % avec contrôle visuel ✓ ;
- **Responsive** : 0 px de débordement à 320 px sur 7 pages ✓ ;
- **Régression** : fiche RDC rendue, boutique 8 cartes, connexion admin Supabase OK,
  persistance rechargée ✓ ;
- **Qualité** : TypeScript sans erreur, `next build` ✓ (32 pages), production relancée.

## 5. Problèmes rencontrés (et résolus)

1. **Lighthouse CLI incompatible** avec le headless-shell du bac à sable (crash au
   lancement) → métriques mesurées directement via Performance API et volumes réseau
   (mêmes indicateurs : load, LCP approximé par le héros, CLS nul constaté, poids) ;
2. **Observateurs CDP bloquants** dans le shell headless (promesse jamais résolue sur le
   1er essai de mesure) → mesures replacées par des évaluations synchrones simples ;
3. **2,9 Mo d'images sur l'accueil** (PNG détourés 32 bits lourds) → quantification
   256 couleurs + tramage : −80 %, qualité validée à l'œil sur le maillot le plus détaillé ;
4. Génération de l'OG image : premier essai avec un chemin de référence erroné — relancée
   avec les bonnes sources (affiche + maillot RDC), puis normalisée en 1200×630.

## 6. Informations nécessaires

*(inchangé — rien de bloquant)*
- Lors de la mise en ligne : renseigner `NEXT_PUBLIC_SITE_URL` avec le domaine réel
  (canonical, OG, sitemap et robots s'adaptent automatiquement) ;
- Coordonnées réelles, textes « À propos »/« Contact », frais de livraison : à saisir dans
  le back-office (persistés dans Supabase) ;
- Recommandé après tests : rotation de la clé `service_role` (elle est passée dans le chat).

## 7. Prochaine phase

**Phase 10 — Tests de bout en bout + guides** : recette complète automatisée (public +
back-office + persistance), rapport de recette final, guide d'utilisation du back-office
(au client), guide de déploiement et de maintenance (variables d'environnement, rotation
des clés, sauvegardes Supabase).

## 8. Autorisation

**Autorises-tu le démarrage de la prochaine phase ?**
