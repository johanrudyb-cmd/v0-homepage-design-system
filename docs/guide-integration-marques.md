# Guide d'Intégration des Marques pour le Scraping

*Document créé via BMAD-Method - Dev + Architect*

## Date : 2025-01-26

---

## 🎯 Comment l'App Sait Quels Sites Regarder ?

Actuellement, les marques sont **configurées dans le code** (`lib/big-brands-scraper.ts`), mais nous allons créer un système **dynamique via la base de données**.

---

## 📋 Structure Actuelle (Code)

Les marques sont définies dans `lib/big-brands-scraper.ts` :

```typescript
const BRAND_CONFIGS = {
  Zara: {
    baseUrl: 'https://www.zara.com',
    newInUrl: '/fr/fr/categorie/femme/nouveautes-c358009.html',
    bestSellersUrl: '/fr/fr/categorie/femme/c358009.html',
    selectors: {
      products: '.product-item, .product-card',
      name: '.product-name, h3',
      price: '.price, [data-price]',
      image: '.product-image img, img[data-src]',
    },
  },
  // ... autres marques
};
```

**Problème** : Pour ajouter une marque, il faut modifier le code et redéployer.

---

## 🚀 Solution : Système Dynamique

### 1. Modèle Prisma pour les Marques

Créer un modèle `ScrapableBrand` dans la base de données :

```prisma
model ScrapableBrand {
  id            String   @id @default(cuid())
  name          String   @unique // "Zara", "ASOS", etc.
  baseUrl       String   // "https://www.zara.com"
  newInUrl      String   // "/fr/fr/categorie/femme/nouveautes-c358009.html"
  bestSellersUrl String  // "/fr/fr/categorie/femme/c358009.html"
  
  // Sélecteurs CSS
  productSelector String // ".product-item, .product-card"
  nameSelector    String // ".product-name, h3"
  priceSelector   String // ".price, [data-price]"
  imageSelector   String // ".product-image img, img[data-src]"
  
  // Métadonnées
  isActive      Boolean  @default(true)
  country       String?  // "FR", "US", etc.
  category      String?  // "fast_fashion", "luxury", "streetwear"
  priority      Int      @default(5) // 1-10 (1 = haute priorité)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([isActive])
  @@index([priority])
}
```

---

## 🔍 Comment Identifier les Sélecteurs CSS ?

### Étape 1 : Ouvrir le Site de la Marque

1. Aller sur le site (ex: `https://www.zara.com`)
2. Naviguer vers la section "New In" ou "Best Sellers"
3. Ouvrir les **Outils de Développeur** (F12)

### Étape 2 : Identifier les Éléments

#### A. Sélecteur de Produits

1. **Inspecter** un produit dans la liste
2. Trouver l'élément **parent** qui contient tous les produits
3. Noter la **classe CSS** ou l'**ID**

**Exemple** :
```html
<article class="product-item">
  <!-- contenu du produit -->
</article>
```

**Sélecteur** : `.product-item`

#### B. Sélecteur du Nom

1. **Inspecter** le nom du produit
2. Noter la classe/ID

**Exemple** :
```html
<h3 class="product-name">Loose Fit Cargo Pant</h3>
```

**Sélecteur** : `.product-name` ou `h3`

#### C. Sélecteur du Prix

1. **Inspecter** le prix
2. Noter la classe/ID ou l'attribut `data-price`

**Exemple** :
```html
<span class="price" data-price="89.99">89,99 €</span>
```

**Sélecteur** : `.price` ou `[data-price]`

#### D. Sélecteur de l'Image

1. **Inspecter** l'image du produit
2. Noter la classe/ID ou l'attribut `data-src` (lazy loading)

**Exemple** :
```html
<img src="..." data-src="https://..." class="product-image" />
```

**Sélecteur** : `.product-image img` ou `img[data-src]`

---

## 🛠️ Outils pour Identifier les Sélecteurs

### 1. Chrome DevTools

1. **Ouvrir** DevTools (F12)
2. **Sélectionner** un élément
3. **Clic droit** → "Copy" → "Copy selector"
4. **Tester** dans la console : `document.querySelector('.product-item')`

### 2. Extension SelectorGadget

- Extension Chrome pour identifier les sélecteurs CSS
- Plus précis que DevTools

### 3. Test Manuel

```javascript
// Dans la console du navigateur
document.querySelectorAll('.product-item').length // Doit retourner le nombre de produits
document.querySelector('.product-name')?.textContent // Doit retourner le nom
document.querySelector('.price')?.textContent // Doit retourner le prix
```

---

## 📝 Exemple Complet : Ajouter une Nouvelle Marque

### Cas : Ajouter "Mango"

#### 1. Analyser le Site

1. Aller sur `https://shop.mango.com`
2. Naviguer vers "Nouveautés"
3. Ouvrir DevTools

#### 2. Identifier les Sélecteurs

**Produits** : `.product-item`
**Nom** : `.product-name`
**Prix** : `.product-price`
**Image** : `.product-image img`

#### 3. Tester les URLs

- **New In** : `/fr/femme/nouveautes`
- **Best Sellers** : `/fr/femme/bestsellers`

#### 4. Configuration

```typescript
{
  name: 'Mango',
  baseUrl: 'https://shop.mango.com',
  newInUrl: '/fr/femme/nouveautes',
  bestSellersUrl: '/fr/femme/bestsellers',
  productSelector: '.product-item',
  nameSelector: '.product-name',
  priceSelector: '.product-price',
  imageSelector: '.product-image img',
  country: 'FR',
  category: 'fast_fashion',
  priority: 5,
  isActive: true
}
```

---

## 🎨 Interface d'Administration (À Créer)

### Page `/admin/brands`

Interface pour :
- ✅ **Ajouter** une nouvelle marque
- ✅ **Modifier** les sélecteurs d'une marque existante
- ✅ **Tester** les sélecteurs avant de sauvegarder
- ✅ **Activer/Désactiver** une marque
- ✅ **Voir les statistiques** (nombre de produits scrapés)

### Formulaire d'Ajout

```
┌─────────────────────────────────────┐
│ Ajouter une Marque                  │
├─────────────────────────────────────┤
│ Nom: [Mango________]                │
│ Base URL: [https://shop.mango.com] │
│ New In URL: [/fr/femme/nouveautes] │
│ Best Sellers: [/fr/femme/bestsellers]│
│                                     │
│ Sélecteurs CSS:                    │
│ Produits: [.product-item]          │
│ Nom: [.product-name]               │
│ Prix: [.product-price]             │
│ Image: [.product-image img]         │
│                                     │
│ [Tester] [Sauvegarder]             │
└─────────────────────────────────────┘
```

---

## 🔄 Migration du Code Actuel vers la Base

### Étape 1 : Créer le Modèle Prisma

```bash
npm run db:generate
npm run db:push
```

### Étape 2 : Script de Migration

Créer un script pour migrer les marques existantes :

```typescript
// scripts/migrate-brands-to-db.ts
import { prisma } from '@/lib/prisma';
import { BRAND_CONFIGS } from '@/lib/big-brands-scraper';

async function migrate() {
  for (const [name, config] of Object.entries(BRAND_CONFIGS)) {
    await prisma.scrapableBrand.upsert({
      where: { name },
      update: {
        baseUrl: config.baseUrl,
        newInUrl: config.newInUrl,
        bestSellersUrl: config.bestSellersUrl,
        productSelector: config.selectors.products,
        nameSelector: config.selectors.name,
        priceSelector: config.selectors.price,
        imageSelector: config.selectors.image,
      },
      create: {
        name,
        baseUrl: config.baseUrl,
        newInUrl: config.newInUrl,
        bestSellersUrl: config.bestSellersUrl,
        productSelector: config.selectors.products,
        nameSelector: config.selectors.name,
        priceSelector: config.selectors.price,
        imageSelector: config.selectors.image,
        isActive: true,
        priority: 5,
      },
    });
  }
}
```

### Étape 3 : Modifier le Scraper

Modifier `lib/big-brands-scraper.ts` pour charger depuis la base :

```typescript
export async function getBrandConfigs(): Promise<Map<string, BrandConfig>> {
  const brands = await prisma.scrapableBrand.findMany({
    where: { isActive: true },
    orderBy: { priority: 'asc' },
  });

  const configs = new Map();
  for (const brand of brands) {
    configs.set(brand.name, {
      baseUrl: brand.baseUrl,
      newInUrl: brand.newInUrl,
      bestSellersUrl: brand.bestSellersUrl,
      selectors: {
        products: brand.productSelector,
        name: brand.nameSelector,
        price: brand.priceSelector,
        image: brand.imageSelector,
      },
    });
  }

  return configs;
}
```

---

## 🚨 Problèmes Courants

### 1. Sélecteurs CSS Changent

**Problème** : Le site change sa structure HTML

**Solution** :
- Surveiller les erreurs de scraping
- Tester régulièrement les sélecteurs
- Avoir des sélecteurs de fallback

### 2. Sites Bloquent le Scraping

**Problème** : Cloudflare, captcha, etc.

**Solution** :
- Utiliser des User-Agents réalistes
- Ajouter des délais entre requêtes
- Utiliser des proxies (si nécessaire)

### 3. URLs Changent

**Problème** : Les URLs "New In" / "Best Sellers" changent

**Solution** :
- Tester régulièrement
- Avoir un système d'alerte
- Permettre la mise à jour facile via l'interface admin

---

## 📚 Ressources

- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [CSS Selectors Reference](https://www.w3schools.com/cssref/css_selectors.asp)
- [Puppeteer Documentation](https://pptr.dev/)

---

**Créé via BMAD-Method** 🎯
