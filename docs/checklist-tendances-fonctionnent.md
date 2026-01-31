# Checklist : faire fonctionner les tendances normalement

Pour que la page **Tendances** affiche de **vraies données** (scraping → signaux → tendances confirmées), il faut au minimum **3 marques** qui renvoient des produits. Voici ce à faire, dans l’ordre.

---

## 1. Ce qui est déjà en place

- **URLs** : New In / Best Sellers à jour pour Zara, ASOS, Zalando, H&M, Nike, Pull&Bear, Adidas (`npm run update:urls`).
- **Nike** : sélecteurs corrigés (nom dans `a[data-testid="product-card__link-overlay"]`). Après `npm run update:selectors`, Nike doit scraper correctement.
- **Scraper** : fallbacks produit + nom améliorés (ex. `div[data-testid="product-card"]`, `a[class*="link-overlay"]`).

---

## 2. À faire pour que ça « fonctionne normalement »

### Étape A – Appliquer les sélecteurs en base

```bash
npm run update:selectors
```

Cela met à jour en base les sélecteurs de Nike (et des autres marques définies dans `scripts/update-selectors-manual.ts`).

---

### Étape B – Avoir au moins 3 marques qui scrapent

Aujourd’hui, **Nike** est la seule marque dont les sélecteurs sont corrects pour les nouvelles URLs homme.

Pour avoir des **tendances confirmées** (règle : 3 marques minimum sur le même type de produit), il faut que **2 autres marques** au moins renvoient des produits. Les plus réalistes à corriger en priorité : **Zara**, **ASOS**, **H&M**.

Pour chaque marque (ex. Zara) :

1. **Ouvrir la page** dans un navigateur :  
   ex. https://www.zara.com/fr/fr/homme-nouveau-l711.html
2. **Ouvrir les DevTools** (F12) → onglet **Elements**.
3. **Repérer une carte produit** (une seule) dans la grille.
4. **Noter** :
   - le **conteneur** de la carte (balise + attributs : `class`, `data-*`, etc.) → ce sera le `productSelector`
   - l’élément qui contient le **nom** du produit → `nameSelector`
   - l’élément qui contient le **prix** → `priceSelector`
   - l’élément **image** → `imageSelector`
5. **Mettre à jour** `scripts/update-selectors-manual.ts` : dans l’objet `UPDATED_SELECTORS`, pour la marque concernée, remplacer les 4 sélecteurs par ceux trouvés.
6. **Relancer** :
   ```bash
   npm run update:selectors
   npm run test:selectors -- Zara   # ou ASOS, H&M, etc.
   ```
   Vérifier que le test affiche un nombre d’éléments produits cohérent.

Répéter pour une 2ᵉ et une 3ᵉ marque (idéalement ASOS et H&M, ou Zara + une autre).

---

### Étape C – Lancer un scan

Une fois au moins 3 marques avec des sélecteurs valides :

```bash
npm run scan:trends
```

Ou, depuis l’app : aller sur **/trends**, être **connecté**, puis cliquer sur **« Lancer le scan »**.

Vérifier dans la sortie :
- **Produits scrapés** > 0
- **Signaux créés / mis à jour** > 0
- **Tendances confirmées** > 0 si au moins un type de produit (ex. Hoodie, T-shirt) apparaît chez 3 marques ou plus.

---

### Étape D – Contrôler le résultat

```bash
npm run check:db
```

Puis recharger la page **/trends** : les tendances confirmées doivent s’afficher dans le bloc principal et dans les filtres.

---

## 3. Résumé des commandes

| Action | Commande |
|--------|----------|
| Mettre à jour les sélecteurs en base | `npm run update:selectors` |
| Tester une marque | `npm run test:selectors -- Zara` (ou ASOS, H&M, Nike, etc.) |
| Lancer un scan complet | `npm run scan:trends` |
| Vérifier la base | `npm run check:db` |

---

## 4. Pourquoi « 3 marques » ?

Une tendance est **confirmée** quand le même produit (même **type** + **coupe** + **matériau**) est vu chez **au moins 3 marques différentes**.  
Ex. : « Hoodie Loose Fit Coton » vu chez Nike, Adidas et H&M → 1 tendance confirmée.

Si une seule marque (ex. Nike) scrape, tu auras des **signaux** en base mais **aucune tendance confirmée** affichée. D’où la nécessité de corriger au moins 2 autres marques (Zara, ASOS, H&M, etc.) et de relancer le scan.

---

## 5. En cas de blocage

- **0 produit** pour une marque : les sélecteurs ou la structure de la page ont changé → refaire l’étape B pour cette marque.
- **Mur de cookies / consentement** : certains sites (ex. Zalando, Adidas) peuvent ne rien afficher tant que l’utilisateur n’a pas accepté. En headless, le scraper peut voir une page vide. Solutions possibles : accepter les cookies dans le script (Puppeteer), ou se concentrer sur les marques qui ne bloquent pas (Nike, Zara, ASOS, H&M).
- **Titre de page vide** (ex. Zalando) : souvent lié à une SPA ou un mur de consentement → idem ci‑dessus.

Une fois **au moins 3 marques** qui renvoient des produits et un **scan** exécuté, les tendances fonctionnent normalement : vraies valeurs, tendances confirmées et page /trends à jour.

---

## 6. Actualisation automatique (Zara, H&M, Nike, etc.)

**Actuellement : non.** Les tendances ne se mettent à jour que quand :

- tu lances `npm run scan:trends`, ou  
- quelqu’un clique sur **« Lancer le scan »** sur la page /trends.

Les pages Zara, H&M, Nike, etc. ne sont **pas** scrapées en continu toutes seules.

**Pour que ce soit automatique**, il faut qu’un **cron** (tâche planifiée) appelle régulièrement la route :

- **URL :** `GET /api/cron/scan-trends`
- **Sécurité :** header `Authorization: Bearer <CRON_SECRET>` ou `x-cron-secret: <CRON_SECRET>`
- **Variable d’environnement :** `CRON_SECRET` dans `.env` (même valeur que celle envoyée dans le header)

**Exemples de mise en place :**

1. **Vercel Cron**  
   Créer un `vercel.json` à la racine :
   ```json
   {
     "crons": [
       { "path": "/api/cron/scan-trends", "schedule": "0 6 * * *" }
     ]
   }
   ```
   (exemple : tous les jours à 6h UTC). Vercel envoie alors la requête ; il faut configurer `CRON_SECRET` dans les env Vercel et que ta route vérifie ce secret.

2. **Service externe (cron-job.org, etc.)**  
   Planifier une requête GET vers  
   `https://ton-domaine.com/api/cron/scan-trends`  
   avec le header `Authorization: Bearer <ton_CRON_SECRET>` à l’heure voulue (ex. 1 fois par jour).

3. **Cron système (serveur Linux)**  
   Par exemple :
   ```bash
   0 6 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://ton-domaine.com/api/cron/scan-trends
   ```

Une fois ce cron en place, les tendances se mettront à jour **automatiquement** selon la fréquence choisie (pages Zara, H&M, Nike, etc. scrapées à chaque exécution).
