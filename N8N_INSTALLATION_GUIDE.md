# 🚀 Guide d'Installation du Workflow n8n OUTFITY

## Prérequis
1. Une instance n8n installée (cloud.n8n.io ou self-hosted)
2. Votre application OUTFITY déployée avec une URL publique
3. La clé secrète `N8N_WEBHOOK_SECRET` définie dans votre `.env`

---

## 📥 Étape 1 : Importer le Workflow

1. **Ouvrez votre interface n8n** (https://cloud.n8n.io ou votre instance)
2. Cliquez sur **"+"** (Nouveau workflow) en haut à droite
3. Cliquez sur les **3 points** (menu) → **"Import from File"**
4. Sélectionnez le fichier `n8n-workflow-outfity-scraper.json`
5. Le workflow complet apparaît avec tous les nœuds connectés

---

## ⚙️ Étape 2 : Configuration des Variables d'Environnement

### Dans n8n (Settings → Variables)
Ajoutez cette variable :
- **Nom** : `OUTFITY_WEBHOOK_SECRET`
- **Valeur** : La même valeur que dans votre `.env` (ex: `bmad_n8n_secret_2024_ultra_secure`)

### Dans votre .env OUTFITY
Vérifiez que cette ligne existe :
```env
N8N_WEBHOOK_SECRET=bmad_n8n_secret_2024_ultra_secure
```

---

## 🔧 Étape 3 : Personnaliser le Nœud "Envoyer vers OUTFITY"

1. **Double-cliquez** sur le nœud **"Envoyer vers OUTFITY"**
2. Remplacez `https://votre-domaine.com` par votre vraie URL :
   - Si vous êtes en local : `http://localhost:3000`
   - Si vous êtes en production : `https://outfity.com` (votre domaine)
3. L'URL finale doit être : `https://votre-domaine.com/api/webhooks/n8n-trend-save`
4. Cliquez sur **"Save"**

---

## 🎯 Étape 4 : Adapter les Scrapers (IMPORTANT)

Les nœuds **"Parser Produits Zalando"** et **"Parser Produits ASOS"** contiennent du code JavaScript qui extrait les données du HTML.

⚠️ **Ces parsers sont des exemples génériques**. Vous devrez les adapter selon la structure HTML réelle des sites :

### Pour tester et ajuster :
1. **Désactivez** temporairement le nœud "Planification Hebdomadaire"
2. Ajoutez un nœud **"Manual Trigger"** au début
3. **Exécutez manuellement** le workflow
4. **Inspectez** les données retournées par chaque nœud
5. **Ajustez** les regex et sélecteurs dans les nœuds "Parser" selon les résultats

### Alternative recommandée (plus robuste) :
Remplacez les nœuds HTTP Request + Code par :
- **Nœud Puppeteer** (si disponible dans votre n8n)
- Ou utilisez vos scripts TypeScript existants (`lib/hybrid-radar-scraper.ts`) en les appelant via un nœud **Execute Command**

---

## ⏰ Étape 5 : Planification Automatique

Le workflow est configuré pour s'exécuter **chaque lundi à 2h du matin**.

Pour modifier la fréquence :
1. Double-cliquez sur **"Planification Hebdomadaire"**
2. Modifiez l'expression cron :
   - `0 2 * * 1` = Lundi 2h
   - `0 2 * * *` = Tous les jours à 2h
   - `0 */6 * * *` = Toutes les 6 heures
3. Cliquez sur **"Save"**

---

## ✅ Étape 6 : Test Manuel

1. Cliquez sur **"Execute Workflow"** en bas à droite
2. Observez l'exécution nœud par nœud
3. Vérifiez que le nœud **"Envoyer vers OUTFITY"** retourne :
   ```json
   {
     "success": true,
     "saved": 42,
     "skipped": 0
   }
   ```
4. Ouvrez votre application OUTFITY → `/trends`
5. Les nouveaux produits doivent apparaître !

---

## 🔔 Étape 7 : Notifications (Optionnel)

Pour recevoir des notifications de succès/erreur :

### Option A : Email
1. Remplacez les nœuds **"Notification Succès/Erreur"** par des nœuds **"Send Email"**
2. Configurez votre SMTP

### Option B : Slack
1. Remplacez par des nœuds **"Slack"**
2. Connectez votre workspace Slack

### Option C : Discord
1. Remplacez par des nœuds **"Discord"**
2. Utilisez un webhook Discord

---

## 🐛 Dépannage

### Erreur 401 (Non autorisé)
→ Vérifiez que `OUTFITY_WEBHOOK_SECRET` dans n8n = `N8N_WEBHOOK_SECRET` dans `.env`

### Erreur 500 (Serveur)
→ Consultez les logs de votre application Next.js : `npm run dev`

### Aucun produit retourné
→ Les parsers HTML doivent être adaptés. Inspectez le HTML des sites sources.

### Produits dupliqués
→ Le système gère automatiquement les doublons via `sourceUrl`

---

## 📊 Monitoring

Pour suivre les exécutions :
1. Dans n8n : **Executions** (menu de gauche)
2. Vous verrez l'historique de chaque exécution
3. Cliquez sur une exécution pour voir les détails

---

## 🚀 Activation Finale

1. **Activez** le workflow en cliquant sur le toggle en haut à droite
2. Le workflow s'exécutera automatiquement selon la planification
3. Vos tendances seront mises à jour chaque semaine sans intervention !

---

## 💡 Améliorations Futures

- Ajouter d'autres sources (Zara, H&M, etc.)
- Scraper plusieurs segments (femme, enfant)
- Scraper plusieurs zones géographiques (US, UK, DE)
- Ajouter un nœud de déduplication avancé
- Intégrer un système de retry en cas d'échec

---

**Besoin d'aide ?** Consultez la documentation n8n : https://docs.n8n.io
