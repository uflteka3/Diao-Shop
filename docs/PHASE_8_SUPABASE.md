# DIAO SHOP — PHASE 8 : SUPABASE RÉEL (RAPPORT)

**Phase :** 8 / 10 — Persistance Supabase (production)
**Date :** 15 septembre 2026
**Statut :** Livrée, branchée sur le projet Supabase réel et testée — en attente de validation client

---

## 1. Travail réalisé

### Base de données (9 tables — schéma appliqué par le client dans SQL Editor)
`products`, `product_sizes`, `product_images`, `product_themes`, `orders`, `order_items`,
`shop_settings` (ligne unique jsonb), `contact_messages`, `profiles` (rôles admin/staff).
- Contraintes métier **au niveau base** : prix ≥ 0, ancien prix > prix, stock ≥ 0,
  `unique (product_id, size)`, statuts de commande restreints (check), glow 0–1,
  mode sombre/clair restreint ;
- **« Un seul maillot mis en avant » garanti par la base** : index unique partiel
  `products_one_featured` sur `is_featured` where true ;
- **1 image principale par produit** : index unique partiel sur `is_main` ;
- **Historique des commandes indestructible** : `order_items.product_id` volontairement
  sans clé étrangère (les snapshots nom/prix/image survivent aux suppressions de produits) ;
- Suppressions en CASCADE (tailles, images, thèmes partent avec le produit — vérifié) ;
- **RLS activée sur les 9 tables, zéro policy publique** : rien n'est exposé ;
  seul le serveur Next.js accède à la base avec la clé service_role (serveur uniquement) ;
- **Storage** : bucket public `produits` pour les images (créé par le schéma, uploads testés).

### Architecture de persistance (double pilote commutable)
- Nouvelle couche `src/lib/server/persistence` : le store mémoire reste la couche de
  lecture synchrone du site, et **chaque mutation est écrite dans la source de vérité** ;
- `DATA_PROVIDER=mock` → fichier JSON local (`.data/db.json`, démonstration durable) ;
  `DATA_PROVIDER=supabase` → les 9 tables (**actif**) ;
- Écritures **différées (300 ms) et sérialisées**, marqueurs « sales » par domaine
  (produits / commandes / paramètres / messages) avec ciblage par identifiant ;
- **État partagé via `globalThis`** (instrumentation, routes et pages sont compilés dans
  des graphes séparés par Next.js) — une seule instance garantie ;
- **Amorçage automatique** : projet vierge → le catalogue de démonstration s'y téléverse
  seul (8 maillots, 40 tailles, 8 images, 8 thèmes, paramètres, RDC en avant — fait) ;
  projet existant → rechargement intégral au démarrage (« données existantes chargées ») ;
- Chargement au démarrage du serveur via `instrumentation.ts` (hook Next 14) + flush
  à la réception de SIGTERM/SIGINT.

### Authentification administrateur (Supabase Auth)
- Compte réel créé : **admin@diaoshop.demo / diaoshop-2026** (modifiable dans
  Authentication → Users), email confirmé ;
- Rôle **admin** attribué dans `public.profiles` (premier admin promu, comme prévu au plan) ;
- La connexion du back-office passe par `signInWithPassword` + **vérification du rôle** :
  tout compte Auth sans rôle admin/staff est refusé (403) ;
- Sécurité renforcée : la vérification du rôle s'effectue par appel direct portant la clé
  service (jamais le jeton utilisateur — sous lequel la RLS masque légitimement les lignes) ;
- Le mode démonstration (.env.local) reste disponible en repli (même interface de session).

### Images (Supabase Storage)
- L'upload du back-office bascule automatiquement sur Storage (`DATA_PROVIDER=supabase`) :
  bucket `produits`, nom aléatoire, URL **publique** renvoyée et utilisable par la boutique ;
- Validations identiques au mode démo (JPEG/PNG/WebP, 5 Mo max).

### Robustesse générale
- Pages publiques et back-office lisent désormais la donnée **persistante** : une commande
  passée ou un produit créé survit aux redémarrages (testé deux fois) ;
- Décrément de stock passé par le store (persisté par produit) ;
- Correctif d'architecture : `CartView` (client) ne consultaient plus le repository
  serveur directement — la page panier lui passe les produits en props (zéro `fs` côté
  navigateur) ;
- `next.config.mjs` : hook d'instrumentation activé + stubs `fs/path` pour le bundle Edge
  (le code serveur ne s'y exécute jamais).

## 2. Fichiers créés

- `supabase/schema.sql` — schéma complet (9 tables, RLS, index uniques, bucket Storage,
  requête de promotion du premier admin) ;
- `src/lib/server/persistence/index.ts` — file d'écriture différée, choix du pilote, init ;
- `src/lib/server/persistence/types.ts` — `Snapshot`, `Kind`, contrat `Driver` ;
- `src/lib/server/persistence/jsonDriver.ts` — pilote JSON local (écriture atomique) ;
- `src/lib/server/persistence/supabaseDriver.ts` — pilote Supabase (lecture 8 tables →
  snapshot ; écriture upserts produits/tailles/images/thèmes/commandes/paramètres/messages) ;
- `src/instrumentation.ts` — chargement de l'état au démarrage + flush à l'arrêt ;
- `docs/GUIDE_CREATION_SUPABASE.md` — guide pas-à-pas de création du projet et des clés.

## 3. Fichiers modifiés

- `src/lib/admin/store.ts` — état dans `globalThis`, export/restauration du snapshot,
  `marquerSale` sur chaque mutation, décrément de stock persistant ;
- `src/app/api/admin/login/route.ts` — branche Supabase Auth (rôle via fetch service) ;
- `src/app/api/admin/upload/route.ts` — branche Storage ;
- `src/lib/data/orderRepository.ts` — décrément de stock via le store ;
- `src/components/panier/CartView.tsx` + `src/app/panier/page.tsx` — produits passés en props ;
- `next.config.mjs` — `instrumentationHook` + fallbacks Edge ;
- `.env.local` / `.env.example` — `DATA_PROVIDER=supabase`, `SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY` (jamais exposés côté client) ;
- `package.json` — `@supabase/supabase-js` ajouté.

## 4. Tests effectués

**Base de données**
- 9/9 tables accessibles via l'API (200) ; bucket Storage présent ;
- Amorçage automatique du catalogue : **8 produits, 40 tailles, 8 images (1 principale
  chacune), 8 thèmes (RDC accent #F5B62E), paramètres, RDC en avant** écrits dans Supabase ;

**Écritures réelles (vérifiées par lecture directe de la base)**
- Produit créé via l'admin → ligne dans `products` (+ tailles/images/thèmes selon saisie) ;
- Commande passée → `orders` (DS-AHMT8X, 26 000) + `order_items` (snapshot RDC L ×1) +
  **stock L décrémenté à 11** persisté ;
- Message contact → `contact_messages` ; thème modifié → `product_themes` ;
  slogan → `shop_settings.data` ;
- Upload → Storage : objet créé, **URL publique accessible (200 image/png)** ;
- Suppressions via l'API admin → lignes disparues, CASCADE vérifiée (40 tailles retours) ;

**Persistance après redémarrage (le test décisif)**
- Serveur arrêté/relancé → « données existantes chargées (9 produits, 1 commandes) » :
  produit de test visible en boutique, commande dans l'admin, stock conservé ;
- État remis à neuf ensuite : 8 produits, 0 commande, 0 message, RDC en avant (re-vérifié
  après un nouveau redémarrage) ;

**Authentification**
- Connexion back-office via Supabase Auth : OK, stable sur re-logins répétés ;
- Déconnexion → /admin re-protégée ; parcours footer → login → dashboard en navigateur
  (capture `capture_phase8_dashboard_supabase.png`) ;
- Zéro débordement 320 px re-vérifié (login, accueil, boutique).

**Qualité** : TypeScript sans erreur, `next build` ✓ (31 pages), serveur de production relancé.

## 5. Problèmes rencontrés (et résolus)

1. **`fs` dans le bundle navigateur** : `CartView` (client) importait le repository serveur —
   toléré avant la persistance, interdit avec `fs`. Résolu par props depuis la page panier ;
2. **État dupliqué entre graphes Next** (instrumentation vs routes) : le pilote et le store
   vivaient en instances séparées → écritures perdues. Résolu par un état sur `globalThis` ;
3. **Compilation Edge d'instrumentation** : `fs/promises` introuvable → stubs webpack pour
   le runtime edge uniquement ;
4. **403 connexion (RLS)** : après `signInWithPassword`, le client supabase-js adopte le
   jeton utilisateur ; la vérification du rôle partait donc sous l'identité « authenticated »
   (RLS sans policy → tableau vide, sans erreur). Résolu : vérification du rôle par fetch
   brut portant la clé service ;
5. **Bash `UID`** (variable readonly) : la première tentative d'insertion du profil visait
   l'uuid « 1000 » — corrigée avec un autre nom de variable ;
6. **Latence d'écriture différée (300 ms)** : une lecture de contrôle trop précoce donnait
   l'impression d'un échec — comportement attendu de la file sérialisée (aucune perte).

## 6. Informations nécessaires

- **Modifier le mot de passe admin** quand vous le souhaitez : Supabase → Authentication →
  Users → `admin@diaoshop.demo` → les identifiants actuels restent ceux du cahier des
  charges de démonstration ;
- **Sécurité recommandée** : la clé `service_role` est passée dans le chat — après la phase
  de tests, générez-en une nouvelle (Settings → API → Rotate) et collez-la-moi (30 s) ;
- Textes « À propos »/« Contact », coordonnées réelles, frais de livraison : saisissables
  dans le back-office (Paramètres) — désormais **définitivement sauvegardés** ;
- (Non bloquant) Le site reste hébergé en local : le déploiement (Vercel ou équivalent)
  pourra se faire avec ces mêmes variables d'environnement.

## 7. Prochaine phase

**Phase 9 — Animations, performances, SEO** : polish des transitions (fidélité affiches,
`prefers-reduced-motion`), audit Lighthouse mobile, lazy-loading ciblé, métadonnées SEO
(titres/descriptions par page, Open Graph, sitemap, robots), accessibilité AA finale.

## 8. Autorisation

**Autorises-tu le démarrage de la prochaine phase ?**
