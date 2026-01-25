# SaaS Mode - Application

Plateforme SaaS complète pour créer et lancer une marque de vêtements de A à Z avec IA.

## 🚀 Technologies

- **Next.js 16+** (App Router, TypeScript)
- **Tailwind CSS** (Design System)
- **Prisma** (ORM, PostgreSQL)
- **NextAuth.js v5** (Authentification)
- **ChatGPT API** (Scripts, Tech Packs)
- **Higgsfield API** (Designs, Virtual Try-On, Vidéos)

## 📁 Structure du Projet

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Routes authentification
│   ├── (dashboard)/      # Routes dashboard
│   ├── api/               # API Routes
│   └── ...
├── components/            # Composants React
│   ├── layout/           # Layout components
│   ├── modules/          # Modules spécifiques
│   └── ui/               # UI primitives
├── lib/                  # Utilities & helpers
│   ├── api/              # API clients (ChatGPT, Higgsfield)
│   ├── auth.ts           # Configuration NextAuth
│   └── ...
└── prisma/               # Prisma schema
```

## 🛠️ Installation

1. **Installer les dépendances** :
```bash
npm install
```

2. **Configurer les variables d'environnement** :
```bash
cp .env.example .env
# Éditer .env avec vos clés API
```

3. **Configurer la base de données** :
```bash
# Générer le client Prisma
npm run db:generate

# Créer la base de données (si nécessaire)
npm run db:push

# Ou utiliser les migrations
npm run db:migrate
```

4. **Lancer le serveur de développement** :
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📚 Documentation

- **Brief** : `docs/saas-brief.md`
- **PRD** : `docs/saas-prd.md`
- **Architecture** : `docs/saas-architecture.md`
- **UX/UI** : `docs/saas-ux-ui-spec.md`
- **Intégrations IA** : `docs/integrations-higgsfield-chatgpt.md`

## 🎯 Modules

1. **Launch Map** - Onboarding structuré (4 phases)
2. **Tendances & Hits** - Product Discovery
3. **Brand Spy** - Audit de marques concurrentes
4. **Design Studio IA** - Génération Tech Packs
5. **Sourcing Hub** - Base de données usines
6. **UGC AI Lab** - Marketing automatisé

## 🔑 Variables d'Environnement Requises

- `DATABASE_URL` - URL PostgreSQL
- `NEXTAUTH_SECRET` - Secret pour NextAuth (générer avec `openssl rand -base64 32`)
- `NEXTAUTH_URL` - URL de l'application (ex: http://localhost:3000)
- `CHATGPT_API_KEY` - Clé API ChatGPT (OpenAI)
- `HIGGSFIELD_API_KEY` - Clé API Higgsfield
- `HIGGSFIELD_API_URL` - URL API Higgsfield

## 📝 Scripts Disponibles

- `npm run dev` - Serveur de développement
- `npm run build` - Build production
- `npm run start` - Serveur production
- `npm run lint` - Linter
- `npm run db:generate` - Générer client Prisma
- `npm run db:push` - Push schema vers DB
- `npm run db:migrate` - Créer migration
- `npm run db:studio` - Ouvrir Prisma Studio

## 🔐 Authentification

L'authentification est implémentée avec NextAuth.js v5 :
- Pages login/signup : `/auth/signin` et `/auth/signup`
- Protection automatique des routes dashboard
- Gestion de session JWT
- Hashage des mots de passe avec bcrypt

## 🚧 Status

**MVP en développement**

- ✅ Setup projet Next.js
- ✅ Design System
- ✅ Composants UI de base
- ✅ Layout (Header, Sidebar)
- ✅ Prisma schema
- ✅ Clients API (ChatGPT, Higgsfield)
- ✅ Authentification (NextAuth v5)
- ⏳ Implémentation modules
- ⏳ Intégrations complètes

---

**Créé via BMAD-Method** 🎯
