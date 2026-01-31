# Plan d'Action : Données Réelles dans Toute l'Application

*Document créé via BMAD-Method - Analyst*

## Date : 2025-01-26

---

## 🎯 Objectif

Remplacer **toutes les données fictives/estimées** par des **données réelles** dans chaque module.

---

## 📊 État Actuel des Données

| Module | Données Actuelles | Type | Priorité |
|--------|-------------------|------|----------|
| **Sourcing Hub** | 28 usines fictives | Fictif | 🔴 CRITIQUE |
| **Tendances & Hits** | 22 produits fictifs | Fictif | 🔴 CRITIQUE |
| **Brand Spy** | Trafic/CA estimés | Estimé | 🟡 IMPORTANT |
| **Design Studio** | Génération IA | Réel | ✅ OK |
| **UGC Lab** | Génération IA | Réel | ✅ OK |

---

## 🔴 PRIORITÉ 1 : Sourcing Hub - Usines Réelles

### Problème Actuel
- ❌ 28 usines **fictives** (noms, emails, téléphones inventés)
- ❌ Contacts non fonctionnels
- ❌ Données non vérifiées

### Solutions pour Données Réelles

#### Option A : Scraping Alibaba (Gratuit) ⭐⭐⭐⭐

**Méthode** :
1. Scraper Alibaba.com (fabricants textiles)
2. Extraire : nom, pays, MOQ, spécialités, contacts
3. Vérifier et nettoyer les données
4. Importer dans la base

**Avantages** :
- ✅ Gratuit
- ✅ Beaucoup de données (milliers d'usines)
- ✅ Données réelles (vraies usines)

**Inconvénients** :
- ⚠️ Nécessite scraping (complexe)
- ⚠️ Données à nettoyer/vérifier
- ⚠️ Contacts peuvent être obsolètes

**Temps estimé** : 1-2 semaines (développement + scraping)

**Fichier à créer** : `lib/alibaba-scraper.ts`

---

#### Option B : Curation Manuelle (Gratuit) ⭐⭐⭐⭐⭐

**Méthode** :
1. Rechercher usines réelles (Google, LinkedIn, salons)
2. Contacter directement pour partenariat
3. Vérifier informations
4. Ajouter manuellement dans la base

**Avantages** :
- ✅ Données 100% vérifiées
- ✅ Contacts fonctionnels
- ✅ Relations privilégiées
- ✅ Qualité maximale

**Inconvénients** :
- ⚠️ Temps investi (2-3 semaines pour 20-30 usines)
- ⚠️ Nécessite contact humain

**Temps estimé** : 2-3 semaines (recherche + contacts)

**Sources** :
- Google : "fabricant textile Portugal"
- LinkedIn : Recherche "manufacturer fashion"
- Salons : Première Vision, Texworld
- Réseaux professionnels mode

---

#### Option C : Système d'Inscription (Meilleure Solution Long Terme) ⭐⭐⭐⭐⭐

**Méthode** :
1. Créer interface d'inscription pour usines
2. Permettre aux usines de créer leur profil
3. Système de vérification/modération
4. Les usines s'inscrivent elles-mêmes

**Avantages** :
- ✅ Données toujours à jour
- ✅ Contacts garantis fonctionnels
- ✅ Scalable (croissance automatique)
- ✅ Qualité maximale

**Inconvénients** :
- ⚠️ Nécessite développement (1-2 semaines)
- ⚠️ Nécessite marketing pour attirer usines

**Temps estimé** : 2-3 semaines (développement + lancement)

**Fichiers à créer** :
- `app/factories/register/page.tsx` (inscription usines)
- `app/api/factories/register/route.ts` (API inscription)
- `app/api/factories/verify/route.ts` (vérification admin)

---

### Recommandation : Approche Hybride

**Phase 1 (Maintenant)** :
1. ✅ **Curation manuelle** : 20-30 usines vérifiées (2-3 semaines)
2. ✅ **Focus géographique** : Portugal, Turquie (qualité + proximité)

**Phase 2 (1 mois)** :
3. ⏳ **Système d'inscription** : Permettre aux usines de s'inscrire
4. ⏳ **Marketing** : Contacter usines pour inscription

**Phase 3 (2-3 mois)** :
5. ⏳ **Scraping Alibaba** : Expansion base (optionnel)

**Coût Phase 1** : 0€ (temps investi)
**Coût Phase 2** : 0€ (développement)
**Coût Phase 3** : 0€ (scraping)

---

## 🔴 PRIORITÉ 2 : Tendances & Hits - Produits Réels

### Problème Actuel
- ❌ 22 produits **fictifs** (inventés pour démo)
- ❌ Prix, images, descriptions non réels

### Solutions pour Données Réelles

#### Option A : Scraping Shopify Stores Populaires (Gratuit) ⭐⭐⭐⭐⭐

**Méthode** :
1. Liste de stores mode populaires (publics)
2. Utiliser Shopify Storefront API (gratuit)
3. Scraper produits tendances
4. Calculer trendScore avec Google Trends
5. Importer dans la base

**Stores à scraper** :
- Stores mode populaires (Kith, Supreme, Palace, etc.)
- Stores streetwear français
- Stores mode européenne

**Avantages** :
- ✅ Gratuit (Storefront API public)
- ✅ Données réelles (vrais produits, vrais prix)
- ✅ Images haute qualité
- ✅ Scalable

**Inconvénients** :
- ⚠️ Rate limiting (2 req/seconde)
- ⚠️ Nécessite rotation stores

**Temps estimé** : 1 semaine (développement + scraping)

**Fichier à créer** : `lib/trends-scraper.ts`

**Code exemple** :
```typescript
// lib/trends-scraper.ts
const POPULAR_STORES = [
  'kith.com',
  'supreme.com',
  'palace.com',
  // ... stores mode populaires
];

async function scrapeTrendingProducts() {
  for (const store of POPULAR_STORES) {
    const products = await fetchShopifyProducts(store);
    // Calculer trendScore avec Google Trends
    // Importer dans TrendProduct
  }
}
```

---

#### Option B : Google Trends API (Gratuit) ⭐⭐⭐⭐

**Méthode** :
1. Utiliser bibliothèque `google-trends-api`
2. Calculer trendScore pour chaque produit
3. Identifier produits tendances
4. Scraper produits depuis stores

**Avantages** :
- ✅ Gratuit
- ✅ Données de tendances réelles
- ✅ Géolocalisation (France, Europe)

**Inconvénients** :
- ⚠️ Rate limiting (5-10 req/minute)
- ⚠️ Données relatives (pas absolues)

**Temps estimé** : 3-5 jours

**Fichier à créer** : `lib/google-trends-api.ts`

---

#### Option C : TikTok/Instagram Trends (Gratuit) ⭐⭐⭐

**Méthode** :
1. Scraper TikTok Creative Center (hashtags tendances)
2. Scraper Instagram Graph API (produits viraux)
3. Identifier produits tendances
4. Scraper produits depuis stores

**Avantages** :
- ✅ Gratuit
- ✅ Données sociales réelles
- ✅ Produits viraux identifiés

**Inconvénients** :
- ⚠️ Scraping peut violer ToS
- ⚠️ Données instables

**Temps estimé** : 1 semaine

---

### Recommandation : Approche Combinée

**Phase 1 (Maintenant)** :
1. ✅ **Scraping Shopify Stores** : 50-100 produits réels (1 semaine)
2. ✅ **Google Trends** : Calculer trendScore réel (3-5 jours)

**Phase 2 (1 mois)** :
3. ⏳ **TikTok/Instagram Trends** : Identifier produits viraux
4. ⏳ **Mise à jour automatique** : CRON job quotidien

**Coût Phase 1** : 0€
**Coût Phase 2** : 0€

---

## 🟡 PRIORITÉ 3 : Brand Spy - Données Réelles

### Problème Actuel
- ⚠️ Trafic mensuel : **Estimations** (pas réel)
- ⚠️ CA estimé : **Calculé depuis estimations**
- ⚠️ Sources trafic : **Mockées**

### Solutions pour Données Réelles

#### Option A : SimilarWeb API (199€/mois) ⭐⭐⭐⭐⭐

**Ce que ça donne** :
- ✅ Trafic réel (visites mensuelles exactes)
- ✅ Sources de trafic (Direct, SEO, Social, Paid)
- ✅ Géolocalisation (répartition par pays)
- ✅ Tendances (évolution 6-12 mois)

**Impact** : ⭐⭐⭐⭐⭐ (Trafic 100% précis vs estimations 50%)

**Temps estimé** : 1 semaine (intégration)

**Fichier à créer** : `lib/similarweb-api.ts`

---

#### Option B : Wappalyzer API (49€/mois) ⭐⭐⭐⭐

**Ce que ça donne** :
- ✅ Apps installées (liste précise)
- ✅ Stack technique complète
- ✅ Technologies détectées

**Impact** : ⭐⭐⭐⭐ (Apps 95% précises vs 70% actuellement)

**Temps estimé** : 3-5 jours (intégration)

**Fichier à créer** : `lib/wappalyzer-api.ts`

---

### Recommandation : APIs Payantes

**Phase 1 (Budget 248€/mois)** :
1. ✅ **SimilarWeb API** (199€/mois) - Trafic réel
2. ✅ **Wappalyzer API** (49€/mois) - Apps précises

**Résultat** :
- Trafic 100% réel
- Apps 95% précises
- Sources de trafic détaillées

**Alternative Gratuite** :
- Continuer avec estimations (acceptable MVP)
- Améliorer algorithmes d'estimation

---

## 📋 Plan d'Action Immédiat

### Semaine 1-2 : Sourcing Hub (Usines Réelles)

**Actions** :
1. [ ] Rechercher 20-30 usines réelles (Google, LinkedIn)
2. [ ] Contacter usines pour partenariat
3. [ ] Vérifier informations
4. [ ] Créer script d'import usines réelles
5. [ ] Remplacer usines fictives par usines réelles

**Résultat** : 20-30 usines réelles vérifiées

---

### Semaine 2-3 : Tendances & Hits (Produits Réels)

**Actions** :
1. [ ] Créer `lib/trends-scraper.ts`
2. [ ] Liste stores mode populaires (20-30 stores)
3. [ ] Scraper produits via Storefront API
4. [ ] Intégrer Google Trends pour trendScore
5. [ ] Importer 50-100 produits réels
6. [ ] Remplacer produits fictifs

**Résultat** : 50-100 produits réels avec trendScore réel

---

### Semaine 3-4 : Brand Spy (APIs Payantes - Optionnel)

**Actions** (si budget disponible) :
1. [ ] Créer compte SimilarWeb Pro
2. [ ] Créer `lib/similarweb-api.ts`
3. [ ] Intégrer dans `app/api/spy/analyze/route.ts`
4. [ ] Remplacer estimations par données réelles
5. [ ] Créer compte Wappalyzer
6. [ ] Créer `lib/wappalyzer-api.ts`
7. [ ] Intégrer détection apps précise

**Résultat** : Trafic réel, apps précises

**Coût** : 248€/mois

---

## 🎯 Résumé des Actions

### Actions Gratuites (0€)

1. ✅ **Sourcing Hub** : Curation manuelle 20-30 usines (2-3 semaines)
2. ✅ **Tendances & Hits** : Scraping Shopify stores (1 semaine)
3. ✅ **Google Trends** : Calcul trendScore réel (3-5 jours)

**Temps total** : 3-4 semaines
**Coût** : 0€

---

### Actions Payantes (248€/mois)

4. ⏳ **Brand Spy** : SimilarWeb + Wappalyzer APIs (1 semaine)

**Temps total** : 1 semaine
**Coût** : 248€/mois

---

## ✅ Checklist Complète

### Sourcing Hub
- [ ] Rechercher 20-30 usines réelles
- [ ] Contacter usines pour partenariat
- [ ] Vérifier informations
- [ ] Créer script d'import
- [ ] Remplacer usines fictives
- [ ] Tester contacts (emails fonctionnels)

### Tendances & Hits
- [ ] Créer `lib/trends-scraper.ts`
- [ ] Liste stores mode populaires
- [ ] Scraper produits Storefront API
- [ ] Intégrer Google Trends
- [ ] Importer 50-100 produits réels
- [ ] Remplacer produits fictifs
- [ ] CRON job mise à jour quotidienne

### Brand Spy (Optionnel)
- [ ] Créer compte SimilarWeb
- [ ] Créer `lib/similarweb-api.ts`
- [ ] Intégrer trafic réel
- [ ] Créer compte Wappalyzer
- [ ] Créer `lib/wappalyzer-api.ts`
- [ ] Intégrer détection apps précise

---

## 🚀 Prochaines Étapes

**Maintenant** :
1. Commencer curation manuelle usines (Sourcing Hub)
2. Développer scraper produits tendances (Tendances & Hits)

**Dans 1 mois** :
3. Système d'inscription usines (Sourcing Hub)
4. CRON job mise à jour produits (Tendances & Hits)

**Si budget disponible** :
5. Intégrer SimilarWeb + Wappalyzer (Brand Spy)

---

**Document créé par** : Analyst  
**Date** : 2025-01-26  
**Status** : Plan d'action pour données réelles
