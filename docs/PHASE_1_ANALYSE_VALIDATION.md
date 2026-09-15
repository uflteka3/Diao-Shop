# DIAO SHOP — PHASE 1 : ANALYSE ET VALIDATION

**Projet :** Diao Shop — Boutique e-commerce premium de maillots de football
**Phase :** 1 / 10 — Analyse et validation
**Date :** 15 septembre 2026
**Nature :** Livrable d'analyse — conformément au protocole, aucun code ni fichier d'application n'a été créé
**Statut :** Livré — en attente de validation client

---

## 1. Compréhension du projet

### 1.1 En une phrase

Construire une véritable boutique e-commerce (pas une maquette) nommée **Diao Shop**, spécialisée dans la vente de maillots de football, dont la page d'accueil reproduit fidèlement une direction artistique de « présentation produit premium » (grande carte centrale arrondie, maillot flottant au centre, thèmes de couleurs dynamiques), adossée à un back-office Supabase complet permettant une administration 100 % sans code.

### 1.2 Les trois piliers

1. **Expérience client cinématographique** — la page d'accueil est une scène de présentation produit (jamais une grille) : navigation flottante, maillot mis en scène au centre, texte éditorial à gauche, panneau d'achat à droite, miniatures de navigation en bas.
2. **Thèmes dynamiques par produit** — chaque maillot porte ses propres couleurs d'interface stockées en base (≈ 14 variables : fonds, surfaces, texte, texte secondaire, bouton, glow + intensité, gradient, mode clair/sombre, bordures), appliquées avec des transitions fluides, sans flash blanc, avec thème de secours. Aucune couleur codée en dur, aucune condition sur le nom du produit.
3. **Back-office CMS complet** — produits (CRUD + publication), images via Supabase Storage, tailles et stocks par variante, éditeur de thèmes avec aperçu, maillot mis en avant (un seul à la fois, jamais remplacé automatiquement), commandes à statuts, paramètres boutique.

### 1.3 Périmètre fonctionnel consolidé

- **9 pages publiques :** Accueil · Catalogue · Fiche produit · Panier · Checkout · Confirmation de commande · Favoris · À propos · Contact
- **Back-office `/admin` (protégé) :** Dashboard · Produits · Images · Tailles & stocks · Thèmes avec prévisualisation · Maillot mis en avant · Commandes · Paramètres
- **8 tables Supabase :** `products`, `product_images`, `product_sizes` (ou `product_variants`), `product_themes`, `orders`, `order_items` (avec snapshots), `profiles`, `shop_settings`
- **Stack imposée :** Next.js · React · TypeScript · Tailwind CSS · Supabase (PostgreSQL, Auth, Storage, RLS) · Zod · Framer Motion ou GSAP · mobile-first · `prefers-reduced-motion` respecté

### 1.4 Cible et langue

- Cible commerciale : clients africains, particulièrement le **Burkina Faso**.
- Langue : **français** ; architecture prête pour l'anglais, sans traduction fictive.

---

## 2. Analyse des références visuelles

> Sources : **Référence A** = capture principale (thème orange/or, Maillot RDC) · **Référence B** = planche de 5 variantes thématiques.

### 2.1 Référence A — composition détaillée (14 zones)

| Zone | Contenu observé |
|---|---|
| Arrière-plan extérieur | Orange lumineux, rayons radiaux subtils, halo central, léger vignettage |
| Carte principale | Grande carte centrée, coins très arrondis (≈ 40–48 px), intérieur brun-ambré sombre en dégradé, liseré lumineux orange, ombre douce |
| En-tête gauche | Couronne dorée + « Diao » (blanc) + « shop » (doré) |
| En-tête centre | Navigation flottante en pilule translucide : « Tous les produits » (actif, souligné), « À propos », « Contact » |
| En-tête droite | Icône recherche, cœur (favoris), panier avec **badge compteur doré « 2 »** |
| Colonne gauche | 2 flèches circulaires ‹ › · label « ● Maillots de football » · titre « Maillot RDC » (blanc) / « Édition Lion. 2026 » (doré) · description (3 lignes) · CTA pilule doré « 🛒 Ajouter au panier → » |
| Centre | Maillot détouré flottant, ombre elliptique sous le produit, glow discret |
| Colonne droite | Prix « 49,99 € » (grand, blanc) · ancien prix « 69,99 € » barré · « Choisir sa taille » · pastilles S (active dorée) M L XL XXL · 3 badges de réassurance avec icônes (tissu respirant / qualité premium 100 % garantie / livraison rapide) |
| Bas gauche | Réseaux sociaux : Instagram, Facebook, TikTok, YouTube |
| Bas centre | Slogan « — Le style de vos équipes, à portée de main — » |
| Bas droite | Rangée de 5 miniatures (active : bordure dorée + indicateur) · mini-carte « produit suivant » avec flèches au-dessus |

### 2.2 Référence B — les 5 variantes thématiques

| Produit | Fond extérieur | Carte | Accents | Mode |
|---|---|---|---|---|
| Maillot DU CONGO — Édition Lion. 2026 | Bleu | Bleu nuit dégradé | Bleu clair / très clair | sombre |
| Maillot FC Barcelona — Édition 2025 | Blanc argenté | Blanche | Pastel irisé (rose/cyan) | **clair** |
| Maillot Arsenal — Édition 2025 | Violet très sombre | Violet profond | Magenta / rose lumineux | sombre |
| Maillot Manchester City — Édition 2025 | Bleu nuit | Bleu moyen | Bleu ciel | sombre |
| Maillot Stade Rennais — Édition 2025 | Noir rougeâtre | Noire | Rouge lumineux | sombre |

**Constat majeur :** la structure est **strictement identique** sur les 6 maquettes ; seuls les couleurs, gradients, glows et le mode clair/sombre changent. Cela valide l'architecture « thème = données liées au produit ». La variante Barcelona prouve par ailleurs que le **mode clair** est un cas d'usage à traiter pleinement (texte sombre, CTA clair, glow pastel).

### 2.3 Inventaire des composants identifiés (16)

1. Logo (couronne + wordmark bicolore) · 2. Navigation flottante en pilule avec état actif souligné · 3. Boutons icônes (recherche, favoris, panier + badge compteur) · 4. Flèches carrousel circulaires · 5. Label de catégorie avec pastille colorée · 6. Titre produit bicolore sur 2 lignes · 7. Description · 8. CTA principal en pilule (icône panier + libellé + flèche) · 9. Scène produit (image détourée + ombre elliptique + glow) · 10. Bloc prix (courant + ancien barré) · 11. Sélecteur de tailles en pastilles (état actif) · 12. Badges de réassurance (icône + texte sur 2 lignes) · 13. Icônes sociales · 14. Slogan centré avec tirets · 15. Rangée de miniatures avec état actif · 16. Mini-carte « produit suivant ».

### 2.4 Chromatique estimée

> Valeurs extraites **visuellement** — approximatives, à affiner en Phase 3 ; de toute façon modifiables depuis le back-office.

| Thème | Fond extérieur (approx.) | Carte (approx.) | Accent (approx.) |
|---|---|---|---|
| RDC — orange/or (Réf. A) | #F08C00 → #FFA51E | #241102 → #3D1F04 | #EFA32B |
| RDC/DU CONGO — bleu (Réf. B + exemple JSON du cahier des charges) | #0A2FA0 → #061A5E | #051243 → #0C2C9E | #BFD4FF (cahier des charges : #1769E8 / #071A46 / #F5A623) |
| FC Barcelona — clair | #DFE5EC → #F5F7FA | #FFFFFF → #ECEFF5 | pastels + texte #0A1A2F |
| Arsenal | #140818 | #1D0A2A → #31104A | #D63BC8 |
| Manchester City | #06122E | #0D2B6B → #154CB0 | #6CABDD |
| Stade Rennais | #200606 | #0D0202 → #260808 | #E5322B |

### 2.5 Typographie et style

- Sans-serif géométrique moderne ; titres extrabold ; prix en gras ; format français « 49,99 € ».
- Candidates à évaluer en Phase 3 : Poppins, Outfit, Plus Jakarta Sans, Sora — décision à valider avec le client.

### 2.6 Interactions impliquées par les références

- Clic sur miniature ou flèches ‹ › → changement de produit **et** de thème global, sans rechargement de page ;
- Sélection de taille → état actif ; ajout au panier → incrément du badge ; cœur → toggle favoris ;
- Transitions estimées : 300–500 ms, courbes douces ; version allégée obligatoire (`prefers-reduced-motion`).

### 2.7 Écarts détectés entre les documents et les références

| # | Élément | Réf. A | Réf. B | Cahier des charges | Master prompt | Décision requise |
|---|---|---|---|---|---|---|
| 1 | Nommage maillot Congo | « Maillot RDC » | « Maillot DU CONGO » | « Maillot RDC » | — | ✅ Oui (donnée de démo) |
| 2 | Libellé nav catalogue | « Tous les produits » | « Tous les maillots » | « Tous les produits » | « Boutique ou Catalogue » | ✅ Oui |
| 3 | Thème du maillot RDC | Orange/or | Bleu profond | Bleu (#1769E8) | — | ✅ Oui |
| 4 | 5e produit | — | Stade Rennais | Reims | — | ✅ Oui |
| 5 | Devise | € | € | — | Cible Burkina Faso | ✅ Oui |
| 6 | Années d'édition | 2026 (RDC) | 2025 (autres) | 2026 (RDC) | Saison facultative | Non bloquant (donnée par produit) |
| 7 | Icône recherche en en-tête | Présente | Présente | Non listée | Non listée | Proposition : conservée, renvoie vers la recherche du catalogue — à valider |

> **Observation complémentaire :** les maquettes réduites de la Réf. B montrent une barre de miniatures **verticale** à droite en plus de la rangée horizontale du bas. La composition canonique desktop reste celle de la Réf. A ; la variante verticale pourrait servir d'adaptation tablette — à trancher en Phase 3.

---

## 3. Informations manquantes — décisions requises

### 3.1 Impact immédiat (Phases 2-3)

| # | Information | Impact si absente | Proposition par défaut |
|---|---|---|---|
| 1 | Devise par défaut (€ vs FCFA) | Formats de prix des données de démo | FCFA (XOF) si cible Burkina Faso — champ administrable de toute façon |
| 2 | Thème du maillot RDC : orange (Réf. A) ou bleu (Réf. B) | Jeu de couleurs de la démo | Orange/or — la Réf. A semble être la référence canonique |
| 3 | Libellé de navigation vers le catalogue | Navigation | « Tous les produits » |
| 4 | 5e produit : Reims ou Stade Rennais | Jeu de données de démo | Stade Rennais (visible dans la référence) |
| 5 | Slogan définitif | Bas de la page d'accueil | Celui des captures, marqué « à valider » |
| 6 | Badges de réassurance : textes validés ? | Bloc sous les tailles | Repris des captures, marqués « à valider » |
| 7 | Prix 49,99 / 69,99 : réels ou démonstration ? | Données produits | Marqués DONNÉES DE DÉMONSTRATION À REMPLACER |
| 8 | Logo : fichier fourni ou recréation SVG de la couronne ? | En-tête + favicon | Recréation SVG fidèle, remplaçable par l'admin |

### 3.2 Impact ultérieur (Phases 4-10)

| # | Information | Phase concernée |
|---|---|---|
| 9 | Images réelles des maillots — idéalement **PNG détourés** pour l'effet flottant | 4 et suivantes |
| 10 | Accès Supabase (URL + clés) — sinon Option B du §6.3 | 8 au plus tard |
| 11 | Moyen de paiement par défaut (paiement à la livraison ? Orange Money ? Wave ?) | 6 |
| 12 | Zones et frais de livraison | 6 |
| 13 | Création du premier compte administrateur (manuel via Supabase) | 7-8 |
| 14 | Favoris : persistance locale (localStorage) ou compte client ? | 5 |
| 15 | Données SEO par page (title, descriptions) | 9 |
| 16 | Anglais : après la V1 uniquement | Post-V1 |

---

## 4. Contraintes

### 4.1 Design et direction artistique
- Fidélité stricte à la Réf. A (structure à 14 zones) ; aucune grille de produits en hero ; pas de page générique.
- Thème lié aux **données** de chaque produit ; jamais de condition sur le nom du produit ; thème de secours obligatoire.
- Transitions fluides sans flash blanc ; contraste maintenu en mode clair comme sombre.
- Mobile : aucun débordement horizontal, zones tactiles ≥ 44 px, hiérarchie visuelle conservée.

### 4.2 Techniques
- Stack imposée : Next.js / React / TypeScript / Tailwind / Supabase ; chaque dépendance supplémentaire sera justifiée.
- Images via Supabase Storage (jamais dans le code frontend) ; `next/image`, lazy loading.
- RLS sur toutes les tables ; lecture publique limitée aux produits publiés ; écriture admin uniquement ; aucun secret côté client.
- Snapshots dans `order_items` (nom/prix/images figés à la commande) ; stock par taille ; commande limitée au stock disponible (validation **serveur**).

### 4.3 Contenu et données
- Aucune invention (produits, prix, tailles, coordonnées, paiements, textes commerciaux, images, logo).
- Toute donnée non fournie = « DONNÉES DE DÉMONSTRATION À REMPLACER », jamais présentée comme réelle.
- Aucune intégration de paiement fonctionnelle inventée ; architecture configurable uniquement.

### 4.4 Qualité
- Tests 320 → 1920 px (plus portrait/paysage) ; états loading / empty / error / skeleton / disabled / confirmation partout ; erreurs compréhensibles pour le client, détails techniques dans les logs.
- SEO de base sans données inventées ; accessibilité (H1 unique, alt text, labels, focus visible, ARIA si nécessaire).
- `prefers-reduced-motion` respecté ; animations performantes (transform/opacity).

### 4.5 Processus
- Validation client avant chaque phase ; format de rapport imposé après chaque phase ; aucune suppression ni simplification de fonctionnalité ; explication avant toute modification.

---

## 5. Risques et parades

| # | Risque | Probabilité | Impact | Parade |
|---|---|---|---|---|
| 1 | Accès Supabase non fournis pendant le développement | Haute | Moyen | Couche de services abstraite + données de démo marquées ; migrations SQL + guide de connexion en Phase 8 ; bascule sans réécriture |
| 2 | Images des maillots non détourées → effet « flottant » dégradé | Moyenne | Moyen | Recommander des PNG détourés ; sinon affichage `object-contain` sans recadrage + ombre/glow adaptés ; placeholder propre si image absente |
| 3 | Contraste insuffisant sur certains thèmes (surtout le mode clair) | Moyenne | Moyen | Variables de thème complètes (texte + texte secondaire) + contrôle de contraste dans l'éditeur de thème |
| 4 | Marques réelles visibles sur les maillots (sponsors, équipementiers) | Certaine | Faible (juridique) | Reproduire la structure et l'expérience, pas les assets ; images fournies par l'admin sous sa responsabilité ; aucun logo ni texte inventé sur les maillots |
| 5 | Débordements mobiles (composition dense) | Moyenne | Élevé | Mobile-first ; points de rupture dédiés (320/360/390/414/tablette/desktop) ; tests systématiques |
| 6 | Survente du stock au checkout | Faible | Élevé | Vérification du stock côté serveur à la création de commande |
| 7 | Performances (grands dégradés, glows, images lourdes) | Moyenne | Moyen | `next/image`, lazy loading, animations CSS transform/opacity, `prefers-reduced-motion`, bundle maîtrisé |
| 8 | Dérive du périmètre (10 phases) | Moyenne | Moyen | Gates de validation strictes ; une phase = livrables testés ; rapport formaté |
| 9 | Aperçu sandbox sans accès réseau externes | Certaine | Faible | Développement sur données locales ; intégration Supabase réelle dès clés fournies ; guides de déploiement (Vercel + Supabase) pour la mise en production |
| 10 | Paiement non défini → blocage du checkout | Certaine | Faible | Mode de paiement **configurable** (champ administrable + architecture extensible : paiement à la livraison, Orange Money, Moov Money, Wave…) ; rien d'activé sans choix du client |

---

## 6. Plan général d'exécution

### 6.1 Feuille de route

| Phase | Livrables clés | Prérequis |
|---|---|---|
| 1. Analyse et validation | Ce document | — (en cours) |
| 2. Architecture technique | Stack détaillée, arborescence, modèle de données final, stratégies Auth / Storage / RLS, gestion panier / thèmes / erreurs | Validation Phase 1 + réponses §3.1 |
| 3. Design system & DA | Tokens (couleurs, typographies, espacements, rayons, ombres), boutons, cartes, états, moteur de thèmes dynamiques, grille responsive | Phase 2 |
| 4. Page d'accueil | Navigation, hero + carte principale, scène produit, miniatures, transitions de thème, slogan, footer | Phase 3 |
| 5. Catalogue & fiche produit | Recherche, filtres, tri, cartes, galerie, tailles, stock, ajout panier, favoris | Phase 4 |
| 6. Panier & checkout | Quantités, totaux, validation stock, formulaire client, livraison configurable, paiement configurable, confirmation de commande | Phase 5 |
| 7. Back-office | Auth admin, dashboard, produits, images, tailles/stocks, thèmes + aperçu, mise en avant, commandes, paramètres | Phase 6 |
| 8. Supabase réel | Migrations SQL, Storage, Auth, RLS/policies, services connectés, variables d'environnement, tests de sécurité | Clés Supabase du client |
| 9. Animations, responsive & optimisation | Animations finales, responsive complet, performance, accessibilité, SEO, états loading/error/empty | Phases 4-7 |
| 10. Tests finaux & livraison | Tests des 3 parcours (client, admin, sécurité), corrections, guides : installation, configuration, déploiement, variables d'environnement, back-office | Phase 9 |

### 6.2 Stratégie « données de démonstration »

- Un jeu de données séparé (seed) alimentera les Phases 3 à 7 : 5-6 maillots correspondant aux références, avec prix, tailles et images **clairement marqués DONNÉES DE DÉMONSTRATION À REMPLACER**.
- Aucune donnée de démo ne sera présentée comme une information commerciale réelle.

### 6.3 Stratégie d'intégration Supabase

- **Option A** (si les clés sont fournies tôt) : connexion réelle dès la Phase 3.
- **Option B (par défaut)** : développement contre une couche d'abstraction de données + simulation locale, puis bascule vers Supabase en Phase 8 (migrations SQL, policies RLS, Storage livrés et testés). Le code public et admin reste identique.

### 6.4 Environnement de travail

- Développement et démonstration en local (aperçu intégré à l'espace de travail) ; mise en production finale côté client (Vercel + Supabase) accompagnée par les guides de la Phase 10.

---

## 7. Décision attendue

Pour passer en **Phase 2 — Architecture technique** : réponses aux points §3.1 (1 à 5 notamment) + autorisation explicite du client.
