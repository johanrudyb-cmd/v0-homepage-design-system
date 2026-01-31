# Stratégie d'Agrégation des Tendances

*Document créé via BMAD-Method - Analyst + Architect*

## Date : 2025-01-26

---

## 🎯 Question Stratégique

**Deux approches possibles** :

1. **Approche Agrégée** : Tous les sites → Groupement par catégorie → Moyenne → Tendances par pays/style/catégorie
2. **Approche Par Magasin** : Tendances par magasin et par pays

---

## 📊 Analyse Comparative

### Approche 1 : Agrégation Globale (RECOMMANDÉE)

#### ✅ Avantages

1. **Plus de Données = Meilleure Prédiction**
   - Combine toutes les marques
   - Plus robuste statistiquement
   - Moins sensible aux variations d'une seule marque

2. **Détecte les Vraies Tendances**
   - Une tendance réelle apparaît chez **plusieurs marques**
   - Si seulement Zara a un produit, ce n'est pas une tendance globale
   - Si 5 marques différentes l'ont → Tendance confirmée ✅

3. **Vue d'Ensemble**
   - Voir les patterns globaux du marché
   - Identifier les tendances cross-brand
   - Comprendre l'évolution du marché

4. **Meilleure Prédiction**
   - L'algorithme de prédiction fonctionne mieux avec plus de données
   - Scores plus fiables
   - Moins de faux positifs

#### ❌ Inconvénients

1. **Perd la Granularité par Marque**
   - Ne voit pas les spécificités d'une marque
   - Moins utile pour analyser une marque précise

2. **Moyenne Peut Masquer des Variations**
   - Un produit très cher chez une marque peut être masqué par des prix bas ailleurs

---

### Approche 2 : Par Magasin et Par Pays

#### ✅ Avantages

1. **Granularité Maximale**
   - Voir exactement ce que fait chaque marque
   - Analyser les stratégies spécifiques
   - Identifier les différences entre marques

2. **Analyse Comparative**
   - Comparer Zara vs ASOS vs H&M
   - Voir qui innove le plus
   - Identifier les leaders de tendances

3. **Spécificité Géographique**
   - Voir les différences par pays
   - Comprendre les marchés locaux

#### ❌ Inconvénients

1. **Moins de Données par Groupe**
   - Chaque groupe (marque × pays) a moins de données
   - Prédictions moins fiables
   - Plus de bruit statistique

2. **Risque de Faux Positifs**
   - Un produit unique à une marque n'est pas une tendance
   - Difficile de distinguer tendance vs produit spécifique

3. **Complexité**
   - Beaucoup plus de combinaisons (marque × pays × catégorie)
   - Interface plus complexe
   - Plus difficile à analyser

---

## 🏆 Recommandation : Approche Hybride

### Stratégie Optimale

**Agrégation Globale + Détails par Marque**

```
1. AGRÉGATION GLOBALE (Principal)
   ↓
   Tous les sites → Groupement par catégorie/style/pays
   ↓
   Calcul de moyennes et scores globaux
   ↓
   Identification des tendances confirmées (3+ marques)
   ↓
   Prédictions basées sur données agrégées
   ↓

2. DÉTAILS PAR MARQUE (Secondaire)
   ↓
   Pour chaque tendance globale
   ↓
   Afficher quelles marques l'ont
   ↓
   Voir les variations de prix par marque
   ↓
   Analyser les différences géographiques
```

---

## 🎨 Implémentation Recommandée

### Niveau 1 : Vue Globale (Agrégée)

**Page** : `/trends` - Trend Radar

**Affichage** :
```
┌─────────────────────────────────────────────┐
│ 🔥 TENDANCE CONFIRMÉE                       │
│                                             │
│ Loose Fit Cargo Pant                        │
│ [Cargo] [Loose Fit] [Coton]                │
│                                             │
│ 📊 Vue Globale                              │
│ • 5 marques : Zara, ASOS, Zalando, H&M... │
│ • 4 pays : FR (15), UK (12), DE (8), ES (5)│
│ • Prix moyen : 89.99€ (85€ - 95€)          │
│ • Style : Streetwear (80%)                  │
│ • Score prédiction : 84/100                 │
│                                             │
│ 📈 Évolution                                │
│ • Détecté il y a 5 jours                    │
│ • Phase : En Croissance                     │
│ • Pic estimé : 15/02/2025                   │
└─────────────────────────────────────────────┘
```

**Données** :
- ✅ Agrégation de **toutes les marques**
- ✅ Moyennes par pays
- ✅ Distribution par style
- ✅ Scores globaux

---

### Niveau 2 : Détails par Marque (Drill-Down)

**Page** : `/trends/[id]` - Détails d'une Tendance

**Affichage** :
```
┌─────────────────────────────────────────────┐
│ Loose Fit Cargo Pant - Détails             │
├─────────────────────────────────────────────┤
│                                             │
│ 📊 Vue Globale                              │
│ Score : 84/100 | Phase : En Croissance      │
│                                             │
│ 🏪 Par Marque                               │
│ ┌─────────┬───────┬──────┬─────────┐       │
│ │ Marque  │ Pays  │ Prix │ Section │       │
│ ├─────────┼───────┼──────┼─────────┤       │
│ │ Zara    │ FR    │ 89€  │ New In  │       │
│ │ ASOS    │ UK    │ 92€  │ New In  │       │
│ │ Zalando │ DE    │ 87€  │ Best... │       │
│ │ H&M     │ FR    │ 85€  │ New In  │       │
│ └─────────┴───────┴──────┴─────────┘       │
│                                             │
│ 🌍 Par Pays                                 │
│ • FR : 15 produits, prix moyen 87€         │
│ • UK : 12 produits, prix moyen 92€          │
│ • DE : 8 produits, prix moyen 87€           │
│                                             │
│ 🎨 Par Style                                │
│ • Streetwear : 20 produits (80%)           │
│ • Minimaliste : 5 produits (20%)            │
└─────────────────────────────────────────────┘
```

**Données** :
- ✅ Vue globale (agrégée)
- ✅ Détails par marque (tableau)
- ✅ Détails par pays (statistiques)
- ✅ Détails par style (distribution)

---

## 🔄 Algorithme Recommandé

### Étape 1 : Scraping

```typescript
// Scrape toutes les marques
const allProducts = await scrapeAllBigBrands();

// Résultat : Array de produits avec marque, pays, prix, etc.
```

### Étape 2 : Normalisation

```typescript
// Normaliser chaque produit
const normalized = products.map(p => ({
  key: `${p.type}|${p.cut}|${p.material}`, // Clé unique
  product: p,
  brand: p.brand,
  country: p.country,
  style: p.style,
  price: p.price,
}));
```

### Étape 3 : Agrégation Globale

```typescript
// Grouper par clé unique (type + cut + material)
const groups = groupBy(normalized, 'key');

// Pour chaque groupe
for (const group of groups) {
  // Calculer agrégations
  const aggregated = {
    productName: group[0].product.name,
    productType: group[0].product.type,
    cut: group[0].product.cut,
    material: group[0].product.material,
    
    // AGRÉGATIONS GLOBALES
    brands: [...new Set(group.map(g => g.brand))], // Marques uniques
    countries: [...new Set(group.map(g => g.country))], // Pays uniques
    averagePrice: mean(group.map(g => g.price)), // Prix moyen
    priceRange: {
      min: min(group.map(g => g.price)),
      max: max(group.map(g => g.price)),
    },
    
    // DISTRIBUTIONS
    byCountry: {
      FR: count(group.filter(g => g.country === 'FR')),
      UK: count(group.filter(g => g.country === 'UK')),
      // ...
    },
    byBrand: {
      Zara: count(group.filter(g => g.brand === 'Zara')),
      ASOS: count(group.filter(g => g.brand === 'ASOS')),
      // ...
    },
    byStyle: {
      Streetwear: count(group.filter(g => g.style === 'Streetwear')),
      // ...
    },
    
    // SCORES
    confirmationScore: uniqueBrands.length, // Nombre de marques
    diversityScore: calculateDiversity(brands, countries),
    // ...
  };
}
```

### Étape 4 : Détection de Tendances

```typescript
// Filtrer les tendances confirmées (3+ marques)
const confirmedTrends = aggregated.filter(t => t.brands.length >= 3);

// Calculer les scores de prédiction
const predictions = confirmedTrends.map(t => ({
  ...t,
  predictionScore: calculatePredictionScore(t),
  trendPhase: determinePhase(t),
  predictedPeakDate: predictPeak(t),
}));
```

---

## 📈 Exemple Concret

### Scraping

**Produits scrapés** :
- Zara (FR) : "Cargo Loose Fit" - 89€ - New In
- ASOS (UK) : "Loose Fit Cargo" - 92€ - New In
- Zalando (DE) : "Cargo Loose Fit" - 87€ - Best Sellers
- H&M (FR) : "Loose Fit Cargo" - 85€ - New In
- Uniqlo (JP) : "Cargo Loose Fit" - 90€ - New In

### Agrégation Globale

**Tendance** :
```json
{
  "productName": "Loose Fit Cargo Pant",
  "productType": "Cargo",
  "cut": "Loose Fit",
  "material": "Coton",
  
  "brands": ["Zara", "ASOS", "Zalando", "H&M", "Uniqlo"],
  "countries": ["FR", "UK", "DE", "JP"],
  "averagePrice": 88.6,
  "priceRange": { "min": 85, "max": 92 },
  
  "byCountry": {
    "FR": 2,
    "UK": 1,
    "DE": 1,
    "JP": 1
  },
  "byBrand": {
    "Zara": 1,
    "ASOS": 1,
    "Zalando": 1,
    "H&M": 1,
    "Uniqlo": 1
  },
  
  "confirmationScore": 5,
  "predictionScore": 88
}
```

### Affichage

**Vue Globale** :
- ✅ 5 marques différentes
- ✅ 4 pays différents
- ✅ Prix moyen : 88.6€ (85€ - 92€)
- ✅ Score : 5/5 (tendance très forte)

**Détails par Marque** (au clic) :
- ✅ Zara (FR) : 89€ - New In
- ✅ ASOS (UK) : 92€ - New In
- ✅ Zalando (DE) : 87€ - Best Sellers
- ✅ H&M (FR) : 85€ - New In
- ✅ Uniqlo (JP) : 90€ - New In

---

## 🎯 Recommandation Finale

### ✅ Utiliser l'Approche Agrégée comme Principal

**Raisons** :
1. **Meilleure Prédiction** : Plus de données = meilleure précision
2. **Vraies Tendances** : Détecte les tendances cross-brand (les vraies tendances)
3. **Robustesse** : Moins sensible aux variations d'une seule marque
4. **Simplicité** : Interface plus claire et actionnable

### ✅ Garder les Détails par Marque comme Secondaire

**Raisons** :
1. **Analyse Profonde** : Permet de comprendre les variations
2. **Comparaison** : Voir les différences entre marques
3. **Granularité** : Pour les utilisateurs qui veulent creuser

---

## 🔧 Implémentation Technique

### Modifier l'Algorithme Actuel

L'algorithme actuel fait déjà de l'agrégation, mais on peut l'améliorer :

1. **Agrégation Multi-Niveaux** :
   - Global (toutes marques)
   - Par pays
   - Par style
   - Par catégorie

2. **Scores Agregés** :
   - Score global (toutes marques)
   - Score par pays
   - Score par style

3. **Détails Disponibles** :
   - Vue globale par défaut
   - Drill-down par marque au clic

---

## 📊 Structure de Données Recommandée

```typescript
interface AggregatedTrend {
  // Identification
  productKey: string; // "Cargo|Loose Fit|Coton"
  productName: string;
  productType: string;
  cut: string | null;
  material: string | null;
  
  // AGRÉGATIONS GLOBALES
  brands: string[]; // Toutes les marques
  countries: string[]; // Tous les pays
  averagePrice: number; // Prix moyen global
  priceRange: { min: number; max: number };
  
  // DISTRIBUTIONS
  byCountry: Record<string, {
    count: number;
    averagePrice: number;
    brands: string[];
  }>;
  byBrand: Record<string, {
    count: number;
    averagePrice: number;
    countries: string[];
  }>;
  byStyle: Record<string, {
    count: number;
    percentage: number;
  }>;
  
  // SCORES GLOBAUX
  confirmationScore: number; // Nombre de marques
  predictionScore: number; // Score de prédiction global
  trendPhase: 'emerging' | 'growing' | 'peak' | 'declining';
  
  // DÉTAILS (pour drill-down)
  details: {
    brand: string;
    country: string;
    price: number;
    section: 'new_in' | 'best_sellers';
  }[];
}
```

---

## ✅ Conclusion

**Recommandation** : **Approche Agrégée avec Détails Disponibles**

1. **Principal** : Vue globale agrégée (toutes marques, tous pays)
2. **Secondaire** : Détails par marque/pays au clic
3. **Avantage** : Meilleure prédiction + flexibilité d'analyse

**L'algorithme actuel fait déjà cela, mais on peut l'améliorer avec** :
- Agrégations multi-niveaux (global, pays, style)
- Scores agrégés par dimension
- Interface avec drill-down

---

**Créé via BMAD-Method** 🎯
