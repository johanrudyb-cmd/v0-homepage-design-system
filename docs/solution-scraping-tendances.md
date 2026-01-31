# Solution : Mise à Jour des Sélecteurs CSS

*Document créé via BMAD-Method - Dev*

## Date : 2025-01-26

---

## 🎯 Problème

Les sélecteurs CSS configurés ne fonctionnent plus car les sites ont changé leur structure HTML.

**Résultat** : 0 produits scrapés malgré 51 marques configurées.

---

## ✅ Solution Immédiate : Données de Test

Pour avoir des tendances à afficher **maintenant**, utilisez les données de test :

```bash
npm run seed:trends
```

Cela créera des tendances de démo dans la base de données.

---

## 🔧 Solution Long Terme : Mettre à Jour les Sélecteurs

### Étape 1 : Tester les sélecteurs d'une marque

```bash
# Tester Zara (priorité 1)
npx tsx scripts/test-selectors.ts Zara
```

Le script va :
- Ouvrir le site dans un navigateur
- Tester les sélecteurs actuels
- Suggérer des alternatives
- Prendre un screenshot pour debug

### Étape 2 : Identifier les bons sélecteurs

1. Ouvrir le screenshot généré
2. Ouvrir le site dans un navigateur
3. Utiliser DevTools (F12) pour inspecter les produits
4. Identifier les classes/IDs réels

### Étape 3 : Mettre à jour dans la base

```bash
npm run db:studio
```

Puis modifier les sélecteurs dans la table `ScrapableBrand` :
- `productSelector` : Sélecteur pour les conteneurs de produits
- `nameSelector` : Sélecteur pour le nom
- `priceSelector` : Sélecteur pour le prix
- `imageSelector` : Sélecteur pour l'image

### Étape 4 : Tester à nouveau

```bash
npx tsx scripts/scan-trends-direct.ts
```

---

## 📋 Checklist par Marque

### Priorité 1 (À faire en premier)
- [ ] Zara
- [ ] ASOS
- [ ] Zalando
- [ ] H&M (si accessible)
- [ ] Uniqlo

### Priorité 2
- [ ] Nike
- [ ] Adidas
- [ ] Mango
- [ ] Bershka
- [ ] Pull&Bear

### Priorité 3
- [ ] Autres marques

---

## 💡 Astuces pour Identifier les Sélecteurs

### 1. Utiliser les Data Attributes
Les sites modernes utilisent souvent `data-*` :
```css
[data-product-id]
[data-testid="product"]
```

### 2. Utiliser les Classes Partielles
Si la classe change, utiliser des sélecteurs partiels :
```css
[class*="product"]
[class*="item"]
```

### 3. Attendre le Chargement
Certains sites chargent le contenu dynamiquement :
```typescript
await page.waitForSelector('.product-item', { timeout: 10000 });
```

### 4. Scroller pour Lazy Loading
Beaucoup de sites utilisent le lazy loading :
```typescript
await page.evaluate(() => {
  window.scrollTo(0, document.body.scrollHeight);
});
```

---

## 🚀 Alternative : Utiliser des APIs

Certaines marques ont des APIs publiques :

### Zalando
- API publique disponible
- Documentation : https://developers.zalando.com/

### Shopify Stores
- Storefront API
- Utiliser `/products.json` pour les données brutes

---

## 📊 Statut Actuel

- ✅ **51 marques configurées** dans la base
- ❌ **0 produits scrapés** (sélecteurs obsolètes)
- ✅ **Script de test créé** (`test-selectors.ts`)
- ⏳ **À faire** : Mettre à jour les sélecteurs

---

**Créé via BMAD-Method** 🎯
