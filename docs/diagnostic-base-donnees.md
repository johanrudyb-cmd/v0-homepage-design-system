# Diagnostic : Problème de connexion à la base de données Supabase

## Résumé du problème

**Erreur actuelle :** `Circuit breaker open: Unable to establish connection to upstream database`

Cette erreur signifie que le **pooler Supabase** (point d'entrée) est atteignable, mais qu'il **ne peut pas se connecter à la base PostgreSQL** en arrière-plan.

---

## Architecture Supabase

```
Votre app (Prisma)  →  Pooler (aws-1-eu-central-1.pooler.supabase.com:5432)
                              ↓
                       Base PostgreSQL (Supabase managed)
```

L'erreur survient **entre le pooler et la base** : le pooler ne peut pas joindre PostgreSQL.

---

## Causes possibles (par ordre de probabilité)

### 1. Projet Supabase en pause ou en cours de démarrage

Sur le plan gratuit, Supabase met les projets en pause après ~7 jours sans activité.

**Solution :**
- Supabase Dashboard → **Project Settings** → **General** → **Project availability**
- Si "Paused" : cliquer sur **Restore** ou **Restart project**
- Attendre **10 à 15 minutes** que le projet soit complètement opérationnel

### 2. Projet en cours de redémarrage

Après un restart, la base peut mettre plusieurs minutes à être disponible.

**Solution :** Attendre 10–15 minutes, puis réessayer.

### 3. Incident ou maintenance Supabase

**Vérifier :** https://status.supabase.com

### 4. Restrictions réseau côté exécution

L'environnement Cursor peut bloquer ou limiter les connexions sortantes vers Supabase.

**Solution :** Exécuter `npx prisma db push` dans un terminal Windows (PowerShell/CMD) sur votre machine.

---

## Erreurs rencontrées (historique)

| Connexion | Erreur | Cause |
|-----------|--------|-------|
| `db.xxx.supabase.co:5432` (direct) | Can't reach database server | Non compatible IPv4, réseau probablement IPv4-only |
| `aws-0-eu-central-1` pooler | Tenant or user not found | Mauvaise région (votre projet est sur aws-1) |
| `aws-1-eu-central-1:5432` | Authentication failed | Ancien mot de passe |
| `aws-1-eu-central-1:5432` | Circuit breaker open | Pooler ne peut pas joindre la base (projet en pause / en démarrage) |
| `aws-1-eu-central-1:6543` | prepared statement exists | Mode transaction incompatible avec certaines opérations Prisma |
| `aws-1-eu-central-1:6543` | Circuit breaker open | Même cause que port 5432 |

---

## Configuration actuelle (correcte)

```
DATABASE_URL=postgresql://postgres.qlefdfepdgdzjgatghjc:[PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
```

- **Format :** ✅ Correct
- **Région :** ✅ aws-1-eu-central-1
- **Port :** ✅ 5432 (Session pooler, compatible IPv4)
- **Identifiant :** ✅ postgres.qlefdfepdgdzjgatghjc

---

## Plan d'action recommandé

1. **Vérifier le statut du projet Supabase**
   - Dashboard → Project Settings → General
   - S'assurer que le projet n'est pas en pause
   - Si besoin : Restart project puis attendre 15 min

2. **Exécuter la commande en local**
   ```powershell
   cd "c:\Users\Admin\Desktop\MEDIA BIANGORY - CURSOR V1"
   npx prisma db push
   ```
   Ou pour tester la connexion :
   ```powershell
   node scripts/test-supabase-connection.js
   ```

3. **Consulter le statut Supabase**
   - https://status.supabase.com

4. **Si le problème persiste**
   - Vérifier que le projet est bien sur le plan attendu (Free / Pro)
   - Contacter le support Supabase en fournissant : Project ref `qlefdfepdgdzjgatghjc`, région `aws-1-eu-central-1`, erreur exacte

---

## Test rapide

```bash
node scripts/test-supabase-connection.js
```

Ce script teste la connexion et affiche les tables existantes. S'il réussit, `prisma db push` devrait fonctionner aussi.

---

## Solution de secours : PostgreSQL local (Docker)

Quand Supabase est en pause et que tu ne peux pas attendre, utilise une base locale :

```powershell
# 1. Démarrer PostgreSQL en local
docker compose up -d

# 2. Dans .env, remplacer DATABASE_URL par :
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medias_biangory

# 3. Appliquer le schéma et lancer l'app
npx prisma db push
npm run dev
```

La base locale démarre en quelques secondes. Pour revenir à Supabase une fois le projet restauré, remets l’URL Supabase dans `DATABASE_URL`.
