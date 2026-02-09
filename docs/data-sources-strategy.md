# Stratégie d'Acquisition de Données - Application OUTFITY

*Document créé via BMAD-Method - Analyst*

## Vue d'Ensemble

Ce document détaille les sources de données pour chaque module de l'application, avec méthodes d'acquisition, coûts, et alternatives.

---

## 1. Tendances & Hits (Product Discovery)

### Données Nécessaires

- Prix de vente moyen par catégorie/style
- Volume de recherche (trends)
- Score de saturabilité
- Images produits "winners"

### Sources de Données

#### Option 1 : Google Trends API (Gratuit) ⭐⭐⭐⭐⭐

**Ce que ça donne** :
- Volume de recherche par mot-clé
- Tendances temporelles
- Comparaison de termes
- Géolocalisation (France, Europe, etc.)

**Limitations** :
- Pas de données absolues (seulement relatives)
- Pas de prix
- Pas d'images produits

**Méthode** :
```javascript
// Google Trends API (non-officielle mais fonctionnelle)
const googleTrends = require('google-trends-api');

googleTrends.interestOverTime({
  keyword: 'hoodie streetwear',
  geo: 'FR',
  startTime: new Date('2024-01-01'),
  endTime: new Date('2025-01-23')
})
```

**Coût** : Gratuit (avec limitations de rate)

---

#### Option 2 : Shopify Product API (Gratuit) ⭐⭐⭐⭐

**Ce que ça donne** :
- Prix produits
- Images produits
- Catégories
- Descriptions

**Limitations** :
- Seulement stores publics
- Pas de données de vente (volume)
- Rate limiting

**Méthode** :
```javascript
// Shopify Storefront API
const SHOPIFY_STORE = 'example.myshopify.com';
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
```

**Coût** : Gratuit (Storefront API public)

**Stores à scraper** :
- Stores mode populaires (publics)
- Marketplaces (Etsy, etc.)

---

#### Option 3 : Amazon Best Sellers API (Gratuit) ⭐⭐⭐

**Ce que ça donne** :
- Produits best-sellers par catégorie
- Prix
- Rankings
- Images

**Limitations** :
- Focus Amazon (pas tous les stores)
- Pas de données mode spécifiques (catégories larges)

**Méthode** :
- Scraping Amazon Best Sellers (catégorie Mode)
- Ou Amazon Product Advertising API (nécessite compte)

**Coût** : Gratuit (scraping) ou Payant (API officielle)

---

#### Option 4 : TikTok/Instagram Trends (Scraping) ⭐⭐⭐⭐

**Ce que ça donne** :
- Hashtags tendances mode
- Produits viraux
- Engagement (likes, shares)

**Limitations** :
- Scraping peut violer ToS
- Nécessite proxies/rotations
- Données instables

**Méthode** :
- TikTok Creative Center (public, gratuit)
- Instagram Graph API (nécessite compte business)
- Scraping avec outils (Apify, ScraperAPI)

**Coût** : 
- TikTok Creative Center : Gratuit
- Instagram Graph API : Gratuit (limité)
- Scraping services : 50-200€/mois

---

#### Option 5 : Etsy API (Gratuit) ⭐⭐⭐

**Ce que ça donne** :
- Produits mode artisanaux
- Prix
- Images
- Catégories

**Limitations** :
- Focus artisanat (pas tous les styles)
- Rate limiting

**Méthode** :
```javascript
// Etsy API v3
const response = await fetch(
  'https://openapi.etsy.com/v3/application/shops/{shop_id}/listings/active',
  {
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  }
);
```

**Coût** : Gratuit (avec limitations)

---

### Recommandation pour Tendances & Hits

**MVP (Phase 1)** :
1. ✅ **Google Trends API** (gratuit) - Trends volume
2. ✅ **Shopify Public Stores** (gratuit) - Prix, images
3. ✅ **Données manuelles** (curation) - 50-100 produits "winners"

**Phase 2** :
4. ⏳ **TikTok Creative Center** (gratuit) - Trends sociaux
5. ⏳ **Etsy API** (gratuit) - Produits artisanaux
6. ⏳ **Scraping services** (payant) - Données additionnelles

**Coût estimé MVP** : 0€ (gratuit)
**Coût estimé Phase 2** : 100-300€/mois (scraping services)

---

## 2. Brand Spy (Audit de Marque)

### Données Nécessaires

- Estimation trafic (visiteurs/mois)
- Stack technique (apps installées)
- Thème Shopify utilisé
- Nombre de publicités actives
- Plateformes publicitaires

### Sources de Données

#### Option 1 : SimilarWeb API (Payant) ⭐⭐⭐⭐⭐

**Ce que ça donne** :
- Trafic estimé (visiteurs/mois)
- Sources de trafic
- Géolocalisation visiteurs
- Engagement metrics

**Limitations** :
- Payant (cher)
- Estimations (pas exactes)
- Nécessite plan API

**Méthode** :
```javascript
// SimilarWeb API
const response = await fetch(
  'https://api.similarweb.com/v1/website/example.com/traffic-and-engagement/visits',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  }
);
```

**Coût** : 
- Starter : 199€/mois
- Professional : 499€/mois
- Enterprise : Sur devis

**Alternative gratuite** : SimilarWeb Free (données limitées, pas d'API)

---

#### Option 2 : Ahrefs API (Payant) ⭐⭐⭐⭐

**Ce que ça donne** :
- Trafic estimé
- Backlinks
- Keywords ranking
- Domain rating

**Limitations** :
- Très cher
- Focus SEO (pas e-commerce spécifique)

**Coût** : 
- Lite : 99$/mois
- Standard : 199$/mois
- Advanced : 399$/mois

---

#### Option 3 : BuiltWith API (Payant) ⭐⭐⭐⭐⭐

**Ce que ça donne** :
- **Stack technique complet** (apps, technologies)
- Thèmes utilisés
- Analytics tools
- Payment processors

**Limitations** :
- Payant
- Pas de trafic

**Méthode** :
```javascript
// BuiltWith API
const response = await fetch(
  'https://api.builtwith.com/v20/api.json?KEY=YOUR_KEY&LOOKUP=example.com'
);
```

**Coût** :
- Basic : 295$/mois
- Pro : 495$/mois
- Enterprise : Sur devis

**Alternative gratuite** : BuiltWith Free (1 lookup/jour, pas d'API)

---

#### Option 4 : Wappalyzer (Gratuit/Payant) ⭐⭐⭐⭐

**Ce que ça donne** :
- Technologies détectées
- Apps installées (côté client)
- Frameworks

**Limitations** :
- Détection côté client uniquement (pas toutes les apps)
- API payante

**Méthode** :
- Extension browser (gratuite)
- API (payante)

**Coût** :
- Free : Extension browser
- API : 49€/mois (1000 requests)

---

#### Option 5 : Facebook Ad Library (Gratuit) ⭐⭐⭐⭐

**Ce que ça donne** :
- **Publicités actives** (Meta/Facebook)
- Budget estimé
- Formats publicitaires
- Durée des campagnes

**Limitations** :
- Seulement Meta/Facebook (pas TikTok)
- Pas d'API officielle (scraping nécessaire)

**Méthode** :
- Scraping Facebook Ad Library
- Ou utilisation service tiers (AdSpy, etc.)

**Coût** :
- Facebook Ad Library : Gratuit (scraping)
- AdSpy : 149$/mois (service tiers)

---

#### Option 6 : TikTok Ad Library (Gratuit) ⭐⭐⭐

**Ce que ça donne** :
- Publicités TikTok actives
- Formats
- Durée

**Limitations** :
- Pas d'API officielle
- Scraping nécessaire
- Données limitées

**Coût** : Gratuit (scraping)

---

#### Option 7 : Shopify Theme Detector (Gratuit) ⭐⭐⭐

**Ce que ça donne** :
- Thème Shopify utilisé
- Apps visibles (côté client)

**Méthode** :
- Analyse code source (gratuit)
- Ou services tiers (Shopify Theme Detector)

**Coût** : Gratuit (analyse manuelle) ou 20-50€/mois (service)

---

### Recommandation pour Brand Spy

**MVP (Phase 1)** :
1. ✅ **Wappalyzer API** (49€/mois) - Stack technique
2. ✅ **Facebook Ad Library** (gratuit, scraping) - Publicités Meta
3. ✅ **Shopify Theme Detector** (gratuit) - Thème
4. ✅ **SimilarWeb Free** (gratuit, manuel) - Trafic estimé basique

**Phase 2** :
5. ⏳ **SimilarWeb API** (199€/mois) - Trafic précis
6. ⏳ **BuiltWith API** (295€/mois) - Stack complet
7. ⏳ **TikTok Ad Library** (gratuit, scraping) - Publicités TikTok

**Coût estimé MVP** : 49€/mois (Wappalyzer)
**Coût estimé Phase 2** : 500-800€/mois (APIs complètes)

**Alternative MVP** : Commencer avec données manuelles (0€) puis automatiser

---

## 3. Sourcing Hub (Base Usines)

### Données Nécessaires

- Nom usine
- Pays
- MOQ (Minimum Order Quantity)
- Spécialités
- Délais moyens
- Contact

### Sources de Données

#### Option 1 : Alibaba (Gratuit) ⭐⭐⭐

**Ce que ça donne** :
- Liste massive d'usines
- MOQ, prix
- Spécialités
- Contact

**Limitations** :
- Qualité variable (beaucoup de spam)
- Pas de vérification
- Focus Chine principalement

**Méthode** :
- Scraping Alibaba (catégorie Textile/Mode)
- Ou utilisation Alibaba API (si disponible)

**Coût** : Gratuit (scraping)

---

#### Option 2 : Thomasnet (Gratuit/Payant) ⭐⭐⭐

**Ce que ça donne** :
- Base B2B fournisseurs
- Spécialités
- Localisation

**Limitations** :
- Focus US principalement
- Pas de données mode spécifiques
- API payante

**Coût** :
- Free : Recherche manuelle
- API : Sur devis

---

#### Option 3 : Curation Manuelle (Recommandé MVP) ⭐⭐⭐⭐⭐

**Ce que ça donne** :
- **Qualité garantie** (vérifiées)
- Données précises
- Contact direct

**Méthode** :
1. Recherche manuelle (Google, LinkedIn)
2. Réseaux professionnels mode
3. Salons professionnels (Première Vision, etc.)
4. Références utilisateurs

**Sources** :
- **Portugal** : Recherche "fabricant textile Portugal"
- **Turquie** : Recherche "fabricant vêtements Turquie"
- **France** : Recherche "confection France"
- **LinkedIn** : Recherche "manufacturer fashion"

**Coût** : 0€ (temps investi)

**Temps estimé** : 2-3 semaines pour 20-30 usines

---

#### Option 4 : Partenariats Directs ⭐⭐⭐⭐⭐

**Ce que ça donne** :
- **Qualité maximale**
- Données à jour
- Relations privilégiées

**Méthode** :
1. Contacter usines directement
2. Proposer partenariat (affiliation)
3. Échange : Visibilité vs Commission

**Avantages** :
- Données garanties exactes
- Support utilisateurs
- Possibilité négociation MOQ

**Coût** : 0€ (commission sur commandes)

---

#### Option 5 : Salons Professionnels ⭐⭐⭐⭐

**Ce que ça donne** :
- Contacts directs
- Vérification qualité
- Réseau professionnel

**Salons clés** :
- **Première Vision** (Paris, Lyon)
- **Texworld** (Paris)
- **Intertextile** (Shanghai)
- **Fashion Week** (various)

**Coût** : 
- Entrée : 50-200€
- Voyage : Variable

---

### Recommandation pour Sourcing Hub

**MVP (Phase 1)** :
1. ✅ **Curation manuelle** (0€) - 20-30 usines vérifiées
2. ✅ **Focus géographique** : Portugal, Turquie (qualité + proximité)
3. ✅ **Partenariats** : Contacter directement pour affiliation

**Phase 2** :
4. ⏳ **Alibaba scraping** (gratuit) - Expansion base
5. ⏳ **Salons professionnels** - Nouvelles relations
6. ⏳ **Système reviews** - Validation par utilisateurs

**Coût estimé MVP** : 0€ (curation manuelle)
**Coût estimé Phase 2** : 100-500€ (salons, scraping)

---

## 4. Design Studio IA (Pas de données externes)

**Pas besoin de données externes** - Génération avec IA (Replicate/Flux)

---

## 5. UGC AI Lab (Pas de données externes)

**Pas besoin de données externes** - Génération avec IA (HeyGen, Kling)

---

## 6. Launch Map (Données internes)

**Données stockées dans Airtable** :
- User_Progress (booléens étapes)
- Résultats calculateur marge

**Pas de données externes nécessaires**

---

## Résumé des Coûts

### MVP (Phase 1)

| Module | Source | Coût Mensuel |
|--------|--------|--------------|
| Tendances & Hits | Google Trends + Shopify (gratuit) | **0€** |
| Brand Spy | Wappalyzer API | **49€** |
| Sourcing Hub | Curation manuelle | **0€** |
| **TOTAL MVP** | | **49€/mois** |

### Phase 2 (Complet)

| Module | Source | Coût Mensuel |
|--------|--------|--------------|
| Tendances & Hits | + Scraping services | **100-300€** |
| Brand Spy | SimilarWeb + BuiltWith | **500-800€** |
| Sourcing Hub | + Alibaba scraping | **100-500€** |
| **TOTAL Phase 2** | | **700-1600€/mois** |

---

## Recommandations Finales

### Stratégie d'Acquisition de Données

1. **MVP** : Commencer avec sources gratuites + curation manuelle
2. **Validation** : Tester avec utilisateurs réels
3. **Automatisation** : Investir dans APIs payantes seulement si validation
4. **Partenariats** : Privilégier partenariats (usines, services) vs scraping

### Priorités

**Haute Priorité** :
- ✅ Sourcing Hub (curation manuelle - 0€)
- ✅ Tendances & Hits (Google Trends - 0€)

**Moyenne Priorité** :
- ⏳ Brand Spy (Wappalyzer - 49€/mois)

**Basse Priorité** :
- ⏳ APIs premium (Phase 2, si validation)

---

**Document créé par** : Analyst BMAD  
**Date** : 2025-01-23  
**Status** : Stratégie complète - Prêt pour implémentation
