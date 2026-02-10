# 🔄 Migration vers Session Pooler Supabase

*Guide pour corriger les problèmes de connexion*

---

## 🔍 Votre Configuration Actuelle

D'après votre `.env`, vous utilisez :
```
postgresql://postgres.qlefdfepdgdzjgatghjc:...@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
```

**Problème détecté** : Vous utilisez le **pooler** mais avec le **port 5432** (Direct connection).

---

## ✅ Solution : Utiliser le Port 6543 (Session Pooler)

### Étape 1 : Récupérer la Bonne Connection String

1. **Aller sur** [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Sélectionner votre projet**
3. **Settings** → **Database**
4. **Section "Connection string"**
5. **S'assurer que "Method" = "Session pooler"** (pas "Direct connection")
6. **Sélectionner "URI"** dans le dropdown
7. **Copier la connection string**

**Format attendu** :
```
postgresql://postgres.qlefdfepdgdzjgatghjc:[PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
```

**⚠️ IMPORTANT** : Le port doit être **6543** (pas 5432)

---

### Étape 2 : Mettre à Jour `.env` Local

**Remplacer** :
```env
DATABASE_URL="postgresql://postgres.qlefdfepdgdzjgatghjc:pYoaTP64sg6pXN2X@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"
```

**Par** :
```env
DATABASE_URL="postgresql://postgres.qlefdfepdgdzjgatghjc:pYoaTP64sg6pXN2X@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=10&pool_timeout=10&statement_cache_size=0"
```

**Changements** :
- Port : `5432` → `6543` ✅
- Ajout paramètres optimisés : `pgbouncer=true&connect_timeout=10&pool_timeout=10&statement_cache_size=0` ✅

---

### Étape 3 : Mettre à Jour Vercel

1. **Aller sur** [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Sélectionner votre projet**
3. **Settings** → **Environment Variables**
4. **Trouver `DATABASE_URL`**
5. **Modifier** avec la nouvelle URL (port 6543)
6. **Sauvegarder**
7. **Redéployer** l'application

---

### Étape 4 : Tester la Connexion

```bash
npm run db:test
```

**Résultat attendu** :
```
🔍 Test de connexion Supabase...

1️⃣ Test connexion basique...
   ✅ Connexion réussie

2️⃣ Test requête simple...
   ✅ Nombre d'utilisateurs : X

3️⃣ Test requête avec relations...
   ✅ Marques récupérées : X

4️⃣ Test performance...
   ✅ Temps de réponse : XXms

5️⃣ Vérification configuration...
   ✅ Session Pooler détecté (recommandé)

✅ Tous les tests sont passés !

📊 Informations de connexion :
   - URL : postgresql://postgres.qlefdfepdgdzjgatghjc:...
   - Pooler : Oui ✅
   - Port : 6543 (Pooler) ✅
```

---

## 🎯 Pourquoi le Port 6543 ?

| Port | Type | Usage | Limite Connexions |
|------|------|-------|-------------------|
| **5432** | Direct Connection | Migrations uniquement | 60 (Supabase Free) |
| **6543** | Session Pooler | Production (recommandé) | Géré automatiquement |

**Avantages du port 6543** :
- ✅ Gestion automatique du pool de connexions
- ✅ Pas de limite stricte de connexions simultanées
- ✅ Optimisé pour les applications serverless (Vercel)
- ✅ Plus stable et performant

---

## 🐛 Si les Problèmes Persistent

### Vérifier les Logs Supabase

1. **Dashboard Supabase** → **Logs** → **Postgres Logs**
2. **Chercher** les erreurs de connexion
3. **Vérifier** les limites atteintes

### Vérifier les Logs Vercel

1. **Dashboard Vercel** → **Deployments** → **Logs**
2. **Chercher** les erreurs Prisma
3. **Vérifier** les timeouts

### Vérifier la Configuration

```bash
# Tester la connexion
npm run db:test

# Vérifier le schéma Prisma
npm run db:push --dry-run

# Vérifier les migrations
npm run db:migrate status
```

---

## 📋 Checklist de Migration

- [ ] Récupérer la connection string Session Pooler (port 6543)
- [ ] Mettre à jour `.env` local
- [ ] Mettre à jour `DATABASE_URL` dans Vercel
- [ ] Tester avec `npm run db:test`
- [ ] Vérifier que le port est 6543
- [ ] Redéployer sur Vercel
- [ ] Tester l'application en production

---

## ✅ Après Migration

Une fois migré vers le port 6543, vous devriez voir :
- ✅ Moins d'erreurs de connexion
- ✅ Meilleures performances
- ✅ Pas de limite de connexions atteinte
- ✅ Application plus stable

---

**Cette migration devrait résoudre la plupart des bugs liés à la connexion Supabase !** 🎉
