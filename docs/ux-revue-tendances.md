# Revue UX — Tendances de la semaine

*Document créé par : UX Expert (Sally) — BMAD-Method*

## 1. Contexte et objectifs utilisateur

- **Qui** : Créateur de marque / acheteur qui veut s’inspirer des tendances Zalando et produire des tech packs pour ses fournisseurs.
- **Objectifs** : Voir les tendances de la semaine → choisir un produit → créer un tech pack (depuis tendances ou depuis un mockup).
- **Message clé** : « Les tendances changent chaque semaine » → éviter le désabonnement, encourager le retour régulier.

---

## 2. Points forts actuels

- **Sous-nav** (Classement / Rapport IA / Phases) : clair, bon repérage.
- **Titre** « Tendances de la semaine » + sous-titre sur la mise à jour hebdo : bon pour la rétention.
- **Cartes produit** : image, marque, catégorie, coupe, prix, 2 CTAs (Voir en détail, Copier tech pack) — hiérarchie lisible.
- **État vide** : message explicite + rappel des villes.
- **Tri** : Meilleures tendances / Plus récents / Prix — couvre les besoins principaux.

---

## 3. Problèmes UX identifiés

### 3.1 Contenu principal noyé

- **Problème** : La grille « Tendances par marché » (contenu principal) arrive après deux gros blocs (Scrape Zalando + Prévisualiser), souvent en dessous du fold.
- **Impact** : L’utilisateur doit scroller pour voir les tendances ; les actions « récupérer des données » prennent trop de place par rapport à « consulter les tendances ».

### 3.2 Trop d’actions avant le contenu

- **Scrape** : 4 boutons (Paris, Berlin, Milan, 10 villes).
- **Prévisualiser** : URL + select + « Prévisualiser » + 10 boutons ville.
- **Impact** : Charge cognitive élevée, risque de confusion entre « Scrape » et « Prévisualiser », et sentiment de page « outil » plutôt que « catalogue ».

### 3.3 Répétition et bruit

- Beaucoup de boutons ville (10 en prévisualisation) sur une seule ligne → wrap, lecture difficile.
- Labels « Homme », « Zone EU (10 villes Homme) » à côté du tri : utiles mais peu mis en forme (badges / chips plus clairs).

### 3.4 Hiérarchie des blocs

- Les deux premières cartes ont le même poids visuel (titre + icône + texte + boutons) alors que l’une sert à « alimenter » (scrape) et l’autre à « vérifier avant d’enregistrer » (preview). Le rôle de chaque bloc n’est pas immédiat.

### 3.5 Filtres « Tendances par marché »

- Tri en `<select>` : correct mais discret.
- Checkbox « Global Trend Alert uniquement » : utile pour une minorité ; peut être secondaire (lien « Filtres » ou petit lien à côté du titre).

---

## 4. Recommandations

### 4.1 Mettre le contenu principal en premier (inversion de structure)

- **Proposition** : Afficher en premier la section **« Tendances par marché »** (grille de produits), puis en dessous une section **« Alimenter les tendances »** (ou « Récupérer des tendances ») qui regroupe Scrape + Prévisualisation.
- **Bénéfice** : L’utilisateur voit tout de suite les produits ; les actions d’alimentation deviennent des outils d’approvisionnement, pas un pré-requis visuel.

### 4.2 Regrouper « Scrape » et « Prévisualiser » en un seul bloc

- **Proposition** : Une seule carte **« Récupérer des tendances Zalando »** avec :
  - **Onglets ou deux zones** : « Lancer un scrape (enregistrer) » / « Prévisualiser avant d’enregistrer ».
  - Pour le scrape : boutons principaux (ex. Paris, Berlin, Milan) + « Toutes les villes (10) » ou lien « Plus de villes » ouvrant un menu/dropdown.
  - Pour la prévisualisation : URL optionnelle + choix de la ville (dropdown ou liste compacte) + bouton « Prévisualiser ».
- **Bénéfice** : Moins de répétition, distinction claire entre « enregistrer direct » et « prévisualiser puis valider ».

### 4.3 Réduire le nombre de boutons ville visibles

- **Proposition** : Afficher par défaut 3–4 villes (ex. Paris, Berlin, Milan, « + 7 villes »). Le clic sur « + 7 villes » affiche le reste (dropdown, popover ou liste repliable).
- **Bénéfice** : Interface plus lisible, moins de wrap, tout reste accessible.

### 4.4 Clarifier les libellés

- **« Produits tendance (Zalando) »** → par ex. **« Récupérer les tendances Zalando »** ou **« Scraper et enregistrer »**.
- **« Prévisualiser par ville ou par URL »** → **« Prévisualiser avant d’enregistrer »** ou **« Voir un aperçu puis enregistrer »**.
- Sous la grille : rappeler en une phrase « Ces tendances sont mises à jour chaque semaine » (lien ou petit bandeau) pour renforcer le message.

### 4.5 Filtres « Tendances par marché »

- Garder le tri bien visible (Meilleures tendances, Plus récents, Prix).
- Option « Global Trend Alert uniquement » : la déplacer dans un **« Filtres avancés »** (lien ou icône filtre) ou sous un petit « (i) » pour ne pas encombrer la barre principale.

### 4.6 Cartes produit

- Conserver **Voir en détail** et **Copier tech pack**.
- Option : **« Copier tech pack »** en style primaire (rempli) et **« Voir en détail »** en secondaire (outline) pour refléter l’action la plus fréquente (création tech pack).
- Sur mobile : garder les deux boutons empilés ou en ligne selon l’espace ; éviter de les cacher dans un menu.

---

## 5. Résumé des changements proposés

| Priorité | Changement | Effet attendu |
|----------|------------|----------------|
| Haute    | Mettre la grille « Tendances par marché » en premier | Contenu principal visible immédiatement |
| Haute    | Regrouper Scrape + Prévisualiser en une carte « Récupérer les tendances » avec onglets ou zones | Moins de bruit, distinction claire des flux |
| Moyenne  | Réduire les boutons ville visibles (3–4 + « Plus de villes ») | Page plus lisible |
| Moyenne  | Libellés plus explicites (Scrape / Prévisualiser) | Compréhension rapide du rôle de chaque action |
| Basse    | Filtre « Global Trend Alert » en option avancée | Barre de filtres plus simple |
| Basse    | Hiérarchie visuelle des 2 CTAs sur la carte (tech pack en primaire) | Alignement avec l’usage principal |

---

## 6. Suite possible

- **Option A** : Implémenter en priorité « Grille en premier » + « Regrouper Scrape / Preview » (quick wins).
- **Option B** : Créer une spec front-end détaillée (wireframes texte, composants, états) pour développement par un dev.
- **Option C** : Prototype basique (maquette ou composants) pour valider avec un utilisateur.

Indiquez la priorité (A, B ou C) ou les numéros de recommandation à appliquer en premier pour que je détaille les modifications de code ou de composants.
