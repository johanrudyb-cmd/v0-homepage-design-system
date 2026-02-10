# 🔧 Configuration Complète Supabase

*Guide pour configurer et diagnostiquer la connexion Supabase*

---

## 🎯 Problèmes Courants avec Supabase

1. **Connexions qui timeout** : Pool de connexions saturé
2. **Erreurs DNS** : Domaine qui ne résout pas
3. **Erreurs de connexion intermittentes** : Pas de connection pooling
4. **Limite de connexions** : Supabase Free a une limite de connexions simultanées

---

## ✅ Configuration Recommandée

### Option 1 : Session Pooler (RECOMMANDÉ pour Production)

**Avantages** :
- ✅ Gestion automatique du pool de connexions
- ✅ Compatible IPv4 (pas de problème DNS)
- ✅ Optimisé pour les applications serverless (Vercel)
- ✅ Limite de connexions gérée automatiquement

**Comment configurer** :

1. **Aller sur** [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Sélectionner votre projet**
3. **Settings** → **Database**
4. **Section "Connection string"**
5. **Changer "Method"** de **"Direct connection"** à **"Session pooler"**
6. **Sélectionner "URI"** dans le dropdown
7. **Copier la connection string**

**Format attendu** :
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-[NUMBER]-[REGION].pooler.supabase.com:6543/postgres
```

**Exemple** :
```
postgresql://postgres.qlefdfepdgdzjgatghjc:pYoaTP64sg6pXN2X@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
```

**⚠️ IMPORTANT** :
- Port : **6543** (pas 5432)
- Domaine : **pooler.supabase.com** (pas `.supabase.co`)
- Format utilisateur : `postgres.[PROJECT_REF]` (pas juste `postgres`)

---

### Option 2 : Direct Connection (Pour migrations uniquement)

**Utilisation** : Uniquement pour `prisma db push` et migrations

**Format** :
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**⚠️ Ne pas utiliser en production** : Limite de connexions trop basse

---

## 🔧 Configuration Prisma pour Supabase

### 1. Configuration avec Session Pooler (Production)

**Dans `.env`** :
```env
# Production : Session Pooler (recommandé)
DATABASE_URL="postgresql://postgres.qlefdfepdgdzjgatghjc:[PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Optionnel : Direct connection pour migrations uniquement
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.qlefdfepdgdzjgatghjc.supabase.co:5432/postgres"
```

**Dans `prisma/schema.prisma`** :
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Prisma détecte automatiquement le pooler
}
```

### 2. Paramètres de Connexion Optimisés

Ajouter ces paramètres à votre `DATABASE_URL` pour optimiser :

```env
DATABASE_URL="postgresql://postgres.qlefdfepdgdzjgatghjc:[PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=10&pool_timeout=10&statement_cache_size=0"
```

**Paramètres expliqués** :
- `pgbouncer=true` : Indique à Prisma d'utiliser le pooler
- `connect_timeout=10` : Timeout de connexion (secondes)
- `pool_timeout=10` : Timeout du pool (secondes)
- `statement_cache_size=0` : Désactive le cache de requêtes (recommandé avec pooler)

---

## 🧪 Test de Connexion

### Script de Test Automatique

Créer `scripts/test-supabase-connection.ts` :

```typescript
import { PrismaClient } from '@prisma/client';

async function testConnection() {
  console.log('🔍 Test de connexion Supabase...\n');
  
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    // Test 1 : Connexion basique
    console.log('1️⃣ Test connexion basique...');
    await prisma.$connect();
    console.log('   ✅ Connexion réussie\n');

    // Test 2 : Requête simple
    console.log('2️⃣ Test requête simple...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ Nombre d'utilisateurs : ${userCount}\n`);

    // Test 3 : Requête complexe
    console.log('3️⃣ Test requête complexe...');
    const brands = await prisma.brand.findMany({
      take: 5,
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });
    console.log(`   ✅ Marques récupérées : ${brands.length}\n`);

    // Test 4 : Performance
    console.log('4️⃣ Test performance...');
    const start = Date.now();
    await prisma.user.findMany({ take: 10 });
    const duration = Date.now() - start;
    console.log(`   ✅ Temps de réponse : ${duration}ms\n`);

    console.log('✅ Tous les tests sont passés !\n');
    console.log('📊 Informations de connexion :');
    console.log(`   - URL : ${process.env.DATABASE_URL?.substring(0, 50)}...`);
    console.log(`   - Pooler : ${process.env.DATABASE_URL?.includes('pooler') ? 'Oui ✅' : 'Non ❌'}`);
    console.log(`   - Port : ${process.env.DATABASE_URL?.includes(':6543') ? '6543 (Pooler) ✅' : process.env.DATABASE_URL?.includes(':5432') ? '5432 (Direct) ⚠️' : 'Inconnu'}`);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Erreur de connexion :\n');
    console.error(`   ${errorMessage}\n`);
    
    // Diagnostic automatique
    if (errorMessage.includes('P1001') || errorMessage.includes('connection')) {
      console.log('💡 Diagnostic : Erreur de connexion\n');
      console.log('   Solutions possibles :');
      console.log('   1. Vérifiez que DATABASE_URL est correct dans .env');
      console.log('   2. Utilisez le Session Pooler (port 6543)');
      console.log('   3. Vérifiez que le projet Supabase est actif');
      console.log('   4. Vérifiez votre connexion internet\n');
    } else if (errorMessage.includes('password') || errorMessage.includes('authentication')) {
      console.log('💡 Diagnostic : Erreur d\'authentification\n');
      console.log('   Solutions possibles :');
      console.log('   1. Vérifiez le mot de passe dans DATABASE_URL');
      console.log('   2. Encodez les caractères spéciaux (ex: @ devient %40)');
      console.log('   3. Régénérez le mot de passe dans Supabase Dashboard\n');
    } else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      console.log('💡 Diagnostic : Timeout de connexion\n');
      console.log('   Solutions possibles :');
      console.log('   1. Utilisez le Session Pooler (plus rapide)');
      console.log('   2. Vérifiez votre connexion internet');
      console.log('   3. Augmentez connect_timeout dans DATABASE_URL\n');
    } else {
      console.log('💡 Vérifiez :');
      console.log('   1. Que DATABASE_URL est correct');
      console.log('   2. Que le projet Supabase est créé et actif');
      console.log('   3. Que vous avez les bonnes permissions');
      console.log('   4. Les logs Supabase pour plus de détails\n');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

**Ajouter dans `package.json`** :
```json
{
  "scripts": {
    "db:test": "npx tsx scripts/test-supabase-connection.ts"
  }
}
```

---

## 🐛 Diagnostic des Problèmes

### Problème 1 : "P1001: Can't reach database server"

**Causes possibles** :
- URL incorrecte
- Projet Supabase suspendu
- Problème réseau

**Solutions** :
1. Vérifier l'URL dans Supabase Dashboard
2. Vérifier que le projet est actif
3. Utiliser le Session Pooler (port 6543)

---

### Problème 2 : "Too many connections"

**Cause** : Limite de connexions simultanées atteinte (Supabase Free : 60 connexions)

**Solutions** :
1. **Utiliser le Session Pooler** (gère automatiquement les connexions)
2. **Réduire le pool de connexions Prisma** :

```typescript
// Dans lib/prisma.ts
const client = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=5&pool_timeout=10',
    },
  },
});
```

3. **Fermer les connexions correctement** :
```typescript
// Toujours fermer après utilisation
await prisma.$disconnect();
```

---

### Problème 3 : Connexions qui timeout

**Cause** : Timeout trop court ou connexions non fermées

**Solutions** :
1. **Augmenter le timeout** :
```env
DATABASE_URL="...?connect_timeout=30&pool_timeout=30"
```

2. **Utiliser le Session Pooler** (plus rapide)

3. **Vérifier les connexions ouvertes** :
```typescript
// Dans lib/prisma.ts, ajouter des logs
const client = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn', 'info'] 
    : ['error'],
});
```

---

### Problème 4 : Erreurs DNS (ENOTFOUND)

**Cause** : Domaine `.supabase.co` qui ne résout pas en IPv4

**Solution** : Utiliser le Session Pooler avec `.pooler.supabase.com`

---

## 🔒 Sécurité

### 1. Ne jamais commiter les credentials

**Dans `.gitignore`** :
```
.env
.env.local
.env*.local
```

### 2. Utiliser des variables d'environnement

**Dans Vercel** :
- Settings → Environment Variables
- Ajouter `DATABASE_URL`
- Sélectionner Production, Preview, Development

### 3. Rotation des mots de passe

**Dans Supabase** :
- Settings → Database
- Reset Database Password
- Mettre à jour `DATABASE_URL` dans Vercel

---

## 📊 Monitoring

### Vérifier les Connexions Actives

**Dans Supabase Dashboard** :
- Database → Connection Pooling
- Voir les connexions actives
- Vérifier les limites

### Logs Supabase

**Dans Supabase Dashboard** :
- Logs → Postgres Logs
- Voir les erreurs de connexion
- Voir les requêtes lentes

---

## ✅ Checklist de Configuration

- [ ] Créer projet Supabase
- [ ] Récupérer connection string (Session Pooler)
- [ ] Configurer `DATABASE_URL` dans `.env` local
- [ ] Configurer `DATABASE_URL` dans Vercel
- [ ] Tester avec `npm run db:test`
- [ ] Exécuter `prisma db push` pour créer les tables
- [ ] Vérifier les connexions dans Supabase Dashboard
- [ ] Configurer les paramètres de pool si nécessaire

---

## 🚀 Configuration Optimale pour Vercel

**DATABASE_URL recommandée** :
```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-[NUMBER]-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=10&pool_timeout=10&statement_cache_size=0"
```

**Pourquoi** :
- ✅ Session Pooler : Gère automatiquement les connexions
- ✅ Port 6543 : Optimisé pour le pooling
- ✅ `pgbouncer=true` : Indique à Prisma d'utiliser le pooler
- ✅ Timeouts configurés : Évite les connexions qui traînent
- ✅ Compatible serverless : Parfait pour Vercel

---

## 📝 Exemple Complet

### 1. Configuration `.env` local

```env
# Supabase - Session Pooler (Production)
DATABASE_URL="postgresql://postgres.qlefdfepdgdzjgatghjc:pYoaTP64sg6pXN2X@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=10&pool_timeout=10&statement_cache_size=0"

# Supabase - Direct Connection (Migrations uniquement)
DIRECT_URL="postgresql://postgres:pYoaTP64sg6pXN2X@db.qlefdfepdgdzjgatghjc.supabase.co:5432/postgres"
```

### 2. Configuration Vercel

**Variables à ajouter** :
- `DATABASE_URL` : La même que `.env` (Session Pooler)

### 3. Test

```bash
npm run db:test
```

**Résultat attendu** :
```
🔍 Test de connexion Supabase...

1️⃣ Test connexion basique...
   ✅ Connexion réussie

2️⃣ Test requête simple...
   ✅ Nombre d'utilisateurs : 0

3️⃣ Test requête complexe...
   ✅ Marques récupérées : 0

4️⃣ Test performance...
   ✅ Temps de réponse : 45ms

✅ Tous les tests sont passés !

📊 Informations de connexion :
   - URL : postgresql://postgres.qlefdfepdgdzjgatghjc:...
   - Pooler : Oui ✅
   - Port : 6543 (Pooler) ✅
```

---

## 🆘 Support

Si les problèmes persistent :

1. **Vérifier les logs Supabase** : Dashboard → Logs → Postgres Logs
2. **Vérifier les logs Vercel** : Deployments → Logs
3. **Tester la connexion** : `npm run db:test`
4. **Vérifier la configuration** : Voir checklist ci-dessus

---

**Une fois configuré correctement, les bugs de connexion devraient disparaître !** 🎉
