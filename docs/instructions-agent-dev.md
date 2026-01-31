# Instructions pour l’agent Dev (état actuel)

**À lire avant toute modification sur Tendances / Zalando / scrape.**

---

## Ce qui est déjà en place (ne pas casser)

1. **Sources Zalando** (`lib/hybrid-radar-sources.ts`)
   - 20 sources : 10 villes × 2 segments (femme + homme).
   - URLs : `https://www.zalando.fr/trend-spotter/{ville}?gender=WOMEN` ou `MEN`.
   - Enrichissement « Voir l’article » (composition, entretien, etc.) **uniquement** pour Paris et Berlin (4 sources). Le reste en grille seule.

2. **Scraper Zalando** (`lib/hybrid-radar-scraper.ts`)
   - `scrapeZalandoTrendSpotter()` : flux grille + flux enrichi (trending-items → clic « Voir l’article » → fiche produit).
   - Exclusions : chaussures, sacs, parfums, accessoires, cosmétiques, etc. (listes `EXCLUDE_*_KEYWORDS`).
   - Référence fonctionnelle : **`docs/brief-zalando-scrape-tendances.md`** (URLs, flux, exclusions). **Ne pas inventer d’autres URLs.**

3. **Enregistrement en base** (`app/api/trends/hybrid-radar/scrape-only/route.ts`)
   - Body `saveToTrends: true` → les produits scrapés sont enregistrés dans **TrendProduct** (sans GPT).
   - Déduplication par `sourceUrl` + `marketZone` + `sourceBrand`.

4. **Page Tendances** (`components/trends/TendancesContent.tsx`)
   - Bouton « Voir les produits tendance (Zalando) » appelle scrape-only avec `saveToTrends: true`, puis rafraîchit « Tendances par marché ».
   - Section « Tendances par marché » : charge les tendances depuis `GET /api/trends/hybrid-radar` (TrendProduct), avec filtres Zone et Global Trend Alert.

---

## Ce que l’agent Dev doit faire maintenant

### 1. Priorité : vérifier que le scrape renvoie des produits

- Lancer un scrape Zalando depuis l’app (bouton « Voir les produits tendance (Zalando) ») ou via un script de test.
- **Si 0 produit** : déboguer dans l’ordre :
  1. Les URLs sont-elles bien celles du brief ? (Trend Spotter uniquement, pas d’URL catalogue inventée.)
  2. La page Trend Spotter charge-t-elle du contenu (lazy-load, blocage bot) ? Ajuster `initialWaitMs`, `preScrollSteps`, ou `waitForSelector` si besoin.
  3. Les sélecteurs dans `zalandoExtractFromPage` et dans le flux enrichi correspondent-ils au HTML actuel de Zalando ? (Inspecter une page `trend-spotter/{ville}?gender=WOMEN` et une fiche produit après « Voir l’article ».)
- Ne pas changer les URLs ni la liste des villes/segments sans validation (voir brief).

### 2. Ne pas faire sans accord

- **Ne pas** ajouter de nouvelles URLs Zalando (catalogue Nouveautés, Best-sellers, etc.) sans que ce soit demandé et documenté dans le brief.
- **Ne pas** désactiver l’enregistrement en base (`saveToTrends`) ni le rafraîchissement de « Tendances par marché » après scrape.
- **Ne pas** supprimer les exclusions (vêtements uniquement, pas chaussures/sacs/parfums/accessoires).

### 3. Améliorations possibles (optionnel)

- **Robustesse** : si le site Zalando change de structure, adapter **uniquement** les sélecteurs (et éventuellement les regex d’extraction fiche produit) en restant sur les mêmes URLs et le même flux que le brief.
- **Logs** : garder ou ajouter des logs utiles (ex. `[Hybrid Radar] Zalando (sourceId): X produits`) pour le débogage.
- **Performance** : si le scrape est trop long (20 sources), on peut réduire le nombre de produits par source (`limit`) ou le nombre de liens enrichis (Paris/Berlin) sans changer la logique métier.
- **Tests** : exécuter `npm run test:zalando` (ou `npx tsx scripts/test-zalando-source.ts [sourceId]`) pour vérifier qu’au moins une source Zalando retourne des produits. Exit 0 = OK, exit 1 = échec (0 produit).

### 4. Référence unique pour Zalando

- **`docs/brief-zalando-scrape-tendances.md`** : spécification des URLs, du flux (grille seule vs enrichi), des données à extraire et des exclusions. S’y référer pour toute modification liée au scrape Zalando / Trend Spotter.

---

## Résumé en une phrase

**L’agent Dev doit s’assurer que le scrape Zalando (Trend Spotter, URLs du brief) renvoie bien des produits, que ceux-ci sont enregistrés en base et affichés dans « Tendances par marché », sans changer les URLs ni la structure des sources sans accord.**
