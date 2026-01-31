# Configuration du Tracking Dynamique - Brand Spy

## Vue d'ensemble

Le système de tracking dynamique permet de suivre les ventes et stocks d'une boutique Shopify en temps réel en analysant les changements de stocks via le fichier `products.json`.

## Architecture

### Modèles de données

1. **FashionBrand** : Marque trackée
   - `id`, `userId`, `name`, `url`
   - `isTrackingActive` : Active/désactive le tracking
   - `lastSales24h` : Nombre de ventes sur 24h
   - `lastRevenue24h` : Revenu estimé sur 24h

2. **StoreSnapshot** : Instantané des stocks
   - `id`, `brandId`, `timestamp`
   - `inventoryData` : État des stocks (JSON)
   - `salesDiff` : Différence de ventes depuis le dernier snapshot
   - `revenueDiff` : Différence de revenu depuis le dernier snapshot

### API Routes

1. **`/api/spy/track`**
   - `POST` : Activer le tracking d'une marque
   - `GET` : Récupérer les données de tracking
   - `DELETE` : Désactiver le tracking

2. **`/api/cron/track-inventory`**
   - `GET` : Route CRON pour le tracking automatique
   - Sécurisée avec `CRON_SECRET`

## Configuration

### 1. Variables d'environnement

Ajoutez dans votre `.env.local` :

```env
CRON_SECRET=votre-secret-securise-ici
```

### 2. Configuration du CRON

#### Option A : Vercel Cron Jobs (Recommandé)

Créez `vercel.json` à la racine :

```json
{
  "crons": [
    {
      "path": "/api/cron/track-inventory",
      "schedule": "0 * * * *"
    }
  ]
}
```

Cela exécutera le tracking toutes les heures.

#### Option B : Service externe (Cron-job.org, EasyCron, etc.)

Configurez une tâche CRON qui appelle :
```
GET https://votre-domaine.com/api/cron/track-inventory
Authorization: Bearer votre-secret-securise-ici
```

Fréquence recommandée : **Toutes les heures** (`0 * * * *`)

## Fonctionnement

### 1. Activation du tracking

L'utilisateur active le tracking depuis l'interface Brand Spy. Cela crée une entrée `FashionBrand` avec `isTrackingActive: true`.

### 2. Exécution du CRON

Le CRON appelle `/api/cron/track-inventory` qui :
1. Récupère toutes les marques avec `isTrackingActive: true`
2. Pour chaque marque :
   - Scrape `{url}/products.json`
   - Compare avec le dernier snapshot
   - Calcule les différences (ventes, revenus)
   - Crée un nouveau snapshot
   - Met à jour les métriques 24h

### 3. Affichage dans l'interface

Le composant `LiveTrackingIndicator` :
- Affiche les ventes et revenus 24h
- Affiche un graphique des 7 derniers jours
- Se rafraîchit automatiquement toutes les 30 secondes

## Calcul des ventes

Les ventes sont calculées en comparant les stocks :
```
Ventes = Stock(T-1) - Stock(T)
```

Si `Stock(T-1) > Stock(T)`, cela signifie qu'il y a eu des ventes.

Le revenu est calculé :
```
Revenu = Ventes × Prix du produit
```

## Limitations

1. **Précision** : Les données dépendent de la disponibilité de `products.json`
2. **Fréquence** : Le tracking est limité par la fréquence du CRON (recommandé : 1h)
3. **Stocks cachés** : Les produits avec gestion de stock désactivée ne sont pas trackés

## Sécurité

- Le CRON est sécurisé avec `CRON_SECRET`
- Seuls les utilisateurs authentifiés peuvent activer/désactiver le tracking
- Les données sont isolées par utilisateur (`userId`)

## Dépannage

### Le tracking ne fonctionne pas

1. Vérifiez que `CRON_SECRET` est défini dans `.env.local`
2. Vérifiez les logs du serveur pour les erreurs
3. Vérifiez que `products.json` est accessible sur la boutique Shopify

### Les données ne se mettent pas à jour

1. Vérifiez que le CRON est bien configuré et s'exécute
2. Vérifiez que `isTrackingActive: true` dans la base de données
3. Vérifiez les logs de l'API `/api/cron/track-inventory`
