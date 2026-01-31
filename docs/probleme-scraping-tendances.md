# Problème : Scraping des Tendances - Sélecteurs CSS Obsolètes

*Document créé via BMAD-Method - Dev*

## Date : 2025-01-26

---

## 🔍 Diagnostic

### Problème Identifié

Le scraper s'exécute mais **ne trouve aucun produit** (0 produits scrapés).

### Causes

1. **Sélecteurs CSS obsolètes** ❌
   - Les sélecteurs configurés ne correspondent plus aux sites actuels
   - Exemple : `.product-item, .product-card` ne trouve rien sur Zara
   - Les sites ont changé leur structure HTML

2. **Protection anti-scraping** 🛡️
   - H&M : "Access Denied"
   - Levi's : "Access Denied"
   - Certains sites détectent Puppeteer

3. **URLs incorrectes** ⚠️
   - Nike : "Page not found"
   - Uniqlo : "Page introuvable"
   - New Balance : URLs incorrectes

4. **Sélecteurs name/price incorrects** ⚠️
   - New Balance trouve 17 éléments mais 0 produits après filtrage
   - Les sélecteurs `nameSelector` et `priceSelector` ne fonctionnent pas

---

## 📊 Résultats du Scan

### Marques qui se chargent mais ne trouvent rien
- ✅ Zara : Page chargée mais 0 éléments
- ✅ ASOS : Page chargée mais 0 éléments
- ✅ Zalando : Page chargée mais 0 éléments
- ✅ Mango : Page chargée mais 0 éléments
- ✅ Bershka : Page chargée mais 0 éléments
- ✅ Pull&Bear : Page chargée mais 0 éléments
- ✅ Shein : Page chargée mais 0 éléments
- ✅ Puma : Page chargée mais 0 éléments
- ✅ Carhartt WIP : Page chargée mais 0 éléments

### Marques bloquées
- ❌ H&M : "Access Denied"
- ❌ Levi's : "Access Denied"

### Marques avec URLs incorrectes
- ❌ Nike : "Page not found"
- ❌ Uniqlo : "Page introuvable"
- ⚠️ New Balance : Trouve 17 éléments mais 0 produits (sélecteurs incorrects)

---

## ✅ Solutions

### Solution 1 : Mettre à jour les sélecteurs CSS (Recommandé)

**Étape 1** : Identifier les vrais sélecteurs
1. Ouvrir le site dans un navigateur
2. Inspecter les éléments produits
3. Identifier les classes/IDs réels
4. Mettre à jour dans la base `ScrapableBrand`

**Étape 2** : Tester les sélecteurs
```bash
# Créer un script de test pour une marque
npx tsx scripts/test-selectors.ts Zara
```

**Étape 3** : Mettre à jour la base
```bash
# Via Prisma Studio
npm run db:studio
# Modifier les sélecteurs dans ScrapableBrand
```

### Solution 2 : Utiliser des APIs officielles (Si disponibles)

Certaines marques ont des APIs publiques :
- **Zalando** : API publique disponible
- **ASOS** : API partielle
- **Shopify Stores** : Storefront API

### Solution 3 : Scraper avec des techniques avancées

1. **Stealth Mode** : Utiliser `puppeteer-extra` avec `stealth-plugin`
2. **Rotating User Agents** : Changer le user agent
3. **Proxies** : Utiliser des proxies pour éviter les blocages
4. **Delays** : Augmenter les délais entre requêtes

### Solution 4 : Alternative - Données de test

En attendant la correction des sélecteurs, créer des données de test :

```bash
npm run seed:trends
```

---

## 🔧 Actions Immédiates

### 1. Créer un script de test de sélecteurs

```typescript
// scripts/test-selectors.ts
// Teste les sélecteurs pour une marque spécifique
```

### 2. Mettre à jour les sélecteurs pour Zara (priorité 1)

Zara utilise probablement :
- Products : `article.product-item` ou `[data-product-id]`
- Name : `h3.product-name` ou `.product-title`
- Price : `.price` ou `[data-price]`
- Image : `img.product-image` ou `[data-src]`

### 3. Vérifier les URLs

Certaines URLs peuvent nécessiter des paramètres supplémentaires ou être différentes.

---

## 📝 Note Technique

**Pourquoi les sélecteurs ne fonctionnent pas ?**

1. **Sites modernes** : Utilisent souvent du JavaScript pour charger le contenu
2. **Lazy loading** : Les images et produits se chargent dynamiquement
3. **Structure changeante** : Les sites changent régulièrement leur HTML
4. **Protection** : Certains sites détectent et bloquent les scrapers

**Solution recommandée** :
- Utiliser `waitForSelector` pour attendre le chargement
- Scroller la page pour déclencher le lazy loading
- Utiliser des sélecteurs plus génériques (data-attributes)

---

## 🎯 Prochaines Étapes

1. ✅ **Créer un script de test de sélecteurs**
2. ✅ **Mettre à jour les sélecteurs pour Zara (test)**
3. ⏳ **Tester avec une marque qui fonctionne**
4. ⏳ **Mettre à jour toutes les marques**
5. ⏳ **Implémenter stealth mode si nécessaire**

---

**Créé via BMAD-Method** 🎯
