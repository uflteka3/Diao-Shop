# GUIDE — Créer votre projet Supabase (≈ 3 minutes, gratuit)

Supabase = la base de données hébergée qui rendra vos données **définitivement persistantes**
(produits, thèmes, commandes, paramètres, messages) et hébergera les images uploadées.

---

## 1. Créer le compte et le projet

1. Ouvrez **https://supabase.com** → bouton **Start your project** (ou Sign in).
2. Connectez-vous avec **GitHub** ou un email.
3. Cliquez **New project** :
   - **Name** : `diao-shop`
   - **Database Password** : cliquez **Generate a password** et **sauvegardez-le** (il servira
     seulement si vous voulez que j'applique le schéma SQL moi-même — voir §3) ;
   - **Region** : `West EU (London)` ou la plus proche de Paris ;
   - **Plan** : Free (aucune carte bancaire requise).
4. Patientez ~2 minutes pendant l'approvisionnement.

## 2. Récupérer les clés

Menu **⚙ Settings → API** (ou Settings → Data API selon la version du tableau de bord) :

| À copier | Nom dans le tableau de bord | Variable pour `.env.local` |
|---|---|---|
| Adresse du projet | **Project URL** (`https://xxxx.supabase.co`) | `SUPABASE_URL` |
| Clé « serveur » | **service_role** (ou *Secret key* `sb_secret_…`) — cliquez Reveal | `SUPABASE_SERVICE_ROLE_KEY` |
| (option) Clé publique | **anon public** (ou *Publishable key*) | `SUPABASE_ANON_KEY` |

⚠️ **La clé `service_role` donne un accès total** : elle reste côté serveur uniquement
(dans `.env.local` / variables d'hébergement), **jamais** dans le navigateur ni dans un dépôt Git.

## 3. Me transmettre les clés

Collez simplement dans le chat :

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ… (ou sb_secret_…)
SUPABASE_ANON_KEY=eyJ… (facultatif)
SUPABASE_DB_PASSWORD=… (facultatif, voir ci-dessous)
```

- **Avec `SUPABASE_DB_PASSWORD`** : j'applique moi-même le schéma SQL (9 tables + sécurité) automatiquement.
- **Sans** : je vous fournis `supabase/schema.sql` prêt à coller dans **SQL Editor → New query → Run** (30 secondes, guidé).

🔒 Après la période de démo, vous pourrez **régénérer les clés** (Settings → API) sans effet sur les données.

## 4. Créer le premier administrateur (après branchement)

Quand les clés seront branchées, je vous guiderai pour : créer l'utilisateur admin
(Authentication → Add user), puis exécuter 1 ligne SQL qui lui donne le rôle « admin ».
En attendant, la connexion démo (`admin@diaoshop.demo`) continue de fonctionner.

---

**En résumé** : créez le projet, copiez Project URL + service_role, collez-les dans le chat.
Je m'occupe du reste (schéma, migration du catalogue démo, branchement, tests).
