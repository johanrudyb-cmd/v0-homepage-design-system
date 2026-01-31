# Stratégie Trend Forecasting - Big Brands Only

*Document créé via BMAD-Method - Analyst + Architect*

## Date : 2025-01-26

---

## 🎯 Objectif

Construire un **moteur de prédiction de tendances** basé sur l'analyse des leaders mondiaux (Zara, ASOS, Zalando, H&M, Uniqlo) pour donner un **avantage injuste** aux utilisateurs en prédisant ce qui sera "Sold Out" le mois prochain.

---

## 📊 Analyse des Leaders (Analyste)

### 1. Zara (zara.com)

**Sections à scraper** :
- **New In** : `/fr/fr/categorie/femme/nouveautes-c358009.html`
- **Best Sellers** : Pas de section dédiée visible, mais produits populaires dans chaque catégorie

**Endpoints JSON** :
- API interne : `https://www.zara.com/api/catalog/products?categoryId=...`
- Format : JSON avec produits, prix, images, disponibilité

**Sélecteurs CSS** :
- Produits : `.product-item`, `.product-card`
- Titre : `.product-name`
- Prix : `.price`
- Image : `.product-image img`

**Structure données** :
```json
{
  "products": [
    {
      "id": "...",
      "name": "Cargo Loose Fit",
      "price": 49.95,
      "category": "Pantalon",
      "image": "...",
      "isNew": true
    }
  ]
}
```

---

### 2. ASOS (asos.com)

**Sections à scraper** :
- **New In** : `/new-in/ctas/?nlid=nav|header|new+in`
- **Best Sellers** : `/best-sellers/ctas/?nlid=nav|header|best+sellers`

**Endpoints JSON** :
- API GraphQL : `https://www.asos.com/api/product/search/v2/`
- Format : GraphQL avec produits, prix, images

**Sélecteurs CSS** :
- Produits : `article[data-auto-id="productTile"]`
- Titre : `h3[data-auto-id="productTileTitle"]`
- Prix : `span[data-auto-id="productTilePrice"]`
- Image : `img[data-auto-id="productTileImage"]`

---

### 3. Zalando (zalando.fr)

**Sections à scraper** :
- **New In** : `/nouveautes/`
- **Best Sellers** : `/best-sellers/`

**Endpoints JSON** :
- API REST : `https://www.zalando.fr/api/catalog/products`
- Format : JSON avec produits, prix, images

**Sélecteurs CSS** :
- Produits : `.z-nvg-catalog_articles-article`
- Titre : `.z-nvg-catalog_articles-article-name`
- Prix : `.z-nvg-catalog_articles-article-price`
- Image : `.z-nvg-catalog_articles-article-image img`

---

### 4. H&M (hm.com)

**Sections à scraper** :
- **New In** : `/fr_fr/ladies/shop-by-product/view-all.html?sort=news`
- **Best Sellers** : Pas de section dédiée, mais tri par popularité

**Endpoints JSON** :
- API interne : `https://www2.hm.com/fr_fr/productpage.ajax.json?article=...`
- Format : JSON avec produits, prix, images

**Sélecteurs CSS** :
- Produits : `.product-item`
- Titre : `.product-item-title`
- Prix : `.product-item-price`
- Image : `.product-item-image img`

---

### 5. Uniqlo (uniqlo.com)

**Sections à scraper** :
- **New In** : `/fr/fr/new-arrivals/`
- **Best Sellers** : `/fr/fr/best-sellers/`

**Endpoints JSON** :
- API REST : `https://www.uniqlo.com/api/products`
- Format : JSON avec produits, prix, images

**Sélecteurs CSS** :
- Produits : `.product-tile`
- Titre : `.product-tile-name`
- Prix : `.product-tile-price`
- Image : `.product-tile-image img`

---

## 🗄️ Modèle Prisma TrendSignal (Architecte)

### Schéma à créer

```prisma
model TrendSignal {
  id            String   @id @default(cuid())
  
  // Identification produit
  productName   String   // Ex: "Loose Fit Cargo Pant"
  productType   String   // Ex: "Pantalon", "Hoodie", "T-shirt"
  cut           String?  // Ex: "Loose Fit", "Oversized", "Slim"
  material      String?  // Ex: "Coton", "Denim"
  color         String?  // Ex: "Noir", "Beige"
  
  // Source
  brand         String   // "Zara", "ASOS", "Zalando", "H&M", "Uniqlo"
  sourceUrl     String   // URL du produit
  sourceSection String   // "new_in" | "best_sellers"
  
  // Métriques
  price         Float    // Prix en EUR
  priceCurrency String   @default("EUR")
  imageUrl      String?
  
  // Détection tendance
  appearanceCount Int    @default(1) // Nombre de fois apparu cette semaine
  firstSeenAt     DateTime @default(now())
  lastSeenAt      DateTime @default(now())
  
  // Confirmation tendance
  confirmedAt     DateTime? // Date de confirmation (3+ leaders)
  isConfirmed     Boolean   @default(false)
  confirmationScore Int      @default(0) // Nombre de leaders qui l'ont
  
  // Métadonnées
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([productType, isConfirmed])
  @@index([brand, sourceSection])
  @@index([confirmedAt])
}
```

---

## 🤖 Logique IA de Détection (Dev)

### Algorithme de Détection

1. **Scraping quotidien** : Scraper "New In" et "Best Sellers" de chaque leader
2. **Normalisation** : Extraire type, coupe, matériau, couleur
3. **Regroupement** : Grouper produits similaires (même type + coupe)
4. **Détection** : Si 3+ leaders ont le même produit → **Tendance Confirmée**
5. **Scoring** : Calculer score de tendance (nombre de leaders, vitesse d'apparition)

### Code Structure

```typescript
// lib/trend-detector.ts
interface TrendProduct {
  name: string;
  type: string;
  cut: string;
  material: string;
  brand: string;
  price: number;
}

export async function detectTrends(products: TrendProduct[]): Promise<TrendSignal[]> {
  // 1. Normaliser les produits
  const normalized = normalizeProducts(products);
  
  // 2. Grouper par similarité
  const groups = groupSimilarProducts(normalized);
  
  // 3. Détecter tendances (3+ leaders)
  const trends = groups.filter(g => g.brands.length >= 3);
  
  // 4. Créer TrendSignals
  return createTrendSignals(trends);
}
```

---

## 🎨 Interface Trend Radar (UX Expert)

### Transformation Brand Spy → Trend Radar

**Nouvelle structure** :
1. **Dashboard Tendances** : Vue d'ensemble des tendances confirmées
2. **Graphiques de Montée** : Évolution temporelle des produits
3. **Alertes** : Notifications pour nouvelles tendances confirmées
4. **Détails Produit** : Analyse approfondie de chaque tendance

### Composants à créer

- `TrendRadar.tsx` : Composant principal
- `TrendChart.tsx` : Graphiques de montée en puissance
- `TrendAlert.tsx` : Alertes tendances confirmées
- `TrendDetails.tsx` : Détails d'une tendance

---

## 📋 Plan d'Implémentation

### Phase 1 : Infrastructure (Semaine 1)

1. [ ] Créer modèle Prisma `TrendSignal`
2. [ ] Créer scrapers pour chaque leader
3. [ ] Créer logique de normalisation
4. [ ] Créer logique de détection

### Phase 2 : Scraping (Semaine 2)

1. [ ] Implémenter scraper Zara
2. [ ] Implémenter scraper ASOS
3. [ ] Implémenter scraper Zalando
4. [ ] Implémenter scraper H&M
5. [ ] Implémenter scraper Uniqlo

### Phase 3 : Détection (Semaine 3)

1. [ ] Algorithme de regroupement
2. [ ] Détection tendances (3+ leaders)
3. [ ] Système d'alertes
4. [ ] CRON job quotidien

### Phase 4 : Interface (Semaine 4)

1. [ ] Transformer Brand Spy en Trend Radar
2. [ ] Graphiques de montée
3. [ ] Dashboard tendances
4. [ ] Notifications alertes

---

## 🚀 Prochaines Étapes Immédiates

1. **Créer modèle Prisma** : `TrendSignal`
2. **Créer scrapers** : Un scraper par leader
3. **Créer logique détection** : Algorithme de regroupement et confirmation
4. **Créer interface** : Trend Radar avec graphiques

---

**Document créé par** : Analyst + Architect  
**Date** : 2025-01-26  
**Status** : Stratégie Trend Forecasting
