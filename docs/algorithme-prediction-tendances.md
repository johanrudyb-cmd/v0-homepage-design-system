# Algorithme de Prédiction de Tendances

*Document créé via BMAD-Method - Dev + Architect*

## Date : 2025-01-26

---

## 🎯 Objectif

Créer un **algorithme de prédiction** qui analyse les marques et leurs vêtements pour **anticiper les tendances** avant qu'elles ne deviennent mainstream.

---

## 🧠 Algorithme Multi-Critères

L'algorithme analyse **7 critères principaux** pour prédire les tendances :

### 1. **Vitesse de Croissance (Trend Velocity)** - 30% du score

**Formule** : `(nombre d'apparitions × nombre de marques) / jours écoulés`

- **Vitesse > 2** : Très rapide → Score 100
- **Vitesse 1-2** : Rapide → Score 50-100
- **Vitesse < 1** : Lent → Score 0-50

**Exemple** :
- Produit détecté il y a 5 jours
- 10 apparitions dans 4 marques différentes
- Vitesse = (10 × 4) / 5 = **8** → Score **100** ✅

---

### 2. **Diversité des Marques & Pays** - 25% du score

**Formule** : `(score_marques × 0.6) + (score_pays × 0.4)`

- **Marques** : Plus il y a de marques différentes, plus le score est élevé
  - 5 marques = Score 100
  - 3 marques = Score 60
  - 1 marque = Score 20

- **Pays** : Diversité géographique
  - 10 pays = Score 100
  - 5 pays = Score 50
  - 1 pays = Score 10

**Exemple** :
- 4 marques différentes (Score 80)
- 3 pays différents (Score 30)
- Diversité = (80 × 0.6) + (30 × 0.4) = **60** ✅

---

### 3. **Score d'Émergence** - 25% du score

**Formule** : `(nombre "New In" / total) × 100`

- **100% New In** : Très émergent → Score 100
- **50% New In** : Émergent → Score 50
- **0% New In** : Déjà mainstream → Score 0

**Logique** : Les produits en "New In" sont plus prédictifs que ceux en "Best Sellers" (qui sont déjà confirmés).

**Exemple** :
- 8 apparitions en "New In"
- 2 apparitions en "Best Sellers"
- Émergence = (8 / 10) × 100 = **80** ✅

---

### 4. **Stabilité du Prix** - 20% du score

**Formule** : Coefficient de variation (CV) = `écart-type / moyenne`

- **CV < 0.1** : Très stable → Score 100
- **CV 0.1-0.3** : Stable → Score 70-100
- **CV > 0.3** : Instable → Score 0-70

**Logique** : Un prix stable indique une tendance mature et fiable.

**Exemple** :
- Prix : [89€, 90€, 89€, 91€, 90€]
- CV = 0.02 → Score **96** ✅

---

## 📊 Score Global de Prédiction

**Formule** :
```
Score = (Velocity × 0.30) + (Diversity × 0.25) + (Emergence × 0.25) + (Price Stability × 0.20)
```

**Exemple** :
- Velocity : 100
- Diversity : 60
- Emergence : 80
- Price Stability : 96

**Score Global** = (100 × 0.30) + (60 × 0.25) + (80 × 0.25) + (96 × 0.20) = **84.2** ✅

---

## 🔮 Phases de Tendance

L'algorithme détermine la **phase** de chaque tendance :

### 1. **Émergent (Emerging)**
- **Critères** : < 7 jours, vitesse élevée (> 70), peu d'apparitions (< 5)
- **Signification** : Tendance naissante, à surveiller de près

### 2. **En Croissance (Growing)**
- **Critères** : 7-30 jours, vitesse élevée (> 50)
- **Signification** : Tendance montante, moment idéal pour produire

### 3. **Pic (Peak)**
- **Critères** : 30-90 jours, beaucoup d'apparitions (> 10)
- **Signification** : Tendance à son apogée, risque de saturation

### 4. **Déclin (Declining)**
- **Critères** : > 90 jours ou vitesse faible (< 30)
- **Signification** : Tendance en déclin, éviter de produire

---

## 🎯 Niveau de Confiance

### **Haute (High)**
- Score > 70
- 3+ marques
- 5+ apparitions

### **Moyenne (Medium)**
- Score 50-70
- 2+ marques
- 3+ apparitions

### **Faible (Low)**
- Sinon

---

## 📅 Prédiction du Pic de Tendance

L'algorithme **prédit la date du pic** basé sur :

- **Phase Émergent** :
  - Vitesse > 70 → Pic dans **14 jours**
  - Vitesse < 70 → Pic dans **45 jours**

- **Phase Croissance** :
  - Vitesse > 60 → Pic dans **14 jours**
  - Vitesse < 60 → Pic dans **28 jours**

- **Phase Pic/Déclin** : Déjà passé le pic

---

## 🏪 Intégration des Marques

### Marques Principales (Toujours incluses)
- Zara
- ASOS
- Zalando
- H&M
- Uniqlo

### Marques Moyennes (Optionnelles, enrichissent les données)
- Mango
- Massimo Dutti
- COS
- Arket
- Weekday
- Bershka
- Pull&Bear
- Stradivarius

**Note** : Plus il y a de marques, plus les prédictions sont précises.

---

## 📡 API Endpoints

### GET `/api/trends/predict`
Obtenir les tendances prédites

**Paramètres** :
- `limit` : Nombre de résultats (défaut: 20)
- `phase` : Filtrer par phase (`emerging`, `growing`, `peak`, `declining`)

**Exemple** :
```bash
GET /api/trends/predict?limit=10&phase=emerging
```

**Réponse** :
```json
{
  "predictions": [
    {
      "productName": "Loose Fit Cargo Pant",
      "productType": "Cargo",
      "predictionScore": 84,
      "velocityScore": 100,
      "diversityScore": 60,
      "emergenceScore": 80,
      "priceStabilityScore": 96,
      "trendPhase": "growing",
      "confidenceLevel": "high",
      "predictedPeakDate": "2025-02-15",
      "brands": ["Zara", "ASOS", "Zalando", "H&M"],
      "countries": ["FR", "UK", "DE"]
    }
  ]
}
```

---

## 🎨 Interface Utilisateur

### Page `/trends/predictions`

Affiche les prédictions avec :
- **Score de prédiction** (0-100)
- **Scores détaillés** (Velocity, Diversity, Emergence, Price Stability)
- **Phase de tendance** (badge coloré)
- **Niveau de confiance** (🔮 Haute, 📊 Moyenne, ⚠️ Faible)
- **Date du pic estimé**
- **Filtres par phase** (Émergent, Croissance, Pic, Déclin)

---

## 🚀 Utilisation Stratégique

### Pour les Utilisateurs

1. **Surveiller les tendances émergentes** (`phase=emerging`)
   - Score > 70 = Agir rapidement
   - Produire avant que ça devienne mainstream

2. **Analyser les tendances en croissance** (`phase=growing`)
   - Moment idéal pour produire
   - Pic estimé dans 2-4 semaines

3. **Éviter les tendances au pic** (`phase=peak`)
   - Risque de saturation
   - Marché déjà saturé

4. **Ignorer les tendances en déclin** (`phase=declining`)
   - Tendance passée
   - Ne pas produire

---

## 🔄 Workflow Recommandé

1. **Scanner quotidiennement** : `/api/trends/scan-big-brands`
2. **Analyser les prédictions** : `/trends/predictions?phase=emerging`
3. **Filtrer par score** : Score > 70, Confiance = High
4. **Agir rapidement** : Produire avant le pic estimé
5. **Surveiller l'évolution** : Vérifier quotidiennement

---

## 📈 Améliorations Futures

- [ ] Intégration Google Trends pour enrichir les scores
- [ ] Machine Learning pour améliorer la précision
- [ ] Analyse des réseaux sociaux (Instagram, TikTok)
- [ ] Prédiction de la durée de vie d'une tendance
- [ ] Recommandations personnalisées par style/pays

---

**Créé via BMAD-Method** 🎯
