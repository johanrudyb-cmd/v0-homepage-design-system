# Correction Erreur DNS Supabase

## Problème

Erreur : `getaddrinfo ENOTFOUND db.qlefdfepdgdzjgatghjc.supabase.co`

Cela signifie que votre machine ne peut pas résoudre le nom de domaine Supabase.

## Solutions

### Solution 1 : Utiliser le Session Pooler (Recommandé)

Le Session Pooler de Supabase utilise un port différent (6543) et peut mieux fonctionner :

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Settings → Database
4. Section "Connection string"
5. Sélectionnez **"Session pooler"** au lieu de "Direct connection"
6. Copiez la nouvelle connection string

Format : `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

### Solution 2 : Vérifier votre connexion internet

- Vérifiez que vous êtes connecté à internet
- Essayez de ping le domaine : `ping db.qlefdfepdgdzjgatghjc.supabase.co`
- Vérifiez votre DNS (essayez Google DNS : 8.8.8.8)

### Solution 3 : Utiliser l'IP directement (non recommandé)

Si le DNS ne fonctionne pas, vous pouvez essayer de trouver l'IP du serveur, mais ce n'est pas recommandé car l'IP peut changer.

### Solution 4 : Vérifier le projet Supabase

- Vérifiez que le projet est actif dans le dashboard Supabase
- Vérifiez que vous utilisez la bonne connection string
- Essayez de vous connecter via le dashboard Supabase (Table Editor)

## Test de connexion

Une fois la connection string mise à jour, testez :

```bash
npm run db:test
```

## Note

Si MCP Supabase fonctionne mais pas la connection string directe, cela indique un problème de réseau/DNS local. Le Session Pooler devrait résoudre ce problème.
