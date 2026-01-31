# Guide Trend Radar - Utilisation Complète

*Document créé via BMAD-Method - UX Expert*

## Date : 2025-01-26

---

## 🎯 Objectif

Utiliser le **Trend Radar** pour prédire les tendances et avoir un **avantage injuste** en prédisant ce qui sera "Sold Out" le mois prochain.

---

## 🚀 Démarrage Rapide

### 1. Migration Base de Données

```bash
# Arrêter le serveur dev (Ctrl+C)
# Générer le client Prisma
npm run db:generate

# Pousser le schéma
npm run db:push
```

---

### 2. Premier Scan

**Via l'interface** :
1. Aller sur `/trends`
2. Cliquer sur **"Scanner les marques"**
3. Attendre 2-3 minutes (scraping de 5 marques × 2 sections)
4. Voir les tendances confirmées

**Via API** :
```bash
curl -X POST http://localhost:3000/api/trends/scan-big-brands \
  -H "Content-Type: application/json"
```

---

## 📊 Comprendre les Tendances

### Score de Confirmation

- **1-2 marques** : Tendance émergente (surveiller)
- **3 marques** : ✅ **Tendance Confirmée** (action recommandée)
- **4-5 marques** : ✅✅ **Tendance Forte** (action immédiate)

### Exemple

**"Loose Fit Cargo" détecté chez** :
- Zara ✅
- ASOS ✅
- Zalando ✅
- H&M ✅

**Résultat** :
- ✅ **Tendance Confirmée**
- Score : **4/5**
- **Action** : Produire cette coupe maintenant (sera sold out dans 1 mois)

---

## 🎨 Interface Trend Radar

### Sections

1. **Header** : Titre + Bouton scan
2. **Alertes** : Tendances confirmées (3+ leaders) en haut
3. **Graphique** : Évolution des scores de confirmation
4. **Liste** : Toutes les tendances détectées

### Données Affichées

Pour chaque tendance :
- **Nom produit** : Ex: "Loose Fit Cargo Pant"
- **Type** : Ex: "Cargo"
- **Coupe** : Ex: "Loose Fit"
- **Marques** : Ex: "Zara, ASOS, Zalando, H&M"
- **Prix moyen** : Ex: "49.95€"
- **Score** : Ex: "4/5" (nombre de marques)

---

## ⚙️ Automatisation

### CRON Job Quotidien

**Schedule** : Tous les jours à 6h00 (UTC)

**Configuration** : `vercel.json`

**URL** : `GET /api/cron/scan-trends`

**Headers** :
```
Authorization: Bearer ${CRON_SECRET}
```

**Résultat** : Scan automatique quotidien des 5 marques

---

## 🔍 Logique de Détection

### Algorithme

1. **Scraping** : Récupère "New In" et "Best Sellers" de chaque marque
2. **Normalisation** : Extrait type, coupe, matériau, couleur
3. **Regroupement** : Groupe produits similaires (même `type + coupe + matériau`)
4. **Détection** : Si groupe contient **3+ marques** → **Tendance Confirmée**
5. **Scoring** : `confirmationScore` = nombre de marques (1-5)

### Exemple Concret

**Produits détectés** :
- Zara : "Cargo Loose Fit Pantalon Noir"
- ASOS : "Loose Fit Cargo Pants Black"
- Zalando : "Pantalon Cargo Loose Fit Noir"
- H&M : "Cargo Loose Fit"

**Normalisation** :
- Type : "Cargo"
- Coupe : "Loose Fit"
- Matériau : null
- Couleur : "Noir"

**Résultat** :
- ✅ **Tendance Confirmée** (4 marques)
- Score : **4/5**
- **Prédiction** : Ce produit sera sold out dans 3-4 semaines

---

## 📈 Utilisation Stratégique

### Pour les Utilisateurs

1. **Scanner quotidiennement** : Voir nouvelles tendances
2. **Surveiller scores 3+** : Tendances confirmées
3. **Agir rapidement** : Produire avant que ça soit sold out
4. **Analyser graphiques** : Voir montée en puissance

### Workflow Recommandé

1. **Matin** : Vérifier nouvelles tendances confirmées
2. **Analyse** : Identifier produits avec score 4-5
3. **Action** : Produire ces produits rapidement
4. **Suivi** : Surveiller évolution sur graphiques

---

## 🚨 Points d'Attention

### 1. Scraping Peut Échouer

**Problème** : Sites peuvent bloquer ou changer structure

**Solution** :
- Vérifier logs console
- Tester manuellement si échec
- Mettre à jour sélecteurs CSS si nécessaire

---

### 2. Normalisation Imparfaite

**Problème** : Noms produits varient entre marques

**Solution** :
- Algorithme de normalisation intelligent
- Peut nécessiter ajustements manuels
- Amélioration continue

---

### 3. Rate Limiting

**Problème** : Sites peuvent limiter requêtes

**Solution** :
- Attendre 3 secondes entre chaque marque
- Limiter à 50 produits par section
- Utiliser user agents réalistes

---

## ✅ Checklist Utilisation

### Première Utilisation
- [ ] Migration Prisma exécutée
- [ ] Premier scan manuel effectué
- [ ] Tendances confirmées visibles
- [ ] Graphiques fonctionnels

### Utilisation Quotidienne
- [ ] CRON job configuré (Vercel)
- [ ] Scan automatique quotidien
- [ ] Vérification tendances confirmées
- [ ] Action sur tendances score 4-5

---

## 🎯 Résultat Attendu

**Avant** : Utilisateur devine les tendances

**Après** : Utilisateur **prédit** les tendances avec données réelles

**Avantage** : Produire avant que ça soit sold out = **avantage injuste** ✅

---

**Document créé par** : UX Expert  
**Date** : 2025-01-26  
**Status** : Guide d'utilisation Trend Radar
