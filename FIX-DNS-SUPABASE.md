# 🔧 Correction Erreur DNS Supabase

## ❌ Problème

Erreur : `getaddrinfo ENOTFOUND db.qlefdfepdgdzjgatghjc.supabase.co`

Le domaine résout uniquement en **IPv6**, ce qui peut causer des problèmes de connexion.

## ✅ Solution : Utiliser le Session Pooler

Le **Session Pooler** de Supabase utilise un domaine différent qui fonctionne mieux :

### Étapes

1. **Allez sur** [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Sélectionnez votre projet**
3. **Settings** → **Database**
4. **Section "Connection string"**
5. **Changez "Method"** de **"Direct connection"** à **"Session pooler"**
6. **Sélectionnez "URI"** dans le dropdown
7. **Copiez la nouvelle connection string**

### Format attendu

```
postgresql://postgres.qlefdfepdgdzjgatghjc:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Note : Le port est **6543** (pas 5432) et le domaine est **pooler.supabase.com**

### Mise à jour du .env

Remplacez `DATABASE_URL` dans votre `.env` :

```env
DATABASE_URL="postgresql://postgres.qlefdfepdgdzjgatghjc:pGP2Fp6SD50j3TnN@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

⚠️ **Remplacez `[REGION]` par votre région** (ex: `eu-west-1` pour West Europe)

### Test

Après mise à jour, testez :

```bash
npm run db:test
```

Puis redémarrez le serveur :

```bash
npm run dev
```

## 🎯 Pourquoi ça fonctionne ?

- Le Session Pooler utilise un domaine avec IPv4
- Meilleure gestion des connexions
- Plus stable pour les applications web
- Port 6543 optimisé pour le pooling

---

**Une fois la connection string mise à jour, l'inscription devrait fonctionner !**
