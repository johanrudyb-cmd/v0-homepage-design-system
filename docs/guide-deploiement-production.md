# Guide de Déploiement Production - Application 100% Fonctionnelle

*Document créé via BMAD-Method - Analyst*

## Date : 2025-01-26

---

## 🎯 Objectif

Rendre l'application **100% fonctionnelle pour le public** avec toutes les configurations nécessaires pour la production.

---

## ✅ Checklist Pré-Déploiement

### 1. Variables d'Environnement ⚠️ CRITIQUE

#### 1.1 Créer `.env.example`
✅ **FAIT** - Fichier créé avec toutes les variables nécessaires

#### 1.2 Configurer `.env.local` (Développement)
```env
# Base de données
DATABASE_URL=postgresql://user:password@host:port/database

# NextAuth
NEXTAUTH_SECRET=votre-secret-fort-minimum-32-caracteres
NEXTAUTH_URL=http://localhost:3000

# APIs
OPENAI_API_KEY=sk-...
HIGGSFIELD_API_KEY=...

# CRON
CRON_SECRET=votre-secret-cron-minimum-32-caracteres
```

#### 1.3 Configurer Variables sur Vercel (Production)
1. Aller sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionner votre projet
3. **Settings** → **Environment Variables**
4. Ajouter toutes les variables depuis `.env.example`
5. Vérifier que `NODE_ENV=production` est défini

**Variables CRITIQUES** :
- ✅ `DATABASE_URL` (PostgreSQL production)
- ✅ `NEXTAUTH_SECRET` (générer un secret fort)
- ✅ `NEXTAUTH_URL` (URL de production, ex: https://yourdomain.com)
- ✅ `OPENAI_API_KEY`
- ✅ `HIGGSFIELD_API_KEY`
- ✅ `CRON_SECRET`

---

### 2. Base de Données ⚠️ CRITIQUE

#### 2.1 Migration Prisma en Production
```bash
# Générer le client Prisma
npm run db:generate

# Créer la migration
npm run db:migrate

# OU push direct (développement uniquement)
npm run db:push
```

#### 2.2 Vérifier la Connexion
```bash
# Tester la connexion
npm run db:test
```

#### 2.3 Backup Automatique
- **Supabase** : Backup automatique activé par défaut
- **Vercel Postgres** : Backup automatique activé
- **Neon** : Backup automatique activé

---

### 3. Sécurité ⚠️ CRITIQUE

#### 3.1 Rate Limiting ✅ IMPLÉMENTÉ
- ✅ Rate limiting sur `/api/spy/analyze` (10 req/min)
- ✅ Rate limiting sur `/api/designs/generate` (5 req/min)
- ✅ Protection par utilisateur

#### 3.2 Headers de Sécurité ✅ IMPLÉMENTÉ
- ✅ Headers de sécurité configurés dans `next.config.ts`
- ✅ HTTPS enforcement
- ✅ XSS protection
- ✅ CSRF protection

#### 3.3 Validation des Inputs
- ✅ Validation des URLs dans Brand Spy
- ✅ Validation des données utilisateur
- ⚠️ **À ajouter** : Validation Zod pour toutes les routes API

---

### 4. Configuration Next.js ⚠️ CRITIQUE

#### 4.1 `next.config.ts` ✅ OPTIMISÉ
- ✅ Headers de sécurité configurés
- ✅ Images remotePatterns configurés
- ✅ React Strict Mode activé

#### 4.2 Build Production
```bash
# Tester le build
npm run build

# Vérifier qu'il n'y a pas d'erreurs
```

---

### 5. CRON Jobs ⚠️ IMPORTANT

#### 5.1 Configuration Vercel Cron
1. Créer `vercel.json` à la racine :
```json
{
  "crons": [
    {
      "path": "/api/cron/track-inventory",
      "schedule": "0 * * * *"
    }
  ]
}
```

2. Ajouter `CRON_SECRET` dans les variables d'env Vercel

3. Vérifier que la route `/api/cron/track-inventory` vérifie le secret :
```typescript
if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

### 6. Monitoring ⚠️ RECOMMANDÉ

#### 6.1 Vercel Analytics
- ✅ Intégré automatiquement avec Vercel
- ✅ Activer dans le dashboard Vercel

#### 6.2 Error Tracking
- ⚠️ **À ajouter** : Sentry ou équivalent
- ⚠️ **À ajouter** : Logging structuré

---

## 🚀 Étapes de Déploiement

### Étape 1 : Préparation (5 min)

1. **Vérifier `.env.example`** ✅
2. **Tester le build local** :
   ```bash
   npm run build
   ```
3. **Vérifier qu'il n'y a pas d'erreurs TypeScript**

### Étape 2 : Configuration Vercel (10 min)

1. **Créer un projet Vercel** (si pas déjà fait)
2. **Connecter le repository GitHub/GitLab**
3. **Configurer les variables d'env** :
   - Copier toutes les variables depuis `.env.example`
   - Remplacer les valeurs par les vraies clés API
   - Générer un `NEXTAUTH_SECRET` fort (32+ caractères)

4. **Configurer la base de données** :
   - Ajouter Vercel Postgres OU
   - Connecter Supabase/Neon
   - Copier `DATABASE_URL` dans les variables d'env

### Étape 3 : Déploiement (5 min)

1. **Push sur GitHub** :
   ```bash
   git add .
   git commit -m "Production ready"
   git push
   ```

2. **Vercel déploie automatiquement**

3. **Vérifier le déploiement** :
   - Aller sur l'URL de production
   - Tester l'inscription/connexion
   - Tester un module principal

### Étape 4 : Migration Base de Données (5 min)

1. **Se connecter à la base de données production**
2. **Exécuter la migration** :
   ```bash
   # Avec DATABASE_URL de production
   DATABASE_URL="postgresql://..." npm run db:migrate
   ```

   OU utiliser Prisma Studio :
   ```bash
   DATABASE_URL="postgresql://..." npx prisma studio
   ```

### Étape 5 : Configuration CRON (5 min)

1. **Créer `vercel.json`** (si pas déjà fait)
2. **Ajouter `CRON_SECRET`** dans les variables d'env
3. **Vérifier que le CRON est configuré** dans Vercel Dashboard

### Étape 6 : Tests Production (15 min)

1. **Tester l'inscription** :
   - Créer un compte
   - Vérifier que l'email est sauvegardé

2. **Tester chaque module** :
   - Launch Map
   - Design Studio
   - Brand Spy
   - Tendances & Hits
   - Sourcing Hub
   - UGC Lab

3. **Tester les limites** :
   - Plan Free (limites)
   - Plan Pro (illimité)

4. **Tester les erreurs** :
   - URL invalide dans Brand Spy
   - API down (fallback)

---

## 🔒 Sécurité Production

### Checklist Sécurité

- [ ] `NEXTAUTH_SECRET` fort et unique (32+ caractères)
- [ ] `CRON_SECRET` fort et unique
- [ ] Toutes les clés API dans les variables d'env (jamais dans le code)
- [ ] Rate limiting activé sur routes sensibles
- [ ] Headers de sécurité configurés
- [ ] HTTPS activé (automatique avec Vercel)
- [ ] Validation des inputs
- [ ] Protection CSRF
- [ ] CORS configuré

---

## 📊 Monitoring Production

### Métriques à Surveiller

1. **Performance** :
   - Temps de réponse API
   - Temps de chargement pages
   - Erreurs 500

2. **Utilisation** :
   - Nombre d'utilisateurs actifs
   - Requêtes API par jour
   - Utilisation des limites

3. **Erreurs** :
   - Erreurs API
   - Erreurs base de données
   - Timeouts

---

## 🐛 Troubleshooting

### Problème : Application ne démarre pas

**Vérifier** :
1. Variables d'env configurées
2. `DATABASE_URL` valide
3. `NEXTAUTH_SECRET` défini
4. Build réussi (`npm run build`)

### Problème : Erreurs base de données

**Vérifier** :
1. Migration exécutée
2. Connexion base de données valide
3. Prisma client régénéré

### Problème : APIs externes ne fonctionnent pas

**Vérifier** :
1. Clés API configurées
2. Clés API valides
3. Rate limiting des APIs externes

---

## ✅ Validation Finale

Avant de rendre l'app publique :

1. [ ] Application démarre sans erreur
2. [ ] Toutes les routes fonctionnent
3. [ ] Authentification fonctionnelle
4. [ ] Base de données accessible
5. [ ] APIs externes configurées
6. [ ] Pas d'erreurs dans la console
7. [ ] Performance acceptable (< 3s chargement)
8. [ ] Sécurité vérifiée
9. [ ] Tests passés
10. [ ] Documentation à jour

---

## 🎉 Une fois Tout Complété

L'application sera **100% fonctionnelle pour le public** avec :
- ✅ Sécurité renforcée
- ✅ Performance optimisée
- ✅ Monitoring en place
- ✅ Configuration production
- ✅ Tests validés

**Temps total estimé** : 1-2 heures pour configuration complète
