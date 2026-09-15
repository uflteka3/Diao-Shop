# DIAO SHOP — PHASE 5 : CATALOGUE ET FICHE PRODUIT (RAPPORT)

**Phase :** 5 / 10 — Catalogue et fiche produit
**Date :** 15 septembre 2026
**Statut :** Livrée et testée — en attente de validation client

---

## 1. Travail réalisé

### Page Boutique / Catalogue (`/boutique`)
- Grille responsive de cartes produits (2 colonnes mobile → 4 desktop), cartes arrondies cohérentes avec la DA, images jamais déformées, badge « Épuisé » + image grisée si rupture ;
- **Recherche** instantanée (nom, équipe, édition) ;
- **Filtres** : équipe/sélection (chips multi-sélection), taille (S→XXL, basé sur le stock réel actif), prix maximum (slider), disponibilité (« En stock uniquement ») ;
- **Tri** : nouveauté, prix croissant, prix décroissant ;
- **Filtres synchronisés à l'URL** (`?q=…&equipe=…&taille=…&prixMax=…&dispo=1&tri=…`) → liens partageables ;
- Compteur de résultats annoncé (aria-live), **état vide** avec bouton de réinitialisation, chargement progressif (« Afficher plus ») ;
- Panneau de filtres repliable sur mobile.

### Fiche produit (`/produit/[slug]`)
- **Le thème du produit s'applique à toute la page** (fond, carte, CTA, glow, badges — variables `--ds-*`) — testé : Arsenal → page entièrement violette ;
- Fil d'Ariane (Accueil / Boutique / produit) ;
- Galerie (image principale + infrastructure multi-images prête pour le back-office), image `object-contain` jamais déformée ;
- Nom bicolore, équipe, description, prix + ancien prix barré ;
- Sélection de taille **obligatoire** (message d'erreur accessible si oubli), tailles épuisées barrées ;
- Sélecteur de quantité **plafonné au stock de la taille choisie** (vérifié : blocage à 12) ;
- Affichage du stock (« 12 disponibles » / « Épuisé » / « Taille momentanément épuisée ») ;
- Ajout au panier via le **contexte global** (badge en-tête mis à jour) + toast de confirmation ;
- Bouton favoris (état actif persistant) ;
- **Produits similaires** (même équipe d'abord, puis autres — 4 max) ;
- SEO par produit : title, description, Open Graph avec image du maillot ;
- Produit dépublié → 404 (comportement qui correspondra à la RLS en Phase 8).

### Page Favoris (`/favoris`) — fonctionnelle
- Ajout/retrait depuis les cartes et les fiches, **persistance locale** (localStorage, aucun compte requis) ;
- Squelette de chargement pendant la lecture du stockage, **état vide** avec appel à l'action vers la boutique ;
- Retrait direct depuis la page (bouton cœur sur chaque carte).

### Footer commun (livrable Phase 4 complété)
- Logo + slogan, navigation, bloc contact (n'affiche **que** les coordonnées configurées — rien d'inventé, mention « à configurer dans le back-office » sinon), réseaux sociaux uniquement si configurés, copyright.

---

## 2. Fichiers créés

- `diao-shop/src/components/catalogue/CatalogueClient.tsx`
- `diao-shop/src/components/catalogue/ProductCard.tsx`
- `diao-shop/src/components/produit/ProductDetail.tsx`
- `diao-shop/src/components/favoris/FavoritesList.tsx`
- `diao-shop/src/components/layout/SiteFooter.tsx`

## 3. Fichiers modifiés

- `diao-shop/src/app/boutique/page.tsx` (page complète remplaçant le placeholder)
- `diao-shop/src/app/produit/[slug]/page.tsx` (fiche complète + similaires + thème produit)
- `diao-shop/src/app/favoris/page.tsx` (page complète)
- `diao-shop/src/contexts/FavoritesContext.tsx` (ajout du drapeau `hydrated` — anti-flash)

## 4. Tests effectués (navigateur headless, build de production)

- Catalogue : 8 cartes ✓ ; recherche « rennais » → 1 carte + URL `?q=rennais` ✓ ; filtre équipe Arsenal → 1 carte + URL ✓ ; tri prix URL ✓ ; filtre taille XL → 8 cartes ✓ ; état vide « Aucun maillot ne correspond » + réinitialisation → 8 cartes ✓ ;
- Fiche Arsenal : thème violet appliqué à la page (`rgb(21, 8, 32)`) ✓ ; ajout sans taille → message « Choisissez d'abord une taille » ✓ ; taille L + quantité 2 → ajout → badge panier « 2 » ✓ + toast ✓ ; quantité plafonnée au stock (12) ✓ ; favori persistant (`['p-arsenal']`) ✓ ; 4 produits similaires ✓ ;
- Favoris : 2 favoris affichés ✓ ; retraits successifs → état vide ✓ ;
- Débordement horizontal : **0 px** sur boutique/fiche/favoris à 320, 390 et 768 px ✓ ;
- Build de production ✓ (boutique 108 kB, fiche 108 kB First Load JS).

## 5. Problèmes rencontrés (et résolus)

- Environnement : un `next build` lancé pendant que le serveur de développement tournait a corrompu son cache (`.next`) → page boutique vide et déshydratée. Résolu : reconstruction propre (`rm -rf .next && npm run build`) et bascule de l'aperçu en **serveur de production** (processus de prévisualisation stabilisé) ;
- Trois sélecteurs de tests ambigus (libellés partagés, sous-chaînes « L »/« XL ») — corrigés côté script (aucun bug produit) ;
- Scénario favoris multi-pages nécessitant un contexte navigateur partagé (localStorage par session) — corrigé côté script.

## 6. Informations nécessaires

- Validation du catalogue, de la fiche et des favoris (aperçu en direct) ;
- (Phase 6) Règles de livraison : zones, frais — ou champs administrables vides ;
- (Phase 6) Mode de paiement par défaut à afficher (aucun activé tant que non choisi) ;
- (Phase 7/8) Coordonnées réelles + clés Supabase.

## 7. Prochaine phase

**Phase 6 — Panier et checkout** : page panier complète (quantités, suppression, sous-totaux, total, panier vide, validation stock), formulaire de commande (nom, téléphone, WhatsApp, adresse, ville, notes), récapitulatif, création de commande côté serveur (validation du stock, numéro `DS-XXXXXX`), page de confirmation, paiement configurable (aucun moyen activé par défaut).

## 8. Autorisation

**Autorises-tu le démarrage de la prochaine phase ?**
