# Configuration de la Base de Données

## 📋 Prérequis

Vous devez avoir une base de données PostgreSQL disponible. Options :

### Option 1 : PostgreSQL Local
- Installer PostgreSQL sur votre machine
- Créer une base de données : `createdb saas_mode`

### Option 2 : Supabase (Recommandé - Gratuit)
1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Copier la connection string depuis Settings > Database

### Option 3 : Vercel Postgres (Recommandé pour production)
1. Créer un projet Vercel
2. Ajouter Vercel Postgres depuis le dashboard
3. Copier la connection string

### Option 4 : Neon (Recommandé - Gratuit)
1. Créer un compte sur [neon.tech](https://neon.tech)
2. Créer un nouveau projet
3. Copier la connection string

## 🔧 Configuration

1. **Créer le fichier `.env`** à la racine du projet :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/saas_mode?schema=public"

# NextAuth
NEXTAUTH_SECRET="votre-secret-aleatoire-ici"
NEXTAUTH_URL="http://localhost:3000"

# ChatGPT API
CHATGPT_API_KEY="votre-cle-openai"

# Higgsfield API
HIGGSFIELD_API_KEY="votre-cle-higgsfield"
HIGGSFIELD_API_URL="https://api.higgsfield.ai"
```

2. **Générer le secret NextAuth** :
```bash
# Sur Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Ou utiliser un générateur en ligne : https://generate-secret.vercel.app/32
```

3. **Générer le client Prisma** :
```bash
npm run db:generate
```

4. **Créer les tables dans la base de données** :
```bash
# Option 1 : Push direct (développement)
npm run db:push

# Option 2 : Migration (production)
npm run db:migrate
```

## ✅ Vérification

Après avoir exécuté `db:push` ou `db:migrate`, vous devriez voir :
- ✅ Tables créées : User, Account, Session, VerificationToken, Brand, LaunchMap, Design, Factory, Quote, BrandSpyAnalysis
- ✅ Relations configurées
- ✅ Indexes créés

## 🛠️ Commandes Utiles

```bash
# Générer le client Prisma
npm run db:generate

# Push le schéma vers la DB (développement)
npm run db:push

# Créer une migration
npm run db:migrate

# Ouvrir Prisma Studio (interface graphique)
npm run db:studio
```

## 🐛 Dépannage

### Erreur : "Can't reach database server"
- Vérifiez que PostgreSQL est démarré
- Vérifiez que `DATABASE_URL` est correct
- Vérifiez les credentials (user/password)

### Erreur : "Database does not exist"
- Créez la base de données : `createdb saas_mode`
- Ou utilisez une base de données existante dans `DATABASE_URL`

### Erreur : "Schema does not exist"
- Ajoutez `?schema=public` à la fin de `DATABASE_URL`
