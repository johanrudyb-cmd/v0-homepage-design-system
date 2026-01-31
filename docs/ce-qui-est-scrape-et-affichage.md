# Ce Qui Est Scrapé et Comment C'est Affiché

*Document créé via BMAD-Method - Dev + UX*

## Date : 2025-01-26

---

## 📥 Données Scrapées

### Pour Chaque Produit, On Scrape :

1. **Nom du produit** (ex: "Loose Fit Cargo Pant Noir")
2. **Prix** (ex: 89.99€)
3. **Image** (URL de l'image du produit)
4. **URL source** (lien vers le produit sur le site de la marque)
5. **Section** ("New In" ou "Best Sellers")
6. **Marque** (Zara, ASOS, etc.)
7. **Pays** (FR, US, UK, etc. - détecté depuis l'URL)

### Données Dérivées (Calculées Automatiquement)

À partir du nom, le système extrait automatiquement :

1. **Type de produit** : "Hoodie", "T-shirt", "Pantalon", "Cargo", etc.
2. **Coupe** : "Loose Fit", "Oversized", "Slim Fit", etc.
3. **Matériau** : "Coton", "Denim", "Polyester", etc.
4. **Couleur** : "Noir", "Beige", "Bleu", etc.
5. **Style** : "Streetwear", "Minimaliste", "Luxe", "Y2K", etc.

---

## 🔄 Flux de Données

```
1. SCRAPING (Puppeteer)
   ↓
   Site Zara → Extrait HTML
   ↓
   Sélecteurs CSS → Nom, Prix, Image, URL
   ↓

2. NORMALISATION
   ↓
   Analyse du nom → Type, Coupe, Matériau, Couleur
   ↓
   Analyse de l'URL → Pays
   ↓
   Analyse du nom → Style
   ↓

3. SAUVEGARDE (Base de Données)
   ↓
   Table: TrendSignal
   - productName: "Loose Fit Cargo Pant"
   - productType: "Cargo"
   - cut: "Loose Fit"
   - material: "Coton"
   - color: "Noir"
   - price: 89.99
   - imageUrl: "https://..."
   - brand: "Zara"
   - country: "FR"
   - style: "Streetwear"
   ↓

4. DÉTECTION DE TENDANCES
   ↓
   Regroupe produits similaires (même type + coupe + matériau)
   ↓
   Si 3+ marques différentes → Tendance Confirmée ✅
   ↓

5. CALCUL DES PRÉDICTIONS
   ↓
   Score de vitesse (velocity)
   Score de diversité (marques + pays)
   Score d'émergence (New In vs Best Sellers)
   Score de stabilité prix
   ↓
   Score global de prédiction (0-100)
   Phase: Émergent / Croissance / Pic / Déclin
   ↓

6. AFFICHAGE SUR LE SITE
```

---

## 🎨 Affichage sur le Site

### Page 1 : `/trends` - Trend Radar

#### Section 1 : Alertes Tendances Confirmées

```
┌─────────────────────────────────────────────┐
│ ⚠️ Tendances Confirmées (5)                 │
│ Produits détectés chez 3+ leaders           │
├─────────────────────────────────────────────┤
│                                             │
│ Loose Fit Cargo Pant                       │
│ [Cargo] [Loose Fit] [Coton]                │
│ 4 marques : Zara, ASOS, Zalando, H&M       │
│ Prix moyen : 89.99€                         │
│ Score : 4/5                                 │
│ [FR] [Streetwear]                           │
│                                             │
└─────────────────────────────────────────────┘
```

**Données affichées** :
- ✅ Nom du produit
- ✅ Type, Coupe, Matériau (badges)
- ✅ Liste des marques qui l'ont
- ✅ Prix moyen
- ✅ Score de confirmation (0-5)
- ✅ Pays et Style (badges colorés)

---

#### Section 2 : Graphique d'Évolution

```
┌─────────────────────────────────────────────┐
│ Évolution des Tendances                     │
├─────────────────────────────────────────────┤
│                                             │
│ Loose Fit Cargo Pant                        │
│ Cargo • Loose Fit                          │
│ ████████████░░░░░░░░ 4/5                    │
│                                             │
│ Oversized Hoodie                            │
│ Hoodie • Oversized                         │
│ ██████████░░░░░░░░░░ 3/5                    │
│                                             │
└─────────────────────────────────────────────┘
```

**Données affichées** :
- ✅ Nom du produit
- ✅ Type et Coupe
- ✅ Barre de progression (score/5)
- ✅ Score numérique

---

#### Section 3 : Liste Complète

```
┌─────────────────────────────────────────────┐
│ Toutes les Tendances                        │
│ 25 tendances détectées                      │
├─────────────────────────────────────────────┤
│                                             │
│ Loose Fit Cargo Pant        [Confirmé]     │
│ Cargo • Loose Fit • Coton                  │
│ Détecté chez : Zara, ASOS, Zalando         │
│ Prix moyen : 89.99€                        │
│ [FR] [Streetwear]                          │
│ Score : 4/5                                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Page 2 : `/trends/predictions` - Prédictions IA

```
┌─────────────────────────────────────────────┐
│ 🔮 Prédictions de Tendances IA              │
├─────────────────────────────────────────────┤
│                                             │
│ Loose Fit Cargo Pant                        │
│ [En Croissance] [🔮 Haute]                  │
│ Cargo • Loose Fit • Coton • Streetwear     │
│                                             │
│ Score Prédiction: 84                        │
│                                             │
│ ┌──────┬──────┬──────┬──────┐              │
│ │ ⚡   │ 🌍   │ ✨   │ 💰   │              │
│ │Vitesse│Diversité│Émergence│Stabilité│     │
│ │ 100  │  60   │  80   │  96   │              │
│ └──────┴──────┴──────┴──────┘              │
│                                             │
│ Marques: Zara, ASOS, Zalando, H&M          │
│ Pays: FR, UK, DE                           │
│ Prix moyen: 89.99€ (85€ - 95€)            │
│ Apparitions: 12 (8 New In, 4 Best Sellers)│
│                                             │
│ ⏰ Pic estimé: 15/02/2025                  │
│ 📅 Détecté il y a: 5 jours                 │
│                                             │
└─────────────────────────────────────────────┘
```

**Données affichées** :
- ✅ Nom du produit
- ✅ Phase de tendance (badge coloré)
- ✅ Niveau de confiance (🔮 Haute / 📊 Moyenne / ⚠️ Faible)
- ✅ Type, Coupe, Matériau, Style
- ✅ **Score global de prédiction** (0-100)
- ✅ **4 scores détaillés** :
  - ⚡ Vitesse (trend velocity)
  - 🌍 Diversité (marques + pays)
  - ✨ Émergence (New In ratio)
  - 💰 Stabilité prix
- ✅ Liste des marques
- ✅ Liste des pays
- ✅ Prix moyen + fourchette
- ✅ Nombre d'apparitions (New In vs Best Sellers)
- ✅ **Date du pic estimé** (prédiction)
- ✅ Nombre de jours depuis première détection

---

### Page 3 : Statistiques (Filtres)

```
┌─────────────────────────────────────────────┐
│ Filtres                                     │
├─────────────────────────────────────────────┤
│                                             │
│ Pays: [Tous les pays ▼]                    │
│   - FR (15)                                 │
│   - UK (12)                                 │
│   - DE (8)                                  │
│                                             │
│ Style: [Tous les styles ▼]                 │
│   - Streetwear (20)                         │
│   - Minimaliste (10)                        │
│   - Y2K (5)                                 │
│                                             │
│ Type: [Tous les types ▼]                   │
│   - Cargo (15)                              │
│   - Hoodie (12)                             │
│   - T-shirt (8)                              │
│                                             │
└─────────────────────────────────────────────┘
```

**Données affichées** :
- ✅ Statistiques par pays
- ✅ Statistiques par style
- ✅ Statistiques par type de produit
- ✅ Filtres interactifs

---

## 📊 Exemple Concret

### Scraping d'un Produit

**Site** : Zara (https://www.zara.com)

**Produit scrapé** :
```json
{
  "name": "CARGO PANTS LOOSE FIT",
  "price": 89.99,
  "imageUrl": "https://static.zara.net/photos/.../image.jpg",
  "sourceUrl": "https://www.zara.com/fr/fr/cargo-pants-loose-fit-p...",
  "section": "new_in",
  "brand": "Zara",
  "country": "FR"
}
```

**Normalisation automatique** :
```json
{
  "type": "Cargo",
  "cut": "Loose Fit",
  "material": "Coton",
  "color": null,
  "style": "Streetwear"
}
```

**Sauvegarde dans TrendSignal** :
- ✅ Toutes les données ci-dessus
- ✅ `firstSeenAt`: 2025-01-26
- ✅ `appearanceCount`: 1

---

### Après Détection (3+ Marques)

**Tendance Confirmée** :
```json
{
  "productName": "Loose Fit Cargo Pant",
  "productType": "Cargo",
  "cut": "Loose Fit",
  "material": "Coton",
  "brands": ["Zara", "ASOS", "Zalando", "H&M"],
  "averagePrice": 89.99,
  "confirmationScore": 4,
  "isConfirmed": true,
  "country": "FR",
  "style": "Streetwear"
}
```

**Affichage** :
- ✅ Badge "Confirmé" (amber)
- ✅ Liste des 4 marques
- ✅ Score 4/5
- ✅ Badges [FR] [Streetwear]

---

### Après Calcul de Prédiction

**Prédiction** :
```json
{
  "predictionScore": 84,
  "velocityScore": 100,
  "diversityScore": 60,
  "emergenceScore": 80,
  "priceStabilityScore": 96,
  "trendPhase": "growing",
  "confidenceLevel": "high",
  "predictedPeakDate": "2025-02-15",
  "daysSinceFirstSeen": 5
}
```

**Affichage** :
- ✅ Score global : **84** (grand, en couleur)
- ✅ 4 scores détaillés avec icônes
- ✅ Badge "En Croissance" (vert)
- ✅ Badge "🔮 Haute" confiance
- ✅ Date du pic : **15/02/2025**

---

## 🎯 Résumé

### Ce Qui Est Scrapé
1. ✅ Nom, Prix, Image, URL
2. ✅ Section (New In / Best Sellers)
3. ✅ Marque et Pays

### Ce Qui Est Calculé
1. ✅ Type, Coupe, Matériau, Couleur (depuis le nom)
2. ✅ Style (depuis le nom)
3. ✅ Scores de prédiction (4 critères)
4. ✅ Phase de tendance
5. ✅ Date du pic estimé

### Ce Qui Est Affiché
1. ✅ **Trend Radar** (`/trends`) : Tendances confirmées avec scores
2. ✅ **Prédictions IA** (`/trends/predictions`) : Scores détaillés + prédictions
3. ✅ **Statistiques** : Filtres par pays, style, type
4. ✅ **Graphiques** : Évolution des tendances

---

**Créé via BMAD-Method** 🎯
