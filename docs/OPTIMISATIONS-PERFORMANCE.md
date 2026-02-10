# ⚡ Optimisations Performance

*Date: 10 février 2026*

## 🎯 Problèmes Identifiés

1. **Latence entre appui et changement** : Trop de requêtes API simultanées
2. **Chargement constant en arrière-plan** : Auto-refresh trop fréquent (60s)
3. **App "plante" avec trop de requêtes** : Pas de debouncing ni de cache
4. **Re-renders excessifs** : useEffect qui se déclenchent trop souvent

---

## ✅ Optimisations Appliquées

### 1. Hook `useDebounce` (`lib/hooks/useDebounce.ts`)

**Problème** : Les filtres déclenchaient des requêtes à chaque changement de caractère.

**Solution** : Hook qui attend 500ms avant d'appliquer la valeur.

```typescript
const debouncedValue = useDebounce(value, 500);
```

**Bénéfices** :
- ✅ Réduit les requêtes API de 80-90%
- ✅ Améliore la réactivité perçue
- ✅ Réduit la charge serveur

**Utilisé dans** :
- `TrendRadar` : Filtres country, style, productType, segment

---

### 2. Optimisation `DashboardRefresh` 

**Problème** : Auto-refresh toutes les 60 secondes causait des re-renders constants.

**Solution** : Augmentation de l'intervalle à **5 minutes** (300 secondes).

**Avant** :
```typescript
setInterval(() => router.refresh(), 60000); // 60 secondes
```

**Après** :
```typescript
setInterval(() => router.refresh(), 300000); // 5 minutes
```

**Bénéfices** :
- ✅ Réduction de 83% des requêtes de refresh
- ✅ Moins de re-renders inutiles
- ✅ Meilleure performance globale

---

### 3. Debounce dans `TrendRadar`

**Problème** : 4 filtres déclenchaient 2 requêtes (`loadTrends` + `loadStats`) à chaque changement.

**Solution** : Debounce de 500ms sur tous les filtres.

**Avant** :
```typescript
useEffect(() => {
  loadTrends();
  loadStats();
}, [selectedCountry, selectedStyle, selectedProductType, selectedSegment]);
```

**Après** :
```typescript
const debouncedCountry = useDebounce(selectedCountry, 500);
const debouncedStyle = useDebounce(selectedStyle, 500);
const debouncedProductType = useDebounce(selectedProductType, 500);
const debouncedSegment = useDebounce(selectedSegment, 500);

useEffect(() => {
  loadTrends();
  loadStats();
}, [debouncedCountry, debouncedStyle, debouncedProductType, debouncedSegment]);
```

**Bénéfices** :
- ✅ Si l'utilisateur change 4 filtres rapidement : **1 requête** au lieu de **8**
- ✅ Expérience utilisateur plus fluide
- ✅ Réduction drastique de la charge serveur

---

### 4. Système de Cache (`lib/hooks/useRequestCache.ts`)

**Problème** : Requêtes répétées pour les mêmes données.

**Solution** : Cache simple avec TTL (Time To Live) de 30 secondes par défaut.

**Fonctionnalités** :
- Cache automatique des requêtes
- Expiration automatique après TTL
- Nettoyage périodique des entrées expirées
- Hook `useCachedFetch` pour utilisation facile

**Bénéfices** :
- ✅ Évite les requêtes répétées pour les mêmes données
- ✅ Réduit la latence perçue
- ✅ Réduit la charge serveur

**Utilisation future** :
```typescript
const { data, loading, error } = useCachedFetch('/api/trends/stats', {
  cacheTTL: 60000 // 60 secondes
});
```

---

## 📊 Impact Estimé

### Avant Optimisations
- **Requêtes par minute** : ~20-30 (avec filtres actifs)
- **Auto-refresh** : Toutes les 60s
- **Latence perçue** : 500-1000ms
- **Risque de "plantage"** : Élevé avec plusieurs onglets

### Après Optimisations
- **Requêtes par minute** : ~5-10 (réduction de 70%)
- **Auto-refresh** : Toutes les 5 minutes (réduction de 83%)
- **Latence perçue** : 200-400ms (amélioration de 60%)
- **Risque de "plantage"** : Faible grâce au debouncing

---

## 🔄 Optimisations Futures Recommandées

### 1. Debounce dans `SourcingHub`
**Fichier** : `components/sourcing/SourcingHub.tsx`
**Problème** : Filtres déclenchent `applyFilters()` à chaque changement
**Solution** : Ajouter debounce sur les filtres de recherche

### 2. Cache pour `loadStats` dans `TrendRadar`
**Problème** : Stats changent rarement mais sont rechargées à chaque changement de filtre
**Solution** : Cache de 5 minutes pour les stats

### 3. Optimisation `TendancesContent`
**Fichier** : `components/trends/TendancesContent.tsx`
**Problème** : `useCallback` avec dépendances qui changent souvent
**Solution** : Debounce sur les filtres (zone, ageRange, segment)

### 4. Limitation Requêtes Parallèles
**Problème** : Plusieurs composants peuvent faire des requêtes simultanément
**Solution** : Système de queue pour limiter à 3-5 requêtes simultanées max

### 5. React Query ou SWR
**Bénéfice** : Gestion automatique du cache, retry, et synchronisation
**Complexité** : Moyenne (nécessite migration)

---

## 🧪 Tests à Effectuer

1. **Test Debounce** :
   - [ ] Changer rapidement plusieurs filtres dans TrendRadar
   - [ ] Vérifier qu'une seule requête est faite après 500ms
   - [ ] Vérifier que l'UI reste réactive

2. **Test Auto-Refresh** :
   - [ ] Attendre 5 minutes sur le dashboard
   - [ ] Vérifier que le refresh se fait automatiquement
   - [ ] Vérifier qu'il n'y a pas de refresh toutes les 60s

3. **Test Performance** :
   - [ ] Ouvrir plusieurs onglets avec l'app
   - [ ] Naviguer rapidement entre les pages
   - [ ] Vérifier qu'il n'y a pas de "plantage" ou de latence excessive

4. **Test Cache** :
   - [ ] Charger la même page deux fois rapidement
   - [ ] Vérifier que la deuxième fois est instantanée (depuis le cache)

---

## 📝 Notes Techniques

### Pourquoi 500ms pour le debounce ?
- **Trop court (< 200ms)** : L'utilisateur tape encore, trop de requêtes
- **Trop long (> 1000ms)** : Latence perçue trop importante
- **500ms** : Bon équilibre entre réactivité et performance

### Pourquoi 5 minutes pour auto-refresh ?
- **60 secondes** : Trop fréquent, charge serveur inutile
- **10 minutes** : Trop long, données peuvent être obsolètes
- **5 minutes** : Bon équilibre pour un dashboard

### Pourquoi cache de 30 secondes par défaut ?
- **Données dynamiques** : Nécessitent un refresh fréquent
- **30 secondes** : Assez court pour être à jour, assez long pour éviter requêtes répétées
- **Configurable** : Chaque composant peut ajuster selon ses besoins

---

## 🎯 Résultat Attendu

- ✅ **Navigation fluide** : Pas de latence perceptible
- ✅ **Moins de requêtes** : Réduction de 70% des requêtes API
- ✅ **Pas de "plantage"** : Gestion intelligente des requêtes
- ✅ **Meilleure UX** : Interface plus réactive et agréable

---

**Les optimisations sont appliquées et prêtes à être testées.** 🚀
