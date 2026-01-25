# Stratégie Données 100% Gratuite - MVP

*Document créé via BMAD-Method - Analyst*

## Objectif : MVP avec 0€ de coûts de données

---

## 1. Tendances & Hits (Product Discovery) - 0€

### Sources Gratuites

#### ✅ Google Trends (Gratuit - API Non-Officielle)

**Méthode** :
```javascript
// Utiliser bibliothèque google-trends-api (npm)
const googleTrends = require('google-trends-api');

// Exemple : Trends pour "hoodie streetwear"
googleTrends.interestOverTime({
  keyword: 'hoodie streetwear',
  geo: 'FR',
  startTime: new Date('2024-01-01'),
  endTime: new Date('2025-01-23')
})
.then(results => {
  // Parser les résultats
  const data = JSON.parse(results);
  // Utiliser les données
});
```

**Limitations** :
- Rate limiting (max 5-10 requêtes/minute)
- Données relatives (pas absolues)
- Nécessite rotation IP si beaucoup de requêtes

**Alternative** : Google Trends Web (scraping avec Puppeteer)
```javascript
// Scraping Google Trends (gratuit mais plus lent)
const puppeteer = require('puppeteer');

async function getTrends(keyword) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://trends.google.com/trends/explore?q=${keyword}&geo=FR`);
  // Extraire données...
}
```

---

#### ✅ Shopify Public Stores (Gratuit - Storefront API)

**Méthode** :
```javascript
// Shopify Storefront API (gratuit, public)
const stores = [
  'kith.com',
  'supreme.com',
  'palace.com',
  // Ajouter stores mode populaires
];

async function getProducts(store) {
  const query = `
    query {
      products(first: 50, query: "product_type:hoodie") {
        edges {
          node {
            title
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                }
              }
            }
          }
        }
      }
    }
  `;
  
  const response = await fetch(`https://${store}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  return response.json();
}
```

**Stores à scraper** (publics, gratuits) :
- Stores mode populaires (Kith, Supreme, Palace, etc.)
- Stores français mode (Sézane, Sandro, etc.)
- Stores streetwear (Vans, Converse, etc.)

**Limitations** :
- Rate limiting (respecter limites)
- Pas tous les stores sont publics
- Données limitées (pas de volume de vente)

---

#### ✅ TikTok Creative Center (Gratuit - Public)

**Méthode** :
- Accès web : https://ads.tiktok.com/help/article?aid=10028
- Données publiques sur hashtags tendances
- Scraping possible (respecter ToS)

**Ce que ça donne** :
- Hashtags mode tendances
- Engagement metrics
- Géolocalisation

**Alternative** : TikTok Trends API (non-officielle, gratuite)

---

#### ✅ Etsy API (Gratuit - Limité)

**Méthode** :
```javascript
// Etsy API v3 (gratuit avec limitations)
const response = await fetch(
  'https://openapi.etsy.com/v3/application/listings/active',
  {
    headers: {
      'x-api-key': 'YOUR_API_KEY' // Gratuit à obtenir
    },
    params: {
      category_id: '69150467', // Mode
      limit: 25
    }
  }
);
```

**Limitations** :
- 10 000 requêtes/jour (gratuit)
- Rate limiting

---

#### ✅ Curation Manuelle (0€ - Temps Investi)

**Méthode** :
1. **Google Shopping** : Recherche manuelle "hoodie streetwear"
2. **Amazon Best Sellers** : Catégorie Mode
3. **Instagram Explore** : Hashtags mode tendances
4. **Pinterest** : Recherche "fashion trends 2025"

**Temps estimé** : 2-3 heures pour 50-100 produits

**Base de données initiale** :
- Créer fichier JSON/CSV avec produits "winners"
- Mettre à jour manuellement chaque semaine
- Automatiser plus tard si validation

---

### Recommandation MVP Gratuit

**Stack Gratuit** :
1. ✅ Google Trends (API non-officielle) - Trends
2. ✅ Shopify Public Stores (Storefront API) - Prix, images
3. ✅ Curation manuelle (JSON/CSV) - 50-100 produits initiaux
4. ✅ TikTok Creative Center (web scraping) - Trends sociaux

**Coût** : **0€**

**Maintenance** : 2-3h/semaine (mise à jour manuelle)

---

## 2. Brand Spy (Audit de Marque) - 0€

### Sources Gratuites

#### ✅ Wappalyzer Extension (Gratuit - Pas d'API)

**Méthode** :
- Extension browser Chrome/Firefox (gratuite)
- Analyse manuelle de chaque site
- Ou automation avec Puppeteer + extension

**Limitation** : Pas d'API (nécessite browser automation)

**Alternative** : Wappalyzer API (49€/mois) - **MAIS** on peut éviter avec :

---

#### ✅ BuiltWith Free (Gratuit - 1 Lookup/Jour)

**Méthode** :
- Site web : https://builtwith.com
- 1 lookup gratuit par jour
- Scraping possible (respecter ToS)

**Alternative** : BuiltWith API (295€/mois) - **MAIS** on peut éviter avec :

---

#### ✅ Analyse Manuelle Code Source (Gratuit)

**Méthode** :
```javascript
// Scraping côté client (gratuit)
async function analyzeShopifyStore(url) {
  const response = await fetch(url);
  const html = await response.text();
  
  // Détecter thème Shopify
  const themeMatch = html.match(/theme_store_id["']:\s*["'](\d+)["']/);
  
  // Détecter apps (côté client)
  const apps = [];
  if (html.includes('klaviyo')) apps.push('Klaviyo');
  if (html.includes('loox')) apps.push('Loox');
  if (html.includes('yotpo')) apps.push('Yotpo');
  // etc.
  
  return { theme: themeMatch?.[1], apps };
}
```

**Ce que ça détecte** :
- Thème Shopify (via code source)
- Apps visibles côté client (Klaviyo, Loox, etc.)
- Technologies (React, Vue, etc.)

**Limitations** :
- Pas toutes les apps (seulement côté client)
- Nécessite parsing HTML

---

#### ✅ Facebook Ad Library (Gratuit - Public)

**Méthode** :
```javascript
// Facebook Ad Library (gratuit, public)
// URL : https://www.facebook.com/ads/library/

async function getFacebookAds(pageName) {
  const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=FR&q=${pageName}`;
  
  // Scraping avec Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  // Extraire publicités actives
  const ads = await page.evaluate(() => {
    // Parser les publicités
    return Array.from(document.querySelectorAll('.ad-card')).map(ad => ({
      title: ad.querySelector('.ad-title')?.textContent,
      image: ad.querySelector('.ad-image')?.src,
      // etc.
    }));
  });
  
  return ads;
}
```

**Ce que ça donne** :
- Publicités actives Meta/Facebook
- Formats publicitaires
- Durée des campagnes

**Limitations** :
- Seulement Meta/Facebook (pas TikTok)
- Scraping nécessaire (respecter ToS)

---

#### ✅ SimilarWeb Free (Gratuit - Données Limitées)

**Méthode** :
- Site web : https://www.similarweb.com
- Données gratuites limitées (pas d'API)
- Scraping possible (respecter ToS)

**Ce que ça donne** :
- Trafic estimé (approximatif)
- Sources de trafic
- Géolocalisation

**Limitations** :
- Données limitées (pas complètes)
- Pas d'API (scraping nécessaire)

---

#### ✅ TikTok Ad Library (Gratuit - Public)

**Méthode** :
- Site web : https://ads.tiktok.com/help/article?aid=10028
- Scraping possible

**Ce que ça donne** :
- Publicités TikTok actives
- Formats

---

### Recommandation MVP Gratuit

**Stack Gratuit** :
1. ✅ **Analyse code source** (gratuit) - Thème, apps côté client
2. ✅ **Facebook Ad Library** (gratuit, scraping) - Publicités Meta
3. ✅ **TikTok Ad Library** (gratuit, scraping) - Publicités TikTok
4. ✅ **SimilarWeb Free** (gratuit, scraping) - Trafic estimé basique
5. ✅ **BuiltWith Free** (1 lookup/jour) - Stack technique (limité)

**Coût** : **0€**

**Limitations** :
- ⚠️ Données moins précises qu'APIs payantes
- ⚠️ Scraping nécessaire (respecter ToS)
- ⚠️ Rate limiting à gérer
- ⚠️ Maintenance plus importante

**Alternative** : Commencer avec analyse manuelle (0€) puis automatiser

---

## 3. Sourcing Hub (Base Usines) - 0€

### Sources Gratuites

#### ✅ Curation Manuelle (0€ - Temps Investi)

**Méthode** :

1. **Google Recherche** :
   - "fabricant textile Portugal"
   - "confection vêtements Turquie"
   - "manufacturer fashion France"
   - "usine mode Europe"

2. **LinkedIn** :
   - Recherche "manufacturer fashion"
   - Filtrer par pays (Portugal, Turquie, etc.)
   - Contacter directement

3. **Salons Professionnels** (Listes publiques) :
   - Première Vision (liste exposants)
   - Texworld (liste exposants)
   - Sites web des salons

4. **Réseaux Professionnels** :
   - Facebook Groups (fashion manufacturers)
   - Forums mode
   - Communautés entrepreneurs mode

5. **Alibaba** (Gratuit - Scraping) :
   - Scraping Alibaba (catégorie Textile)
   - Filtrer par pays, MOQ, etc.

**Temps estimé** : 2-3 semaines pour 20-30 usines vérifiées

**Base de données** :
- Créer fichier JSON/CSV
- Airtable (gratuit jusqu'à 1200 records)
- Google Sheets (gratuit)

---

#### ✅ Alibaba Scraping (Gratuit)

**Méthode** :
```javascript
// Scraping Alibaba (gratuit, respecter ToS)
async function scrapeAlibabaSuppliers(category = 'textile') {
  const url = `https://www.alibaba.com/trade/search?fsb=y&IndexArea=product_en&CatId=&SearchText=${category}`;
  
  // Scraping avec Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  const suppliers = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.supplier-item')).map(item => ({
      name: item.querySelector('.supplier-name')?.textContent,
      country: item.querySelector('.supplier-country')?.textContent,
      moq: item.querySelector('.moq')?.textContent,
      // etc.
    }));
  });
  
  return suppliers;
}
```

**Limitations** :
- Qualité variable (beaucoup de spam)
- Nécessite filtrage manuel
- Respecter ToS Alibaba

---

#### ✅ Partenariats Directs (0€ - Commission)

**Méthode** :
1. Contacter usines directement (email, LinkedIn)
2. Proposer partenariat :
   - "Nous listons votre usine sur notre plateforme"
   - "En échange : commission 5-10% sur commandes"
   - "Avantage : nouveaux clients qualifiés"

**Avantages** :
- Données garanties exactes
- Relations privilégiées
- Support utilisateurs

**Coût** : **0€** (commission seulement si commande)

---

### Recommandation MVP Gratuit

**Stack Gratuit** :
1. ✅ **Curation manuelle** (0€) - 20-30 usines vérifiées
2. ✅ **Alibaba scraping** (0€) - Expansion base (avec filtrage)
3. ✅ **Partenariats directs** (0€) - Relations privilégiées
4. ✅ **Airtable Free** (0€) - Stockage jusqu'à 1200 records

**Coût** : **0€**

**Temps investi** : 2-3 semaines initiales, puis maintenance hebdomadaire

---

## Résumé - MVP 100% Gratuit

### Coûts Mensuels : 0€

| Module | Source | Coût | Temps Investi |
|--------|--------|------|---------------|
| **Tendances & Hits** | Google Trends + Shopify + Curation | **0€** | 2-3h/semaine |
| **Brand Spy** | Code source + Ad Libraries + SimilarWeb Free | **0€** | 1-2h/semaine |
| **Sourcing Hub** | Curation manuelle + Alibaba scraping | **0€** | 2-3 semaines initiales |

**TOTAL** : **0€/mois**

---

## Limitations du Modèle Gratuit

### ⚠️ Contraintes

1. **Temps Investi** :
   - Curation manuelle : 3-5h/semaine
   - Maintenance données : 2-3h/semaine
   - **Total** : 5-8h/semaine

2. **Qualité Données** :
   - Moins précises qu'APIs payantes
   - Nécessite validation manuelle
   - Mises à jour moins fréquentes

3. **Scalabilité** :
   - Difficile de scaler avec curation manuelle
   - Rate limiting sur sources gratuites
   - Nécessite automation plus tard

4. **Risques Légaux** :
   - Scraping peut violer ToS
   - Nécessite respecter robots.txt
   - Rotation IP si beaucoup de requêtes

---

## Stratégie Recommandée

### Phase 1 : MVP Gratuit (0€)

**Objectif** : Valider le concept avec utilisateurs réels

**Durée** : 3-6 mois

**Méthode** :
- ✅ Sources gratuites uniquement
- ✅ Curation manuelle
- ✅ Données limitées mais suffisantes pour MVP

**Avantages** :
- 0€ de coûts
- Validation rapide
- Apprentissage utilisateurs

---

### Phase 2 : Automatisation (Si Validation)

**Objectif** : Automatiser et améliorer qualité

**Investissement** : 50-200€/mois

**Méthode** :
- ⏳ APIs payantes (Wappalyzer, SimilarWeb)
- ⏳ Scraping services (Apify, ScraperAPI)
- ⏳ Automation complète

**Avantages** :
- Données plus précises
- Moins de maintenance manuelle
- Scalabilité

---

## Conclusion

**OUI, c'est possible de faire un MVP avec 0€ de données !**

**Trade-off** :
- ✅ Coût : 0€
- ⚠️ Temps : 5-8h/semaine de curation
- ⚠️ Qualité : Moins précise mais suffisante pour MVP

**Recommandation** : Commencer gratuit, investir seulement si validation utilisateurs.

---

**Document créé par** : Analyst BMAD  
**Date** : 2025-01-23  
**Status** : Stratégie 100% gratuite validée
