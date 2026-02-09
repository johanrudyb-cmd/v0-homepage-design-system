# 🚀 Configuration Supabase - Guide Rapide

## 📋 Checklist

Suivez ces étapes dans l'ordre :

### ✅ Étape 1 : Créer un compte et projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte (GitHub recommandé)
3. Créez un nouveau projet :
   - **Name** : `outfity`
   - **Database Password** : ⚠️ **SAVEZ-LE !**
   - **Region** : `West Europe` (ou la plus proche)
   - **Plan** : `Free`

### ✅ Étape 2 : Récupérer la connection string

1. Dans Supabase : **Settings** → **Database**
2. Section **"Connection string"**
3. Sélectionnez **"URI"**
4. Copiez la connection string

### ✅ Étape 3 : Mettre à jour .env

Ouvrez votre `.env` et remplacez `DATABASE_URL` :

```env
DATABASE_URL="postgresql://postgres:[VOTRE-MOT-DE-PASSE]@db.xxxxx.supabase.co:5432/postgres"
```

⚠️ **Remplacez `[VOTRE-MOT-DE-PASSE]` par le mot de passe de l'étape 1**

### ✅ Étape 4 : Tester la connexion

```bash
npm run db:test
```

Si vous voyez "✅ Connexion réussie !", continuez à l'étape 5.

### ✅ Étape 5 : Créer les tables

```bash
npm run db:push
```

Vous devriez voir :
```
✔ Your database is now in sync with your Prisma schema.
```

### ✅ Étape 6 : Vérifier dans Supabase

1. Dans Supabase : **Table Editor**
2. Vous devriez voir toutes vos tables : `User`, `Account`, `Session`, `Brand`, etc.

## 🎉 C'est fait !

Votre base de données est configurée. Vous pouvez maintenant :
- Tester l'authentification (`/auth/signup`)
- Commencer à implémenter les modules

## 📚 Documentation complète

Voir `docs/supabase-setup.md` pour plus de détails.

## 🐛 Problème ?

Exécutez `npm run db:test` pour diagnostiquer les erreurs.
