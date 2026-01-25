# Configuration Base de Données - Prisma 7

## ⚠️ Important : Prisma 7 a changé la configuration

Prisma 7 utilise une nouvelle façon de configurer la connexion à la base de données.

## 🔧 Configuration avec Prisma Accelerate

Si vous utilisez **Prisma Accelerate** (URL commençant par `prisma+`), vous devez :

### 1. URL dans `.env`

```env
DATABASE_URL="prisma+postgres://...?api_key=..."
```

### 2. Pour `db push` : URL directe requise

Prisma `db push` nécessite une **URL directe** à PostgreSQL, pas une URL Accelerate.

**Solution** : Ajoutez une variable `DIRECT_URL` dans `.env` :

```env
# URL Accelerate (pour l'application)
DATABASE_URL="prisma+postgres://...?api_key=..."

# URL directe PostgreSQL (pour migrations/push)
DIRECT_URL="postgresql://user:password@host:port/database?schema=public"
```

### 3. Utiliser `DIRECT_URL` pour les migrations

Modifiez temporairement `prisma/schema.prisma` pour utiliser `DIRECT_URL` :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DIRECT_URL")  // Temporaire pour db push
}
```

Puis exécutez :
```bash
npm run db:push
```

**Important** : Remettez ensuite le schéma sans `url` pour utiliser Accelerate dans le code.

## 🔧 Configuration sans Accelerate (PostgreSQL direct)

Si vous utilisez PostgreSQL directement :

### 1. URL dans `.env`

```env
DATABASE_URL="postgresql://user:password@localhost:5432/saas_mode?schema=public"
```

### 2. Schéma Prisma

```prisma
datasource db {
  provider = "postgresql"
  // Pas de url ici pour Prisma 7
}
```

### 3. Configuration dans `lib/prisma.ts`

Le code détecte automatiquement le type d'URL et configure Prisma Client correctement.

### 4. Exécuter `db push`

```bash
npm run db:push
```

## ✅ Vérification

Après `db push`, vous devriez voir :
- ✅ Tables créées : User, Account, Session, VerificationToken, Brand, LaunchMap, Design, Factory, Quote, BrandSpyAnalysis
- ✅ Relations configurées
- ✅ Indexes créés

## 🐛 Dépannage

### Erreur : "URL must contain a valid API key"
- Vérifiez que votre URL Prisma Accelerate contient une clé API valide
- Ou utilisez une URL PostgreSQL directe pour `db push`

### Erreur : "Can't reach database server"
- Vérifiez que PostgreSQL est démarré
- Vérifiez que `DIRECT_URL` (ou `DATABASE_URL`) est correct
- Vérifiez les credentials

### Erreur : "Database does not exist"
- Créez la base de données : `createdb saas_mode`
- Ou utilisez une base de données existante dans l'URL

## 📝 Commandes

```bash
# Générer le client Prisma
npm run db:generate

# Push le schéma (nécessite DIRECT_URL pour Accelerate)
npm run db:push

# Créer une migration
npm run db:migrate

# Ouvrir Prisma Studio
npm run db:studio
```
