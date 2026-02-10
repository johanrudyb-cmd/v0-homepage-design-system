# 🚀 Installation n8n sur Railway (Guide Rapide)

## Étapes Rapides

### 1. Créer un compte Railway
- Aller sur [railway.app](https://railway.app)
- Se connecter avec GitHub/Google

### 2. Créer un nouveau projet
- Cliquer sur **"New Project"**
- Sélectionner **"Deploy from Docker Hub"**

### 3. Configurer n8n
- **Docker Image** : `n8nio/n8n:latest`
- **Port** : `5678` (détecté automatiquement)

### 4. Ajouter les Variables d'Environnement

Dans Railway → Variables, ajouter :

```env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=votre_mot_de_passe_fort_ici
WEBHOOK_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

**Note** : `${{RAILWAY_PUBLIC_DOMAIN}}` sera automatiquement remplacé par Railway.

### 5. Déployer
- Cliquer sur **"Deploy"**
- Attendre 2-3 minutes
- Railway génère une URL automatique (ex: `n8n-production.up.railway.app`)

### 6. Accéder à n8n
- Ouvrir l'URL générée
- Se connecter avec :
  - Username : `admin`
  - Password : Le mot de passe configuré

### 7. Créer une API Key
- Dans n8n → **Settings** → **API**
- Cliquer sur **"Create API Key"**
- **Noter la clé**

### 8. Configurer dans votre App

Dans Vercel, ajouter :

```env
N8N_WEBHOOK_URL=https://votre-instance.railway.app/webhook
N8N_API_URL=https://votre-instance.railway.app
N8N_API_KEY=votre_api_key_ici
```

**✅ n8n est maintenant installé et prêt à l'emploi !**

---

## 🎯 Prochaines Étapes

1. **Créer votre premier workflow** dans n8n
2. **Migrer un CRON job** (voir `docs/ALLEGEMENT-APP-N8N.md`)
3. **Tester** avec `triggerN8nWebhook()` depuis votre app
