# 🚀 Démarrage Rapide Serveur n8n OUTFITY

Votre serveur d'automatisation n8n est prêt ! Voici comment le lancer en 2 minutes.

## 1. Installation
Ouvrez un terminal dans le dossier `n8n` :
```powershell
cd n8n
npm install
```

## 2. Configuration
Copiez le fichier d'exemple pour créer votre configuration locale :
```powershell
copy .env .env.local
```
*(Vous pourrez éditer `.env.local` plus tard avec vos vraies clés API)*

## 3. Démarrage
Lancez le serveur :
```powershell
npm start
```

## 4. Accès & Import
1. Ouvrez **http://localhost:5678** dans votre navigateur
2. Créez votre compte admin (email/password)
3. Dans le menu à gauche, allez sur **Workflows**
4. Cliquez sur **Import from File** (en haut à droite)
5. Sélectionnez tous les fichiers JSON dans le dossier `n8n/workflows/`
6. Activez les workflows (switch "Active" en haut)

## 5. Intégration
Pour que Next.js puisse appeler n8n :
1. Ajoutez `N8N_WEBHOOK_URL=http://localhost:5678/webhook` dans votre `.env` Next.js à la racine du projet
2. Redémarrez votre serveur Next.js (`npm run dev`)

---

## 📋 Workflows Disponibles
- **Scraping Tendances** (Daily 2am)
- **Emails Onboarding** (Welcome J0-J7)
- **Monitoring Santé** (Check APIs 15min)
- **Notifications Multi-canal** (Email + In-App)
- **Sync Stripe** (Paiements -> BDD)
- **Rapport Hebdo** (Lundi 9am -> Email)

Besoin d'aide ? Voir `docs/recommandations-n8n-integration.md`
