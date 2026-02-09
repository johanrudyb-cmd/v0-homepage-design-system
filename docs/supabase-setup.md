# Configuration Supabase - Guide Complet

## 🚀 Étape 1 : Créer un compte Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur **"Start your project"** ou **"Sign in"**
3. Connectez-vous avec GitHub (recommandé) ou créez un compte email

## 🎯 Étape 2 : Créer un nouveau projet

1. Cliquez sur **"New Project"**
2. Remplissez les informations :
   - **Name** : `outfity` (ou votre nom)
   - **Database Password** : Choisissez un mot de passe fort (⚠️ **SAVEZ-LE !**)
   - **Region** : Choisissez la région la plus proche (ex: `West Europe` pour la France)
   - **Pricing Plan** : Sélectionnez **Free** (gratuit)

3. Cliquez sur **"Create new project"**
4. ⏳ Attendez 2-3 minutes que le projet soit créé

## 🔑 Étape 3 : Récupérer la connection string

1. Dans votre projet Supabase, allez dans **Settings** (⚙️ en bas à gauche)
2. Cliquez sur **Database** dans le menu de gauche
3. Faites défiler jusqu'à **"Connection string"**
4. Sélectionnez **"URI"** dans le dropdown
5. Copiez la connection string (elle ressemble à) :
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

## 📝 Étape 4 : Mettre à jour votre .env

1. Ouvrez votre fichier `.env`
2. Remplacez `DATABASE_URL` par la connection string Supabase :
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
   ```
   ⚠️ **Remplacez `[YOUR-PASSWORD]` par le mot de passe que vous avez créé à l'étape 2**

3. Ajoutez aussi (optionnel, pour Prisma Studio) :
   ```env
   DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
   ```

## ✅ Étape 5 : Créer les tables

Une fois la connection string configurée, exécutez :

```bash
npm run db:push
```

Vous devriez voir :
```
✔ Your database is now in sync with your Prisma schema.
```

## 🎉 Vérification

1. **Vérifier dans Supabase** :
   - Allez dans **Table Editor** dans le menu de gauche
   - Vous devriez voir toutes vos tables : `User`, `Account`, `Session`, `Brand`, etc.

2. **Tester avec Prisma Studio** :
   ```bash
   npm run db:studio
   ```
   Cela ouvrira une interface graphique pour voir vos données.

## 🔒 Sécurité

⚠️ **Important** :
- Ne commitez **JAMAIS** votre `.env` dans Git
- Le fichier `.env` est déjà dans `.gitignore`
- Ne partagez jamais votre connection string publiquement

## 📊 Limites du plan gratuit Supabase

- **500 MB** de base de données
- **2 GB** de bande passante
- **50,000** requêtes par mois
- Parfait pour le développement et les petits projets !

## 🐛 Dépannage

### Erreur : "password authentication failed"
- Vérifiez que vous avez remplacé `[YOUR-PASSWORD]` par votre vrai mot de passe
- Le mot de passe peut contenir des caractères spéciaux, assurez-vous de les encoder correctement dans l'URL

### Erreur : "connection timeout"
- Vérifiez votre connexion internet
- Vérifiez que le projet Supabase est bien créé et actif

### Erreur : "database does not exist"
- Supabase crée automatiquement la base `postgres`, vous n'avez rien à faire
- Utilisez simplement `postgres` comme nom de base dans l'URL

## 🚀 Prochaines étapes

Une fois les tables créées :
1. ✅ Vous pouvez tester l'authentification
2. ✅ Créer des utilisateurs via `/auth/signup`
3. ✅ Commencer à implémenter les modules
