# Guide Rapide : Ajouter une Nouvelle Marque

## 🎯 Objectif

Ajouter une nouvelle marque à scraper pour enrichir les données de prédiction de tendances.

---

## 📋 Étapes

### 1. Analyser le Site de la Marque

1. **Ouvrir** le site (ex: `https://www.nike.com`)
2. **Naviguer** vers "New In" ou "Nouveautés"
3. **Ouvrir** DevTools (F12)
4. **Inspecter** les éléments :
   - Produits (liste)
   - Nom du produit
   - Prix
   - Image

### 2. Identifier les Sélecteurs CSS

#### A. Sélecteur de Produits

1. **Inspecter** un produit dans la liste
2. Trouver l'élément **parent** qui contient tous les produits
3. Noter la **classe CSS**

**Exemple** :
```html
<div class="product-card">
  <!-- contenu -->
</div>
```

**Sélecteur** : `.product-card`

#### B. Sélecteur du Nom

**Exemple** :
```html
<h2 class="product-title">Nike Air Max</h2>
```

**Sélecteur** : `.product-title` ou `h2`

#### C. Sélecteur du Prix

**Exemple** :
```html
<span class="price">129,99 €</span>
```

**Sélecteur** : `.price`

#### D. Sélecteur de l'Image

**Exemple** :
```html
<img src="..." class="product-image" />
```

**Sélecteur** : `.product-image` ou `img`

### 3. Tester les URLs

- **New In** : `/new-arrivals` ou `/nouveautes`
- **Best Sellers** : `/bestsellers` ou `/meilleures-ventes`

### 4. Ajouter dans la Base de Données

#### Option A : Via l'Interface Admin (À créer)

1. Aller sur `/admin/brands`
2. Cliquer sur "Ajouter une marque"
3. Remplir le formulaire
4. Tester les sélecteurs
5. Sauvegarder

#### Option B : Via SQL Direct

```sql
INSERT INTO "ScrapableBrand" (
  name, "baseUrl", "newInUrl", "bestSellersUrl",
  "productSelector", "nameSelector", "priceSelector", "imageSelector",
  country, category, priority, "isActive"
) VALUES (
  'Nike',
  'https://www.nike.com',
  '/fr/fr/new-arrivals',
  '/fr/fr/bestsellers',
  '.product-card',
  '.product-title',
  '.price',
  '.product-image img',
  'US',
  'sportswear',
  5,
  true
);
```

#### Option C : Via Script TypeScript

```typescript
import { prisma } from '@/lib/prisma';

await prisma.scrapableBrand.create({
  data: {
    name: 'Nike',
    baseUrl: 'https://www.nike.com',
    newInUrl: '/fr/fr/new-arrivals',
    bestSellersUrl: '/fr/fr/bestsellers',
    productSelector: '.product-card',
    nameSelector: '.product-title',
    priceSelector: '.price',
    imageSelector: '.product-image img',
    country: 'US',
    category: 'sportswear',
    priority: 5,
    isActive: true,
  },
});
```

### 5. Tester le Scraping

```bash
# Scanner les marques
curl -X POST http://localhost:3000/api/trends/scan-big-brands
```

Vérifier les logs pour voir si la nouvelle marque est scrapée avec succès.

---

## ✅ Checklist

- [ ] Sélecteurs CSS identifiés et testés
- [ ] URLs "New In" et "Best Sellers" vérifiées
- [ ] Marque ajoutée dans la base de données
- [ ] Test de scraping réussi
- [ ] Produits apparaissent dans `/trends`

---

## 🚨 Problèmes Courants

### Sélecteurs ne fonctionnent pas

**Solution** : Tester dans la console du navigateur :
```javascript
document.querySelectorAll('.product-card').length
```

### Aucun produit scrapé

**Vérifier** :
1. Les sélecteurs sont corrects
2. Les URLs sont accessibles
3. Le site ne bloque pas le scraping (Cloudflare, etc.)

### Erreur "Configuration manquante"

**Solution** : Vérifier que la marque est bien dans la base avec `isActive = true`

---

**Créé via BMAD-Method** 🎯
