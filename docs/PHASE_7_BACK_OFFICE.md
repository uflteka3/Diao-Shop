# DIAO SHOP — PHASE 7 : BACK-OFFICE ADMINISTRATEUR (RAPPORT)

**Phase :** 7 / 10 — Back-office administrateur
**Date :** 15 septembre 2026
**Statut :** Livrée et testée — en attente de validation client

---

## 1. Travail réalisé

### Accès & sécurité
- Lien discret **« Administration »** dans le pied de page (12 px, choix validé en Phase 6) → `/admin/login` ;
- **Connexion** : identifiants de démonstration issus de `.env.local` (ADMIN_EMAIL / ADMIN_PASSWORD), erreur française en cas d'échec, blocage temporaire après 5 tentatives (anti brute-force léger) ;
- **Session** : cookie `httpOnly` signé **HMAC-SHA256** (ADMIN_SESSION_SECRET, Web Crypto compatible edge/node), expiration 12 h, `Secure` en production, `SameSite=Lax` ;
- **Triple barrière** : middleware Edge sur `/admin/*` + garde serveur dans le layout `(protected)` + re-vérification dans **chaque** route API admin (401 JSON) ;
- Cookie falsifié/signature invalide/expiré → rejeté (testé) ; déconnexion = effacement du cookie.

### Tableau de bord (`/admin`)
- Carte « Maillot principal de la page d'accueil » (produit en cours + accès direct au changement) ;
- 6 statistiques : produits, publiés, brouillons, commandes, commandes nouvelles, chiffre (hors annulées/remboursées) ;
- 5 dernières commandes (numéro, client, total, statut, date) + rappel du mode démonstration.

### Produits (`/admin/produits`)
- Liste : recherche (nom/équipe/sous-titre), filtres Tous/Publiés/Brouillons, badge de statut, stock total, mention « mis en avant » ;
- **Publication/dépublication** en un clic — effet **immédiat** sur la boutique (vérifié) ;
- **Suppression** avec confirmation navigateur (retire aussi son thème et sa mise en avant éventuelle) ;
- **Formulaire complet** (création + édition) : identité (nom, sous-titre/édition, slug auto-dédoublonné, équipe, accroche, description), prix FCFA + ancien prix barré (contrôle : ancien > actuel), **images** (URL ou téléversement, texte alternatif, galerie secondaire réordonnable), **tailles & stocks** (libellés personnalisables, stock 0–9999, activation par taille, ajout/suppression de lignes), publication, et case « définir comme maillot principal » (avec avertissement d'unicité).

### Images
- Route d'**upload** réservée admin : JPEG/PNG/WebP, 5 Mo max, nom aléatoire, stockage `public/uploads/` (mode démo — Supabase Storage en Phase 8) ;
- Composant réutilisable avec aperçu, saisie URL manuelle, retrait.

### Mise en avant (`/admin/mise-en-avant`) — règle « UN SEUL »
- Carte du maillot actuellement en avant + option « retirer la mise en avant » (accueil sans héros, état vide maîtrisé) ;
- Grille des produits publiés, **confirmation explicite** avant changement ; la garantie système est côté store : `definirFeatured()` réinitialise tous les `isFeatured` (impossible d'en avoir deux, y compris via l'API) ; seul un produit **publié** peut être mis en avant.

### Éditeur de thèmes (`/admin/themes`) — zéro code
- Sélecteur de maillot (liste avec vignettes) ; chargement du thème existant ou du thème de secours ;
- **8 couleurs + dégradé CSS + intensité du glow (curseur 0–1) + mode (sombre/clair) + bordure** : double saisie (pipette native + champ HEX), validation serveur (HEX, gradient `linear/radial-gradient(...)`, intensité bornée) ;
- **Aperçu live** fidèle à la carte d'accueil (se met à jour à chaque frappe, AVANT enregistrement) ;
- **Contrôle d'accessibilité intégré** : ratio de contraste texte/carte affiché, alerte si < 4,5:1 (référence = surface secondaire, là où le texte repose réellement — le thème RDC validé ne déclenche pas de fausse alerte) ;
- Bouton « Valeurs par défaut » (thème de secours) ; le thème enregistré suit le produit **partout** : accueil, boutique, fiche, favoris, panier, commande (vérifié par tests).

### Commandes (`/admin/commandes`)
- Filtres par statut avec compteurs ; ligne dépliable : client (téléphone, WhatsApp, email, adresse, zone, notes, moyen de paiement) + articles (snapshots immuables) + totaux ;
- **Changement de statut** (Nouvelle → Confirmée → En préparation → Expédiée → Livrée / Annulée / Remboursée), persistant, validé côté serveur.

### Messages (`/admin/messages`)
- Nouvelle **page publique `/contact`** : formulaire (nom, téléphone/WhatsApp, email, message) → table des messages ; **honeypot anti-spam** ; coordonnées et réseaux affichés uniquement s'ils sont configurés (sinon invite à utiliser le formulaire) ;
- Admin : badge « Nouveau », marquer lu/non lu, supprimer.

### Paramètres (`/admin/parametres`)
- **Identité** : nom, slogan (affiché à l'accueil et au pied de page), devise (FCFA administrable) ;
- **Coordonnées** : téléphone, WhatsApp (format international), email, adresse — **laisser vide masque l'élément côté site** (règle « aucune donnée fictive ») ; réseaux sociaux Facebook/Instagram/TikTok/YouTube (icônes apparaissent seulement si configurés) ;
- **Paiement** : libellé + instructions du bloc checkout (« Confirmation via WhatsApp ») ;
- **Zones de livraison** : libellés + frais éditables, ajout/suppression (les zones de démonstration Ouagadougou restent marquées à remplacer) ;
- **Textes** des pages « À propos » (nouvelle page publique `/a-propos`) et « Contact » — vides par défaut, aucun texte commercial inventé ;
- Fusion serveur sûre : un PUT partiel n'écrase plus les clés non transmises.

### Architecture (prête pour la Phase 8)
- **Store mutable central** (`src/lib/admin/store.ts`) : produits, thèmes, commandes, paramètres, messages, featured — toute la logique back-office est la logique de production ; la Phase 8 branchera Supabase derrière ces mêmes fonctions ;
- **Répositories publics repointés** sur ce store : une modification admin est visible sur le site **immédiatement** (sans recompilation) ; les pages publiques sont désormais `force-dynamic` (CMS) ;
- **Thèmes résolus côté serveur** et passés en données au carrousel (le client n'accède jamais au store) — le changement d'ambiance suit le produit sans flash.

## 2. Fichiers créés

- `src/lib/admin/session.ts` — jeton de session signé HMAC (création/vérification) ;
- `src/lib/admin/store.ts` — store mutable central (produits, thèmes, commandes, paramètres, messages, featured) ;
- `src/lib/admin/guard.ts` — `exigerSession()` pour routes API + réponse 401 ;
- `middleware.ts` — protection Edge de `/admin/*` (redirection login) ;
- `src/app/admin/login/page.tsx` — connexion (erreurs FR, anti brute-force) ;
- `src/app/admin/(protected)/layout.tsx` — garde serveur + shell ;
- `src/app/admin/(protected)/page.tsx` — dashboard ;
- `src/app/admin/(protected)/produits/page.tsx`, `produits/nouveau/page.tsx`, `produits/[id]/page.tsx` ;
- `src/app/admin/(protected)/mise-en-avant/page.tsx` ;
- `src/app/admin/(protected)/themes/page.tsx` ;
- `src/app/admin/(protected)/commandes/page.tsx` ;
- `src/app/admin/(protected)/messages/page.tsx` ;
- `src/app/admin/(protected)/parametres/page.tsx` ;
- `src/app/api/admin/login/route.ts`, `logout/route.ts` ;
- `src/app/api/admin/products/route.ts` (GET/POST/PUT/DELETE), `featured/route.ts`, `themes/route.ts`, `orders/route.ts`, `settings/route.ts`, `messages/route.ts`, `upload/route.ts` ;
- `src/app/api/contact/route.ts` — contact public (honeypot) ;
- `src/components/admin/AdminShell.tsx`, `StatutBadge.tsx`, `ProductsAdmin.tsx`, `ProductForm.tsx`, `ImageUploader.tsx`, `ThemeFields.tsx`, `ThemeEditor.tsx`, `FeaturedPicker.tsx`, `OrdersAdmin.tsx`, `MessagesAdmin.tsx`, `SettingsForm.tsx` ;
- `src/components/contact/ContactForm.tsx` ;
- `src/app/contact/page.tsx`, `src/app/a-propos/page.tsx` (pages publiques pilotées par paramètres) ;
- Captures : `capture_phase7_*.png` (login, dashboard, produits, thèmes, mise en avant, commandes, paramètres, messages, mobile).

## 3. Fichiers modifiés

- `src/lib/data/productRepository.ts`, `settingsRepository.ts`, `orderRepository.ts` — branchés sur le store admin (site piloté par le back-office) ;
- `src/lib/themes/resolveTheme.ts` — lit le thème enregistré en back-office (sinon secours) ;
- `src/lib/data/types.ts` — `Product.gallery`, `ShopSettings.aboutText/contactText` ;
- `src/app/page.tsx` — thèmes résolus serveur, passés en props à `HomeHero` ; `dynamic = 'force-dynamic'` ;
- `src/components/home/HomeHero.tsx` — consomme `themes` (props) au lieu du store client ;
- Pages publiques (boutique, favoris, panier, commande, confirmation, produit/[slug], contact, à propos) — `force-dynamic` ;
- `src/components/layout/SiteFooter.tsx` — lien discret « Administration » ;
- `src/components/SocialIcons.tsx` — `links` optionnel (robustesse) ;
- `src/lib/admin/store.ts` — fusion des paramètres sans écrasement par `undefined`.

## 4. Tests effectués

**API / sécurité (curl + Python)**
- `/admin` sans session → 307 vers `/admin/login` ; API admin sans session → 401 ; cookie vide ou **falsifié** → rejet ;
- Mauvais mot de passe → 401 avec message FR ; bonne connexion → 200 + cookie ; logout → API re-protégée ;
- Création produit (brouillon puis publication), **slug dupliqué refusé (400)**, ancien prix ≤ prix refusé, suppression ;
- Dépublication PSG → absente de la boutique ; republication → de retour (effet immédiat vérifié) ;
- Mise en avant d'un produit → accueil mis à jour ; retour RDC ; produit non publié refusé ;
- Thème : enregistrement valide, **couleur invalide refusée (400)** ; l'accueil ET la fiche suivent le thème (#FF0000/#0A4D23 vérifiés dans le rendu) ;
- Commande créée via l'API publique → visible dans l'admin, statut changé puis persistant ;
- Paramètres : PUT partiel du slogan → affiché à l'accueil, restauré, aucune perte de données ;
- Contact : validation (400), **honeypot** (robot non enregistré), message visible côté admin, lu/suppression ;
- Upload : PNG téléversé → fichier présent sur disque.

**Parcours navigateur (Playwright/Chromium, 27/27 OK)**
- Footer → login → erreur identifiants → connexion → dashboard ;
- Création complète d'un maillot via le formulaire (mise en avant cochée) → héros de l'accueil + listé en boutique ;
- Éditeur de thème : accent #16A34A + fond #064E3B enregistrés → **accueil ET fiche produit thémés** ;
- Mise en avant : dialog de confirmation → RDC de retour en héros ;
- Statut « En préparation » persistant après rechargement ;
- Slogan modifié visible sur l'accueil ; contact public → message dans l'admin ;
- Déconnexion → `/admin` re-protégée ;
- **Zéro débordement horizontal à 320 px sur les 8 pages admin** ;
- Captures desktop pleine page + mobile (`capture_phase7_*.png`).

**Build** : TypeScript sans erreur ; `next build` ✓ (31 pages) ; serveur de production relancé.

## 5. Problèmes rencontrés (et résolus)

1. **Thème non visible sur l'accueil** : `HomeHero` (client) résolvait le thème via le store — dont la copie navigateur est vide par conception. Résolu en résolvant les thèmes **côté serveur** et en les passant en props ;
2. **Pages statiques périmées** : l'accueil/boutique prérendus ne reflétaient pas toujours les changements admin. Résolu : toutes les pages publiques passées en `force-dynamic` (rendu CMS toujours frais) ;
3. **PUT paramètres partiel écrasait `socialLinks`** (undefined → crash `ConfiguredSocialLinks`) : fusion serveur filtrant les `undefined` + prop `links` optionnelle ;
4. **Fausse alerte de contraste** sur le thème RDC validé : le ratio comparait le texte au fond *extérieur* alors que le texte repose sur la *carte* (surface secondaire) — référence corrigée, alerte désormais juste (0 sur RDC, déclenchée si texte = carte) ;
5. `StatutBadge` exporté depuis une page (interdit par Next) → extrait dans `src/components/admin/StatutBadge.tsx` ;
6. Comportement documenté du mode démo : le redémarrage du serveur réinitialise les données du store (commandes/produits créés) — la persistance JSON/Supabase est précisément l'objet de la suite.

## 6. Informations nécessaires

*(inchangé — rien de bloquant)*
- Clés Supabase (projet + service_role serveur) pour la Phase 8 ;
- Coordonnées réelles (téléphone, WhatsApp, email, adresse, réseaux) et textes « À propos »/« Contact » — saisissables désormais **par le client dans le back-office** (les éléments restent masqués tant que rien n'est configuré) ;
- Validation finale du slogan « Le style de vos équipes, à portée de main » ;
- Frais réels des zones de livraison (zones de démonstration Ouagadougou à remplacer).

## 7. Prochaine phase

**Phase 8 — Supabase réel** : migration du store vers les 9 tables (produits, tailles, thèmes, commandes + snapshots, paramètres jsonb, messages, profils admin/staff), RLS partout, Supabase Auth pour l'admin, Storage pour les images — mêmes contrats de fonctions, données enfin persistantes.

## 8. Autorisation

**Autorises-tu le démarrage de la prochaine phase ?**
