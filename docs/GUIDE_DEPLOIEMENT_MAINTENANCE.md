# GUIDE DE DÉPLOIEMENT & MAINTENANCE — Diao Shop

Tout ce qu'il faut savoir pour mettre la boutique en ligne et l'entretenir.

---

## 1. Ce qui est en place

| Composant | État |
|---|---|
| Application | Next.js 14 (App Router), React, TypeScript, Tailwind — build de production ✓ |
| Base de données | **Supabase** — 9 tables (RLS active), images dans Storage (bucket `produits`) |
| Authentification admin | Supabase Auth + table `profiles` (rôle `admin`) |
| Persistance | `DATA_PROVIDER=supabase` dans `.env.local` (repli démo : `mock` → `.data/db.json`) |
| SEO | sitemap.xml + robots.txt dynamiques, JSON-LD, Open Graph/Twitter, canoniques |

## 2. Variables d'environnement (`.env.local`)

```bash
DATA_PROVIDER=supabase
NEXT_PUBLIC_SITE_URL=https://VOTRE-DOMAINE.com     # ← domaine réel à la mise en ligne
ADMIN_EMAIL=…            # connexion de secours (mode mock uniquement)
ADMIN_PASSWORD=…         # idem
ADMIN_SESSION_SECRET=…   # longue chaîne aléatoire — à changer en production
SUPABASE_URL=https://suwfudcyorymufzfxxgs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_…    # SERVEUR UNIQUEMENT, jamais côté navigateur
```

⚠️ `NEXT_PUBLIC_SITE_URL` pilote les URLs canoniques, Open Graph, sitemap et robots :
indispensable à la mise en ligne.

## 3. Mettre en ligne (Vercel ou équivalent)

1. Poussez le code sur un dépôt Git (le dossier `diao-shop/` — sans `.env.local`,
   déjà exclu par `.gitignore`) ;
2. Sur Vercel : « Import Project » → répertoire `diao-shop` → framework Next.js détecté ;
3. Ajoutez les **variables d'environnement** ci-dessus (Settings → Environment Variables) ;
4. Déployez, puis vérifiez : accueil, une fiche, `/admin/login`, `/sitemap.xml` ;
5. Supabase : autorisez le domaine du site si un jour vous activez des accès client
   (Authentication → URL Configuration) — inutile aujourd'hui, tout passe par le serveur.

## 4. Sécurité — à faire après mise en ligne

1. **Mot de passe admin** : Supabase → Authentication → Users → `admin@diaoshop.demo`
   → modifier le mot de passe (il a servi pendant les démonstrations) ;
2. **Rotation de la clé `service_role`** : Settings → API → Rotate keys (elle a circulé
   dans les échanges) → mettez à jour `SUPABASE_SERVICE_ROLE_KEY` sur l'hébergement ;
3. `ADMIN_SESSION_SECRET` : générez une longue chaîne aléatoire (32+ caractères) ;
4. Vérifiez que `.env.local` n'est jamais versionné (déjà le cas).

## 5. Comptes supplémentaires

1. Supabase → Authentication → Users → **Add user** (email + mot de passe, « Auto Confirm ») ;
2. SQL Editor :
```sql
insert into public.profiles (id, email, role)
  select u.id, u.email, 'admin'   -- ou 'staff' pour un accès limité à l'avenir
  from auth.users u where u.email = 'nouveau@exemple.com'
  on conflict (id) do update set role = 'admin';
```

## 6. Sauvegardes & maintenance

- **Sauvegarde manuelle** : Supabase → Database → Backups (plan payant) ou export SQL
  via `pg_dump` (chaîne de connexion dans Database → Connection string) ;
- **Sauvegarde minimale gratuite** : SQL Editor →
  `select * from products;` etc. → export CSV (produits, orders, shop_settings) ;
- **Storage** : les images sont dans le bucket `produits` — exportables via le tableau
  de bord ;
- **Mise à jour des dépendances** : `npm outdated` puis `npm update` — refaire tourner la
  recette (`/docs` du projet) avant de redéployer ;
- **Surveillance** : Supabase → Reports (charge, erreurs) ; logs de l'hébergeur côté app.

## 7. Revenir au mode démonstration local

Dans `.env.local`, mettre `DATA_PROVIDER=mock` : la boutique tourne alors sur le fichier
local `.data/db.json` (créé au premier démarrage). Repasser à `supabase` pour retrouver
les données réelles. **Ne jamais mélanger** les deux sans intention.

## 8. Structure du projet (référence rapide)

```
diao-shop/
├── src/app/                  # pages (site + /admin + /api)
├── src/components/           # composants (accueil, catalogue, panier, admin…)
├── src/lib/
│   ├── admin/                # session, garde, store (cœur du back-office)
│   ├── data/                 # types, repositories, données de démonstration
│   ├── server/persistence/   # pilotes JSON/Supabase (source de vérité)
│   └── themes/               # moteur de thèmes (couleurs = données)
├── supabase/schema.sql       # schéma complet de la base
├── docs/                     # rapports de phases et guides
└── public/images/            # images produits + marque
```

## 9. Recette de vérification après tout changement important

1. Accueil : héros + carrousel + changement de thème ✓
2. Boutique : 8+ produits, recherche/filtres ✓
3. Fiche : taille obligatoire, ajout panier, « Acheter maintenant » ✓
4. Checkout : commande créée, confirmation avec numéro `DS-XXXXXX` ✓
5. Admin : connexion, produit créé→publié, mise en avant unique, statut commande ✓
6. Redémarrer le serveur : tout est toujours là ✓
