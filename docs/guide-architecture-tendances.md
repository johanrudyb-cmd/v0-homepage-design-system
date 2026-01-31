# Guide d’architecture — Module Tendances

*Document de référence pour comprendre et utiliser la partie Tendances de l’application.*

---

## En bref : les 3 parties du module

| Partie | URL | Rôle |
|--------|-----|------|
| **Classement** | `/trends` | Liste des produits détectés chez 3+ marques. Filtres, actions Design / Devis, et **analyse IA par produit** (bouton sur chaque carte). |
| **Rapport IA** | `/trends/analyse` | Un **texte de synthèse** généré par l’IA (prévisions France, tendances à venir, recommandations). |
| **Phases** | `/trends/predictions` | Vue **émergent → croissance → pic → déclin** et scores calculés (pas de texte IA). |

La même **sous-navigation** (Classement | Rapport IA | Phases) apparaît en haut de chaque page pour passer de l’une à l’autre.

---

## 1. Vue d’ensemble en une phrase

**Les tendances = produits repérés chez plusieurs grandes marques (Zara, H&M, etc.).**  
Plus un même type de produit apparaît chez des marques différentes, plus il est considéré comme une « tendance confirmée ».

---

## 2. D’où viennent les données ?

| Élément | Description |
|--------|-------------|
| **Source** | Scraping des sites des grandes marques (sections « New In », « Best Sellers »). |
| **Règle** | Un produit est **tendance confirmée** dès qu’il est vu chez **au moins 3 marques** différentes. |
| **Mise à jour** | **Automatique** : un job planifié (CRON) lance un scan chaque nuit (6h UTC). **Manuelle** : bouton « Lancer un scan maintenant » pour actualiser sans attendre. |

Tout le module Tendances s’appuie sur ces données (table `TrendSignal` en base).

---

## 3. Les 3 écrans principaux

### 3.1 Page d’accueil — **Tendances** (`/trends`)

**Rôle :** Voir le **classement des tendances** (produits détectés chez 3+ marques).

- **Contenu :** Cartes produits avec image, nom, type, marques, prix moyen, score de confirmation.
- **Filtres :** Pays, style, type de produit.
- **Actions sur chaque carte :**
  - **Design** → envoie vers le Design Studio avec ce produit en base.
  - **Devis** → envoie vers Sourcing avec critères issus du produit.
  - **Analyser ce produit (IA)** → génère un texte d’analyse pour ce produit seul (potentiel France, positionnement, recommandations).

**En-tête :**
- **« Rapport IA »** (ou « Analyse approfondie ») → va vers `/trends/analyse`.
- **« Phases des tendances »** (ou « Prédictions IA ») → va vers `/trends/predictions`.
- **« Lancer un scan maintenant »** → lance un scan manuel tout de suite (en plus du scan automatique nocturne).

---

### 3.2 Rapport IA — **Synthèse globale** (`/trends/analyse`)

**Rôle :** Obtenir un **texte de synthèse** rédigé par l’IA (GPT) à partir de toutes les tendances.

- **Contenu :** Un rapport unique : prévisions pour la France, tendances à venir, recommandations.
- **Données utilisées :** Statistiques par pays / style / type de produit + principales tendances.
- **Bouton « Tester l’API GPT »** : vérifie que la clé OpenAI est bien configurée et que l’API répond.

*À ne pas confondre avec l’analyse **par produit** (bouton « Analyser ce produit » sur chaque carte de la page Tendances).*

---

### 3.3 Phases des tendances — **Émergent → Pic → Déclin** (`/trends/predictions`)

**Rôle :** Voir en quelle **phase** se situe chaque tendance et les **scores calculés** (pas de génération de texte IA).

- **Phases :** Émergent → En croissance → Pic → Déclin.
- **Scores affichés :** Vitesse, diversité (marques/pays), émergence, stabilité des prix, etc.
- **Données utilisées :** Même base que le classement (TrendSignal), avec un algorithme qui estime la phase et la date de pic.

*Ici, « IA » = algorithmes de scoring et de phase, pas GPT. Le **texte** IA est dans « Rapport IA » et « Analyser ce produit ».*

---

## 4. Récapitulatif des actions et où elles mènent

| Action | Où ? | Effet |
|--------|------|--------|
| Voir le classement des tendances | `/trends` | Liste des produits détectés chez 3+ marques, avec filtres. |
| Lancer un scan maintenant | `/trends` (bouton en-tête) | Lance un scan manuel des marques ; les tendances se mettent à jour après. |
| Analyser **un** produit avec l’IA | `/trends` (bouton sur chaque carte) | Appel à l’API d’analyse produit → texte sous la carte (potentiel France, recos). |
| Voir le **rapport IA** global | `/trends/analyse` | Rapport texte unique (prévisions France, tendances à venir, recommandations). |
| Tester la connexion GPT | `/trends/analyse` (bouton) | Vérifie que l’API OpenAI est joignable. |
| Voir les **phases** (émergent, pic, déclin) | `/trends/predictions` | Vue par phase et par scores, sans texte GPT. |

---

## 5. Architecture technique (pour dev)

```
Données
  └── TrendSignal (Prisma) ← scrapées par scan (CRON ou POST /api/trends/scan-big-brands)

Pages
  ├── /trends           → TrendRadar (liste + filtres + actions par produit)
  ├── /trends/analyse   → TrendsAnalyse (rapport IA global + test GPT)
  └── /trends/predictions → TrendPredictions (phases + scores)

APIs tendances
  ├── GET  /api/trends/confirmed     → tendances confirmées (pour le classement)
  ├── GET  /api/trends/stats        → stats par pays / style / type
  ├── POST /api/trends/scan-big-brands → scan manuel
  ├── GET  /api/trends/analyse-ia   → rapport texte global (GPT)
  ├── POST /api/trends/analyse-ia   → analyse texte pour un produit (GPT)
  ├── GET  /api/trends/predict      → prédictions (phases, scores)
  └── …
```

---

## 6. À propos de TrendProduct et /trends/[id]

Il existe un autre modèle **TrendProduct** et une page **/trends/[id]** (détail d’un produit par id).  
Ils reposent sur un **catalogue** (TrendProduct) et des **favoris**, pas sur les tendances détectées par scan (TrendSignal).

Aujourd’hui, la page d’accueil Tendances (`/trends`) n’utilise que **TrendSignal** et ne propose pas de lien vers `/trends/[id]`.  
Si tu veux unifier l’expérience, il faudra soit :
- faire pointer le détail produit vers les tendances « scan » (par exemple une page détail basée sur TrendSignal),  
- soit garder deux entrées distinctes (Tendances scan vs Catalogue produits tendance) et le documenter clairement.

---

## 7. Naming recommandé pour l’interface

Pour limiter la confusion :

- **« Tendances »** = la section / le module (produits détectés chez les marques).
- **« Classement »** ou **« Tendances du moment »** = la liste sur `/trends`.
- **« Rapport IA »** ou **« Synthèse IA »** = la page `/trends/analyse` (texte global).
- **« Phases des tendances »** = la page `/trends/predictions` (émergent → pic → déclin).
- **« Lancer un scan maintenant »** = actualisation manuelle (le scan auto reste chaque nuit).
- **« Analyser ce produit »** = analyse IA pour **un** produit (sous la carte).

Éviter d’utiliser « Prédictions IA » sans explication : préciser qu’il s’agit des **phases** et des **scores**, pas d’un rapport rédigé par GPT.

---

*Document créé pour clarifier l’architecture et le usage du module Tendances.*
