# 🗄️ Configuration Base de Données

## ⚠️ Problème actuel

Votre `DATABASE_URL` utilise **Prisma Accelerate** (`prisma+postgres://...`), mais `db push` nécessite une **URL directe** PostgreSQL.

## ✅ Solution rapide

### Option 1 : Ajouter DIRECT_URL (Recommandé)

1. **Ajoutez dans votre `.env`** :

```env
# URL Accelerate (pour l'application)
DATABASE_URL="prisma+postgres://...?api_key=..."

# URL directe PostgreSQL (pour migrations)
DIRECT_URL="postgresql://user:password@localhost:5432/saas_mode?schema=public"
```

2. **Temporairement, modifiez `prisma/schema.prisma`** :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DIRECT_URL")  // Pour db push uniquement
}
```

3. **Exécutez** :
```bash
npm run db:push
```

4. **Remettez le schéma sans `url`** :
```prisma
datasource db {
  provider = "postgresql"
}
```

### Option 2 : Utiliser PostgreSQL local

1. **Installez PostgreSQL** (si pas déjà fait)

2. **Créez une base de données** :
```bash
createdb saas_mode
```

3. **Mettez à jour `.env`** :
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/saas_mode?schema=public"
```

4. **Exécutez** :
```bash
npm run db:push
```

### Option 3 : Utiliser Supabase (Gratuit)

1. Créez un compte sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Copiez la connection string depuis Settings > Database
4. Ajoutez dans `.env` :
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
```

5. **Exécutez** :
```bash
npm run db:push
```

## 📚 Documentation complète

Voir `docs/database-setup-prisma7.md` pour plus de détails.
