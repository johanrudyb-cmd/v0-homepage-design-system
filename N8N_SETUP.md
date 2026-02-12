# Configuration n8n pour le Webhook OUTFITY

Ce guide explique comment configurer n8n pour envoyer des tendances vers votre application.

## 1. Sécurité
Dans votre fichier `.env` à la racine de l'application, vérifiez ou ajoutez :
```env
N8N_WEBHOOK_SECRET=votre_secret_ultra_confidentiel
```

## 2. Structure du Noeud n8n (HTTP Request)

- **Method** : `POST`
- **URL** : `https://votre-domaine.com/api/webhooks/n8n-trend-save`
- **Authentication**: `None` (on utilise un Header personnalisé)
- **Headers** :
  - `x-api-key` : `votre_secret_ultra_confidentiel`
  - `Content-Type` : `application/json`

## 3. Format du JSON (Body)

Envoyez un tableau d'objets `items` :

```json
{
  "items": [
    {
      "name": "Nike Sportswear - Veste sans manches",
      "price": 89.99,
      "imageUrl": "https://cdn.brandfetch.io/...",
      "sourceUrl": "https://www.exemple.com/produit/123",
      "sourceBrand": "Zalando", 
      "marketZone": "FR",
      "segment": "homme",
      "trendGrowthPercent": 24,
      "trendLabel": "En forte hausse",
      "productBrand": "Nike",
      "composition": "100% Polyester",
      "color": "Noir"
    }
  ]
}
```

## 4. Règles d'anonymisation (Automatique)
Le système s'occupe de tout :
- Si `productBrand` est "Zalando", "ASOS" ou "Zara", il sera effacé du champ public.
- Le système tentera d'extraire la vraie marque du titre si `productBrand` est vide.
- L'analyse IA se déclenchera dès qu'un utilisateur consultera le produit.
