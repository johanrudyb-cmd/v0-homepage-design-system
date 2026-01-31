# Configuration du Scan Quotidien Automatique

*Document créé via BMAD-Method - Dev*

## Date : 2025-01-26

---

## ✅ Système Déjà Configuré

Le système effectue **automatiquement un scan quotidien** de toutes les marques pour alimenter l'algorithme de prédiction.

---

## ⏰ Horaires de Scan

### Scan Quotidien des Tendances

**Fichier** : `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/scan-trends",
      "schedule": "0 6 * * *"
    }
  ]
}
```

**Horaire** : Tous les jours à **6h00 UTC** (7h00 heure française en hiver, 8h00 en été)

**Ce qui se passe** :
1. ✅ Scrape toutes les marques actives (`isActive = true`)
2. ✅ Extrait les produits "New In" et "Best Sellers"
3. ✅ Normalise les données (type, coupe, matériau, couleur)
4. ✅ Détecte les tendances (3+ marques = confirmé)
5. ✅ Calcule les scores de prédiction
6. ✅ Met à jour la base de données

---

## 🔧 Modifier la Fréquence

### Option 1 : Plusieurs Scans par Jour

Pour scanner **2 fois par jour** (matin et soir) :

```json
{
  "crons": [
    {
      "path": "/api/cron/scan-trends",
      "schedule": "0 6,18 * * *"
    }
  ]
}
```

**Horaires** : 6h00 et 18h00 UTC

### Option 2 : Toutes les 12 Heures

```json
{
  "crons": [
    {
      "path": "/api/cron/scan-trends",
      "schedule": "0 */12 * * *"
    }
  ]
}
```

**Horaires** : Toutes les 12 heures (0h00, 12h00 UTC)

### Option 3 : Toutes les 6 Heures

```json
{
  "crons": [
    {
      "path": "/api/cron/scan-trends",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Horaires** : Toutes les 6 heures (0h00, 6h00, 12h00, 18h00 UTC)

---

## 📅 Format de Schedule (Cron)

Le format utilisé est : `minute heure jour mois jour-semaine`

**Exemples** :
- `0 6 * * *` : Tous les jours à 6h00
- `0 6,18 * * *` : Tous les jours à 6h00 et 18h00
- `0 */6 * * *` : Toutes les 6 heures
- `0 0 * * *` : Tous les jours à minuit
- `0 0 * * 1` : Tous les lundis à minuit

---

## 🚀 En Local (Développement)

Pour tester le scan automatique en local, vous pouvez utiliser :

### Option 1 : Script Node.js

Créer `scripts/daily-scan.js` :

```javascript
const { exec } = require('child_process');

// Exécuter le scan
exec('curl -X GET http://localhost:3000/api/cron/scan-trends -H "Authorization: Bearer YOUR_CRON_SECRET"', (error, stdout, stderr) => {
  if (error) {
    console.error(`Erreur: ${error}`);
    return;
  }
  console.log(stdout);
});
```

### Option 2 : Task Scheduler Windows

1. Ouvrir **Planificateur de tâches**
2. Créer une tâche
3. Définir le déclencheur : **Quotidien à 6h00**
4. Action : Exécuter un script PowerShell qui appelle l'API

### Option 3 : Cron Linux/Mac

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne (tous les jours à 6h00)
0 6 * * * curl -X GET http://localhost:3000/api/cron/scan-trends -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🔐 Sécurité

Le CRON job est protégé par un secret :

**Variable d'environnement** : `CRON_SECRET`

**Dans `.env`** :
```env
CRON_SECRET=your-super-secret-key-here
```

**Vercel** : Configurer dans les variables d'environnement du projet

---

## 📊 Monitoring

### Vérifier les Scans

1. **Logs Vercel** : Voir les logs du CRON job
2. **Base de données** : Vérifier `ScrapableBrand.lastScrapedAt`
3. **Tendances** : Voir les nouvelles tendances dans `/trends`

### Statistiques

Le système enregistre :
- `lastScrapedAt` : Dernière date de scan
- `lastScrapeSuccess` : Succès ou échec
- `totalScraped` : Nombre total de produits scrapés

---

## 🎯 Résultat

Après chaque scan quotidien :

1. ✅ **Nouvelles tendances détectées** : Apparaissent dans `/trends`
2. ✅ **Scores mis à jour** : Prédictions recalculées
3. ✅ **Historique enrichi** : Plus de données = meilleures prédictions
4. ✅ **Tendances émergentes** : Détectées plus rapidement

---

## ⚠️ Points d'Attention

### 1. Rate Limiting

Les sites peuvent bloquer si trop de requêtes. Le système inclut :
- Délai de 3 secondes entre chaque marque
- User-Agent réaliste
- Gestion des erreurs

### 2. Temps d'Exécution

Un scan complet peut prendre **5-10 minutes** selon le nombre de marques.

### 3. Coûts Vercel

Les CRON jobs consomment des ressources. Surveiller l'utilisation.

---

## 🔄 Workflow Complet

```
1. CRON déclenché (6h00 UTC)
   ↓
2. Appelle /api/cron/scan-trends
   ↓
3. Charge toutes les marques actives depuis ScrapableBrand
   ↓
4. Scrape chaque marque (New In + Best Sellers)
   ↓
5. Normalise les produits
   ↓
6. Détecte les tendances (3+ marques)
   ↓
7. Calcule les scores de prédiction
   ↓
8. Sauvegarde dans TrendSignal
   ↓
9. Met à jour les statistiques (lastScrapedAt, totalScraped)
   ↓
10. Prédictions disponibles dans /trends/predictions
```

---

**Créé via BMAD-Method** 🎯
