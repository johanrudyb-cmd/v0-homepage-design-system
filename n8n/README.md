# 🤖 Serveur n8n OUTFITY

Serveur d'automatisation n8n dédié pour OUTFITY. Permet d'exécuter les workflows de scraping, emails, IA, et synchronisation.

## 📁 Structure

- `workflows/` : Contient les 6 workflows JSON prêts à importer
  - `01-scraping-tendances.json` : Scraping quotidien à 2h du matin
  - `02-email-onboarding.json` : Séquence d'email de bienvenue (J0-J7)
  - `03-monitoring-sante.json` : Vérification santé API toutes les 15 min
  - `04-notifications-multicanal.json` : Envoi notifs + emails dynamiques
  - `05-sync-stripe.json` : Sync paiements Stripe vers BDD
  - `06-rapport-hebdomadaire.json` : Rapport stats chaque lundi matin
- `.env` : Configuration du serveur n8n (à copier en `.env.local` si besoin)
- `package.json` : Scripts de lancement

## 🚀 Installation & Démarrage

### Pré-requis
- Node.js installé (v16+)

### 1. Installation
```bash
cd n8n
npm install
```

### 2. Configuration Env
Copiez `.env` et ajustez les valeurs (clés API, secret CRON, SMTP, etc.) :
```bash
cp .env .env.local
# Éditez .env.local avec vos vraies clés
```

### 3. Démarrage
```bash
npm start
```
Le serveur sera accessible sur **http://localhost:5678**.

Pour exposer le serveur (pour recevoir les webhooks de Stripe/Next.js en dev) :
```bash
npm run start:tunnel
```
Cela créera une URL publique temporaire (ex: `https://votre-tunnel.hooks.n8n.cloud`). 
**Notez cette URL** et mettez-la à jour dans votre `.env` Next.js : `N8N_WEBHOOK_URL`.

## 📥 Importer les Workflows

Une fois n8n lancé et votre compte admin créé :
1. Allez dans le menu **Workflows**
2. Cliquez sur **Import from File**
3. Sélectionnez les fichiers JSON dans le dossier `n8n/workflows/`
4. Activez les workflows (switch "Active" en haut à droite)

## 🔗 Intégration Next.js

L'application Next.js communique avec ce serveur via :
- **Webhooks** : `lib/n8n.ts` contient les fonctions `triggerOnboarding`, `triggerNotification`, etc.
- **API Endpoints** : `app/api/n8n/` reçoit les logs et syncs de n8n.
- **CRON Secret** : Assurez-vous que `OUTFITY_CRON_SECRET` dans n8n correspond à `CRON_SECRET` dans `.env` Next.js.
