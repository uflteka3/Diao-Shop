# DIAO SHOP — PHASE 4 : PAGE D'ACCUEIL (RAPPORT)

**Phase :** 4 / 10 — Page d'accueil
**Date :** 15 septembre 2026
**Statut :** Livrée et testée — en attente de validation client

---

## 1. Travail réalisé

### Projet Next.js complet
- Initialisation Next.js 14 (App Router) + React 18 + TypeScript strict + Tailwind CSS ;
- Police **Outfit variable auto-hébergée** (`next/font/local`) ;
- Favicon couronne (pastille or, SVG généré), métadonnées SEO de base, `lang="fr"` ;
- Build de production validé : **147 kB First Load JS** sur l'accueil.

### Intégration des images fournies (8 maillots réels)
- Analyse des 9 fichiers reçus, identification visuelle individuelle (correction de l'ordre d'envoi : Espagne/Belgique et PSG/Man City inversés) ;
- **Détourage IA** (rembg/isnet + u2net pour Arsenal) pour l'effet flottant des affiches ;
- Nettoyage des artefacts (composantes connexes) sur Arsenal et Belgique ;
- 8 PNG transparents ≤ 1000 px dans `public/images/demo/` — images utilisées telles quelles, sans retouche des maillots ;
- Catalogue de démonstration aligné sur les 8 vrais maillots : **RDC (mis en avant), Real Madrid, Manchester City, Arsenal, PSG, Espagne, Belgique, Stade Rennais**. Barcelona et Reims ne sont pas créés (aucune image fournie) — ajoutables via back-office en Phase 7.

### Moteur de thèmes dynamiques (fonctionnel)
- 8 thèmes complets extraits des affiches (12 variables chacun) + thème de secours ;
- Aucune couleur codée en dur : tout transite par les variables `--ds-*` ;
- **Thème initial rendu en SSR** (pas de flash), transitions CSS 450 ms au changement de produit ;
- Contraste automatique des textes de boutons/badges (calcul WCAG) ;
- `prefers-reduced-motion` respecté partout.

### Page d'accueil (fidèle aux affiches)
- Fond dégradé theme-driven (rayons + halo dérivés automatiquement) ;
- Grande carte arrondie (rayon 48 px) bordée de lumière, ombre profonde ;
- En-tête : couronne + « Diao shop » bicolore, navigation flottante en pilule (Boutique / À propos / Contact, soulignement actif), recherche / favoris / panier avec badge compteur, menu hamburger mobile ;
- Colonne gauche : flèches carrousel, label avec pastille, titre bicolore 2 lignes, description, CTA pilule doré + bouton favoris ;
- Scène centrale : maillot flottant (animation douce 5,5 s), glow du thème, jamais déformé (`object-contain`) ;
- Colonne droite : prix FCFA, ancien prix barré, sélecteur de tailles (obligatoire, tailles épuisées barrées), disponibilité, 3 badges de réassurance ;
- Pied de carte : réseaux sociaux (uniquement si configurés), slogan des affiches, **mini-carte produit suivant**, rangée des 8 miniatures (active : bordure accent + indicateur) ;
- **Interactions complètes** : changement de produit par miniatures/flèches → produit, prix, tailles et thème changent sans rechargement ; ajout au panier avec taille obligatoire → toast + badge incrémenté ; favoris persistants (localStorage) ;
- Bandeau « Démo — Donnée de démonstration à remplacer depuis le back-office. » sous la carte.

### Pages provisoires cohérentes (Phase 5+ pour le contenu)
Boutique, À propos, Contact, Favoris, Panier, fiche produit `[slug]`, 404 — toutes thématisées (thème de secours), navigation sans erreur 404.

---

## 2. Fichiers créés

- `diao-shop/package.json` · `tsconfig.json` · `next.config.mjs` · `postcss.config.js` · `tailwind.config.ts` · `.env.example` · `.gitignore`
- `diao-shop/src/app/layout.tsx` · `globals.css` · `page.tsx` · `not-found.tsx` · `icon.png`
- `diao-shop/src/app/boutique/page.tsx` · `a-propos/page.tsx` · `contact/page.tsx` · `favoris/page.tsx` · `panier/page.tsx` · `produit/[slug]/page.tsx`
- `diao-shop/src/components/Providers.tsx` · `CrownLogo.tsx` · `Icons.tsx` · `SocialIcons.tsx` · `ProductVisual.tsx` · `PagePlaceholder.tsx`
- `diao-shop/src/components/layout/SiteHeader.tsx`
- `diao-shop/src/components/home/HomeHero.tsx`
- `diao-shop/src/contexts/CartContext.tsx` · `FavoritesContext.tsx`
- `diao-shop/src/lib/data/types.ts` · `productRepository.ts` · `settingsRepository.ts`
- `diao-shop/src/lib/data/seed/products.ts` · `themes.ts` · `settings.ts`
- `diao-shop/src/lib/themes/resolveTheme.ts` · `cssVariables.ts`
- `diao-shop/src/lib/utils/contrast.ts` · `format.ts`
- `diao-shop/src/lib/i18n/fr.ts`
- `diao-shop/src/fonts/outfit-var.woff2`
- `diao-shop/public/images/demo/` (8 PNG détourés) · `public/images/brand/`

## 3. Fichiers modifiés

- Aucun fichier existant extérieur au projet (première itération du code).

## 4. Tests effectués

- **Build production** : ✓ compilation + vérification TypeScript strict ;
- **SSR** : titre, prix, tailles, thème RDC (#F59200) présents dans le HTML initial (SEO + pas de flash) ;
- **Interactions (navigateur headless)** : sélection taille M ✓, ajout au panier → toast + badge « 1 » ✓, changement de miniature PSG → fond `rgb(5,11,38)` + titre + prix mis à jour sans rechargement ✓, favoris ✓, mode clair Real Madrid lisible ✓ ;
- **Responsive** : 0 px de débordement horizontal mesuré à 320, 390 et 768 px ; captures desktop 1440 / mobile 390 vérifiées visuellement ;
- **Routes** : toutes en 200 (`/boutique`, `/a-propos`, `/contact`, `/favoris`, `/panier`, `/produit/maillot-rdc`), 404 propre pour slug inconnu et page inexistante ;
- **Images** : 8/8 servies en 200.

## 5. Problèmes rencontrés (et résolus)

- Ordre d'envoi des images différent du réel (Espagne ↔ Belgique, PSG ↔ Man City) — corrigé par identification visuelle individuelle ;
- Mémoire insuffisante pour le modèle de détourage par défaut → bascule sur `isnet-general-use` (1 image = 1 processus) + `u2net` pour Arsenal ;
- Artefacts de détourage (Arsenal, Belgique) → nettoyage par composante connexe puis re-détourage u2net ;
- Clés de thèmes non alignées avec les ids produits (détecté par test SSR) → corrigé ;
- Détails d'ajustement visuel constatés sur captures (largeurs de colonnes, logo mobile, sous-titres redondants) → corrigés.

## 6. Informations nécessaires

- Validation du rendu (captures et aperçu en direct) ou demandes d'ajustement ;
- (Phase 5+) Images supplémentaires si tu veux des galeries multi-vues par maillot ;
- (Phase 6/7) Coordonnées réelles de la boutique (téléphone, WhatsApp, email, réseaux) — les zones restent vides tant que non fournies ;
- (Phase 8) URL + clés Supabase.

## 7. Prochaine phase

**Phase 5 — Catalogue et fiche produit** : liste des maillots, recherche, filtres (équipe, prix, taille, disponibilité), tri, cartes produits, fiche produit complète (galerie, tailles, stock, ajout panier, favoris, produits similaires).

## 8. Autorisation

**Autorises-tu le démarrage de la prochaine phase ?**
