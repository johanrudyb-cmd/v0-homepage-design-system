# 🔧 Mise à jour DATABASE_URL

## ⚠️ Action requise

Votre `.env` contient encore l'ancienne connection string (Direct connection).

Vous devez la remplacer par la connection string **Session Pooler**.

## ✅ Connection string à utiliser

Ouvrez votre fichier `.env` et remplacez la ligne `DATABASE_URL` par :

```env
DATABASE_URL="postgresql://postgres.qlefdfepdgdzjgatghjc:pGP2Fp6SD50j3TnN@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"
```

## 📝 Différences importantes

**Ancienne (Direct connection)** :
- `db.qlefdfepdgdzjgatghjc.supabase.co`
- Problème DNS IPv6

**Nouvelle (Session Pooler)** :
- `aws-1-eu-central-1.pooler.supabase.com`
- Compatible IPv4
- Meilleure pour les applications web

## ✅ Après mise à jour

1. Testez : `npm run db:test`
2. Redémarrez : `npm run dev`
3. Testez l'inscription

---

**Une fois mis à jour, le test devrait fonctionner !**
