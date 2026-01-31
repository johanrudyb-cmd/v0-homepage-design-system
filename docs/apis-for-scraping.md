# APIs pour Améliorer le Scraping Brand Spy

## Vue d'ensemble

Actuellement, le système utilise **Puppeteer** pour scraper directement les pages web. Voici les APIs qui peuvent améliorer la précision des données.

---

## 🎯 APIs Essentielles (Recommandées)

### 1. Shopify Storefront API ⭐⭐⭐⭐⭐ (GRATUIT)

**Ce que ça donne** :
- ✅ **Produits réels** : Liste complète des produits (pas seulement homepage)
- ✅ **Prix exacts** : Prix réels avec devises
- ✅ **Images haute qualité** : URLs directes des images produits
- ✅ **Variantes** : Tailles, couleurs, stocks
- ✅ **Collections** : Catégories de produits
- ✅ **Métadonnées** : Tags, descriptions, types

**Limitations** :
- ⚠️ Seulement pour les stores Shopify
- ⚠️ Pas de données privées (stocks réels nécessitent Admin API)
- ⚠️ Rate limiting (généralement 2 requêtes/seconde)

**Comment l'utiliser** :
```typescript
// Endpoint : https://{store}.myshopify.com/api/2024-01/graphql.json
const query = `
  query {
    products(first: 50) {
      edges {
        node {
          id
          title
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                price
                availableForSale
                inventoryQuantity
              }
            }
          }
        }
      }
    }
  }
`;

const response = await fetch(`https://${storeDomain}/api/2024-01/graphql.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query }),
});
```

**Coût** : **0€** (API publique)

**Impact** : ⭐⭐⭐⭐⭐ (Données produits 100% précises)

---

### 2. SimilarWeb API ⭐⭐⭐⭐ (PAYANT ~199€/mois)

**Ce que ça donne** :
- ✅ **Trafic réel** : Visites mensuelles exactes
- ✅ **Sources de trafic** : Direct, SEO, Social, Paid
- ✅ **Géolocalisation** : Répartition par pays
- ✅ **Tendances** : Évolution du trafic
- ✅ **Concurrents** : Sites similaires

**Limitations** :
- ⚠️ Coût élevé (199€/mois)
- ⚠️ Données estimées (pas 100% exactes)
- ⚠️ Rate limiting (varie selon le plan)

**Alternative gratuite** :
- SimilarWeb Free (scraping manuel, données limitées)
- Estimation basée sur d'autres métriques (actuel)

**Coût** : **199€/mois** (plan Pro)

**Impact** : ⭐⭐⭐⭐ (Trafic réel au lieu d'estimations)

---

### 3. Wappalyzer API ⭐⭐⭐ (PAYANT ~49€/mois)

**Ce que ça donne** :
- ✅ **Apps installées** : Liste complète et précise
- ✅ **Technologies** : Framework, CMS, serveur
- ✅ **E-commerce** : Plateforme, outils marketing
- ✅ **Analytics** : Google Analytics, Facebook Pixel, etc.

**Limitations** :
- ⚠️ Coût (49€/mois pour 1000 requêtes)
- ⚠️ Détection côté client uniquement (pas d'apps backend)

**Alternative gratuite** :
- Wappalyzer Extension (gratuite, mais manuelle)
- Scraping des scripts (actuel, moins précis)

**Coût** : **49€/mois** (1000 requêtes)

**Impact** : ⭐⭐⭐ (Détection apps plus précise)

---

## 🔍 APIs Complémentaires (Optionnelles)

### 4. BuiltWith API ⭐⭐⭐ (PAYANT ~295€/mois)

**Ce que ça donne** :
- ✅ **Stack technique complète** : Plus détaillé que Wappalyzer
- ✅ **Historique** : Évolution de la stack
- ✅ **Comparaison** : Avec d'autres sites

**Limitations** :
- ⚠️ Coût très élevé (295€/mois)
- ⚠️ Redondant avec Wappalyzer pour MVP

**Coût** : **295€/mois**

**Impact** : ⭐⭐⭐ (Meilleur que Wappalyzer, mais coût élevé)

---

### 5. Facebook Ad Library ⭐⭐⭐ (GRATUIT - Scraping)

**Ce que ça donne** :
- ✅ **Publicités actives** : Voir les campagnes Meta
- ✅ **Budget estimé** : Dépenses publicitaires
- ✅ **Formats** : Images, vidéos, carrousels
- ✅ **Ciblage** : Audiences ciblées

**Limitations** :
- ⚠️ Scraping nécessaire (pas d'API officielle)
- ⚠️ Données limitées (pas de budget exact)
- ⚠️ Rate limiting à gérer

**Méthode** :
```typescript
// Scraping Facebook Ad Library
const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=FR&q=${encodeURIComponent(storeName)}&search_type=page&media_type=all`;

// Utiliser Puppeteer pour scraper
const page = await browser.newPage();
await page.goto(url);
// Extraire les publicités...
```

**Coût** : **0€** (scraping)

**Impact** : ⭐⭐⭐ (Insight marketing)

---

### 6. TikTok Ad Library ⭐⭐⭐ (GRATUIT - Scraping)

**Ce que ça donne** :
- ✅ **Publicités TikTok** : Campagnes actives
- ✅ **Formats** : Vidéos, images
- ✅ **Engagement** : Likes, shares (si visibles)

**Limitations** :
- ⚠️ Scraping nécessaire
- ⚠️ Données limitées

**Coût** : **0€** (scraping)

**Impact** : ⭐⭐⭐ (Insight marketing TikTok)

---

### 7. Google Trends API (Non-officielle) ⭐⭐ (GRATUIT)

**Ce que ça donne** :
- ✅ **Tendances de recherche** : Popularité des mots-clés
- ✅ **Géolocalisation** : Tendances par pays
- ✅ **Comparaison** : Comparer plusieurs termes

**Limitations** :
- ⚠️ Pas d'API officielle (bibliothèque npm)
- ⚠️ Rate limiting strict
- ⚠️ Données relatives (pas absolues)

**Méthode** :
```typescript
import googleTrends from 'google-trends-api';

const trends = await googleTrends.interestOverTime({
  keyword: storeName,
  geo: 'FR',
  startTime: new Date('2024-01-01'),
  endTime: new Date(),
});
```

**Coût** : **0€**

**Impact** : ⭐⭐ (Tendances, pas données directes)

---

## 📊 Recommandations par Phase

### MVP (Phase 1) - Coût : 0€

**APIs à intégrer** :
1. ✅ **Shopify Storefront API** (gratuit) - Produits réels
2. ✅ **Facebook Ad Library** (gratuit, scraping) - Publicités
3. ✅ **TikTok Ad Library** (gratuit, scraping) - Publicités TikTok

**Résultat** :
- Produits 100% précis (au lieu d'estimations)
- Prix réels
- Publicités visibles
- **Coût total : 0€**

---

### Phase 2 - Coût : 49€/mois

**APIs à ajouter** :
4. ✅ **Wappalyzer API** (49€/mois) - Détection apps précise

**Résultat** :
- Apps détectées avec précision
- Stack technique complète
- **Coût total : 49€/mois**

---

### Phase 3 - Coût : 248€/mois

**APIs à ajouter** :
5. ✅ **SimilarWeb API** (199€/mois) - Trafic réel

**Résultat** :
- Trafic réel au lieu d'estimations
- Sources de trafic
- **Coût total : 248€/mois**

---

## 🚀 Plan d'Implémentation

### Étape 1 : Shopify Storefront API (Priorité 1)

**Pourquoi** : Données produits 100% précises, gratuit, impact maximal

**Fichier à créer** : `lib/shopify-storefront-api.ts`

```typescript
export async function fetchShopifyProducts(storeDomain: string) {
  // Détecter le domaine myshopify.com
  const shopifyDomain = extractShopifyDomain(storeDomain);
  
  // Requête GraphQL
  const query = `...`;
  const response = await fetch(`https://${shopifyDomain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  
  return response.json();
}
```

**Intégration** : Modifier `lib/shopify-scraper.ts` pour utiliser Storefront API en complément du scraping

---

### Étape 2 : Facebook/TikTok Ad Library (Priorité 2)

**Pourquoi** : Insight marketing, gratuit, scraping simple

**Fichier à créer** : `lib/ad-library-scraper.ts`

```typescript
export async function scrapeFacebookAds(storeName: string) {
  // Scraping Facebook Ad Library
}

export async function scrapeTikTokAds(storeName: string) {
  // Scraping TikTok Ad Library
}
```

---

### Étape 3 : Wappalyzer API (Priorité 3 - Payant)

**Pourquoi** : Détection apps précise, coût raisonnable

**Fichier à créer** : `lib/wappalyzer-api.ts`

```typescript
export async function detectTechnologies(url: string, apiKey: string) {
  const response = await fetch(`https://api.wappalyzer.com/v2/lookup?urls=${url}`, {
    headers: {
      'X-Api-Key': apiKey,
    },
  });
  return response.json();
}
```

---

## 📝 Variables d'Environnement Nécessaires

```env
# Shopify Storefront API (optionnel - détection auto)
SHOPIFY_STOREFRONT_API_VERSION=2024-01

# Wappalyzer API (si Phase 2)
WAPPALYZER_API_KEY=your_api_key_here

# SimilarWeb API (si Phase 3)
SIMILARWEB_API_KEY=your_api_key_here
```

---

## ✅ Checklist d'Implémentation

### MVP (0€)
- [ ] Intégrer Shopify Storefront API pour produits réels
- [ ] Scraper Facebook Ad Library
- [ ] Scraper TikTok Ad Library
- [ ] Mettre à jour `lib/shopify-scraper.ts`
- [ ] Mettre à jour `app/api/spy/analyze/route.ts`

### Phase 2 (49€/mois)
- [ ] Intégrer Wappalyzer API
- [ ] Ajouter `WAPPALYZER_API_KEY` dans `.env`
- [ ] Mettre à jour la détection d'apps

### Phase 3 (248€/mois)
- [ ] Intégrer SimilarWeb API
- [ ] Ajouter `SIMILARWEB_API_KEY` dans `.env`
- [ ] Remplacer estimations de trafic par données réelles

---

## 🎯 Impact Attendu

| API | Précision Avant | Précision Après | Amélioration |
|-----|----------------|-----------------|--------------|
| **Shopify Storefront** | ~60% (scraping homepage) | **100%** (tous produits) | +40% |
| **Wappalyzer** | ~70% (détection scripts) | **95%** (API) | +25% |
| **SimilarWeb** | Estimations (~50%) | **Données réelles** (~85%) | +35% |
| **Ad Libraries** | 0% | **100%** (publicités visibles) | +100% |

---

## 💡 Recommandation Finale

**Pour MVP** : Commencer avec **Shopify Storefront API** (gratuit) pour avoir des données produits 100% précises. C'est l'amélioration la plus impactante avec 0€ de coût.

**Pour Phase 2** : Ajouter **Wappalyzer** (49€/mois) si la détection d'apps est critique.

**Pour Phase 3** : Ajouter **SimilarWeb** (199€/mois) uniquement si le trafic réel est essentiel pour vos utilisateurs.
