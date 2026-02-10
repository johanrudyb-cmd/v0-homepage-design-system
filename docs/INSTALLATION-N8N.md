# 🚀 Installation n8n

*Guide complet pour installer et configurer n8n*

---

## 🎯 Options d'Installation

### Option 1 : Railway (Recommandé - Le Plus Simple) ⭐

**Avantages** :
- ✅ Setup en 5 minutes (1-click deploy)
- ✅ HTTPS automatique
- ✅ Scaling automatique
- ✅ Plan gratuit : 500h/mois
- ✅ Pas de maintenance serveur

**Prix** : Gratuit jusqu'à 500h/mois, puis ~5€/mois

---

### Option 2 : Render (Alternative Simple)

**Avantages** :
- ✅ Setup simple
- ✅ HTTPS automatique
- ✅ Plan gratuit : 750h/mois

**Prix** : Gratuit jusqu'à 750h/mois

---

### Option 3 : Docker Local (Pour Développement)

**Avantages** :
- ✅ Contrôle total
- ✅ Gratuit
- ✅ Parfait pour tester

**Inconvénients** :
- ⚠️ Nécessite Docker installé
- ⚠️ Pas accessible depuis internet (sauf tunnel)

---

## 🚀 Option 1 : Installation sur Railway (Recommandé)

### Étape 1 : Créer un compte Railway

1. Aller sur [railway.app](https://railway.app)
2. Créer un compte (GitHub/Google)
3. Cliquer sur **"New Project"**

### Étape 2 : Déployer n8n

1. Dans Railway, cliquer sur **"New"** → **"Deploy from GitHub repo"**
2. **OU** cliquer sur **"New"** → **"Deploy from Docker Hub"**
3. Entrer : `n8nio/n8n`
4. Railway va automatiquement :
   - Détecter que c'est n8n
   - Configurer les variables d'environnement
   - Déployer avec HTTPS

### Étape 3 : Configurer les Variables d'Environnement

Dans Railway → Settings → Variables, ajouter :

```env
# Base URL (important pour les webhooks)
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=votre_mot_de_passe_fort_ici

# Optionnel : Email pour notifications
N8N_EMAIL_MODE=smtp
N8N_SMTP_HOST=smtp.gmail.com
N8N_SMTP_PORT=587
N8N_SMTP_USER=votre_email@gmail.com
N8N_SMTP_PASS=votre_mot_de_passe_app

# Optionnel : Base de données externe (recommandé pour production)
# Par défaut, n8n utilise SQLite (suffisant pour commencer)
```

### Étape 4 : Récupérer l'URL

1. Railway va générer une URL automatique (ex: `n8n-production.up.railway.app`)
2. **Noter cette URL** : vous en aurez besoin pour configurer votre app

### Étape 5 : Accéder à n8n

1. Ouvrir l'URL générée par Railway
2. Se connecter avec :
   - Username : `admin` (ou celui configuré)
   - Password : Le mot de passe configuré

**✅ n8n est maintenant installé et accessible !**

---

## 🐳 Option 2 : Installation Docker Local

### Étape 1 : Créer `docker-compose.yml`

Créer le fichier à la racine du projet :

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=changez_moi_en_production
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - n8n_network

volumes:
  n8n_data:

networks:
  n8n_network:
    driver: bridge
```

### Étape 2 : Démarrer n8n

```bash
docker-compose up -d
```

### Étape 3 : Accéder à n8n

1. Ouvrir [http://localhost:5678](http://localhost:5678)
2. Se connecter avec les identifiants configurés

**⚠️ Note** : Pour accéder depuis internet (pour les webhooks), utiliser un tunnel comme ngrok :
```bash
ngrok http 5678
```

---

## 🌐 Option 3 : Installation sur Render

### Étape 1 : Créer un compte Render

1. Aller sur [render.com](https://render.com)
2. Créer un compte (GitHub/Google)

### Étape 2 : Créer un nouveau Web Service

1. Cliquer sur **"New"** → **"Web Service"**
2. Connecter votre repo GitHub (ou créer un nouveau repo)
3. Configuration :
   - **Name** : `n8n`
   - **Environment** : `Docker`
   - **Docker Image** : `n8nio/n8n:latest`
   - **Plan** : Free (750h/mois)

### Étape 3 : Configurer les Variables

Dans Render → Environment, ajouter :

```env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=votre_mot_de_passe_fort_ici
```

### Étape 4 : Déployer

1. Cliquer sur **"Create Web Service"**
2. Render va déployer n8n automatiquement
3. Noter l'URL générée (ex: `n8n.onrender.com`)

---

## 🔧 Configuration Post-Installation

### 1. Créer une API Key

1. Dans n8n, aller dans **Settings** → **API**
2. Cliquer sur **"Create API Key"**
3. **Noter la clé** : vous en aurez besoin pour votre app

### 2. Configurer les Variables d'Environnement dans votre App

Dans Vercel (ou `.env` local), ajouter :

```env
# URL de votre instance n8n
N8N_WEBHOOK_URL=https://votre-instance-n8n.railway.app/webhook
# OU pour Render
N8N_WEBHOOK_URL=https://n8n.onrender.com/webhook

# API Key (optionnel, pour déclencher workflows via API)
N8N_API_URL=https://votre-instance-n8n.railway.app
N8N_API_KEY=votre_api_key_ici

# Secret pour authentifier les webhooks entrants (optionnel)
N8N_WEBHOOK_SECRET=votre_secret_aleatoire_ici
```

### 3. Tester la Connexion

Dans votre app, tester :

```typescript
import { triggerN8nWebhook } from '@/lib/n8n';

// Tester
await triggerN8nWebhook('test', { message: 'Hello n8n!' });
```

---

## 📋 Checklist d'Installation

- [ ] Choisir une option d'installation (Railway recommandé)
- [ ] Créer le compte (Railway/Render/Docker)
- [ ] Déployer n8n
- [ ] Configurer les variables d'environnement
- [ ] Accéder à l'interface n8n
- [ ] Créer une API Key
- [ ] Configurer les variables dans votre app
- [ ] Tester la connexion

---

## 🎯 Prochaines Étapes

Une fois n8n installé :

1. **Créer votre premier workflow** :
   - Aller dans n8n → **"Workflows"** → **"Add workflow"**
   - Créer un workflow de test avec Webhook Trigger

2. **Migrer un CRON job** :
   - Créer un workflow avec Schedule Trigger
   - Appeler votre endpoint API
   - Voir `docs/ALLEGEMENT-APP-N8N.md` pour les détails

3. **Configurer les webhooks** :
   - Créer des workflows avec Webhook Trigger
   - Utiliser `triggerN8nWebhook()` depuis votre app

---

## 🆘 Dépannage

### Problème : n8n ne démarre pas

**Solution** :
- Vérifier les variables d'environnement
- Vérifier les logs (Railway/Render → Logs)
- Vérifier que le port est correctement exposé

### Problème : Webhooks ne fonctionnent pas

**Solution** :
- Vérifier que `N8N_WEBHOOK_URL` est correct
- Vérifier que le workflow est activé dans n8n
- Vérifier les logs n8n pour voir les requêtes reçues

### Problème : Timeout sur les workflows longs

**Solution** :
- Railway/Render : Vérifier les limites de timeout
- Pour workflows très longs (> 5 min), considérer des sous-workflows

---

## 📚 Ressources

- **Documentation n8n** : https://docs.n8n.io/
- **Railway** : https://railway.app
- **Render** : https://render.com
- **Docker** : https://docs.docker.com/

---

**Une fois installé, vous pourrez commencer à créer vos workflows et alléger votre app !** 🚀
