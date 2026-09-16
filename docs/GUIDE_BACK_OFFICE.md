# GUIDE DU BACK-OFFICE — Diao Shop

Guide d'utilisation de votre boutique, section par section. Aucune compétence technique
n'est nécessaire : tout se fait à la souris depuis le back-office.

---

## 1. Se connecter

1. Ouvrez la boutique ;
2. En haut à gauche, **cliquez 3 fois de suite (rapidement) sur la couronne 👑** à
   gauche du logo « Diao shop » — un ou deux clics ne font rien, c'est voulu pour
   garder l'accès discret ;
3. Saisissez votre email et votre mot de passe d'administrateur, puis **Se connecter**.

> 🔒 Email administrateur : **uflteka3@gmail.com** (mot de passe défini par vos soins).
> La session reste active 12 h sur votre navigateur. En bas du menu : **Se déconnecter**.
>
> **Mot de passe oublié ?** Cliquez « Mot de passe oublié ? » sous le formulaire de
> connexion : un email vous est envoyé avec un lien pour définir un nouveau mot de
> passe (lien à usage unique, valable une heure). Pensez aux spams.

---

## 2. Tableau de bord

Dès la connexion : vue d'ensemble avec le **maillot principal** de la page d'accueil, les
statistiques (produits, publiés, brouillons, commandes, chiffre) et les 5 dernières
commandes. Chaque carte renvoie vers la section concernée.

## 3. Produits — ajouter, modifier, publier

- **« + Ajouter un maillot »** : nom, sous-titre (ex. « Édition 2025 »), **prix FCFA**
  (et ancien prix barré facultatif), **image** (bouton *Téléverser un fichier* : JPEG/PNG/WebP,
  5 Mo max), description, **tailles & stocks** (libellés libres — S, M, L, XL… ou tailles
  chiffrées), puis **Publier** ;
- **Dépublier** masque le maillot de la boutique sans le supprimer (brouillon) ;
- **Dupliquer** crée une copie en brouillon « (copie) » — mêmes photos, prix, tailles et
  thème. Idéal pour décliner un modèle : modifiez la copie, puis publiez-la ;
- **Supprimer** efface définitivement (confirmation demandée) — ses tailles, images et
  thème partent avec lui ;
- Les changements sont **visibles immédiatement** sur la boutique après enregistrement ;
- **Galerie secondaire** : images supplémentaires réordonnables (↺/✕) affichées sur la fiche.

## 4. Mise en avant — le maillot de la page d'accueil

**Un seul maillot** apparaît en grand sur l'accueil. Section « Mise en avant » :
cliquez **« Mettre en avant »** sur le maillot publié choisi (confirmation demandée) ;
l'ancien perd automatiquement la mise en avant — impossible d'en avoir deux.
Vous pouvez aussi retirer toute mise en avant (accueil sans héros).

## 5. Thèmes — les couleurs de chaque maillot

Chaque maillot possède **ses couleurs** : l'ambiance de la page d'accueil et de sa fiche
change automatiquement quand il est affiché.

- Choisissez le maillot à gauche, ajustez les couleurs (pipette 🎨 ou code HEX) ;
- **L'aperçu réagit en direct** — vous voyez le rendu avant d'enregistrer ;
- Curseur **intensité du glow**, mode **sombre/clair**, dégradé de la carte (pour les
  utilisateurs avancés) ;
- Un **contrôle de lisibilité** vous alerte si le contraste texte/fond devient insuffisant ;
- **Valeurs par défaut** : thème neutre de secours, en un clic.

## 6. Commandes — suivre et faire évoluer

Chaque commande (numéro `DS-XXXXXX`) se déplie : client, adresse, zone, articles, total.
Le menu **Statut** la fait évoluer : Nouvelle → Confirmée → En préparation → Expédiée →
Livrée (ou Annulée / Remboursée). Filtrez par statut en haut de page.
Le bouton **Supprimer** efface définitivement la commande (confirmation demandée).
Les stocks sont **décrémentés automatiquement** à la commande.

## 7. Messages

Les messages du formulaire « Contact » arrivent ici : badge **Nouveau**, marquer lu/non lu,
supprimer. Le formulaire de la boutique est protégé contre les robots.

## 8. Paramètres — votre boutique

- **Identité** : nom de la boutique, **slogan** (affiché sur l'accueil), devise ;
- **Coordonnées** : téléphone, WhatsApp, email, adresse, réseaux sociaux —
  ⚠️ **laisser vide masque l'élément côté site** (aucune donnée factice n'est affichée) ;
  le bouton « Confirmation via WhatsApp » du paiement apparaît dès qu'un numéro WhatsApp
  est renseigné ;
- **Paiement** : libellé et instructions affichés au moment de la commande ;
- **Zones de livraison** : libellés + frais FCFA (ajouter/retirer des zones) ;
- **Textes** : pages « À propos » et « Contact » — écrivez-les quand vous êtes prêt(e).

---

### 💾 Vos données sont permanentes

Tout ce que vous enregistrez (produits, thèmes, commandes, paramètres, messages, images)
est sauvegardé dans votre base **Supabase** : vous pouvez fermer le site, éteindre
l'ordinateur, tout sera encore là au retour.

### 🆘 Problèmes courants

| Problème | Solution |
|---|---|
| « Trop de tentatives » à la connexion | Attendez 1 minute (protection anti-essais répétés) |
| Image refusée | Vérifiez le format (JPEG/PNG/WebP) et la taille (5 Mo max) |
| Slug refusé | Il est déjà utilisé par un autre maillot — choisissez-en un autre |
| Le site n'affiche pas ma modification | Rechargez la page (Ctrl+R) — sinon vérifiez que le produit est **publié** |
