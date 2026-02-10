# 🔧 Fix: Erreur 500 en production/preview - Authentification

## Problème
Erreur 500 lors de la connexion en production et preview, alors que ça fonctionne en local.

## Corrections appliquées

### 1. Gestion d'erreur améliorée avec tracking d'étapes
- Chaque étape de la connexion est maintenant trackée (`errorStep`)
- Logs détaillés pour chaque erreur avec contexte
- Messages d'erreur plus précis selon le type d'erreur (DB, JWT, bcrypt, etc.)

### 2. Vérification Prisma Client
- Vérification explicite que Prisma Client est généré avant utilisation
- Messages d'erreur clairs si Prisma Client n'est pas disponible
- Gestion d'erreur améliorée dans `lib/prisma.ts`

### 3. Gestion du secret JWT
- Vérification que `NEXTAUTH_SECRET` ou `AUTH_SECRET` est défini en production
- Le secret est vérifié à chaque requête (pas seulement au chargement du module)
- Message d'erreur clair si le secret manque en production

### 4. Gestion bcrypt
- Try-catch autour de `bcrypt.compare()` pour éviter les erreurs silencieuses
- Logs détaillés en cas d'erreur

### 5. Parsing JSON amélioré
- Try-catch autour du parsing du body de la requête
- Message d'erreur si le format JSON est invalide

### 6. Gestion des cookies
- Try-catch autour de la définition du cookie
- Le token est toujours retourné dans la réponse JSON même si le cookie échoue

## Logs de diagnostic

Les logs incluent maintenant :
- L'étape où l'erreur s'est produite (`errorStep`)
- Le message d'erreur complet
- La durée de la requête
- L'état des variables d'environnement (DATABASE_URL, NEXTAUTH_SECRET)
- Le contexte Vercel (isVercel, isProduction)

## Étapes de la connexion (trackées)

1. `initialization` - Début de la fonction
2. `env_check` - Vérification des variables d'environnement
3. `parse_body` - Parsing du JSON de la requête
4. `prisma_check` - Vérification que Prisma Client est disponible
5. `db_query` - Requête à la base de données
6. `password_check` - Vérification du mot de passe avec bcrypt
7. `secret_check` - Vérification du secret JWT
8. `jwt_create` - Création du token JWT
9. `response_create` - Création de la réponse avec cookie

## Vérifications à faire sur Vercel

### 1. Variables d'environnement (CRITIQUE)

Dans Vercel Dashboard → Settings → Environment Variables :

```env
# OBLIGATOIRE pour Production ET Preview
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-strong-secret-here-minimum-32-characters
# OU
AUTH_SECRET=your-strong-secret-here-minimum-32-characters
```

**⚠️ IMPORTANT :**
- Vérifier que les variables sont définies pour **Production** ET **Preview**
- `NEXTAUTH_SECRET` doit être d'au moins 32 caractères
- Générer avec : `openssl rand -base64 32`

### 2. Prisma Client génération

Vérifier que `package.json` contient :
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

### 3. Vérifier les logs Vercel

1. Aller dans Vercel Dashboard → Ton projet → Deployments
2. Cliquer sur le dernier déploiement
3. Ouvrir **Function Logs**
4. Chercher les logs avec `[AUTH LOGIN]` ou `[PRISMA]`
5. Vérifier l'étape (`errorStep`) où l'erreur se produit

### 4. Tester la connexion

Après le déploiement, tester avec :
```bash
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

## Diagnostic des erreurs courantes

### Erreur : "Configuration serveur incorrecte"
- **Cause** : `DATABASE_URL` non défini
- **Solution** : Vérifier que `DATABASE_URL` est défini dans Vercel (Production ET Preview)

### Erreur : "Prisma Client non disponible"
- **Cause** : Prisma Client non généré
- **Solution** : Vérifier que `postinstall` script est dans `package.json` et que `prisma generate` s'exécute

### Erreur : "Erreur de connexion à la base de données"
- **Cause** : Problème de connexion à PostgreSQL
- **Solution** : 
  - Vérifier que `DATABASE_URL` est correct
  - Vérifier que la base de données est accessible depuis Vercel (pas de restriction IP)
  - Vérifier que le port est correct (5432 pour connexion directe)

### Erreur : "Erreur lors de la création du token JWT"
- **Cause** : `NEXTAUTH_SECRET` non défini ou invalide
- **Solution** : Vérifier que `NEXTAUTH_SECRET` est défini dans Vercel (Production ET Preview)

### Erreur : "Erreur lors de la vérification"
- **Cause** : Problème avec bcrypt.compare()
- **Solution** : Vérifier les logs pour plus de détails

## Fichiers modifiés

- `app/api/auth/login/route.ts` - Gestion d'erreur complète avec tracking
- `lib/prisma.ts` - Vérification Prisma Client améliorée

## Prochaines étapes

1. Déployer les changements sur Vercel
2. Vérifier les logs Vercel après une tentative de connexion
3. Identifier l'étape (`errorStep`) où l'erreur se produit
4. Corriger selon le diagnostic

## Support

Si le problème persiste après ces corrections :
1. Partager les logs Vercel (Function Logs) avec `[AUTH LOGIN]`
2. Partager l'étape (`errorStep`) où l'erreur se produit
3. Vérifier que toutes les variables d'environnement sont bien définies
