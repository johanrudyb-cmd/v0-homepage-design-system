# Plan Analyste : Rendre la fonctionnalité Tendances 100 % fonctionnelle avec de vraies valeurs

**Rôle : Analyste**  
**Objectif :** Donner les actions exactes pour que la page Tendances affiche des données réelles issues du scraping des sites de marques (Zara, ASOS, Zalando, H&M, Uniqlo, etc.).

---

## 1. Chaîne de valeur actuelle (diagnostic)

| Étape | Composant | Rôle |
|-------|-----------|------|
| 1 | `ScrapableBrand` (table Prisma) | Stocke par marque : `baseUrl`, `newInUrl`, `bestSellersUrl`, sélecteurs CSS (`productSelector`, `nameSelector`, `priceSelector`, `imageSelector`). C’est **la seule source** des URLs et sélecteurs utilisés par le scraper. |
| 2 | `lib/brand-config-loader.ts` | Lit les marques actives en base et expose `loadBrandConfigs()` / `getBrandConfig(brandName)`. |
| 3 | `lib/big-brands-scraper.ts` | Pour chaque marque : Puppeteer ouvre l’URL (new_in ou best_sellers), applique les sélecteurs, extrait nom / prix / image, normalise type/coupe/matériau/couleur. Renvoie des `BigBrandProduct[]`. |
| 4 | `lib/trend-detector.ts` → `saveTrendSignals(products)` | Crée ou met à jour des enregistrements `TrendSignal` en base. Une tendance est **confirmée** quand au moins **3 marques différentes** ont le même (productType + cut + material). |
| 5 | `GET /api/trends/confirmed` | Utilise `getConfirmedTrends()` : lit les `TrendSignal` avec `isConfirmed === true`, les groupe par type+coupe+matériau, calcule prix moyen et liste des marques. |
| 6 | `TrendRadar.tsx` (page `/trends`) | Appelle `/api/trends/confirmed` et `/api/trends/stats`, affiche les tendances. Le bouton « Lancer le scan » appelle `POST /api/trends/scan-big-brands` (nécessite d’être connecté). |

**Point de rupture actuel :**  
Si les sélecteurs en base ne correspondent plus au HTML des sites, le scraper trouve **0 produit** par marque. Sans produits, aucun `TrendSignal` n’est créé/mis à jour, donc aucune tendance confirmée et la page reste vide ou avec d’anciennes données de seed.

---

## 2. Ce qu’il faut obtenir pour des « vraies valeurs »

- **Données d’entrée :** produits réels récupérés depuis les pages New In / Best Sellers des sites des marques.
- **Données en base :** `TrendSignal` remplis par le scraper (pas seulement par un seed manuel).
- **Tendances confirmées :** au moins un groupe (productType + cut + material) présent chez **3 marques ou plus**, afin d’avoir des lignes avec `isConfirmed === true` et un `confirmationScore >= 3`.
- **Page Tendances :** affichage de ces tendances confirmées, avec pays, style, type de produit, prix moyen et marques.

---

## 3. Actions exactes à faire (dans l’ordre)

### Étape 1 : Vérifier l’état de la base

```bash
npm run check:db
```

À contrôler :

- Nombre de marques **actives** dans `ScrapableBrand`.
- Présence et cohérence des champs `baseUrl`, `newInUrl`, `bestSellersUrl` (et sélecteurs) pour Zara, ASOS, Zalando, H&M, Uniqlo au minimum.

Si des marques stratégiques manquent ou sont inactives, les ajouter/activer (scripts existants ou Prisma Studio / migrations).

---

### Étape 2 : Valider les sélecteurs site par site

Les sélecteurs en base sont souvent obsolètes (sites refaits, A/B tests, régionalisation). Il faut les valider sur le HTML actuel.

**Outil prévu :**

```bash
npm run test:selectors Zara
```

(Idem en remplaçant `Zara` par `ASOS`, `Zalando`, `H&M`, `Uniqlo`, etc.)

Ce script ouvre la page « New In » de la marque, teste le `productSelector` configuré en base et affiche le nombre d’éléments trouvés. Si le compte est 0, il propose des sélecteurs alternatifs.

**À faire pour chaque marque importante :**

1. Lancer `npm run test:selectors <Marque>`.
2. Si « 0 éléments » : noter les sélecteurs qui renvoient un nombre cohérent de produits (souvent proposés dans la sortie du script, ou à trouver via l’inspecteur du navigateur).
3. Pour chaque marque testée, noter les 4 sélecteurs qui fonctionnent :
   - conteneur produit (`productSelector`)
   - nom (`nameSelector`)
   - prix (`priceSelector`)
   - image (`imageSelector`)

---

### Étape 3 : Mettre à jour les sélecteurs en base

Les sélecteurs sont modifiés soit via un script, soit directement en base.

**Option A – Script dédié (recommandé)**

Le projet contient déjà un script qui pousse des sélecteurs vers la table `ScrapableBrand` :

- Fichier : `scripts/update-selectors-manual.ts`
- Contenu : un objet `UPDATED_SELECTORS` par marque (`productSelector`, `nameSelector`, `priceSelector`, `imageSelector`).

Actions :

1. Ouvrir `scripts/update-selectors-manual.ts`.
2. Pour chaque marque validée à l’étape 2, remplacer les 4 sélecteurs par ceux qui ont vraiment marché (ceux du `test:selectors` ou de l’inspecteur).
3. Lancer :

```bash
npm run update:selectors
```

(correspond à `npx tsx scripts/update-selectors-manual.ts` selon le `package.json`).

Vérifier en sortie que les marques concernées sont bien « mises à jour » et qu’aucune erreur Prisma n’apparaît.

**Option B – Modification directe en base**

Si tu préfères ne pas passer par le script :

- Utiliser Prisma Studio (`npm run db:studio`) ou une migration/script personnalisé.
- Pour chaque marque, mettre à jour `productSelector`, `nameSelector`, `priceSelector`, `imageSelector` (et éventuellement `notes`) dans `ScrapableBrand`.

---

### Étape 4 : Lancer un scan complet

Une fois les sélecteurs à jour, lancer un scan qui :

1. Scrape les marques configurées (New In + Best Sellers).
2. Envoie les produits à `saveTrendSignals()`.
3. Crée/met à jour les `TrendSignal` et recalcule les tendances confirmées.

**En ligne de commande (sans être connecté à l’app) :**

```bash
npm run scan:trends
```

(= `npx tsx scripts/scan-trends-direct.ts`)

**Depuis l’interface (utilisateur connecté) :**

- Aller sur la page Tendances (`/trends`).
- Cliquer sur « Lancer le scan » (ou équivalent).
- L’app envoie `POST /api/trends/scan-big-brands`, qui appelle le même scraper et la même logique de sauvegarde.

Dans les deux cas, surveiller la sortie ou la réponse API :

- Nombre de produits scrapés.
- Nombre de signaux créés / mis à jour / tendances confirmées.

Si « 0 produit » persiste pour une marque, revenir à l’étape 2 pour cette marque et corriger les sélecteurs.

---

### Étape 5 : Contrôler le résultat

**En base :**

```bash
npm run check:db
```

Vérifier :

- Augmentation du nombre total de `TrendSignal`.
- Présence de signaux `isConfirmed === true` et `confirmationScore >= 3`.
- Répartition par marque, pays, style cohérente avec les sites scrapés.

**Dans l’UI :**

- Recharger la page `/trends`.
- Les tendances confirmées doivent apparaître (bloc « Tendances confirmées » ou équivalent).
- Les filtres (pays, style, type de produit) doivent refléter les données réelles.
- Les stats (`/api/trends/stats`) doivent être cohérentes avec les `TrendSignal` confirmés.

---

### Étape 6 (optionnel) : Rendre le flux pérenne

Pour que les tendances restent « vraies » dans le temps :

1. **Planning des scans**  
   - Utiliser un cron (Vercel Cron, serveur, etc.) qui appelle régulièrement le même flux que `scan-trends-direct` (ou une route dédiée type `POST /api/cron/scan-trends` si elle existe et fait la même chose).
   - Ou documenter que l’utilisateur peut relancer « Lancer le scan » sur `/trends` quand il veut rafraîchir.

2. **Surveillance des sélecteurs**  
   - Dès que le nombre de produits scrapés chute fortement pour une marque (ex. 0 alors qu’avant on avait des dizaines), relancer un `test:selectors` pour cette marque et refaire une mise à jour des sélecteurs (étape 2 → 3).

3. **Qualité des données**  
   - Si besoin, affiner la normalisation dans `normalizeProductName()` (dans `big-brands-scraper.ts`) pour mieux déduire type / coupe / matériau à partir des noms de produits, et donc améliorer le regroupement et la confirmation des tendances.

---

## 4. Récapitulatif des commandes

| Action | Commande |
|--------|----------|
| État base (marques + signaux) | `npm run check:db` |
| Tester les sélecteurs d’une marque | `npm run test:selectors Zara` (ou ASOS, Zalando, etc.) |
| Appliquer les sélecteurs du script | `npm run update:selectors` |
| Lancer un scan complet (hors UI) | `npm run scan:trends` |
| Scans depuis l’UI | Être connecté, aller sur `/trends`, cliquer sur « Lancer le scan » |
| Inspecter la BDD (Prisma Studio) | `npm run db:studio` |

---

## 5. Critères de succès « 100 % fonctionnel avec de vraies valeurs »

- [ ] Au moins 3 marques (idéalement 5+) ont des sélecteurs à jour et actifs en base.
- [ ] Un scan (`npm run scan:trends` ou bouton « Lancer le scan ») récupère **au moins quelques dizaines de produits** au total (pas 0).
- [ ] La table `TrendSignal` contient des lignes créées/mises à jour par ce scan (pas uniquement par un seed manuel).
- [ ] Il existe au moins un groupe (productType + cut + material) présent chez **3 marques ou plus**, donc des `TrendSignal` avec `isConfirmed === true`.
- [ ] La page `/trends` affiche ces tendances confirmées (bloc principal + filtres + stats) sans erreur.
- [ ] Les prix, marques, pays et styles affichés correspondent aux sites scrapés (vérification manuelle sur 2–3 tendances).

Une fois ces points validés, la fonctionnalité tendances peut être considérée comme **100 % fonctionnelle avec de vraies valeurs** dans le périmètre actuel (scraping des grandes marques + détection par seuil 3 marques + affichage sur `/trends`).
