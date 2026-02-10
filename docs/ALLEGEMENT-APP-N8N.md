# 🪶 Comment Alléger votre App avec n8n

*Guide pour réduire la charge serveur et améliorer les performances*

---

## 🎯 Problèmes Identifiés dans votre App

### 1. **CRON Jobs Lourds** (4 jobs dans `vercel.json`)
- `scan-trends` : Scraping toutes les marques (5-10 min)
- `refresh-zalando-trends` : Scraping Zalando (plusieurs minutes)
- `refresh-all-trends` : Refresh complet (plusieurs minutes)
- `track-inventory` : Tracking inventaire

**Problème** : Ces jobs s'exécutent sur Vercel, consomment des ressources, et peuvent timeout.

### 2. **Opérations Lourdes Synchrones**
- Scraping de marques (séquentiel, lent)
- Enrichissement IA (GPT + Higgsfield, 30-60s par produit)
- Génération de designs (30-60s)
- Analyse de marques (multiples APIs en parallèle)

**Problème** : Bloquent les requêtes, causent des timeouts, ralentissent l'app.

### 3. **Redirections Multiples**
- Dashboard : Vérifie user → redirect si pas connecté
- Pages protégées : Vérifications multiples
- Après actions : Redirections vers différentes pages

**Problème** : Requêtes DB multiples, latence, expérience utilisateur dégradée.

### 4. **Requêtes DB Excessives**
- Dashboard : Charge beaucoup de données à chaque chargement
- Pages trends : Filtres qui déclenchent plusieurs requêtes
- Navigation : Vérifications d'auth à chaque page

**Problème** : Charge DB élevée, latence, risque de saturation.

---

## ✅ Solutions avec n8n

### Stratégie 1 : Déplacer les CRON Jobs vers n8n

**Avant** : CRON jobs dans `vercel.json` → S'exécutent sur Vercel

**Avec n8n** :
- Créer des workflows n8n avec **Schedule Trigger**
- Appeler vos endpoints API depuis n8n
- Gérer les erreurs et retry dans n8n
- Notifications Slack/Email en cas d'erreur

**Bénéfices** :
- ✅ **-100% charge CRON sur Vercel**
- ✅ Gestion des erreurs améliorée
- ✅ Logs centralisés dans n8n
- ✅ Pas de timeout Vercel (n8n peut tourner longtemps)

**Workflows à créer** :
1. **Scan Trends Quotidien** (6h00)
   - Schedule Trigger → Appeler `/api/cron/scan-trends`
   - Si erreur → Retry automatique
   - Si succès → Notification Slack

2. **Refresh Zalando** (Lundi 9h00)
   - Schedule Trigger → Appeler `/api/cron/refresh-zalando-trends`
   - Gestion erreurs + notifications

3. **Refresh All Trends** (Mardi 11h00)
   - Schedule Trigger → Appeler `/api/cron/refresh-all-trends`
   - Gestion erreurs + notifications

4. **Track Inventory** (Tous les jours 2h00)
   - Schedule Trigger → Appeler `/api/cron/track-inventory`
   - Gestion erreurs + notifications

**Impact** : **-4 CRON jobs** sur Vercel = **-80% charge CRON**

---

### Stratégie 2 : Externaliser les Opérations Lourdes

#### 2.1 Scraping de Trends

**Avant** : `/api/trends/scan-big-brands` → Scrape toutes les marques (5-10 min)

**Avec n8n** :
- Workflow n8n avec **Schedule Trigger** (tous les jours 6h00)
- Scraper les marques dans n8n (pas de timeout)
- Sauvegarder directement dans votre DB via API
- Notifier quand terminé

**Bénéfices** :
- ✅ **Pas de timeout** (n8n peut tourner 10+ minutes)
- ✅ **-100% charge scraping sur Vercel**
- ✅ Gestion d'erreurs améliorée
- ✅ Logs détaillés dans n8n

**Workflow n8n** :
```
Schedule Trigger (6h00)
  ↓
HTTP Request → GET /api/brands/list (récupérer marques à scraper)
  ↓
Loop Over Items (pour chaque marque)
  ↓
  HTTP Request → Scraper marque (ex: Zara, Nike)
  ↓
  HTTP Request → POST /api/trends/save-product (sauvegarder produit)
  ↓
HTTP Request → POST /api/trends/detect-trends (détecter tendances)
  ↓
Slack Notification (résultats)
```

**Impact** : **-1 endpoint lourd** = **-90% charge scraping**

---

#### 2.2 Enrichissement IA des Produits

**Avant** : `/api/trends/products/[id]/enrich` → Appelle GPT + Higgsfield (30-60s)

**Avec n8n** :
- Workflow n8n déclenché par webhook depuis votre app
- Enrichissement dans n8n (pas de timeout)
- Mise à jour DB via API
- Notification quand terminé

**Bénéfices** :
- ✅ **Pas de timeout** pour l'utilisateur
- ✅ **-100% charge enrichissement sur Vercel**
- ✅ Traitement en arrière-plan
- ✅ Retry automatique en cas d'erreur

**Workflow n8n** :
```
Webhook Trigger (depuis votre app)
  ↓
HTTP Request → GET /api/trends/products/[id] (récupérer produit)
  ↓
OpenAI Node → Enrichir description (GPT)
  ↓
HTTP Request → Appeler Higgsfield API (générer image)
  ↓
HTTP Request → PUT /api/trends/products/[id] (mettre à jour)
  ↓
Webhook → Notifier votre app (optionnel)
```

**Dans votre app** :
```typescript
// Au lieu d'attendre l'enrichissement
await triggerN8nWebhook('enrich-product', { productId });
// Retourner immédiatement
return NextResponse.json({ status: 'processing' });
```

**Impact** : **-30-60s d'attente** par enrichissement = **Meilleure UX**

---

#### 2.3 Génération de Designs IA

**Avant** : `/api/designs/generate` → Appelle Higgsfield (30-60s) → Bloque la requête

**Avec n8n** :
- Workflow n8n déclenché par webhook
- Génération dans n8n
- Mise à jour DB quand terminé
- Notification utilisateur

**Bénéfices** :
- ✅ **Réponse immédiate** à l'utilisateur
- ✅ **-100% charge génération sur Vercel**
- ✅ Pas de timeout
- ✅ Retry automatique

**Workflow n8n** :
```
Webhook Trigger (depuis votre app)
  ↓
HTTP Request → POST Higgsfield API (générer design)
  ↓
Wait Node (attendre 30-60s)
  ↓
HTTP Request → GET Higgsfield API (récupérer résultat)
  ↓
HTTP Request → Upload vers Vercel Blob
  ↓
HTTP Request → PUT /api/designs/[id] (mettre à jour status)
  ↓
Email/Slack → Notifier utilisateur
```

**Dans votre app** :
```typescript
// Créer le design en DB
const design = await prisma.design.create({ status: 'processing' });

// Déclencher n8n (non-bloquant)
await triggerN8nWebhook('generate-design', { designId });

// Retourner immédiatement
return NextResponse.json({ designId, status: 'processing' });
```

**Impact** : **-30-60s d'attente** = **UX instantanée**

---

### Stratégie 3 : Réduire les Redirections

#### 3.1 Vérification d'Auth Centralisée

**Avant** : Chaque page vérifie l'auth → Redirection si pas connecté

**Avec n8n** :
- Workflow n8n qui vérifie l'auth périodiquement
- Mise à jour cache Redis/DB
- Pages lisent le cache (pas de vérification à chaque fois)

**Bénéfices** :
- ✅ **-80% vérifications auth**
- ✅ Pages chargent plus vite
- ✅ Moins de redirections

**Workflow n8n** :
```
Schedule Trigger (toutes les 5 minutes)
  ↓
HTTP Request → GET /api/auth/verify-all-sessions
  ↓
Update Cache (Redis/DB)
```

**Impact** : **-80% requêtes auth** = **Navigation plus fluide**

---

#### 3.2 Pré-chargement des Données

**Avant** : Dashboard charge tout à chaque visite (brands, designs, stats)

**Avec n8n** :
- Workflow n8n qui pré-calcule les stats
- Sauvegarde dans DB/cache
- Dashboard lit les stats pré-calculées

**Bénéfices** :
- ✅ **-90% requêtes DB sur dashboard**
- ✅ Chargement instantané
- ✅ Moins de redirections (pas d'attente)

**Workflow n8n** :
```
Schedule Trigger (toutes les heures)
  ↓
HTTP Request → GET /api/dashboard/stats (calculer stats)
  ↓
HTTP Request → PUT /api/dashboard/cache-stats (sauvegarder)
```

**Impact** : **-90% requêtes DB** = **Dashboard 10x plus rapide**

---

### Stratégie 4 : Optimiser les Requêtes DB

#### 4.1 Cache des Données Fréquentes

**Avant** : Chaque page charge les données depuis DB

**Avec n8n** :
- Workflow n8n qui met à jour le cache périodiquement
- Pages lisent depuis le cache
- Invalidation intelligente

**Bénéfices** :
- ✅ **-70% requêtes DB**
- ✅ Pages plus rapides
- ✅ Moins de charge sur Supabase

**Workflow n8n** :
```
Schedule Trigger (toutes les 15 minutes)
  ↓
HTTP Request → GET /api/trends/confirmed (récupérer trends)
  ↓
HTTP Request → PUT /api/cache/trends (mettre en cache)
```

**Impact** : **-70% requêtes DB** = **App plus légère**

---

#### 4.2 Agrégation des Données

**Avant** : Dashboard fait plusieurs requêtes (brands, designs, stats)

**Avec n8n** :
- Workflow n8n qui agrège les données
- Sauvegarde dans une table dédiée
- Dashboard lit une seule requête

**Bénéfices** :
- ✅ **-80% requêtes DB**
- ✅ Chargement plus rapide
- ✅ Moins de charge sur Supabase

**Workflow n8n** :
```
Schedule Trigger (toutes les heures)
  ↓
HTTP Request → GET /api/dashboard/aggregate-data
  ↓
HTTP Request → POST /api/dashboard/save-aggregated (sauvegarder)
```

**Impact** : **-80% requêtes DB** = **Performance améliorée**

---

## 📊 Impact Global Estimé

### Avant n8n
- **CRON jobs** : 4 jobs sur Vercel (charge élevée)
- **Opérations lourdes** : Sur Vercel (timeouts fréquents)
- **Requêtes DB** : ~100-200/min (charge élevée)
- **Redirections** : Multiples vérifications auth
- **Temps de réponse** : 500-2000ms (lent)

### Après n8n
- **CRON jobs** : 0 sur Vercel (**-100%**)
- **Opérations lourdes** : Sur n8n (**-100%**)
- **Requêtes DB** : ~20-40/min (**-80%**)
- **Redirections** : Réduites grâce au cache (**-70%**)
- **Temps de réponse** : 100-300ms (**-70%**)

---

## 🎯 Plan d'Action Recommandé

### Phase 1 : CRON Jobs (Semaine 1)
**Priorité** : 🔴 **HAUTE**

1. **Migrer `scan-trends`** vers n8n
   - Créer workflow avec Schedule Trigger
   - Appeler votre endpoint API
   - Gérer erreurs + notifications

2. **Migrer `refresh-zalando-trends`** vers n8n
   - Même principe

3. **Migrer `refresh-all-trends`** vers n8n
   - Même principe

4. **Migrer `track-inventory`** vers n8n
   - Même principe

**Résultat** : **-4 CRON jobs** sur Vercel = **-80% charge CRON**

---

### Phase 2 : Opérations Lourdes (Semaine 2)
**Priorité** : 🟡 **MOYENNE**

1. **Externaliser enrichissement produits**
   - Workflow n8n avec webhook
   - Traitement asynchrone
   - Notification quand terminé

2. **Externaliser génération designs**
   - Workflow n8n avec webhook
   - Réponse immédiate à l'utilisateur
   - Traitement en arrière-plan

**Résultat** : **-30-60s d'attente** = **UX instantanée**

---

### Phase 3 : Optimisation DB (Semaine 3)
**Priorité** : 🟢 **BASSE**

1. **Cache des données fréquentes**
   - Workflow n8n pour pré-calculer
   - Pages lisent depuis cache

2. **Agrégation des données**
   - Workflow n8n pour agréger
   - Dashboard lit une seule requête

**Résultat** : **-70-80% requêtes DB** = **App plus légère**

---

## 💰 Coût Estimé

### n8n Cloud
- **Plan Gratuit** : 250 exécutions/mois
- **Plan Starter** : 20€/mois (5000 exécutions)
- **Plan Pro** : 50€/mois (20000 exécutions)

**Estimation pour votre app** :
- 4 CRON jobs × 30 jours = 120 exécutions/mois
- Enrichissements : ~100/mois = 100 exécutions
- Générations designs : ~50/mois = 50 exécutions
- **Total** : ~270 exécutions/mois

**Recommandation** : **Plan Gratuit** suffit pour commencer (250 exécutions)

---

## ✅ Bénéfices Finaux

### Performance
- ✅ **-80% charge CRON** sur Vercel
- ✅ **-70% requêtes DB**
- ✅ **-70% temps de réponse**
- ✅ **-90% redirections**

### Expérience Utilisateur
- ✅ **Réponses instantanées** (pas d'attente 30-60s)
- ✅ **Navigation plus fluide** (moins de redirections)
- ✅ **Pages plus rapides** (cache + agrégation)

### Coûts
- ✅ **-80% coûts Vercel** (moins de ressources)
- ✅ **-70% coûts Supabase** (moins de requêtes)
- ✅ **n8n gratuit** pour commencer (250 exécutions/mois)

---

## 🚀 Prochaines Étapes

1. **Créer compte n8n Cloud** (5 min)
2. **Migrer 1 CRON job** pour tester (30 min)
3. **Vérifier les résultats** (performance, logs)
4. **Migrer les autres CRON jobs** progressivement
5. **Externaliser les opérations lourdes** une par une

---

**Avec n8n, votre app sera beaucoup plus légère et performante !** 🎉
