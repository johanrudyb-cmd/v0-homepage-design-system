# Product Requirements Document (PRD) - Application OUTFITY

*Document créé via BMAD-Method - Product Manager (John)*

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-23 | 1.0 | Création initiale du PRD | PM (John) |

---

## Goals and Background Context

### Goals

- Créer une plateforme SaaS complète permettant de créer et lancer une marque de vêtements de A à Z
- Automatiser le processus de création de marque (design, sourcing, marketing) avec IA
- Réduire les barrières à l'entrée pour entrepreneurs mode (coûts, temps, compétences)
- Fournir tous les outils nécessaires en une seule plateforme (design, sourcing, marketing)
- Générer des revenus via abonnements et commissions sur sourcing

### Background Context

Les entrepreneurs mode qui veulent lancer leur marque font face à plusieurs obstacles :
- **Complexité technique** : Créer boutique, gérer designs, intégrations
- **Coûts élevés** : Designers (500-2000€), développeurs (2000-10000€), agences (10000€+)
- **Temps perdu** : Processus long (2-6 mois) pour lancer une marque
- **Manque de créativité** : Difficulté à générer designs originaux
- **Barrières multiples** : Nécessite compétences design, dev, marketing, e-commerce

L'IA (GPT-4, Midjourney, DALL-E, Replicate, Flux) permet maintenant d'automatiser tout ce processus.

**Concurrents principaux** :
- **Atelia** : Crée des pièces de mode (design 3D, techpacks, fabricants) - Mais pas de boutique, pas de POD, pas de marketing
- **Copify** : Crée des boutiques e-commerce - Mais pas de designs IA, pas de marque complète

**Notre différenciation** : Création de **marques complètes** (nom, logo, identité, designs, boutique, marketing) avec IA.

---

## Requirements

### Functional Requirements

#### Module 1 : Launch Map (Onboarding Structuré)

**FR1.1** : Le système doit afficher un stepper interactif avec 4 phases (Fondations, Design, Sourcing, Go-to-Market)

**FR1.2** : Le système doit permettre la saisie de données dans le calculateur de rentabilité (Phase 1) :
- Prix de vente visé
- Coût de production estimé
- Frais marketing
- Calcul automatique de la marge nette

**FR1.3** : Le système doit valider la complétion de chaque phase avant de débloquer la suivante

**FR1.4** : Le système doit sauvegarder la progression utilisateur dans Airtable (table User_Progress)

**FR1.5** : Le système doit permettre de reprendre le stepper à n'importe quelle étape

**FR1.6** : Le système doit afficher un indicateur de progression (pourcentage, barre de progression)

#### Module 2 : Tendances & Hits (Product Discovery)

**FR2.1** : Le système doit afficher une galerie de produits "winners" avec filtres :
- Catégorie (Hoodie, T-shirt, Cargo, Accessoires)
- Style (Minimaliste, Streetwear, Luxe, Y2K)
- Matière dominante (Coton GSM élevé, Denim, Synthétique)

**FR2.2** : Le système doit afficher pour chaque produit :
- Prix de vente moyen
- Évolution du volume de recherche (Trends)
- Score de saturabilité
- Image du produit

**FR2.3** : Le système doit permettre de sauvegarder des produits favoris

**FR2.4** : Le système doit mettre à jour les données de tendances régulièrement (hebdomadaire)

**FR2.5** : Le système doit permettre de cliquer sur un produit pour voir les détails complets

#### Module 3 : Brand Spy (Audit de Marque)

**FR3.1** : Le système doit permettre la saisie d'une URL Shopify à analyser

**FR3.2** : Le système doit afficher les indicateurs clés :
- Estimation CA (basée sur trafic et panier moyen 80-120€)
- Stack technique (liste des apps installées : Klaviyo, Loox, etc.)
- Analyse de thème (thème Shopify utilisé)
- Ad Strategy (nombre publicités actives, plateforme dominante TikTok vs Meta)

**FR3.3** : Le système doit permettre de sauvegarder des analyses de marques

**FR3.4** : Le système doit afficher un rapport d'audit formaté et exportable (PDF)

**FR3.5** : Le système doit permettre de comparer plusieurs marques côte à côte

#### Module 4 : Design Studio IA (Cœur du SaaS)

**FR4.1** : Le système doit permettre la saisie de prompts assistés pour générer des assets techniques :
- Type de vêtement
- Coupe (oversized, slim)
- Détails (coutures, poches)
- Matière

**FR4.2** : Le système doit générer avec IA (API Replicate/Flux) :
- Flat Sketch : Dessin technique noir et blanc (recto/verso)
- Tech Pack Draft : Tableau généré par IA listant composants (tissu principal, bord-côte, étiquettes, boutons)

**FR4.3** : Le système doit permettre la personnalisation des designs générés :
- Ajustement couleurs
- Modification textes/éléments
- Ajustement détails

**FR4.4** : Le système doit permettre l'export en PDF du tech pack pour l'usine

**FR4.5** : Le système doit sauvegarder tous les designs générés dans la bibliothèque utilisateur

**FR4.6** : Le système doit limiter le nombre de générations selon le plan utilisateur (Free: 3, Pro: illimité)

#### Module 5 : Sourcing Hub (Base de Données Usines)

**FR5.1** : Le système doit afficher une liste de cartes fournisseurs avec filtres avancés :
- Pays (Portugal, Turquie, Chine, etc.)
- MOQ (Minimum Order Quantity)
- Spécialités (ex: "Expert Jersey 400GSM+")
- Délais moyens

**FR5.2** : Le système doit afficher pour chaque usine :
- Nom
- Pays
- MOQ
- Spécialités
- Délais moyens
- Contact direct

**FR5.3** : Le système doit permettre de contacter une usine avec bouton "Contacter de la part de [Ton SaaS]" pour tracking

**FR5.4** : Le système doit permettre de sauvegarder des usines favorites

**FR5.5** : Le système doit permettre de demander un devis à au moins 2 usines (Phase 3 du Launch Map)

**FR5.6** : Le système doit afficher un système de reviews/notes pour les usines (Phase 2)

#### Module 6 : UGC AI Lab (Marketing Automatisé)

**FR6.1** : Le système doit permettre l'upload d'un logo/design pour Virtual Try-On

**FR6.2** : Le système doit générer avec IA une image de mannequin portant le vêtement avec le logo/design appliqué

**FR6.3** : Le système doit générer des scripts de 15s basés sur hooks viraux (Problème → Solution → Preuve → CTA)

**FR6.4** : Le système doit permettre l'intégration d'API (HeyGen ou Kling) pour générer une vidéo d'un avatar présentant le vêtement

**FR6.5** : Le système doit permettre l'export des assets générés (images, scripts, vidéos)

**FR6.6** : Le système doit limiter le nombre de générations selon le plan utilisateur

#### Fonctionnalités Transversales

**FR7.1** : Le système doit permettre l'authentification utilisateur (email/social login)

**FR7.2** : Le système doit gérer les abonnements (Free, Pro, Enterprise)

**FR7.3** : Le système doit afficher un dashboard utilisateur avec vue d'ensemble de toutes les marques créées

**FR7.4** : Le système doit permettre la gestion de plusieurs marques (selon plan)

**FR7.5** : Le système doit intégrer Airtable pour stockage données (User_Progress, Factories, etc.)

### Non-Functional Requirements

**NFR1** : Le système doit charger en moins de 3 secondes sur connexion moyenne (4G)

**NFR2** : Le système doit être accessible 99.5% du temps (uptime)

**NFR3** : Le système doit être conforme RGPD (cookies, données personnelles, politique confidentialité)

**NFR4** : Le système doit utiliser HTTPS avec certificat SSL valide

**NFR5** : Le système doit être responsive et fonctionnel sur navigateurs modernes (Chrome, Firefox, Safari, Edge)

**NFR6** : Le système doit avoir un score Lighthouse > 80 (Performance, Accessibility, Best Practices, SEO)

**NFR7** : Les images générées par IA doivent être optimisées (WebP, compression)

**NFR8** : Le système doit gérer les rate limits des APIs IA (Replicate, HeyGen, etc.)

**NFR9** : Le système doit avoir des backups réguliers des données utilisateurs

**NFR10** : Le système doit être scalable pour supporter 1000+ utilisateurs simultanés

**NFR11** : Le système doit respecter les ToS des APIs externes (Replicate, HeyGen, Shopify, etc.)

**NFR12** : Le système doit avoir un système de logging et monitoring des erreurs

---

## User Stories

### Epic 1 : Launch Map (Onboarding)

#### Story 1.1 : Calculateur de Rentabilité
**En tant que** entrepreneur mode  
**Je veux** calculer ma marge nette  
**Afin de** valider la viabilité économique de ma marque

**Acceptance Criteria** :
- [ ] Je peux saisir le prix de vente visé
- [ ] Je peux saisir le coût de production estimé
- [ ] Je peux saisir les frais marketing
- [ ] Le système calcule automatiquement la marge nette
- [ ] Le résultat est sauvegardé dans Airtable
- [ ] Je peux modifier les valeurs et recalculer

**Priorité** : Haute (MVP)

---

#### Story 1.2 : Stepper de Progression
**En tant que** utilisateur  
**Je veux** voir ma progression dans le processus de création de marque  
**Afin de** savoir où j'en suis et ce qu'il me reste à faire

**Acceptance Criteria** :
- [ ] Le stepper affiche 4 phases (Fondations, Design, Sourcing, Go-to-Market)
- [ ] Chaque phase complétée est marquée comme terminée
- [ ] La phase suivante se débloque automatiquement après complétion
- [ ] Un indicateur de progression (pourcentage) est visible
- [ ] Je peux cliquer sur une phase complétée pour la revoir
- [ ] La progression est sauvegardée et récupérable

**Priorité** : Haute (MVP)

---

#### Story 1.3 : Validation Tech Pack
**En tant que** utilisateur  
**Je veux** valider mon premier Tech Pack via le Design Studio  
**Afin de** compléter la Phase 2 du Launch Map

**Acceptance Criteria** :
- [ ] Je peux accéder au Design Studio depuis le Launch Map
- [ ] Après génération d'un Tech Pack, la Phase 2 est marquée complète
- [ ] Le Tech Pack généré est lié à ma progression
- [ ] Je peux revenir au Launch Map après génération

**Priorité** : Haute (MVP)  
**Dépendance** : Story 4.1 (Design Studio)

---

#### Story 1.4 : Demande de Devis Usines
**En tant que** utilisateur  
**Je veux** envoyer une demande de devis à au moins 2 usines  
**Afin de** compléter la Phase 3 du Launch Map

**Acceptance Criteria** :
- [ ] Je peux accéder au Sourcing Hub depuis le Launch Map
- [ ] Je peux sélectionner au moins 2 usines
- [ ] Je peux envoyer une demande de devis avec mon Tech Pack
- [ ] La Phase 3 est marquée complète après envoi
- [ ] Je reçois une confirmation d'envoi

**Priorité** : Haute (MVP)  
**Dépendance** : Story 5.1 (Sourcing Hub)

---

#### Story 1.5 : Génération Scripts UGC
**En tant que** utilisateur  
**Je veux** générer 5 scripts de clips UGC IA  
**Afin de** compléter la Phase 4 du Launch Map

**Acceptance Criteria** :
- [ ] Je peux accéder au UGC AI Lab depuis le Launch Map
- [ ] Je peux générer 5 scripts différents
- [ ] Les scripts sont basés sur hooks viraux actuels
- [ ] La Phase 4 est marquée complète après génération
- [ ] Je peux exporter les scripts

**Priorité** : Haute (MVP)  
**Dépendance** : Story 6.3 (UGC Scripts)

---

### Epic 2 : Tendances & Hits (Product Discovery)

#### Story 2.1 : Affichage Galerie Produits
**En tant que** utilisateur  
**Je veux** voir une galerie de produits "winners"  
**Afin de** m'inspirer et identifier des opportunités

**Acceptance Criteria** :
- [ ] La galerie affiche des produits avec images, prix, trends
- [ ] Les produits sont triés par score de saturabilité (meilleurs en premier)
- [ ] Je peux scroller pour voir plus de produits
- [ ] Chaque produit affiche : prix moyen, évolution trends, score saturabilité
- [ ] Les images se chargent rapidement (lazy loading)

**Priorité** : Moyenne (Phase 2)

---

#### Story 2.2 : Filtres Produits
**En tant que** utilisateur  
**Je veux** filtrer les produits par catégorie, style, matière  
**Afin de** trouver des produits pertinents pour mon projet

**Acceptance Criteria** :
- [ ] Je peux filtrer par catégorie (Hoodie, T-shirt, Cargo, Accessoires)
- [ ] Je peux filtrer par style (Minimaliste, Streetwear, Luxe, Y2K)
- [ ] Je peux filtrer par matière (Coton GSM élevé, Denim, Synthétique)
- [ ] Les filtres peuvent être combinés
- [ ] La galerie se met à jour en temps réel selon les filtres
- [ ] Je peux réinitialiser les filtres

**Priorité** : Moyenne (Phase 2)

---

#### Story 2.3 : Détails Produit
**En tant que** utilisateur  
**Je veux** voir les détails complets d'un produit  
**Afin de** comprendre pourquoi il est un "winner"

**Acceptance Criteria** :
- [ ] Je peux cliquer sur un produit pour voir les détails
- [ ] La page détails affiche : prix moyen, évolution trends, score saturabilité, images multiples
- [ ] Je peux voir l'historique des trends (graphique)
- [ ] Je peux sauvegarder le produit en favori
- [ ] Je peux partager le produit

**Priorité** : Moyenne (Phase 2)

---

#### Story 2.4 : Mise à Jour Tendances
**En tant que** utilisateur  
**Je veux** voir des données de tendances à jour  
**Afin de** identifier les opportunités actuelles

**Acceptance Criteria** :
- [ ] Les données sont mises à jour au moins une fois par semaine
- [ ] Un indicateur affiche la date de dernière mise à jour
- [ ] Les nouveaux produits "winners" apparaissent automatiquement
- [ ] Les produits obsolètes sont retirés

**Priorité** : Moyenne (Phase 2)

---

### Epic 3 : Brand Spy (Audit de Marque)

#### Story 3.1 : Analyse URL Shopify
**En tant que** utilisateur  
**Je veux** analyser une URL Shopify  
**Afin de** comprendre comment une marque concurrente opère

**Acceptance Criteria** :
- [ ] Je peux saisir une URL Shopify dans un champ de recherche
- [ ] Le système valide que l'URL est valide
- [ ] Le système lance l'analyse (30-60 secondes)
- [ ] Un indicateur de chargement est affiché pendant l'analyse
- [ ] Les résultats s'affichent une fois l'analyse terminée

**Priorité** : Moyenne (Phase 2)

---

#### Story 3.2 : Affichage Indicateurs Clés
**En tant que** utilisateur  
**Je veux** voir les indicateurs clés d'une marque  
**Afin de** comprendre sa stratégie et performance

**Acceptance Criteria** :
- [ ] Estimation CA est affichée (basée sur trafic et panier moyen)
- [ ] Stack technique est listée (apps installées : Klaviyo, Loox, etc.)
- [ ] Thème Shopify utilisé est identifié
- [ ] Ad Strategy est affichée (nombre publicités, plateformes)
- [ ] Tous les indicateurs sont formatés de manière claire

**Priorité** : Moyenne (Phase 2)

---

#### Story 3.3 : Rapport d'Audit Exportable
**En tant que** utilisateur  
**Je veux** exporter un rapport d'audit en PDF  
**Afin de** le partager ou l'archiver

**Acceptance Criteria** :
- [ ] Je peux cliquer sur "Exporter PDF"
- [ ] Le PDF contient tous les indicateurs clés
- [ ] Le PDF est formaté professionnellement
- [ ] Le téléchargement démarre automatiquement
- [ ] Le PDF inclut la date d'analyse

**Priorité** : Basse (Post-MVP)

---

#### Story 3.4 : Comparaison Marques
**En tant que** utilisateur  
**Je veux** comparer plusieurs marques côte à côte  
**Afin de** identifier les meilleures pratiques

**Acceptance Criteria** :
- [ ] Je peux sélectionner plusieurs analyses de marques
- [ ] Les indicateurs sont affichés en tableau comparatif
- [ ] Je peux exporter la comparaison en PDF
- [ ] Les différences clés sont mises en évidence

**Priorité** : Basse (Post-MVP)

---

### Epic 4 : Design Studio IA (Cœur du SaaS)

#### Story 4.1 : Interface Prompting Assistée
**En tant que** utilisateur  
**Je veux** générer un design avec IA via prompts assistés  
**Afin de** créer mon Tech Pack sans compétences design

**Acceptance Criteria** :
- [ ] Je peux sélectionner le type de vêtement (T-shirt, Hoodie, etc.)
- [ ] Je peux sélectionner la coupe (oversized, slim)
- [ ] Je peux ajouter des détails (coutures, poches)
- [ ] Je peux sélectionner la matière
- [ ] Un prompt est généré automatiquement à partir de mes sélections
- [ ] Je peux modifier le prompt manuellement si besoin

**Priorité** : **Critique (MVP)**

---

#### Story 4.2 : Génération Flat Sketch
**En tant que** utilisateur  
**Je veux** générer un Flat Sketch (dessin technique) avec IA  
**Afin de** avoir une représentation technique de mon design

**Acceptance Criteria** :
- [ ] Le système appelle l'API Replicate/Flux avec le prompt
- [ ] Un Flat Sketch noir et blanc est généré (recto/verso)
- [ ] Le temps de génération est affiché (30-60 secondes)
- [ ] Le résultat est affiché dans l'interface
- [ ] Je peux régénérer si le résultat ne me convient pas

**Priorité** : **Critique (MVP)**

---

#### Story 4.3 : Génération Tech Pack Draft
**En tant que** utilisateur  
**Je veux** générer un Tech Pack Draft avec IA  
**Afin de** avoir la liste des composants nécessaires

**Acceptance Criteria** :
- [ ] Le système génère un tableau avec composants :
  - Tissu principal
  - Bord-côte
  - Étiquettes
  - Boutons
  - Fermetures
- [ ] Chaque composant a des spécifications (quantité, type, etc.)
- [ ] Le Tech Pack est formaté professionnellement
- [ ] Je peux modifier les composants manuellement

**Priorité** : **Critique (MVP)**

---

#### Story 4.4 : Personnalisation Designs
**En tant que** utilisateur  
**Je veux** personnaliser les designs générés  
**Afin de** les adapter à ma vision

**Acceptance Criteria** :
- [ ] Je peux ajuster les couleurs du design
- [ ] Je peux modifier les textes/éléments
- [ ] Je peux ajuster les détails (coutures, poches)
- [ ] Les modifications sont sauvegardées
- [ ] Je peux prévisualiser les modifications en temps réel

**Priorité** : Haute (MVP)

---

#### Story 4.5 : Export PDF Tech Pack
**En tant que** utilisateur  
**Je veux** exporter mon Tech Pack en PDF  
**Afin de** l'envoyer à une usine

**Acceptance Criteria** :
- [ ] Je peux cliquer sur "Générer PDF pour l'usine"
- [ ] Le PDF contient : Flat Sketch + Tech Pack Draft
- [ ] Le PDF est formaté professionnellement (normes industrie)
- [ ] Le téléchargement démarre automatiquement
- [ ] Le PDF inclut les informations de contact utilisateur

**Priorité** : **Critique (MVP)**

---

#### Story 4.6 : Bibliothèque Designs
**En tant que** utilisateur  
**Je veux** voir tous mes designs générés  
**Afin de** les retrouver et les réutiliser

**Acceptance Criteria** :
- [ ] Tous les designs générés sont sauvegardés automatiquement
- [ ] Je peux accéder à ma bibliothèque depuis le dashboard
- [ ] Les designs sont organisés par marque
- [ ] Je peux rechercher/filtrer mes designs
- [ ] Je peux supprimer des designs

**Priorité** : Haute (MVP)

---

#### Story 4.7 : Limites Générations par Plan
**En tant que** utilisateur  
**Je veux** connaître mes limites de générations  
**Afin de** gérer mon usage

**Acceptance Criteria** :
- [ ] Le nombre de générations restantes est affiché
- [ ] Un compteur décrémente à chaque génération
- [ ] Un message s'affiche quand la limite est atteinte
- [ ] Je peux voir les options pour augmenter ma limite (upgrade plan)
- [ ] Les limites sont : Free (3), Pro (illimité), Enterprise (illimité)

**Priorité** : Haute (MVP)

---

### Epic 5 : Sourcing Hub (Base Usines)

#### Story 5.1 : Liste Usines avec Filtres
**En tant que** utilisateur  
**Je veux** voir une liste d'usines avec filtres  
**Afin de** trouver l'usine adaptée à mon projet

**Acceptance Criteria** :
- [ ] La liste affiche des cartes d'usines avec : nom, pays, MOQ, spécialités
- [ ] Je peux filtrer par pays (Portugal, Turquie, Chine, etc.)
- [ ] Je peux filtrer par MOQ (minimum, maximum)
- [ ] Je peux filtrer par spécialités (ex: "Expert Jersey 400GSM+")
- [ ] Je peux filtrer par délais moyens
- [ ] Les filtres peuvent être combinés
- [ ] La liste se met à jour en temps réel

**Priorité** : **Critique (MVP)**

---

#### Story 5.2 : Détails Usine
**En tant que** utilisateur  
**Je veux** voir les détails complets d'une usine  
**Afin de** décider si elle correspond à mes besoins

**Acceptance Criteria** :
- [ ] Je peux cliquer sur une usine pour voir les détails
- [ ] La page détails affiche : nom, pays, MOQ, spécialités, délais, contact
- [ ] Je peux voir les reviews/notes si disponibles (Phase 2)
- [ ] Je peux sauvegarder l'usine en favori
- [ ] Je peux partager l'usine

**Priorité** : **Critique (MVP)**

---

#### Story 5.3 : Contact Usine avec Tracking
**En tant que** utilisateur  
**Je veux** contacter une usine avec tracking  
**Afin de** bénéficier d'avantages et permettre le suivi

**Acceptance Criteria** :
- [ ] Je peux cliquer sur "Contacter de la part de [Ton SaaS]"
- [ ] Un formulaire de contact s'ouvre avec mon Tech Pack pré-rempli
- [ ] Le message inclut une mention du SaaS pour tracking
- [ ] L'usine reçoit l'email avec les informations
- [ ] Je reçois une confirmation d'envoi
- [ ] Le système track l'envoi pour commissions/avantages

**Priorité** : **Critique (MVP)**

---

#### Story 5.4 : Demande de Devis
**En tant que** utilisateur  
**Je veux** envoyer une demande de devis à plusieurs usines  
**Afin de** comparer les offres

**Acceptance Criteria** :
- [ ] Je peux sélectionner plusieurs usines (minimum 2)
- [ ] Je peux joindre mon Tech Pack PDF
- [ ] Je peux ajouter des notes spécifiques
- [ ] Le système envoie la demande à toutes les usines sélectionnées
- [ ] Je reçois une confirmation pour chaque envoi
- [ ] Je peux suivre le statut des demandes (envoyé, lu, répondu)

**Priorité** : **Critique (MVP)**

---

#### Story 5.5 : Favoris Usines
**En tant que** utilisateur  
**Je veux** sauvegarder des usines en favoris  
**Afin de** les retrouver facilement

**Acceptance Criteria** :
- [ ] Je peux marquer une usine comme favorite
- [ ] Mes usines favorites sont accessibles depuis mon dashboard
- [ ] Je peux retirer une usine des favoris
- [ ] Les favoris sont organisés par marque

**Priorité** : Moyenne (MVP)

---

#### Story 5.6 : Système Reviews Usines
**En tant que** utilisateur  
**Je veux** voir les reviews d'autres utilisateurs sur les usines  
**Afin de** faire un choix éclairé

**Acceptance Criteria** :
- [ ] Je peux voir les notes/reviews d'une usine
- [ ] Je peux laisser une review après avoir travaillé avec une usine
- [ ] Les reviews incluent : note (1-5), commentaire, date
- [ ] Les reviews sont modérées avant publication
- [ ] Je peux signaler une review inappropriée

**Priorité** : Basse (Post-MVP)

---

### Epic 6 : UGC AI Lab (Marketing Automatisé)

#### Story 6.1 : Virtual Try-On
**En tant que** utilisateur  
**Je veux** générer une image de mannequin portant mon vêtement  
**Afin de** créer du contenu marketing visuel

**Acceptance Criteria** :
- [ ] Je peux uploader mon logo/design
- [ ] Je peux sélectionner le type de vêtement
- [ ] Le système génère une image de mannequin réaliste portant le vêtement
- [ ] Le logo/design est appliqué correctement
- [ ] Je peux régénérer si le résultat ne me convient pas
- [ ] Je peux télécharger l'image générée

**Priorité** : Haute (MVP)

---

#### Story 6.2 : Script Generator
**En tant que** utilisateur  
**Je veux** générer des scripts de 15s pour clips UGC  
**Afin de** créer du contenu marketing viral

**Acceptance Criteria** :
- [ ] Le système génère des scripts basés sur hooks viraux actuels
- [ ] Les scripts suivent la structure : Problème → Solution → Preuve → CTA
- [ ] Je peux générer plusieurs scripts différents (5 minimum)
- [ ] Les scripts sont adaptés au secteur mode
- [ ] Je peux modifier les scripts générés
- [ ] Je peux exporter les scripts (texte, PDF)

**Priorité** : Haute (MVP)

---

#### Story 6.3 : Vidéo IA Avatar
**En tant que** utilisateur  
**Je veux** générer une vidéo d'un avatar présentant mon vêtement  
**Afin de** créer du contenu vidéo marketing automatisé

**Acceptance Criteria** :
- [ ] Le système intègre l'API HeyGen ou Kling
- [ ] Je peux sélectionner un avatar (homme, femme, style)
- [ ] Je peux utiliser un script généré ou en saisir un
- [ ] Le système génère une vidéo de 15-30 secondes
- [ ] La vidéo présente le vêtement de manière réaliste
- [ ] Je peux télécharger la vidéo générée
- [ ] Le temps de génération est affiché (1-3 minutes)

**Priorité** : Moyenne (Phase 2 - Coûteux)

---

#### Story 6.4 : Export Assets Marketing
**En tant que** utilisateur  
**Je veux** exporter tous mes assets marketing générés  
**Afin de** les utiliser sur mes réseaux sociaux

**Acceptance Criteria** :
- [ ] Je peux exporter les images Virtual Try-On (PNG, JPG)
- [ ] Je peux exporter les scripts (TXT, PDF)
- [ ] Je peux exporter les vidéos (MP4)
- [ ] Je peux exporter tout en une fois (ZIP)
- [ ] Les assets sont optimisés pour réseaux sociaux (formats, tailles)

**Priorité** : Haute (MVP)

---

#### Story 6.5 : Limites Générations Marketing
**En tant que** utilisateur  
**Je veux** connaître mes limites de générations marketing  
**Afin de** gérer mon usage

**Acceptance Criteria** :
- [ ] Le nombre de générations restantes est affiché par type (images, scripts, vidéos)
- [ ] Les limites sont : Free (5 images, 10 scripts, 0 vidéos), Pro (illimité), Enterprise (illimité)
- [ ] Un message s'affiche quand la limite est atteinte
- [ ] Je peux voir les options pour augmenter ma limite (upgrade plan, add-ons)

**Priorité** : Haute (MVP)

---

### Epic 7 : Authentification & Gestion Compte

#### Story 7.1 : Inscription/Connexion
**En tant que** utilisateur  
**Je veux** créer un compte et me connecter  
**Afin de** accéder à la plateforme

**Acceptance Criteria** :
- [ ] Je peux créer un compte avec email/mot de passe
- [ ] Je peux me connecter avec Google/GitHub (social login)
- [ ] Je reçois un email de confirmation
- [ ] Je peux réinitialiser mon mot de passe
- [ ] La session est maintenue après fermeture du navigateur

**Priorité** : **Critique (MVP)**

---

#### Story 7.2 : Gestion Abonnements
**En tant que** utilisateur  
**Je veux** gérer mon abonnement  
**Afin de** accéder aux fonctionnalités selon mon plan

**Acceptance Criteria** :
- [ ] Je peux voir mon plan actuel (Free, Pro, Enterprise)
- [ ] Je peux voir les fonctionnalités disponibles selon mon plan
- [ ] Je peux upgrader mon plan (paiement Stripe)
- [ ] Je peux downgrader mon plan
- [ ] Je peux voir mon historique de paiements
- [ ] Je reçois des notifications avant renouvellement

**Priorité** : **Critique (MVP)**

---

#### Story 7.3 : Dashboard Utilisateur
**En tant que** utilisateur  
**Je veux** voir un dashboard avec vue d'ensemble  
**Afin de** gérer mes marques et projets

**Acceptance Criteria** :
- [ ] Le dashboard affiche toutes mes marques créées
- [ ] Pour chaque marque : statut Launch Map, nombre designs, usines contactées
- [ ] Je peux créer une nouvelle marque
- [ ] Je peux accéder rapidement aux différents modules
- [ ] Des statistiques basiques sont affichées (designs générés, usines contactées, etc.)

**Priorité** : **Critique (MVP)**

---

#### Story 7.4 : Gestion Multi-Marques
**En tant que** utilisateur  
**Je veux** créer et gérer plusieurs marques  
**Afin de** tester différents concepts

**Acceptance Criteria** :
- [ ] Je peux créer plusieurs marques (selon mon plan : Free 1, Pro 3, Enterprise illimité)
- [ ] Chaque marque a son propre espace (designs, usines, marketing)
- [ ] Je peux basculer entre mes marques depuis le dashboard
- [ ] Je peux supprimer une marque
- [ ] Les données sont isolées par marque

**Priorité** : Haute (MVP)

---

## User Journeys

### Journey 1 : Créer Ma Première Marque (Onboarding Complet)

**Acteur** : Entrepreneur mode débutant

**Objectif** : Créer une marque complète de A à Z

**Flow** :
1. **Inscription** : Création de compte (email/social)
2. **Onboarding** : Tour guidé de l'application
3. **Launch Map - Phase 1** : Calculateur de rentabilité
   - Saisie prix de vente, coût prod, frais marketing
   - Calcul marge nette
   - Validation phase
4. **Launch Map - Phase 2** : Design Studio
   - Accès Design Studio depuis Launch Map
   - Génération premier Tech Pack avec IA
   - Validation phase
5. **Launch Map - Phase 3** : Sourcing
   - Accès Sourcing Hub depuis Launch Map
   - Sélection 2 usines
   - Envoi demande de devis avec Tech Pack
   - Validation phase
6. **Launch Map - Phase 4** : Go-to-Market
   - Accès UGC AI Lab depuis Launch Map
   - Génération 5 scripts UGC
   - Validation phase
7. **Complétion** : Toutes les phases complétées, marque prête

**Points de décision** :
- Choix du plan (Free vs Pro)
- Validation de la marge (Phase 1)
- Satisfaction du Tech Pack (Phase 2)
- Choix des usines (Phase 3)

**Succès** : Marque créée avec Tech Pack, usines contactées, scripts marketing générés

---

### Journey 2 : Analyser un Concurrent

**Acteur** : Entrepreneur mode

**Objectif** : Comprendre comment une marque concurrente opère

**Flow** :
1. **Accès Brand Spy** : Navigation vers module Brand Spy
2. **Saisie URL** : Entrée de l'URL Shopify à analyser
3. **Analyse** : Système lance l'analyse (30-60 secondes)
4. **Résultats** : Affichage indicateurs clés
   - Estimation CA
   - Stack technique
   - Thème Shopify
   - Ad Strategy
5. **Export** : Téléchargement rapport PDF (optionnel)
6. **Sauvegarde** : Sauvegarde analyse pour référence future

**Points de décision** :
- URL valide
- Satisfaction des résultats

**Succès** : Analyse complète obtenue, insights identifiés

---

### Journey 3 : Générer un Tech Pack

**Acteur** : Utilisateur

**Objectif** : Créer un Tech Pack professionnel avec IA

**Flow** :
1. **Accès Design Studio** : Navigation vers module
2. **Saisie Paramètres** :
   - Type de vêtement (T-shirt, Hoodie, etc.)
   - Coupe (oversized, slim)
   - Détails (coutures, poches)
   - Matière
3. **Génération** : Système génère avec IA (30-60 secondes)
   - Flat Sketch (recto/verso)
   - Tech Pack Draft (composants)
4. **Personnalisation** : Ajustements si nécessaire
5. **Export PDF** : Téléchargement Tech Pack pour usine
6. **Sauvegarde** : Design sauvegardé dans bibliothèque

**Points de décision** :
- Satisfaction du design généré
- Besoin de personnalisation
- Export ou nouvelle génération

**Succès** : Tech Pack professionnel généré et exporté

---

## Data Model

### Core Entities

#### User
- **id** : string (unique identifier)
- **email** : string (unique)
- **name** : string
- **plan** : "free" | "pro" | "enterprise"
- **createdAt** : date
- **updatedAt** : date

#### Brand
- **id** : string (unique identifier)
- **userId** : string (foreign key → User)
- **name** : string
- **status** : "draft" | "in_progress" | "completed"
- **launchMapProgress** : object (phases complétées)
- **createdAt** : date
- **updatedAt** : date

#### UserProgress (Airtable)
- **userId** : string
- **brandId** : string
- **phase1_completed** : boolean (Fondations)
- **phase2_completed** : boolean (Design)
- **phase3_completed** : boolean (Sourcing)
- **phase4_completed** : boolean (Go-to-Market)
- **calculator_results** : object (marge nette, etc.)

#### Design
- **id** : string (unique identifier)
- **brandId** : string (foreign key → Brand)
- **type** : string (T-shirt, Hoodie, etc.)
- **flatSketch** : string (URL image)
- **techPack** : object (composants)
- **prompt** : string (prompt utilisé)
- **createdAt** : date

#### Factory (Airtable)
- **id** : string
- **name** : string
- **country** : string
- **moq** : number
- **specialties** : string[]
- **deliveryTime** : string
- **contact** : string
- **rating** : number (1-5, Phase 2)

#### QuoteRequest
- **id** : string (unique identifier)
- **brandId** : string (foreign key → Brand)
- **factoryId** : string (foreign key → Factory)
- **techPackId** : string (foreign key → Design)
- **status** : "sent" | "read" | "responded"
- **sentAt** : date

#### BrandAnalysis (Brand Spy)
- **id** : string (unique identifier)
- **userId** : string (foreign key → User)
- **shopifyUrl** : string
- **estimatedRevenue** : number
- **techStack** : string[]
- **theme** : string
- **adStrategy** : object (platforms, count)
- **analyzedAt** : date

#### TrendProduct (Tendances & Hits)
- **id** : string (unique identifier)
- **category** : string
- **style** : string
- **material** : string
- **averagePrice** : number
- **trendScore** : number
- **saturabilityScore** : number
- **imageUrl** : string
- **updatedAt** : date

#### MarketingAsset (UGC Lab)
- **id** : string (unique identifier)
- **brandId** : string (foreign key → Brand)
- **type** : "virtual_tryon" | "script" | "video"
- **content** : string (URL ou texte)
- **createdAt** : date

---

## Technical Assumptions

### Repository Structure

**Monorepo** (recommandé pour MVP)

### Service Architecture

**Monolith** (Next.js full-stack pour MVP)
- Scalable vers microservices si nécessaire

### Stack Technique

**Frontend** :
- Next.js 14+ (React, TypeScript)
- Tailwind CSS
- Radix UI / shadcn/ui

**Backend** :
- Next.js API Routes
- PostgreSQL (Prisma ORM)
- Airtable (données complémentaires)

**IA/ML** :
- Replicate API (designs, tech packs)
- Flux API (alternative Replicate)
- OpenAI API (GPT-4 pour scripts, noms)
- HeyGen API (vidéos IA - Phase 2)
- Kling API (alternative HeyGen - Phase 2)

**Intégrations** :
- Airtable API (User_Progress, Factories)
- Stripe API (paiements)
- Shopify API (Brand Spy - scraping)

**Hosting** :
- Vercel (frontend + API)
- Supabase / Vercel Postgres (database)
- Airtable (données complémentaires)

### Testing Requirements

**Unit + Integration** (recommandé pour MVP)
- Tests unitaires : composants React, fonctions utilitaires
- Tests d'intégration : flux critiques (génération IA, envoi devis)
- Tests manuels : validation design, UX

### Intégrations Externes

1. **Replicate/Flux** : Génération designs IA
2. **OpenAI** : Scripts UGC, noms marques
3. **HeyGen/Kling** : Vidéos IA (Phase 2)
4. **Airtable** : Stockage données (User_Progress, Factories)
5. **Stripe** : Paiements abonnements
6. **Shopify** : Brand Spy (scraping)

### Security & Compliance

- **RGPD** : Conformité obligatoire
- **HTTPS** : Obligatoire (automatique Vercel)
- **Sécurité données** : Chiffrement, backups
- **API Keys** : Stockage sécurisé (variables d'environnement)

### Performance Requirements

- Temps de chargement page < 3 secondes
- Génération IA < 60 secondes
- Score Lighthouse > 80

---

## MVP Scope vs Post-MVP

### MVP (Phase 1 - 3-4 mois)

**Modules Inclus** :
1. ✅ **Launch Map** (onboarding complet)
2. ✅ **Design Studio IA** (génération tech packs)
3. ✅ **Sourcing Hub** (20-30 usines, demande devis)

**Modules Partiels** :
4. ⚠️ **UGC AI Lab** (Virtual Try-On + Scripts seulement, pas vidéos IA)
5. ❌ **Tendances & Hits** (Phase 2)
6. ❌ **Brand Spy** (Phase 2)

**Fonctionnalités MVP** :
- Authentification (email/social)
- Gestion abonnements (Free, Pro)
- Dashboard utilisateur
- Génération designs IA (Replicate/Flux)
- Export PDF tech packs
- Sourcing Hub (20-30 usines)
- Virtual Try-On + Scripts UGC

**Exclusions MVP** :
- Vidéos IA (HeyGen/Kling - trop cher)
- Tendances & Hits (nécessite données)
- Brand Spy (complexe techniquement)
- Reviews usines
- Comparaison marques

---

### Post-MVP (Phase 2 - 6-12 mois)

**Modules à Ajouter** :
1. ⏳ **Tendances & Hits** (product discovery complet)
2. ⏳ **Brand Spy** (audit marques complet)
3. ⏳ **UGC AI Lab** (vidéos IA complètes)

**Fonctionnalités à Ajouter** :
- Vidéos IA (HeyGen/Kling)
- Reviews usines
- Comparaison marques
- Analytics avancés
- API pour développeurs
- Multi-marques avancé
- Intégration boutique e-commerce automatique

---

## Epic and Story Dependencies

### Dependencies Graph

```
Launch Map (Epic 1)
  ├─ Story 1.3 → Design Studio (Epic 4) [Dépendance]
  ├─ Story 1.4 → Sourcing Hub (Epic 5) [Dépendance]
  └─ Story 1.5 → UGC AI Lab (Epic 6) [Dépendance]

Design Studio (Epic 4)
  └─ Story 4.5 → Export PDF [Indépendant]

Sourcing Hub (Epic 5)
  └─ Story 5.3 → Contact avec Tech Pack [Dépendance Epic 4]

UGC AI Lab (Epic 6)
  └─ Story 6.1 → Virtual Try-On [Indépendant]
  └─ Story 6.2 → Scripts [Indépendant]
  └─ Story 6.3 → Vidéos IA [Dépendance API externe]

Tendances & Hits (Epic 2)
  └─ Toutes stories [Indépendant, Phase 2]

Brand Spy (Epic 3)
  └─ Toutes stories [Indépendant, Phase 2]
```

---

## Risks & Mitigation

### Risques Techniques

**Risque** : Qualité designs IA insuffisante (Replicate/Flux)  
**Mitigation** : Tests approfondis, curation prompts, validation manuelle optionnelle

**Risque** : Coûts APIs IA élevés (Replicate, HeyGen)  
**Mitigation** : Limites par plan, cache, optimisation usage, pricing adapté

**Risque** : Rate limiting APIs externes  
**Mitigation** : Queue système, retry logic, fallbacks

### Risques Business

**Risque** : Concurrence Atelia  
**Mitigation** : Différenciation claire (marque complète vs pièces), focus POD vs fabricants

**Risque** : Adoption lente  
**Mitigation** : Freemium attractif, onboarding excellent, marketing ciblé

**Risque** : Qualité données gratuites  
**Mitigation** : Curation manuelle initiale, validation utilisateurs, amélioration progressive

---

## Success Metrics

### KPIs MVP (3-6 mois)

1. **Utilisateurs** :
   - 500 utilisateurs Free
   - 50 utilisateurs Pro
   - 5 utilisateurs Enterprise

2. **Engagement** :
   - 60% des utilisateurs complètent le Launch Map
   - 40% génèrent au moins 1 Tech Pack
   - 30% contactent au moins 1 usine
   - Temps moyen création marque < 15 minutes

3. **Revenus** :
   - 2000€/mois (MVP)
   - Croissance 25%/mois

4. **Satisfaction** :
   - NPS > 50
   - Taux de rétention > 70% (mois 2)
   - Score qualité designs IA > 4/5

---

## Next Steps

1. ✅ **PRD validé** (ce document)
2. ⏳ **Architecture technique** détaillée
3. ⏳ **Design UX/UI** (wireframes, prototypes)
4. ⏳ **Développement MVP** (3-4 mois)
5. ⏳ **Tests & Itérations**
6. ⏳ **Lancement Beta**
7. ⏳ **Lancement Public**

---

**Document créé par** : Product Manager (John) via BMAD-Method  
**Date** : 2025-01-23  
**Version** : 1.0  
**Status** : Ready for Architecture & Development
