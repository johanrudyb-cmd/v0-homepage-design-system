# Informations de Connexion Supabase

## ✅ Base de données configurée

Votre projet Supabase est configuré et toutes les tables ont été créées avec succès !

## 📋 Informations du Projet

- **URL du projet** : `https://qlefdfepdgdzjgatghjc.supabase.co`
- **Migration** : `initial_schema` appliquée avec succès

## 🔑 Clés API

### Clé Anon (Legacy)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZWZkZmVwZGdkempnYXRnaGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNzYxOTgsImV4cCI6MjA4NDk1MjE5OH0.L7FWStw5TaFzqPaLfFogjE0fJt00Wrg6q5tBq1H6-OM
```

### Clé Publishable (Moderne)
```
sb_publishable_M8HCfv0d6KjlB-KtLYGSfQ_aVbDqplq
```

## 🔗 Connection String

Pour obtenir votre connection string complète :

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Database**
4. Section **"Connection string"**
5. Sélectionnez **"URI"**
6. Copiez la connection string (format : `postgresql://postgres:[PASSWORD]@db.qlefdfepdgdzjgatghjc.supabase.co:5432/postgres`)

## 📝 Mise à jour du .env

Ajoutez dans votre `.env` :

```env
# Supabase Database
DATABASE_URL="postgresql://postgres:[VOTRE-MOT-DE-PASSE]@db.qlefdfepdgdzjgatghjc.supabase.co:5432/postgres"

# Supabase API (optionnel, pour utiliser Supabase Client)
NEXT_PUBLIC_SUPABASE_URL="https://qlefdfepdgdzjgatghjc.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZWZkZmVwZGdkempnYXRnaGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNzYxOTgsImV4cCI6MjA4NDk1MjE5OH0.L7FWStw5TaFzqPaLfFogjE0fJt00Wrg6q5tBq1H6-OM"
```

⚠️ **Remplacez `[VOTRE-MOT-DE-PASSE]` par le mot de passe que vous avez défini lors de la création du projet Supabase.**

## ✅ Vérification

Une fois la connection string ajoutée, testez la connexion :

```bash
npm run db:test
```

Vous devriez voir "✅ Connexion réussie !" et la liste de toutes les tables créées.

## 📊 Tables Créées

- ✅ `User` - Utilisateurs
- ✅ `Account` - Comptes OAuth
- ✅ `Session` - Sessions utilisateurs
- ✅ `VerificationToken` - Tokens de vérification
- ✅ `Brand` - Marques
- ✅ `LaunchMap` - Progression onboarding
- ✅ `Design` - Designs de vêtements
- ✅ `Factory` - Usines
- ✅ `Quote` - Devis
- ✅ `BrandSpyAnalysis` - Analyses de marques

## 🎉 Prochaines étapes

1. ✅ Ajoutez la connection string dans `.env`
2. ✅ Testez la connexion avec `npm run db:test`
3. ✅ Testez l'authentification avec `/auth/signup`
4. ✅ Commencez à implémenter les modules !
