# Guide de dépannage : Authentification en production (Vercel)

## 🔍 Problème : Connexion échoue en production mais fonctionne en local

### ✅ Vérifications à faire sur Vercel

#### 1. Variables d'environnement CRITIQUES

Dans le dashboard Vercel → Settings → Environment Variables, vérifier que ces variables sont définies :

```env
# OBLIGATOIRE
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-strong-secret-here-minimum-32-characters
# OU
AUTH_SECRET=your-strong-secret-here-minimum-32-characters

# Optionnel mais recommandé
NEXTAUTH_URL=https://yourdomain.com
```

**⚠️ IMPORTANT :**
- `NEXTAUTH_SECRET` ou `AUTH_SECRET` doit être défini (générer avec `openssl rand -base64 32`)
- `DATABASE_URL` doit pointer vers une base de données PostgreSQL accessible depuis Vercel
- Vérifier que les variables sont définies pour **Production** (pas seulement Preview/Development)

#### 2. Vérifier les logs Vercel

1. Aller dans Vercel Dashboard → Ton projet → Deployments → Cliquer sur le dernier déploiement
2. Ouvrir les **Function Logs**
3. Chercher les erreurs avec `[AUTH LOGIN]` ou `[AUTH]`
4. Vérifier s'il y a des erreurs de connexion à la base de données

#### 3. Vérifier la connexion à la base de données

Si tu utilises Supabase ou une autre base de données :
- Vérifier que l'IP de Vercel est autorisée (si restriction IP activée)
- Vérifier que la connection string utilise le bon port (5432 pour connexion directe, pas 6543 pour le pooler)
- Tester la connexion depuis un script Node.js

#### 4. Vérifier les cookies

Le cookie `auth-token` doit être :
- `secure: true` en production (HTTPS requis)
- `httpOnly: true` (sécurité)
- `sameSite: 'lax'` (compatibilité)

**Pour vérifier dans le navigateur :**
1. Ouvrir les DevTools (F12)
2. Onglet **Application** → **Cookies**
3. Vérifier que le cookie `auth-token` est présent après la connexion
4. Vérifier que `Secure` est coché en production

#### 5. Vérifier CORS et Headers

Le code utilise `credentials: 'include'` côté client, ce qui devrait fonctionner.

Si tu as un domaine personnalisé, vérifier :
- Que le domaine est bien configuré dans Vercel
- Que le certificat SSL est valide
- Que les headers de sécurité ne bloquent pas les cookies

### 🔧 Corrections appliquées

Les modifications suivantes ont été faites pour améliorer la compatibilité production :

1. **Détection HTTPS améliorée** : Utilise `x-forwarded-proto` (header Vercel) pour détecter HTTPS
2. **Gestion d'erreur améliorée** : Messages d'erreur plus explicites pour diagnostiquer
3. **Vérification DATABASE_URL** : Vérifie que la base de données est configurée avant de tenter la connexion
4. **Logs de diagnostic** : Logs ajoutés pour voir la configuration du cookie en production
5. **Credentials côté client** : Changé de `same-origin` à `include` pour meilleure compatibilité

### 📝 Checklist de déploiement

- [ ] `DATABASE_URL` défini dans Vercel (Production)
- [ ] `NEXTAUTH_SECRET` ou `AUTH_SECRET` défini dans Vercel (Production)
- [ ] Base de données accessible depuis Vercel (pas de restriction IP ou IP autorisée)
- [ ] Build réussi sans erreur
- [ ] Tester la connexion après déploiement
- [ ] Vérifier les logs Vercel en cas d'erreur
- [ ] Vérifier que le cookie est bien créé dans le navigateur

### 🐛 Diagnostic rapide

Si ça ne fonctionne toujours pas :

1. **Vérifier les logs Vercel** pour voir l'erreur exacte
2. **Tester l'endpoint directement** :
   ```bash
   curl -X POST https://yourdomain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test"}'
   ```
3. **Vérifier que Prisma Client est généré** : Le script `postinstall` devrait le faire automatiquement
4. **Vérifier la connexion DB** : Utiliser `scripts/test-supabase-connection.js` adapté pour ta DB

### 📞 Support

Si le problème persiste après ces vérifications, partager :
- Les logs Vercel (Function Logs)
- La configuration des variables d'environnement (sans les valeurs sensibles)
- Le résultat du test curl ci-dessus
