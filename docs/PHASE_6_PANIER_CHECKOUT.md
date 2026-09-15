# DIAO SHOP — PHASE 6 : PANIER ET CHECKOUT (RAPPORT)

**Phase :** 6 / 10 — Panier et checkout
**Date :** 15 septembre 2026
**Statut :** Livrée et testée — en attente de validation client

---

## 1. Travail réalisé

### Page Panier (`/panier`)
- Lignes d'articles : image (jamais déformée), nom, taille, prix unitaire, sous-total par ligne ;
- Modification de quantité **limitée au stock réel** de la taille (bouton + désactivé au plafond) ;
- Suppression d'article (icône poubelle accessible, aria-label explicite) ;
- Récapitulatif latéral (sticky) : sous-total, note « frais calculés à l'étape suivante », CTA « Passer commande » (désactivé si un article dépasse le stock, avec alerte sur la ligne concernée) ;
- **Panier vide** : état dédié + CTA vers la boutique ; squelette pendant l'hydratation ;
- Badge en-tête synchronisé en temps réel.

### Page Checkout (`/commande`)
- **Coordonnées** : nom complet*, téléphone*, WhatsApp (facultatif), email (facultatif) ;
- **Livraison** : adresse/lieu*, ville*, **zone de livraison** (zones de démonstration Ouagadougou marquées « à remplacer depuis le back-office » : Centre 1 000 FCFA / Périphérie 1 500 FCFA / Autre ville — frais à confirmer), notes (500 car. max) ;
- **Paiement** : bloc « Confirmation via WhatsApp » (choix validé) avec instructions — aucune intégration inventée, configurables en Phase 7 ;
- **Récapitulatif latéral** : articles, sous-total, frais de zone, total mis à jour à la sélection de la zone ;
- Redirection automatique vers /panier si panier vide (avec garde pendant la création de commande) ;
- Soumission → **POST /api/commandes** ; erreurs serveur affichées en français compréhensible.

### API de commande — logique métier SERVEUR
- Validation Zod partagée client/serveur (schéma commande complet) ;
- **Prix et stock relus depuis la couche de données** (jamais depuis le client) ;
- Refus explicites : champs invalides (400), panier vide (400), zone inconnue (400), **stock insuffisant (409 avec stock restant indiqué)**, produit retiré (400) ;
- **Décrément du stock** après validation (mémoire en mode démo — transaction SQL en Phase 8) ;
- **Snapshots immuables** : nom, image, prix unitaire figés dans la commande ;
- Numéro **DS-XXXXXX** (alphabet sans caractères ambigus) ;
- Journalisation serveur uniquement — jamais de détail technique exposé au client.

### Page Confirmation (`/commande/confirmation/[numero]`)
- Numéro de commande mis en avant, statut « Nouvelle », récapitulatif avec snapshots, client, livraison (zone), paiement + instructions ;
- **Bouton « Confirmer via WhatsApp »** avec message pré-rempli — affiché **uniquement** si le numéro WhatsApp est configuré ; sinon encart explicite « numéro non encore configuré » (rien d'inventé) ;
- 404 propre si numéro inconnu ; `noindex` sur checkout et confirmation.

### Fiche produit — « Acheter maintenant »
- Nouveau bouton (à côté d'« Ajouter au panier ») : taille obligatoire, ajout au panier puis redirection directe vers le checkout.

---

## 2. Fichiers créés

- `diao-shop/src/app/api/commandes/route.ts`
- `diao-shop/src/lib/validation/commande.ts`
- `diao-shop/src/lib/data/orderRepository.ts`
- `diao-shop/src/components/panier/CartView.tsx`
- `diao-shop/src/components/checkout/CheckoutForm.tsx`
- `diao-shop/src/app/panier/page.tsx` (complète)
- `diao-shop/src/app/commande/page.tsx`
- `diao-shop/src/app/commande/confirmation/[numero]/page.tsx`

## 3. Fichiers modifiés

- `diao-shop/src/lib/data/types.ts` (Order, OrderItem, zones, paiement)
- `diao-shop/src/lib/data/seed/settings.ts` (zones démo Ouagadougou + paiement WhatsApp)
- `diao-shop/src/lib/i18n/fr.ts` (chaînes panier/commande/confirmation)
- `diao-shop/src/contexts/CartContext.tsx` (drapeau `hydrated`)
- `diao-shop/src/components/produit/ProductDetail.tsx` (bouton « Acheter maintenant »)

## 4. Tests effectués

**API (curl)** : validation champs → 400 avec message FR ✓ ; stock insuffisant (99 > 12) → 409 « Disponible : 12 » ✓ ; zone inconnue → 400 ✓ ; commande valide → 201 + numéro + total exact ✓ ; panier vide → 400 ✓ ; confirmation numéro inconnu → 404 ✓.

**Parcours complet (navigateur headless)** :
- « Acheter maintenant » → redirection /commande ✓ ;
- Panier : 2 lignes, badge (3) ✓, quantité RDC → 3 (sous-total 100 000 FCFA) ✓, suppression ligne City ✓ ;
- Checkout : formulaire rempli, zone Périphérie → récap 1 500 FCFA ✓ ;
- Confirmation : création OK, page avec numéro DS-5BWFHA, **total serveur 76 500 FCFA = 25 000×3 + 1 500** ✓, statut Nouvelle ✓, snapshots (nom/image/prix) ✓, panier localStorage vidé ✓ ;
- Débordement horizontal : **0 px** à 320/390 px sur panier, checkout et confirmation ✓ ;
- Build de production ✓ (checkout 109 kB First Load JS).

## 5. Problèmes rencontrés (et résolus)

- **Bug corrigé** : après une commande réussie, `clear()` déclenchait la redirection « panier vide » en concurrence avec la navigation vers la confirmation → garde `commandeCreee` ajoutée ;
- Deux modifications parallèles sur un même fichier se sont écrasées (CheckoutForm, ProductDetail) → ré-appliquées et vérifiées par grep ;
- Comparaisons de prix dans les scripts de test : espace fine insécable française (U+202F) à normaliser — erreur de test, pas du produit.

## 6. Informations nécessaires

- Validation du parcours (aperçu en direct) ;
- (Phase 7) Contenu des pages À propos et Contact (textes, valeurs) — sinon zones administrables vides ;
- (Phase 7/8) Coordonnées réelles (téléphone, WhatsApp, email, réseaux) pour activer le bouton WhatsApp et les icônes sociales ;
- (Phase 8) URL + clés Supabase.

## 7. Prochaine phase

**Phase 7 — Back-office** : authentification administrateur, dashboard, gestion des produits (CRUD, publication, mise en avant unique), tailles & stocks, éditeur de thèmes avec aperçu, gestion des commandes (statuts), paramètres boutique.

## 8. Autorisation

**Autorises-tu le démarrage de la prochaine phase ?**
