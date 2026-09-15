# DIAO SHOP — PHASE 2 : ARCHITECTURE TECHNIQUE

**Projet :** Diao Shop — Boutique e-commerce premium de maillots de football
**Phase :** 2 / 10 — Architecture technique
**Date :** 15 septembre 2026
**Nature :** Document d'architecture — aucun développement applicatif (conformément au protocole)
**Statut :** Livré — en attente de validation client

---

## 0. Décisions validées en Phase 1 (enregistrées le 15/09/2026)

| # | Décision | Valeur retenue |
|---|---|---|
| 1 | Devise par défaut | **FCFA (XOF)** — champ administrable |
| 2 | Thème du maillot RDC en démo | **Orange/or comme l'affiche principale** (variante bleue disponible via back-office) |
| 3 | Libellé navigation catalogue | **« Boutique »** |
| 4 | Produits de démonstration | **6 maillots** : RDC (mis en avant), FC Barcelona, Arsenal, Manchester City, Reims, Stade Rennais — tous marqués DONNÉES DE DÉMONSTRATION À REMPLACER |
| 5 | Interprétation notée | « Fait comme dans les affiches » = fidélité stricte aux affiches fournies |

---

## 1. Stack technique détaillée et justifications

| Technologie | Rôle | Justification |
|---|---|---|
| **Next.js (App Router)** | Framework full-stack | Rendu serveur (SEO, première visite rapide sur réseau mobile faible), routage par fichiers, `next/image` pour l'optimisation des images, Server Components + Server Actions |
| **React** | UI | Imposé par le cahier des charges |
| **TypeScript (strict)** | Typage | Imposé ; réduit les erreurs, code maintenable |
| **Tailwind CSS** | Styles | Imposé ; tokens de design centralisés, cohérence avec le moteur de thèmes (variables CSS) |
| **Supabase** | Backend (PostgreSQL, Auth, Storage, RLS) | Imposé ; option « cloud » activée en Phase 8, simulation locale d'ici là (§3) |
| **Framer Motion** | Animations | Déclaratif et intégré React, `AnimatePresence` pour les transitions de produit, `useReducedMotion` natif pour `prefers-reduced-motion`. Les transitions de **couleurs** restent en CSS (plus performant que du tween JS). GSAP écarté : aucun besoin de timeline complexe au scroll, dépendance plus lourde |
| **Zod** | Validation | Schémas partagés client + serveur (formulaires produit, commande, contact, paramètres) |
| **React Hook Form** | Formulaires | Formulaires checkout et admin (performances, erreurs par champ, `@hookform/resolvers` + Zod) |
| **@supabase/supabase-js + @supabase/ssr** | Client Supabase | Sessions par cookies compatibles App Router |
| **lucide-react** | Icônes UI | Bibliothèque cohérente, tree-shakeable. Les icônes de marques (Instagram, Facebook, TikTok, YouTube) et la couronne du logo seront des **SVG inline** maison pour coller exactement aux affiches |
| **next/font/local** | Typographies | Polices **auto-hébergées** : build hors-ligne possible, pas de dépendance réseau, performance et confidentialité |
| React Context + useReducer | État panier/favoris | Suffisant ; aucune dépendance d'état supplémentaire (rule : pas de dépendance inutile) |
| Dictionnaire `lib/i18n/fr.ts` | Préparation multilingue | Toutes les chaînes centralisées sans dépendance i18n → anglais ajoutable plus tard sans refonte |

**Écartements explicites :** pas de Redux, pas de GSAP, pas de bibliothèque i18n, pas de SDK de paiement (architecture configurable uniquement), pas de framework de tests unitaires en V1 (tests fonctionnels manuels protocolés — Phase 10).

---

## 2. Stratégie générale : double fournisseur de données

Conformément à l'Option B validée en Phase 1 (clés Supabase non encore fournies) :

```
UI (pages, composants)
        │
Repositories (interfaces TypeScript)
   ProductRepository · OrderRepository · SettingsRepository
        │
        ├── MockProvider   → données de démonstration locales (Phases 3 à 7)
        │                    fichiers seed/ marqués « DONNÉES DE DÉMONSTRATION »
        └── SupabaseProvider → base réelle (Phase 8)
```

- Sélection via variable d'environnement `DATA_PROVIDER=mock|supabase` ;
- **Aucun composant ne connaît la source** : la bascule Phase 8 ne réécrit rien ;
- La simulation locale permet aussi l'aperçu dans l'environnement de travail (sans réseau externe) ;
- Panier et favoris : 100 % côté client (localStorage) dans les deux cas.

---

## 3. Structure des dossiers

```
diao-shop/
├── docs/                              # Livrables des phases
├── database/                          # Phase 8 : SQL Supabase
│   ├── 01_schema.sql                  # Tables + contraintes + index
│   ├── 02_policies.sql                # RLS
│   ├── 03_storage.sql                 # Buckets + policies Storage
│   └── seed-demo.sql                  # Jeu de démonstration marqué
├── public/
│   ├── fonts/                         # Polices auto-hébergées
│   ├── images/
│   │   ├── brand/                     # Logo (SVG couronne + favicon)
│   │   └── demo/                      # Placeholders produits marqués DÉMO
├── seed/                              # Données de démo JSON (MockProvider)
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Racine : langue fr, polices, providers
│   │   ├── globals.css                # Tokens + variables CSS de thème
│   │   ├── page.tsx                   # Accueil (hero produit mis en avant)
│   │   ├── boutique/page.tsx          # Catalogue (filtres via URL)
│   │   ├── produit/[slug]/page.tsx    # Fiche produit
│   │   ├── panier/page.tsx
│   │   ├── commande/page.tsx          # Checkout
│   │   ├── commande/confirmation/[numero]/page.tsx
│   │   ├── favoris/page.tsx
│   │   ├── a-propos/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx             # Shell admin + garde d'accès
│   │   │   ├── login/page.tsx
│   │   │   ├── page.tsx               # Dashboard
│   │   │   ├── produits/…             # Liste / nouveau / édition
│   │   │   ├── commandes/…            # Liste / détail
│   │   │   ├── themes/page.tsx        # Éditeur de thèmes + aperçu
│   │   │   ├── mise-en-avant/page.tsx # Sélection du maillot principal
│   │   │   └── parametres/page.tsx
│   │   ├── api/
│   │   │   ├── commandes/route.ts     # Création commande (validation stock serveur)
│   │   │   └── contact/route.ts
│   │   ├── error.tsx / not-found.tsx  # (à chaque segment majeur)
│   │   ├── sitemap.ts / robots.ts     # Phase 9
│   ├── components/
│   │   ├── ui/                        # Button, Badge, Input, Select, Modal, Toast, Skeleton, EmptyState, ErrorState, ColorPicker…
│   │   ├── layout/                    # SiteHeader, FloatingNav, CartBadge, MobileMenu, SiteFooter, SocialIcons
│   │   ├── home/                      # HeroCard, ProductStage, ProductInfoPanel, PricePanel, SizeSelector, TrustBadges, ThumbnailStrip, NextProductCard, SloganBar
│   │   ├── catalogue/                 # FiltersBar, SortSelect, ProductCard, Pagination
│   │   ├── produit/                   # Gallery, SimilarProducts, AddToCartBar
│   │   ├── panier/ checkout/
│   │   └── admin/                     # ProductForm, ImageUploader, ThemeEditor (+ LivePreview), FeaturedSelector, OrdersTable, SettingsForm, StatCard
│   ├── contexts/                      # CartContext, FavoritesContext
│   ├── hooks/                         # useCart, useFavorites, useProductTheme, useMediaQuery…
│   ├── lib/
│   │   ├── supabase/                  # client.ts (anon), server.ts, admin.ts (service_role — serveur uniquement)
│   │   ├── data/                      # types.ts, repositories/, mock/, supabase/
│   │   ├── themes/                    # resolveTheme.ts, fallbackTheme.ts, cssVariables.ts
│   │   ├── validation/                # schemas Zod (produit, taille, commande, contact, paramètres)
│   │   ├── i18n/fr.ts                 # Chaînes FR centralisées
│   │   └── utils/                     # formatPrix(XOF), slugify, cn, generateOrderNumber…
│   ├── server/                        # actions/ (Server Actions admin), orders.ts (logique commande)
│   └── types/
├── .env.example
└── middleware.ts                      # Garde de routes /admin
```

---

## 4. Architecture frontend

### 4.1 Rendu

| Page | Stratégie | Motif |
|---|---|---|
| Accueil | Server Component (produits publiés + thèmes) → Client Component interactif | HTML complet pour le SEO ; changement de produit/thème instantané côté client, **sans rechargement** |
| Catalogue | Server Component + filtres en paramètres d'URL | Partageable, SEO, état de retour |
| Fiche produit | Server Component (génèreStaticParams possible Phase 9) | SEO produit |
| Panier / Favoris | Client (localStorage) | Aucun compte client requis |
| Checkout | Client + Server Action/API | Validation serveur obligatoire (stock) |
| Admin | Client lourd + Server Actions | Application de gestion derrière authentification |

### 4.2 Moteur de thèmes dynamiques (cœur du projet)

1. `product_themes` → objet `ProductTheme` normalisé (typé) ;
2. `resolveTheme()` : thème produit **ou** thème de secours (constante + surcharge future via `shop_settings`) ;
3. `cssVariables.ts` mappe le thème vers des variables CSS sur le conteneur :
   `--ds-bg`, `--ds-surface`, `--ds-primary`, `--ds-secondary`, `--ds-accent`, `--ds-text`, `--ds-muted`, `--ds-button`, `--ds-glow`, `--ds-glow-intensity`, `--ds-gradient`, `--ds-border` + classe de mode `theme-light` / `theme-dark` ;
4. Tous les composants consomment **exclusivement** ces variables → aucune couleur codée en dur, aucune condition sur le nom du produit ;
5. Transitions de couleurs : `transition` CSS globales (300–500 ms, `background-color`, `color`, `border-color`, `box-shadow`) → fondu fluide **sans flash blanc** (le thème initial est rendu en SSR avec le produit mis en avant) ;
6. Changement d'image/contenu : Framer Motion (`AnimatePresence`, fondu + léger scale), désactivé sous `prefers-reduced-motion` ;
7. Contraste : utilitaire de ratio (Phase 3) utilisé dans l'éditeur admin pour alerter si texte/fond insuffisant.

### 4.3 Panier et favoris

- **Panier** : `CartContext` + `useReducer` ; clé d'article = `productId + taille` ; actions : ajouter, modifier quantité (limitée au stock connu), supprimer, vider ; persistance localStorage (`diaoshop.cart.v1`) ; totaux calculés via utilitaires partagés avec le serveur (même fonction → même résultat) ;
- **Favoris** : `FavoritesContext` + localStorage (`diaoshop.favorites.v1`) — persistance locale par défaut (point §9 à confirmer) ;
- Ajout au panier : feedback visuel (badge animé + toast), taille obligatoire si le produit en a.

### 4.4 Gestion d'état des erreurs et états UI

- États systématiques : `loading` (skeletons), `empty`, `error` (compréhensible en français), `success` (confirmations) ;
- `error.tsx` par segment, `not-found.tsx` global, garde-fous image (placeholder si absente/cassée) ;
- Erreurs typées côté serveur (`DataError`, `ValidationError`, `AuthError`, `StorageError`) → réponse API `{ erreur: { code, message } }` ; détails techniques uniquement dans les logs serveur.

---

## 5. Architecture backend

### 5.1 Répartition des responsabilités

| Besoin | Mécanisme |
|---|---|
| Lectures publiques (produits, thèmes, paramètres) | Server Components → Repository (clé `anon` + RLS « publié ») |
| Création de commande | `POST /api/commandes` (serveur, client `service_role`) : validation Zod, **vérification et décrément du stock en transaction**, calcul serveur des totaux, génération du numéro |
| Formulaire de contact | `POST /api/contact` (serveur) : validation + anti-spam basique (honeypot + limite de débit) |
| Mutations admin (produits, images, thèmes, statuts, paramètres) | **Server Actions** : chaque action revalide la session + le rôle admin côté serveur avant toute écriture |

### 5.2 Logique commande (Phase 6, spécifiée dès maintenant)

1. Réception du panier + infos client → validation Zod serveur ;
2. Relecture des prix/stocks **depuis la base** (jamais depuis le client) ;
3. Vérification `stock ≥ quantité` pour chaque ligne → refus explicite sinon ;
4. Décrément du stock en transaction ; calcul `subtotal + delivery_fee = total` côté serveur ;
5. Insertion `orders` + `order_items` avec **snapshots** (nom, image, prix unitaire figés) ;
6. Numéro de commande `DS-XXXXXX` ; retour → page de confirmation publique (numero seul, aucune donnée personnelle exposée).

---

## 6. Modèle de données final (PostgreSQL)

> Fusion fidèle du cahier des charges (§7) et du prompt maître (§11) — aucun champ requis n'est supprimé. Détails SQL livrés en Phase 8.

### products
`id uuid pk` · `name text not null` · `slug text unique not null` · `short_description text` · `description text` · `team text` · `season text` · `category text` · `price numeric(12,2) not null check (price >= 0)` · `compare_at_price numeric(12,2) null` · `currency text not null default 'XOF'` · `published boolean default false` · `is_featured boolean default false` · `created_at` · `updated_at`

**Garantie « un seul mis en avant » au niveau base :** index unique partiel — `CREATE UNIQUE INDEX products_one_featured ON products ((1)) WHERE is_featured;`

### product_images
`id uuid pk` · `product_id fk → products on delete cascade` · `storage_path text` · `public_url text` · `alt_text text` · `sort_order int` · `is_primary boolean` · `created_at`
Unique partiel : une seule image principale par produit.

### product_sizes  (couvre `product_sizes` du cahier et `product_variants` du prompt maître)
`id uuid pk` · `product_id fk cascade` · `size text not null` · `stock int not null default 0 check (stock >= 0)` · `price_override numeric(12,2) null` · `active boolean default true` · `sort_order int` · `created_at` · `updated_at`
Unique `(product_id, size)`. **Disponibilité = `active AND stock > 0`** (couvre le champ `is_available` du cahier des charges sans doublon). Prix spécifique par taille possible (`price_override`).

### product_themes  (1-1 avec products)
`id uuid pk` · `product_id fk unique` · `background_color` · `primary_color` · `secondary_color` · `accent_color` · `surface_color` · `text_color` · `muted_text_color` · `button_color` · `glow_color` · `glow_intensity numeric default 0.5` · `gradient text` (ex. `linear-gradient(...)`) · `border_color` · `appearance_mode text check in ('light','dark')` · `created_at` · `updated_at`
→ Couvre intégralement les 9 variables du cahier des charges **et** les extensions du prompt maître (bouton, gradient, intensité du glow, bordures).

### orders
`id uuid pk` · `order_number text unique` (`DS-XXXXXX`) · `customer_name` · `phone` · `whatsapp null` · `email null` · `address` · `city` · `delivery_zone null` · `delivery_method null` · `payment_method null` · `notes null` · `subtotal numeric` · `delivery_fee numeric default 0` · `total numeric` · `status text check in ('nouvelle','confirmee','en_preparation','expediee','livree','annulee','remboursee') default 'nouvelle'` · `created_at` · `updated_at`

### order_items  (snapshots immuables)
`id uuid pk` · `order_id fk cascade` · `product_id fk null on delete set null` · `product_name_snapshot` · `product_image_snapshot null` · `size` · `quantity int check (> 0)` · `unit_price_snapshot numeric` · `total_price numeric` · `created_at`
→ Les données de la commande restent correctes même si le produit est modifié ou supprimé ensuite.

### profiles
`id uuid pk → auth.users on delete cascade` · `email` · `full_name` · `role text check in ('admin','staff') default 'staff'` · `created_at` · `updated_at`
Création automatique par trigger à l'inscription ; le premier admin est promu via SQL (procédure documentée).

### shop_settings  (ligne unique)
`id` · `shop_name` · `slogan` · `logo_path` · `phone` · `whatsapp` · `email` · `address` · `social_links jsonb` · `currency default 'XOF'` · `delivery_settings jsonb` (zones, frais, méthodes) · `payment_settings jsonb` (méthodes activées + instructions — **rien d'activé par défaut**) · `about_text` · `contact_text` · `order_message` · `legal_texts jsonb` (CGV, confidentialité) · `updated_at`

**Point ouvert à valider avant Phase 6/7 :** stockage des messages du formulaire de contact — (a) nouvelle table `contact_messages` visible dans l'admin, ou (b) envoi vers l'email/WhatsApp configuré, ou (c) les deux. Je ne décide pas seul.

---

## 7. Stratégie d'authentification

1. **Supabase Auth** (email + mot de passe) ; sessions par **cookies** via `@supabase/ssr` (compatibles App Router/SSR) ;
2. `middleware.ts` : toute requête `/admin/*` (hors `/admin/login`) exige une session valide **et** `profiles.role = 'admin'` — sinon redirection `/admin/login` ;
3. Double vérification **dans chaque Server Action admin** (le middleware seul ne suffit pas) ;
4. Aucune inscription publique : le site client n'expose aucun compte ; le premier administrateur est créé manuellement dans Supabase puis promu `role='admin'` par SQL (guide pas-à-pas en Phase 8/10) ;
5. Réinitialisation du mot de passe : e-mail Supabase Auth si SMTP configuré, sinon procédure manuelle documentée ;
6. Déconnexion = purge des cookies de session ; erreurs d'auth → messages français génériques (pas de détail technique) ;
7. Clé `service_role` : **uniquement** côté serveur (routes API, Server Actions), jamais préfixée `NEXT_PUBLIC_`.

---

## 8. Stratégie Storage (Supabase Storage)

| Bucket | Accès | Contenu | Arborescence |
|---|---|---|---|
| `products` | lecture publique, écriture admin | Photos des maillots | `products/{product_id}/{sort}-{timestamp}.{ext}` |
| `branding` | lecture publique, écriture admin | Logo de la boutique | `branding/logo.{ext}` |

- Upload **via le serveur** (Server Action, client `service_role`) après validation : formats jpg/png/webp, taille max ≈ 5 Mo, contrôle du MIME réel, alt text recommandé ;
- Suppression d'image = suppression Storage + nettoyage de la ligne ; remplacement atomique ;
- URL publiques enregistrées dans `product_images.public_url` (+ `storage_path` pour la gestion) ; domaine Storage ajouté à `next.config` pour `next/image` ;
- Recommandation client : **PNG détourés** pour l'effet « flottant » des affiches ; affichage sans déformation (`object-contain`), placeholder local marqué DÉMO si image absente ;
- En mode `mock` : images locales `public/images/demo/`.

---

## 9. Stratégie RLS (résumé — SQL complet en Phase 8)

| Table | anon (public) | admin authentifié |
|---|---|---|
| products | SELECT `published = true` | SELECT / INSERT / UPDATE / DELETE |
| product_images, product_sizes, product_themes | SELECT si produit parent publié | écriture complète |
| orders, order_items | **aucun accès direct** (création uniquement via route serveur `service_role`) | SELECT / UPDATE (statut) |
| profiles | ses propres lignes uniquement | SELECT de tous |
| shop_settings | SELECT (contenu public) | UPDATE |
| Storage objects | lecture publique des 2 buckets | écriture admin |

- Fonction utilitaire `is_admin()` (`SECURITY DEFINER`) pour les policies ;
- RLS activée sur **toutes** les tables, y compris `storage.objects` ;
- La protection des commandes est double : RLS (lecture admin) + création uniquement côté serveur (anti-falsification des prix/stocks).

---

## 10. Variables d'environnement (`.env.example` livré dès la Phase 3)

```
DATA_PROVIDER=mock|supabase          # mock par défaut jusqu'en Phase 8
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=            # (Phase 8)
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # (Phase 8)
SUPABASE_SERVICE_ROLE_KEY=           # (Phase 8, serveur uniquement)
```
Aucun secret côté frontend ; les valeurs de démo ne contiennent aucune donnée réelle.

---

## 11. Points ouverts — RÉSOLUTIONS (15/09/2026)

1. **Messages de contact** — ✅ Résolu : **les deux**. Ajout d'une table `contact_messages` (consultable dans l'admin : nom, email, téléphone, message, statut lu/traité) **+** envoi optionnel vers l'email et/ou lien WhatsApp selon la configuration admin. L'envoi email nécessitera une configuration SMTP (Phase 7/8, documentée) ; la table fonctionne sans dépendance.
2. **Favoris** — ✅ Résolu : **persistance locale (localStorage)** en V1, sans compte client. Architecture prête pour une évolution ultérieure.
3. **Prix de démonstration** — Valeurs FCFA placeholder marquées DÉMO (ex. 15 000 / 25 000 FCFA) en attendant les vrais tarifs de l'administrateur.
4. **« Acheter maintenant »** — Retenu par défaut (fiche produit → checkout direct, taille obligatoire) ; à confirmer en Phase 5.

> Le modèle de données compte donc **9 tables** (les 8 initiales + `contact_messages`), spécifiée en Phase 7.

---

## 12. Impact sur les phases suivantes

- **Phase 3** : tokens du design system = les variables `--ds-*` définies ici ; typographies auto-hébergées à choisir ; contrôle de contraste ;
- **Phases 4-7** : développement sur MockProvider, interfaces identiques à Supabase ;
- **Phase 8** : exécution du SQL (schema, policies, storage), SupabaseProvider, création du premier admin, tests de sécurité RLS ;
- **Phase 10** : guides (installation, configuration, déploiement Vercel + Supabase, back-office).
