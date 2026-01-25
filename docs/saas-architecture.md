# Architecture Technique - Application SaaS Mode

*Document créé via BMAD-Method - Architect (Alex)*

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-23 | 1.0 | Création initiale de l'architecture technique | Architect (Alex) |

---

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Stack Technique](#stack-technique)
3. [Architecture Système](#architecture-système)
4. [Structure du Projet](#structure-du-projet)
5. [Modèle de Données](#modèle-de-données)
6. [APIs et Intégrations](#apis-et-intégrations)
7. [Sécurité et Conformité](#sécurité-et-conformité)
8. [Performance et Scalabilité](#performance-et-scalabilité)
9. [Déploiement et CI/CD](#déploiement-et-cicd)
10. [Roadmap Technique](#roadmap-technique)

---

## Vue d'Ensemble

### Objectif Architectural

Créer une architecture technique moderne, scalable et maintenable pour une application SaaS permettant de créer des marques de vêtements de A à Z avec IA. L'architecture doit supporter :

- **6 Modules** : Launch Map, Tendances & Hits, Brand Spy, Design Studio IA, Sourcing Hub, UGC AI Lab
- **Génération IA** : Designs, Tech Packs, Scripts, Vidéos
- **Intégrations multiples** : Higgsfield, ChatGPT, Airtable, Stripe
- **Scalabilité** : Support 1000+ utilisateurs simultanés
- **Performance** : Génération IA < 60 secondes, chargement < 3 secondes

### Principes Architecturaux

1. **Simplicité** : Architecture monolithique pour MVP, évite complexité inutile
2. **Scalabilité** : Structure extensible pour croissance future
3. **Performance** : Optimisation APIs IA, cache, queue système
4. **Maintenabilité** : Code modulaire, TypeScript, documentation claire
5. **Sécurité** : Conformité RGPD, HTTPS, validation données, API keys sécurisées
6. **Developer Experience** : Outils modernes, hot reload, déploiement automatique

---

## Stack Technique

### Frontend

| Composant | Technologie | Version | Rationale |
|-----------|------------|---------|-----------|
| **Framework** | Next.js | 14+ | SSR/SSG, App Router, API Routes intégrées |
| **Language** | TypeScript | 5.x | Type safety, meilleure DX |
| **Styling** | Tailwind CSS | 4.1+ | Design system cohérent, rapidité |
| **UI Components** | Radix UI / shadcn/ui | Latest | Composants accessibles, headless |
| **Forms** | React Hook Form | 7.60+ | Validation performante |
| **Validation** | Zod | 3.25+ | Validation TypeScript-first |
| **State Management** | Zustand / React Context | Latest | State management léger |
| **Icons** | Lucide React | Latest | Icons modernes, légers |

### Backend

| Composant | Technologie | Version | Rationale |
|-----------|------------|---------|-----------|
| **API Routes** | Next.js API Routes | 14+ | API intégrée, pas de backend séparé |
| **Database** | PostgreSQL | 14+ | Relations, ACID, scalable |
| **ORM** | Prisma | Latest | Type-safe, migrations, excellent DX |
| **Queue System** | BullMQ / Inngest | Latest | Gestion jobs asynchrones (génération IA) |
| **File Storage** | Vercel Blob / Cloudinary | - | Stockage images générées, CDN intégré |
| **Cache** | Upstash Redis | - | Cache résultats APIs, rate limiting |

### IA/ML

| Service | Technologie | Usage |
|---------|------------|-------|
| **Designs/Tech Packs** | Higgsfield API | Génération Flat Sketch, Tech Packs |
| **Scripts UGC** | ChatGPT API (GPT-4) | Génération scripts marketing |
| **Virtual Try-On** | Higgsfield API | Images mannequin avec vêtement |
| **Vidéos IA** | Higgsfield API | Vidéos avatar (Phase 2) |

### Services Externes

| Service | Technologie | Usage |
|---------|------------|-------|
| **Données** | Airtable API | User_Progress, Factories |
| **Paiements** | Stripe API | Abonnements, add-ons |
| **Analytics** | Vercel Analytics / Posthog | Tracking utilisateurs |
| **Monitoring** | Sentry | Error tracking, performance |
| **Email** | Resend / SendGrid | Emails transactionnels |

### Hosting & Infrastructure

| Composant | Technologie | Rationale |
|-----------|------------|-----------|
| **Hosting** | Vercel | Déploiement, CDN, edge functions |
| **Database** | Vercel Postgres / Supabase | PostgreSQL managé, backups automatiques |
| **Redis** | Upstash | Cache, queue, rate limiting |
| **Storage** | Vercel Blob | Images générées, CDN |

---

## Architecture Système

### Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                       │
│  Next.js App (React) - SSR/SSG - Responsive                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTPS
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    VERCEL (Hosting)                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js App Router                                   │   │
│  │  ├── Pages (SSR/SSG)                                  │   │
│  │  ├── API Routes (Serverless Functions)                │   │
│  │  └── Edge Functions (CDN)                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Queue System (BullMQ/Inngest)                         │   │
│  │  - Jobs génération IA (async)                           │   │
│  │  - Retry logic                                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Vercel Postgres / Supabase                           │   │
│  │  (Users, Brands, Designs, etc.)                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Upstash Redis                                        │   │
│  │  - Cache résultats APIs                                │   │
│  │  - Rate limiting                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Vercel Blob / Cloudinary                              │   │
│  │  - Images générées (designs, virtual try-on)           │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ APIs
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              SERVICES EXTERNES                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Higgsfield  │  │  ChatGPT     │  │  Airtable    │      │
│  │  (Designs,   │  │  (Scripts)   │  │  (Données)   │      │
│  │   Try-On,    │  │              │  │             │      │
│  │   Vidéos)    │  │              │  │             │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐                                          │
│  │  Stripe      │                                          │
│  │  (Paiements) │                                          │
│  └──────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
```

### Flux de Données

#### 1. Génération Design IA (Design Studio)

```
Client (Browser)
    ↓
Next.js API Route (/api/designs/generate)
    ↓
Queue System (BullMQ/Inngest)
    ↓
Worker Process
    ↓
Higgsfield API (génération IA - 30-60s)
    ↓
Vercel Blob (stockage image)
    ↓
PostgreSQL (sauvegarde metadata)
    ↓
WebSocket / Polling (notification client)
    ↓
Client (affichage résultat)
```

#### 2. Brand Spy (Analyse Concurrent)

```
Client (Browser)
    ↓
Next.js API Route (/api/brand-spy/analyze)
    ↓
Parallèle :
  ├─ Scraping Shopify (thème, apps)
  ├─ SimilarWeb Free (trafic)
  ├─ Facebook Ad Library (publicités)
  └─ BuiltWith Free (stack)
    ↓
PostgreSQL (sauvegarde analyse)
    ↓
Client (affichage résultats)
```

#### 3. Sourcing Hub (Demande Devis)

```
Client (Browser)
    ↓
Next.js API Route (/api/sourcing/quote)
    ↓
PostgreSQL (sauvegarde demande)
    ↓
Email Service (Resend) → Usine
    ↓
Airtable (tracking)
    ↓
Client (confirmation)
```

#### 4. UGC AI Lab (Virtual Try-On)

```
Client (Browser)
    ↓
Upload logo/design
    ↓
Next.js API Route (/api/ugc/virtual-tryon)
    ↓
Queue System
    ↓
Higgsfield API (Virtual Try-On - 30-60s)
    ↓
Vercel Blob (stockage image)
    ↓
PostgreSQL (sauvegarde)
    ↓
Client (affichage résultat)
```

---

## Structure du Projet

### Organisation des Dossiers

```
saas-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Route group auth
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/             # Route group dashboard
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── brands/              # Gestion marques
│   │   │   ├── [id]/
│   │   │   │   ├── launch-map/ # Launch Map
│   │   │   │   ├── designs/     # Design Studio
│   │   │   │   ├── sourcing/   # Sourcing Hub
│   │   │   │   └── marketing/  # UGC Lab
│   │   │   └── new/            # Créer nouvelle marque
│   ├── (modules)/               # Route group modules
│   │   ├── trends/             # Tendances & Hits
│   │   ├── brand-spy/           # Brand Spy
│   │   └── ...
│   ├── api/                     # API Routes
│   │   ├── auth/                # Authentification
│   │   ├── designs/            # Design Studio API
│   │   │   ├── generate/       # Génération IA
│   │   │   ├── [id]/           # Gestion design
│   │   │   └── export/         # Export PDF
│   │   ├── sourcing/           # Sourcing Hub API
│   │   │   ├── factories/      # Liste usines
│   │   │   └── quotes/         # Demandes devis
│   │   ├── ugc/                # UGC AI Lab API
│   │   │   ├── virtual-tryon/ # Virtual Try-On
│   │   │   ├── scripts/        # Scripts génération
│   │   │   └── videos/         # Vidéos IA (Phase 2)
│   │   ├── brand-spy/          # Brand Spy API
│   │   │   └── analyze/        # Analyse URL
│   │   ├── trends/             # Tendances API (Phase 2)
│   │   └── launch-map/         # Launch Map API
│   │       └── progress/       # Progression
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles
│
├── components/                   # Composants React
│   ├── layout/                  # Layout components
│   │   ├── Navigation.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── modules/                 # Modules spécifiques
│   │   ├── launch-map/         # Launch Map components
│   │   │   ├── Stepper.tsx
│   │   │   ├── Phase1Calculator.tsx
│   │   │   ├── Phase2Design.tsx
│   │   │   ├── Phase3Sourcing.tsx
│   │   │   └── Phase4Marketing.tsx
│   │   ├── design-studio/      # Design Studio components
│   │   │   ├── PromptBuilder.tsx
│   │   │   ├── DesignGenerator.tsx
│   │   │   ├── TechPackViewer.tsx
│   │   │   └── DesignLibrary.tsx
│   │   ├── sourcing/           # Sourcing Hub components
│   │   │   ├── FactoryList.tsx
│   │   │   ├── FactoryCard.tsx
│   │   │   ├── FactoryFilters.tsx
│   │   │   └── QuoteForm.tsx
│   │   ├── ugc-lab/            # UGC AI Lab components
│   │   │   ├── VirtualTryOn.tsx
│   │   │   ├── ScriptGenerator.tsx
│   │   │   └── VideoGenerator.tsx
│   │   ├── brand-spy/          # Brand Spy components
│   │   │   ├── AnalysisForm.tsx
│   │   │   ├── AnalysisResults.tsx
│   │   │   └── ComparisonView.tsx
│   │   └── trends/             # Tendances components (Phase 2)
│   │       ├── ProductGallery.tsx
│   │       └── ProductFilters.tsx
│   ├── ui/                     # UI primitives (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── shared/                 # Composants partagés
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── Toast.tsx
│
├── lib/                         # Utilities & helpers
│   ├── utils.ts                # General utilities
│   ├── api/                     # API clients
│   │   ├── higgsfield.ts       # Higgsfield API client
│   │   ├── chatgpt.ts          # ChatGPT API client
│   │   ├── airtable.ts         # Airtable API client
│   │   └── stripe.ts           # Stripe API client
│   ├── queue/                  # Queue system
│   │   ├── jobs.ts             # Job definitions
│   │   └── workers.ts          # Worker processes
│   ├── ai/                     # IA utilities
│   │   ├── prompts.ts          # Prompts templates
│   │   └── validators.ts       # Validation résultats IA
│   └── validations/            # Zod schemas
│       ├── design.ts
│       ├── sourcing.ts
│       └── ugc.ts
│
├── prisma/                      # Database schema & migrations
│   ├── schema.prisma
│   └── migrations/
│
├── types/                       # TypeScript types
│   ├── user.ts
│   ├── brand.ts
│   ├── design.ts
│   ├── factory.ts
│   └── api.ts
│
├── workers/                     # Background workers
│   ├── design-generator.ts     # Worker génération designs
│   ├── ugc-generator.ts        # Worker génération UGC
│   └── brand-analyzer.ts       # Worker analyse marques
│
├── docs/                        # Documentation
│   ├── saas-brief.md
│   ├── saas-prd.md
│   └── saas-architecture.md    # Ce document
│
├── .env.local                   # Environment variables (gitignored)
├── .env.example                 # Example env file
├── next.config.mjs              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── postcss.config.mjs          # PostCSS config
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
└── README.md                   # Project README
```

### Conventions de Nommage

- **Fichiers** : `kebab-case` (ex: `design-generator.tsx`)
- **Composants** : `PascalCase` (ex: `DesignGenerator.tsx`)
- **Fonctions/Utils** : `camelCase` (ex: `generateDesign()`)
- **Types/Interfaces** : `PascalCase` (ex: `Design`, `DesignProps`)
- **Constantes** : `UPPER_SNAKE_CASE` (ex: `API_BASE_URL`)

---

## Modèle de Données

### Schéma de Base de Données (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Users
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  plan          String   @default("free") // free, pro, enterprise
  stripeCustomerId String? @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  brands        Brand[]
  designs       Design[]
  brandAnalyses BrandAnalysis[]
  marketingAssets MarketingAsset[]

  @@index([email])
  @@index([plan])
  @@map("users")
}

// Brands
model Brand {
  id                String   @id @default(cuid())
  userId            String
  name              String
  status            String   @default("draft") // draft, in_progress, completed
  launchMapProgress Json?   // { phase1: boolean, phase2: boolean, ... }
  calculatorResults Json?   // { margeNette: number, ... }
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  designs           Design[]
  quoteRequests     QuoteRequest[]
  marketingAssets   MarketingAsset[]

  @@index([userId])
  @@index([status])
  @@map("brands")
}

// Designs
model Design {
  id            String   @id @default(cuid())
  brandId       String
  userId        String
  type          String   // T-shirt, Hoodie, etc.
  cut           String?  // oversized, slim
  details       Json?    // { coutures: string, poches: string, ... }
  material      String?
  flatSketchUrl String?  // URL Vercel Blob
  techPack      Json     // { tissu: string, bordCote: string, ... }
  prompt        String   // Prompt utilisé pour génération
  status        String   @default("generating") // generating, completed, failed
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  brand         Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)
  quoteRequests QuoteRequest[]

  @@index([brandId])
  @@index([userId])
  @@index([status])
  @@map("designs")
}

// Factories (Sourcing Hub)
// Note: Données principales dans Airtable, PostgreSQL pour cache/relations
model Factory {
  id            String   @id @default(cuid())
  airtableId    String   @unique // ID Airtable
  name          String
  country       String
  moq           Int      // Minimum Order Quantity
  specialties   String[] // ["Expert Jersey 400GSM+", ...]
  deliveryTime  String   // "4-6 weeks"
  contact       String?
  rating        Float?   // 1-5 (Phase 2)
  cachedAt     DateTime @default(now())

  quoteRequests QuoteRequest[]

  @@index([country])
  @@index([moq])
  @@map("factories")
}

// Quote Requests
model QuoteRequest {
  id            String   @id @default(cuid())
  brandId       String
  designId      String
  factoryId     String
  status        String   @default("sent") // sent, read, responded
  message       String?  @db.Text
  sentAt        DateTime @default(now())
  respondedAt   DateTime?

  brand         Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)
  design        Design   @relation(fields: [designId], references: [id], onDelete: Cascade)
  factory       Factory  @relation(fields: [factoryId], references: [id])

  @@index([brandId])
  @@index([factoryId])
  @@index([status])
  @@map("quote_requests")
}

// Brand Analyses (Brand Spy)
model BrandAnalysis {
  id              String   @id @default(cuid())
  userId          String
  shopifyUrl      String
  estimatedRevenue Float?
  techStack       String[] // ["Klaviyo", "Loox", ...]
  theme           String?
  adStrategy      Json?    // { platforms: string[], count: number }
  analyzedAt      DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([shopifyUrl])
  @@map("brand_analyses")
}

// Marketing Assets (UGC Lab)
model MarketingAsset {
  id            String   @id @default(cuid())
  brandId       String
  userId        String
  type          String   // virtual_tryon, script, video
  content       String   // URL ou texte
  prompt        String?  // Prompt utilisé
  status        String   @default("generating") // generating, completed, failed
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  brand         Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)

  @@index([brandId])
  @@index([userId])
  @@index([type])
  @@map("marketing_assets")
}

// Trend Products (Tendances & Hits - Phase 2)
model TrendProduct {
  id                String   @id @default(cuid())
  category          String
  style             String
  material          String
  averagePrice      Float
  trendScore        Float
  saturabilityScore Float
  imageUrl          String
  updatedAt         DateTime @default(now())

  @@index([category])
  @@index([style])
  @@index([trendScore])
  @@map("trend_products")
}
```

### Airtable Schema (Données Complémentaires)

**Table User_Progress** :
- userId (Text)
- brandId (Text)
- phase1_completed (Checkbox)
- phase2_completed (Checkbox)
- phase3_completed (Checkbox)
- phase4_completed (Checkbox)
- calculator_results (JSON)

**Table Factories** :
- name (Text)
- country (Single Select)
- moq (Number)
- specialties (Multiple Selects)
- deliveryTime (Text)
- contact (Email/Phone)
- rating (Number) - Phase 2

---

## APIs et Intégrations

### API Routes Next.js

#### 1. Design Studio API (`/api/designs/*`)

```typescript
// app/api/designs/generate/route.ts
POST /api/designs/generate
Body: {
  brandId: string,
  type: string,
  cut: string,
  details: object,
  material: string
}
Response: {
  jobId: string,
  status: "queued"
}

// Polling ou WebSocket pour résultats
GET /api/designs/[id]/status
Response: {
  status: "generating" | "completed" | "failed",
  flatSketchUrl?: string,
  techPack?: object
}
```

**Flow** :
1. Validation input (Zod)
2. Vérification limites plan utilisateur
3. Création job dans queue
4. Worker génère avec Higgsfield
5. Stockage résultat (Vercel Blob)
6. Sauvegarde metadata (PostgreSQL)
7. Notification client (WebSocket ou polling)

---

#### 2. Sourcing Hub API (`/api/sourcing/*`)

```typescript
// app/api/sourcing/factories/route.ts
GET /api/sourcing/factories?country=Portugal&moq=100
Response: {
  factories: Factory[],
  total: number
}

// app/api/sourcing/quotes/route.ts
POST /api/sourcing/quotes
Body: {
  brandId: string,
  designId: string,
  factoryIds: string[],
  message?: string
}
Response: {
  quoteRequests: QuoteRequest[],
  success: boolean
}
```

**Flow** :
1. Récupération usines (Airtable + cache PostgreSQL)
2. Filtrage selon critères
3. Création demandes devis
4. Envoi emails (Resend)
5. Sauvegarde tracking (PostgreSQL + Airtable)

---

#### 3. UGC AI Lab API (`/api/ugc/*`)

```typescript
// app/api/ugc/virtual-tryon/route.ts
POST /api/ugc/virtual-tryon
Body: {
  brandId: string,
  designUrl: string,
  garmentType: string
}
Response: {
  jobId: string,
  status: "queued"
}

// app/api/ugc/scripts/route.ts
POST /api/ugc/scripts
Body: {
  brandId: string,
  count: number
}
Response: {
  scripts: string[]
}
```

**Flow** :
1. Validation input
2. Vérification limites plan
3. Queue job (Virtual Try-On) ou génération directe (Scripts)
4. Worker génère avec IA
5. Stockage résultat
6. Notification client

---

#### 4. Brand Spy API (`/api/brand-spy/*`)

```typescript
// app/api/brand-spy/analyze/route.ts
POST /api/brand-spy/analyze
Body: {
  shopifyUrl: string
}
Response: {
  analysisId: string,
  status: "analyzing"
}

// Polling pour résultats
GET /api/brand-spy/analyze/[id]
Response: {
  estimatedRevenue: number,
  techStack: string[],
  theme: string,
  adStrategy: object
}
```

**Flow** :
1. Validation URL Shopify
2. Scraping parallèle (thème, apps, publicités)
3. Estimation trafic (SimilarWeb Free)
4. Calcul indicateurs
5. Sauvegarde analyse
6. Retour résultats

---

#### 5. Launch Map API (`/api/launch-map/*`)

```typescript
// app/api/launch-map/progress/route.ts
GET /api/launch-map/progress?brandId=xxx
Response: {
  phase1: boolean,
  phase2: boolean,
  phase3: boolean,
  phase4: boolean,
  calculatorResults?: object
}

POST /api/launch-map/progress
Body: {
  brandId: string,
  phase: number,
  completed: boolean,
  data?: object
}
```

**Flow** :
1. Récupération progression (Airtable)
2. Mise à jour phase
3. Sauvegarde Airtable + PostgreSQL
4. Retour progression mise à jour

---

### Intégrations Externes

#### Higgsfield API (Designs, Virtual Try-On, Vidéos)

```typescript
// lib/api/higgsfield.ts
// Note: Adapter selon la documentation officielle Higgsfield

export async function generateFlatSketch(prompt: string) {
  // Exemple d'intégration (à adapter selon API Higgsfield)
  const response = await fetch('https://api.higgsfield.ai/v1/images/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HIGGSFIELD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: `Technical fashion flat sketch, ${prompt}, black and white, front and back view`,
      width: 1024,
      height: 1024,
      model: 'fashion-flat-sketch', // À adapter selon modèles disponibles
    }),
  });
  
  const data = await response.json();
  return data.imageUrl; // URL image générée
}

export async function generateVirtualTryOn(designUrl: string, garmentType: string) {
  const response = await fetch('https://api.higgsfield.ai/v1/images/virtual-tryon', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HIGGSFIELD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      designUrl,
      garmentType,
      model: 'virtual-tryon', // À adapter
    }),
  });
  
  const data = await response.json();
  return data.imageUrl;
}

export async function generateVideo(script: string, avatarId: string) {
  // Phase 2 - Vidéos IA
  const response = await fetch('https://api.higgsfield.ai/v1/videos/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HIGGSFIELD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      script,
      avatarId,
      duration: 15, // secondes
    }),
  });
  
  const data = await response.json();
  return data.videoUrl;
}

export async function generateTechPack(designData: object) {
  // Utiliser modèle spécialisé tech pack ou GPT-4 pour générer composants
  const techPack = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "You are a fashion tech pack expert. Generate a tech pack from design data."
    }, {
      role: "user",
      content: JSON.stringify(designData)
    }]
  });
  
  return JSON.parse(techPack.choices[0].message.content);
}
```

---

#### ChatGPT API (Scripts UGC)

```typescript
// lib/api/chatgpt.ts
// Utilisation de l'API OpenAI (ChatGPT)
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY, // Ou OPENAI_API_KEY
});

export async function generateUGCScripts(brandName: string, count: number = 5) {
  const scripts = [];
  
  for (let i = 0; i < count; i++) {
    const script = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are a viral UGC script writer for fashion brands. Create 15-second scripts following: Problem → Solution → Proof → CTA"
      }, {
        role: "user",
        content: `Generate a viral UGC script for ${brandName} fashion brand. Make it engaging and TikTok/Instagram ready.`
      }]
    });
    
    scripts.push(script.choices[0].message.content);
  }
  
  return scripts;
}
```

---

#### Airtable API

```typescript
// lib/api/airtable.ts
import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

export async function updateUserProgress(userId: string, brandId: string, data: object) {
  return base("User_Progress").create({
    userId,
    brandId,
    ...data
  });
}

export async function getFactories(filters?: object) {
  let query = base("Factories").select();
  
  if (filters) {
    // Appliquer filtres
    Object.entries(filters).forEach(([field, value]) => {
      query = query.filterByFormula(`{${field}} = "${value}"`);
    });
  }
  
  return query.all();
}
```

---

#### Stripe API (Paiements)

```typescript
// lib/api/stripe.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createSubscription(customerId: string, planId: string) {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: planId }],
  });
}

export async function checkUserLimits(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  const limits = {
    free: { designs: 3, ugc: { images: 5, scripts: 10, videos: 0 } },
    pro: { designs: -1, ugc: { images: -1, scripts: -1, videos: 0 } },
    enterprise: { designs: -1, ugc: { images: -1, scripts: -1, videos: -1 } }
  };
  
  return limits[user.plan] || limits.free;
}
```

---

## Sécurité et Conformité

### RGPD Compliance

1. **Consentement** : Bannière cookies avec choix
2. **Politique Confidentialité** : Page dédiée
3. **Droit à l'Oubli** : API pour suppression données
4. **Export Données** : API pour export données utilisateur
5. **HTTPS** : Obligatoire (automatique Vercel)

### Sécurité des Données

1. **Validation** : Zod schemas pour toutes les entrées
2. **Sanitization** : Nettoyage inputs (XSS prevention)
3. **Rate Limiting** : Upstash Redis pour limiter requêtes
4. **API Keys** : Variables d'environnement (`.env.local`, jamais commitées)
5. **CORS** : Configuration stricte pour APIs
6. **Authentication** : NextAuth.js pour gestion sessions

### Variables d'Environnement

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Airtable
AIRTABLE_API_KEY="xxx"
AIRTABLE_BASE_ID="xxx"

# Higgsfield
HIGGSFIELD_API_KEY="xxx"
HIGGSFIELD_API_URL="https://api.higgsfield.ai" # À adapter selon URL réelle

# ChatGPT (OpenAI)
CHATGPT_API_KEY="xxx" # Ou OPENAI_API_KEY

# Stripe
STRIPE_SECRET_KEY="xxx"
STRIPE_PUBLISHABLE_KEY="xxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="xxx"

# Note: Vidéos IA via Higgsfield (pas besoin de HeyGen séparé)

# Upstash Redis
UPSTASH_REDIS_REST_URL="xxx"
UPSTASH_REDIS_REST_TOKEN="xxx"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="xxx"

# App
NEXT_PUBLIC_APP_URL="https://yourapp.com"
NODE_ENV="production"
```

---

## Performance et Scalabilité

### Optimisations

1. **Queue System** : Jobs asynchrones pour génération IA (évite timeouts)
2. **Cache** : Upstash Redis pour résultats APIs (1h TTL)
3. **CDN** : Vercel Blob pour images générées
4. **Rate Limiting** : Protection APIs avec Upstash
5. **Image Optimization** : Next.js Image component (WebP, lazy loading)
6. **Code Splitting** : Dynamic imports pour modules lourds

### Monitoring Performance

1. **Vercel Analytics** : Métriques automatiques
2. **Sentry** : Error tracking, performance monitoring
3. **Lighthouse CI** : Tests performance automatisés
4. **Web Vitals** : Core Web Vitals tracking

### Scalabilité

**MVP** : Monolith Next.js (1000+ utilisateurs)  
**Phase 2** : 
- Microservices si nécessaire
- Workers séparés pour génération IA
- Database read replicas

---

## Déploiement et CI/CD

### Déploiement Vercel

1. **Git Integration** : Push sur `main` → déploiement automatique
2. **Preview Deployments** : Branches → preview URLs
3. **Environment Variables** : Configuration via dashboard Vercel
4. **Database** : Vercel Postgres intégré

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
```

---

## Roadmap Technique

### Phase 1 : MVP (3-4 mois)

**Modules** :
- ✅ Launch Map (onboarding complet)
- ✅ Design Studio IA (génération tech packs)
- ✅ Sourcing Hub (20-30 usines, demande devis)
- ✅ UGC AI Lab (Virtual Try-On + Scripts)

**Infrastructure** :
- ✅ Next.js setup
- ✅ PostgreSQL + Prisma
- ✅ Airtable intégration
- ✅ Queue system (BullMQ/Inngest)
- ✅ Higgsfield API
- ✅ ChatGPT API
- ✅ Stripe intégration

**Exclusions** :
- ❌ Tendances & Hits (Phase 2)
- ❌ Brand Spy (Phase 2)
- ❌ Vidéos IA (Phase 2 - trop cher)

---

### Phase 2 : Post-MVP (6-12 mois)

**Modules à Ajouter** :
- ⏳ Tendances & Hits
- ⏳ Brand Spy
- ⏳ Vidéos IA (Higgsfield)

**Infrastructure à Ajouter** :
- ⏳ Scraping services (Tendances, Brand Spy)
- ⏳ Vidéos IA via Higgsfield (si pas déjà inclus)
- ⏳ Analytics avancés
- ⏳ Microservices (si nécessaire)

---

## Décisions Techniques Clés

### Pourquoi Next.js ?

- **SSR/SSG** : SEO optimal, performance
- **App Router** : Routing moderne, layouts
- **API Routes** : Backend intégré
- **Vercel** : Déploiement optimisé
- **Écosystème** : Large communauté

### Pourquoi Queue System ?

- **Génération IA longue** : 30-60 secondes (timeout API Routes)
- **Retry logic** : Gestion erreurs APIs
- **Scalabilité** : Workers séparés
- **UX** : Pas de timeout côté client

### Pourquoi Airtable + PostgreSQL ?

- **Airtable** : Données complémentaires (User_Progress, Factories)
- **PostgreSQL** : Relations complexes (Users, Brands, Designs)
- **Hybride** : Meilleur des deux mondes

### Pourquoi Upstash Redis ?

- **Cache** : Résultats APIs (réduit coûts)
- **Rate Limiting** : Protection APIs
- **Queue** : Alternative à BullMQ (serverless)
- **Vercel compatible** : Intégration native

---

## Prochaines Étapes

1. ✅ **Architecture validée** (ce document)
2. ⏳ **Setup projet Next.js** : Initialisation, structure
3. ⏳ **Configuration base de données** : Prisma, migrations
4. ⏳ **Intégrations APIs** : Higgsfield, ChatGPT, Airtable, Stripe
5. ⏳ **Queue system** : BullMQ/Inngest setup
6. ⏳ **Développement MVP** : Modules prioritaires

---

**Document créé par** : Architect (Alex) via BMAD-Method  
**Date** : 2025-01-23  
**Version** : 1.0  
**Status** : Ready for Development
