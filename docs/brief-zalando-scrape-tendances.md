# Brief Zalando — Scrape Tendances (pour l’agent Dev)

**Rôle : Analyste (Mary)**  
**Objectif :** Définir les bonnes URLs et données Zalando pour le scrape des tendances, afin que l’agent Dev puisse les intégrer sans ambiguïté.

---

## Recommandation Analyste : Trend Spotter / Trend Alert

**Pourquoi se baser sur la partie Trend Alert de Zalando ?**

- Zalando référence **beaucoup de marques** et de références à travers l’Europe.
- Le **Trend Spotter** (Trend Alert) est une page dédiée aux « produits tendance » par ville : c’est exactement la donnée dont tu as besoin pour des tendances multi-marques.
- Les URLs sont **stables** et **prévisibles** : `https://www.zalando.fr/trend-spotter/{ville}?gender=WOMEN` ou `MEN`.
- On ne touche pas au catalogue classique (Nouveautés / Best-sellers), qui aurait des URLs différentes par catégorie et serait plus fragile.

**Recommandation :** utiliser **uniquement le Trend Spotter** (Option 1) avec les URLs ci-dessous. Pas de mélange avec le catalogue classique.

---

## Spécification finale (validée)

| Question | Choix |
|----------|--------|
| **Type de page** | Trend Spotter / Trend Alert uniquement |
| **Villes** | Toutes : Paris, Berlin, Milan, Copenhagen, Stockholm, Antwerp, Zurich, London, Amsterdam, Warsaw |
| **Segment** | Les deux : Femme (WOMEN) + Homme (MEN) |
| **Données produit** | Toutes : nom, prix, image, lien, composition, entretien, couleur, tailles, pays d’origine, référence article |
| **« Voir l’article »** | Oui — pour récupérer la fiche produit complète (composition, entretien, etc.). Activé pour **Paris + Berlin** (femme + homme) pour limiter le temps de scrape ; le reste des villes en grille seule. |
| **Exclusions** | Garder : chaussures, sacs, sous-vêtements, parfums, accessoires, cosmétiques |

**Implémentation faite :** `lib/hybrid-radar-sources.ts` a été mis à jour : 20 sources Zalando (10 villes × 2 segments), enrichissement « Voir l’article » pour Paris et Berlin uniquement.

---

## Comment le scrape fonctionne correctement

### 1. URLs à utiliser (ne pas en inventer d’autres)

- **Base :** `https://www.zalando.fr`
- **Page liste (grille tendance par ville) :**
  - Femme : `https://www.zalando.fr/trend-spotter/{ville}?gender=WOMEN`
  - Homme : `https://www.zalando.fr/trend-spotter/{ville}?gender=MEN`
- **Villes valides :** `paris`, `berlin`, `milan`, `copenhagen`, `stockholm`, `antwerp`, `zurich`, `london`, `amsterdam`, `warsaw`

Exemples :
- Femme Paris : `https://www.zalando.fr/trend-spotter/paris?gender=WOMEN`
- Homme Berlin : `https://www.zalando.fr/trend-spotter/berlin?gender=MEN`

### 2. Flux pour une source « grille seule » (ex. Milan, London…)

1. Ouvrir l’URL de la page liste (ex. `.../trend-spotter/milan?gender=WOMEN`).
2. Attendre le chargement + faire défiler la page pour charger le lazy-load.
3. Sur cette page, extraire les **cartes produit** : lien, nom, prix, image (depuis les `article` ou les liens `a[href*="zalando.fr"]` qui contiennent `.html` ou `trending-items`).
4. Ne pas cliquer sur « Voir l’article ». Données obtenues : nom, prix, image, lien (sans composition/entretien).

### 3. Flux pour une source « enrichie » (Paris + Berlin uniquement)

1. Ouvrir l’URL de la page liste (ex. `.../trend-spotter/paris?gender=WOMEN`).
2. Faire défiler pour charger la grille.
3. Récupérer tous les liens de type **trending-items** :  
   `https://www.zalando.fr/trend-spotter/trending-items/{ville}/women/{productId}` ou `.../men/{productId}`.
4. Pour chaque lien trending-items (jusqu’à 20 par source) :
   - Ouvrir la page trending-items.
   - Trouver le bouton/lien **« Voir l’article »** et cliquer.
   - Sur la **fiche produit** qui s’ouvre, extraire : nom, prix, image, **composition, entretien, couleur, tailles, pays d’origine, référence article**, et l’URL finale de la fiche comme `sourceUrl`.
5. Exclure les produits dont le nom contient des mots-clés à exclure (chaussures, sacs, parfums, accessoires, etc.).

### 4. Exclusions (à appliquer sur le nom du produit)

Ne pas garder les produits dont le nom contient (liste actuelle) : chaussures, baskets, sacs, sous-vêtements, parfums, lunettes, montres, ceintures, bijoux, cosmétiques, etc. (voir `lib/hybrid-radar-scraper.ts` → `EXCLUDE_*_KEYWORDS`).

### 5. Fichiers concernés

- **Sources (URLs, villes, segments, enrichissement) :** `lib/hybrid-radar-sources.ts`
- **Logique de scrape (Zalando) :** `lib/hybrid-radar-scraper.ts` → `scrapeZalandoTrendSpotter()`
- **Extraction page produit (composition, entretien, etc.) :** dans le même fichier, bloc `page.evaluate(...)` après le clic « Voir l’article ».

Tu peux donner ce brief (ou le lien vers ce fichier) à l’agent Dev pour qu’il s’aligne sur ces URLs et ce flux sans inventer d’autres liens.

---

## Partie 1 — Questions pour toi (à remplir) — référence

Réponds à ces questions. Tes réponses seront la source de vérité pour le Dev.

### A. Quel type de page Zalando veux-tu scraper ?

Actuellement le code utilise **Zalando Trend Spotter** (ex. `https://www.zalando.fr/trend-spotter/paris?gender=WOMEN`).

- [ ] **Option 1 — Garder Trend Spotter**  
  Pages du type : `https://www.zalando.fr/trend-spotter/{ville}?gender=WOMEN` ou `MEN`  
  → Produits « tendance » par ville (Paris, Berlin, Milan, etc.)

- [ ] **Option 2 — Catalogue classique**  
  Pages du type : Nouveautés / Best-sellers par catégorie (ex. Femme → Vêtements → Nouveautés)  
  → Il faudra me donner **l’URL exacte** d’une page qui liste les produits (ex. une page « Nouveautés femme »).

- [ ] **Option 3 — Les deux**  
  Trend Spotter pour certaines sources + catalogue pour d’autres (précise lesquelles).

**Ta réponse :**  
*(ex. « Option 1, uniquement Trend Spotter femme par ville »)*

---

### B. Quelles villes (Trend Spotter) ?

Aujourd’hui configuré : Paris, Berlin, Milan, Copenhagen, Stockholm, Antwerp, Zurich, London, Amsterdam, Warsaw.

- Tu veux **garder toutes** ?
- En **enlever** ? Lesquelles ?
- En **ajouter** ? Lesquelles ?

**Ta réponse :**  
*(ex. « Garder Paris, Berlin, Milan, London. Enlever le reste. »)*

---

### C. Homme, femme ou les deux ?

- [ ] **Femme uniquement** (comme actuellement : `gender=WOMEN`)
- [ ] **Homme uniquement** (`gender=MEN`)
- [ ] **Les deux** (deux séries de sources : une par ville pour WOMEN, une pour MEN)

**Ta réponse :**

---

### D. Quelles données produit sont obligatoires ?

Cocher ce que tu veux **obligatoirement** pour chaque produit scrapé :

- [ ] **Nom** (titre produit)
- [ ] **Prix** (en €)
- [ ] **Image** (URL de la photo)
- [ ] **Lien vers la fiche produit** (URL Zalando)
- [ ] **Composition** (matières, ex. « 100 % coton ») — souvent sur la fiche produit après « Voir l’article »
- [ ] **Entretien** (instructions lavage)
- [ ] **Couleur**
- [ ] **Tailles disponibles**
- [ ] **Pays d’origine**
- [ ] **Référence / numéro d’article**

**Ta réponse :**  
*(ex. « Nom, prix, image, lien, composition, entretien. Le reste en bonus si possible. »)*

---

### E. Flux « Voir l’article » (fiche produit complète)

Sur Trend Spotter, un clic « Voir l’article » ouvre la **fiche produit** (composition, entretien, etc.).

- [ ] **Oui** — Je veux qu’on clique « Voir l’article » pour **chaque** produit et qu’on récupère les infos de la fiche (composition, entretien, etc.).  
  → Plus lent, mais données complètes (idéal pour tech pack).

- [ ] **Non** — Rester sur la grille / la page liste uniquement (nom, prix, image, lien).  
  → Plus rapide, moins de données.

- [ ] **Seulement pour une ville** (ex. Paris) pour tester, le reste en grille seule.

**Ta réponse :**

---

### F. Ce qu’il ne faut PAS scraper (exclusions)

Actuellement on exclut : chaussures, sacs, sous-vêtements, parfums, accessoires (lunettes, montres, ceintures…), cosmétiques.

- Tu veux **garder ces exclusions** ?
- **Ajouter** d’autres catégories à exclure ? (ex. « maillots de bain », « ski »)

**Ta réponse :**

---

### G. Liens que tu as déjà (si tu en as)

Si tu as des liens Zalando qui marchent bien (pages qui listent des produits tendance), colle-les ici. Le Dev pourra s’en servir comme référence pour la structure des URLs.

**Exemple de format :**

- Page liste (grille de produits) : `https://www.zalando.fr/...`
- Exemple de fiche produit (après « Voir l’article ») : `https://www.zalando.fr/...`

**Tes liens :**

```
(Colle ici)
```

---

## Partie 2 — Ce que le Dev doit faire (spécification)

Une fois tes réponses remplies ci-dessus, le Dev doit :

1. **Lire la Partie 1** de ce document (tes réponses).
2. **Adapter `lib/hybrid-radar-sources.ts`** :
   - Utiliser **exactement** les URLs que tu as validées (baseUrl + newInPath).
   - Ne garder que les **villes / segments** que tu as choisis (questions B et C).
3. **Respecter les données obligatoires** (question D) : s’assurer que le scraper remplit au minimum ces champs (et les envoie à l’API / au front).
4. **Gérer le flux « Voir l’article »** selon ta réponse E (pour toutes les sources, aucune, ou une seule ville).
5. **Garder ou étendre les exclusions** selon ta réponse F.
6. **Ne pas inventer d’URLs** : si un lien n’est pas dans ce brief ou dans le code actuel, demander confirmation avant de l’ajouter.

---

## Partie 3 — Référence technique rapide (pour le Dev)

- **Fichier des sources :** `lib/hybrid-radar-sources.ts`
- **Scraper Zalando :** `lib/hybrid-radar-scraper.ts` → `scrapeZalandoTrendSpotter()`
- **Structure d’une source :**  
  `baseUrl` = `https://www.zalando.fr`  
  `newInPath` = `/trend-spotter/{ville}?gender=WOMEN` ou `?gender=MEN`  
  → URL finale = `baseUrl` + `newInPath`
- **Exemples d’URLs liste :**
  - Femme Paris : `https://www.zalando.fr/trend-spotter/paris?gender=WOMEN`
  - Homme Berlin : `https://www.zalando.fr/trend-spotter/berlin?gender=MEN`
- **Page « trending-items » (un produit, pour enrichissement) :**  
  Femme : `https://www.zalando.fr/trend-spotter/trending-items/{ville}/women/{productId}`  
  Homme : `https://www.zalando.fr/trend-spotter/trending-items/{ville}/men/{productId}`  
  → Depuis cette page, le clic « Voir l’article » mène à la fiche produit complète (composition, entretien, etc.).
- **Enrichissement « Voir l’article » :** activé uniquement pour les sources Paris et Berlin (femme + homme) via `zalandoTrendingItemsEnrich: true` dans les sources.

---

*Document créé par l’Analyste (Mary) pour clarifier les données Zalando et le brief Dev. Spécification finale appliquée dans le code (sources + brief).*
