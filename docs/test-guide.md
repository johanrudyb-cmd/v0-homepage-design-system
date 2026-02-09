# Guide de Tests Fonctionnels

## Vue d'ensemble

Ce document décrit les tests fonctionnels end-to-end pour valider tous les modules de l'application OUTFITY.

## Prérequis

- Node.js 18+ (pour l'API `fetch`)
- Serveur de développement en cours d'exécution (`npm run dev`)
- Base de données configurée et accessible
- Variables d'environnement configurées (`.env`)

## Exécution des Tests

### Test End-to-End Complet

```bash
npm run test:e2e
```

### Test avec URL personnalisée

```bash
TEST_BASE_URL=http://localhost:3000 npm run test:e2e
```

## Modules Testés

### 1. Authentification ✅

- **Inscription utilisateur**
  - Création d'un compte avec email/password
  - Validation des données utilisateur

- **Connexion utilisateur**
  - Authentification avec email/password
  - Génération du token JWT

- **Récupération utilisateur**
  - Endpoint `/api/auth/me`
  - Validation de la session

- **Déconnexion**
  - Invalidation de la session
  - Suppression du cookie

### 2. Launch Map ✅

- **Phase 1 - Calculateur de rentabilité**
  - Sauvegarde des données de calcul
  - Validation des calculs

- **Phase 2 - Design**
  - Mise à jour du statut de phase
  - Intégration avec Design Studio

- **Phase 3 - Sourcing**
  - Mise à jour du statut de phase
  - Intégration avec Sourcing Hub

- **Phase 4 - Marketing**
  - Mise à jour du statut de phase
  - Intégration avec UGC AI Lab

### 3. Design Studio ✅

- **Récupération des designs**
  - Liste des designs par marque
  - Filtrage et tri

- **Export PDF Tech Pack**
  - Génération du PDF
  - Téléchargement du fichier
  - Validation du contenu

### 4. Sourcing Hub ✅

- **Récupération des usines**
  - Liste complète des usines
  - Filtres (pays, MOQ, spécialités)

- **Demande de devis**
  - Création d'une demande
  - Association avec marque et usine
  - Validation des données

### 5. UGC AI Lab ✅

- **Récupération des scripts UGC**
  - Liste des scripts par marque
  - Validation du format

- **Virtual Try-On** (à tester manuellement)
  - Upload d'image
  - Génération avec Higgsfield
  - Récupération du résultat

### 6. Brand Spy ✅

- **Analyse d'URL Shopify**
  - Soumission d'URL
  - Génération du rapport
  - Validation des données

- **Export PDF rapport**
  - Génération du PDF
  - Téléchargement du fichier
  - Validation du contenu

### 7. Tendances & Hits ✅

- **Récupération des produits**
  - Liste des produits tendances
  - Filtres (catégorie, style, matière)

- **Gestion des favoris**
  - Ajout d'un produit aux favoris
  - Suppression d'un favori
  - Liste des favoris

## Résultats Attendus

### Succès ✅

Tous les tests doivent retourner :
- Status HTTP 200/201 pour les créations
- Données valides dans la réponse
- Pas d'erreurs dans les logs

### Échecs ⚠️

Les tests peuvent échouer si :
- Le serveur n'est pas démarré
- La base de données n'est pas accessible
- Les variables d'environnement sont manquantes
- Les APIs externes (ChatGPT, Higgsfield) ne répondent pas

## Tests Manuels Recommandés

### Design Studio

1. Générer un nouveau design
2. Vérifier le flat sketch
3. Vérifier le tech pack
4. Exporter en PDF

### UGC AI Lab

1. Uploader une image pour Virtual Try-On
2. Générer un script UGC
3. Vérifier le format du script

### Sourcing Hub

1. Filtrer les usines par pays
2. Filtrer par MOQ
3. Demander un devis
4. Vérifier la liste des devis

### Brand Spy

1. Analyser une vraie URL Shopify
2. Vérifier l'estimation de CA
3. Vérifier la stack technique
4. Exporter le rapport en PDF

## Dépannage

### Erreur: "fetch is not defined"

**Solution**: Utilisez Node.js 18+ qui inclut l'API `fetch` nativement.

### Erreur: "Connection refused"

**Solution**: Vérifiez que le serveur de développement est démarré (`npm run dev`).

### Erreur: "Non authentifié"

**Solution**: Vérifiez que les tests d'authentification passent en premier.

### Erreur: "Design non trouvé"

**Solution**: Créez d'abord un design via l'interface ou les scripts de seed.

## Améliorations Futures

- [ ] Tests unitaires avec Jest
- [ ] Tests d'intégration avec Supertest
- [ ] Tests E2E avec Playwright
- [ ] Coverage de code avec Istanbul
- [ ] Tests de performance
- [ ] Tests de sécurité

## Notes

- Les tests utilisent des données de test (emails avec timestamp)
- Les données de test ne sont pas nettoyées automatiquement
- Certains tests nécessitent des données pré-existantes (usines, produits)
- Les tests d'export PDF vérifient uniquement le status HTTP, pas le contenu
