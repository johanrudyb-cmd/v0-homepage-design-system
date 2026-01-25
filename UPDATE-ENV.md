# 🔧 Mise à jour de votre .env

## ✅ Connection string Session Pooler

Ajoutez ou remplacez cette ligne dans votre fichier `.env` :

```env
DATABASE_URL="postgresql://postgres.qlefdfepdgdzjgatghjc:pGP2Fp6SD50j3TnN@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"
```

## 📝 Étapes

1. Ouvrez votre fichier `.env`
2. Trouvez la ligne `DATABASE_URL=`
3. Remplacez-la par la ligne ci-dessus
4. Sauvegardez le fichier

## ✅ Test

Après avoir mis à jour, testez :

```bash
npm run db:test
```

Puis redémarrez le serveur :

```bash
npm run dev
```

## 🎉 Résultat attendu

- ✅ Connexion réussie
- ✅ Inscription fonctionnelle
- ✅ Connexion fonctionnelle

---

**Le Session Pooler devrait résoudre le problème DNS !**
