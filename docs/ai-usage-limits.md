# Système de jetons IA

## Objectif

Gestion de la consommation IA par **jetons** (1€ = 100 jetons). Le plan de base (34€) = 3400 jetons/mois. Affichage en temps réel dans la navbar et sur chaque bouton de génération.

## Architecture

### 1. Modèle de données (`AIUsage`)

Chaque appel IA est enregistré avec :
- `userId`
- `feature` (ex: `ugc_scripts`, `brand_strategy`)
- `costEur` (coût estimé en €)
- `metadata` (optionnel, pour debug)

### 2. Configuration (`lib/ai-usage-config.ts`)

- **Système de jetons** : 1€ = 100 jetons
- **Budget par plan** :
  - `free` / `starter` : 5€ = 500 jetons
  - `base` : 34€ = 3400 jetons
  - `growth` : 75€ = 7500 jetons
  - `pro` : 150€ = 15 000 jetons
  - `enterprise` : illimité
- **Limites par feature** : stratégie (10×/mois base), recommandations (30×/mois), virtual try-on (5×/mois base)

### 3. Utilitaires (`lib/ai-usage.ts`)

- `checkAIUsageLimit(userId, plan, feature)` : vérifie si l'appel est autorisé
- `recordAIUsage(userId, feature, metadata)` : enregistre la consommation
- `withAIUsageLimit(userId, plan, feature, fn, metadata)` : wrapper complet (vérifie + exécute + enregistre)

## Intégration dans une route IA

```typescript
import { withAIUsageLimit } from '@/lib/ai-usage';

// Dans votre route POST :
const user = await getCurrentUser();
if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

const result = await withAIUsageLimit(
  user.id,
  user.plan,
  'ugc_scripts',  // ou autre clé de ai-usage-config.ts
  () => generateUGCScripts(...),
  { brandId }    // metadata optionnel
);
```

Si le quota est dépassé, `withAIUsageLimit` lance une `Error` avec un message explicite pour l'utilisateur.

## Routes à intégrer (priorité)

**Tech pack, mockups, design** : créés par l'utilisateur (pas d'IA) — pas de limite à intégrer.

| Route | Feature key |
|-------|-------------|
| `POST /api/ugc/scripts` | `ugc_scripts` ✅ |
| `POST /api/brands/[id]/generate-logo` | `brand_logo` |
| `POST /api/brands/strategy` | `brand_strategy` |
| `POST /api/brands/analyze` | `brand_analyze` |
| `POST /api/launch-map/recommendations` | `launch_map_recommendations` |
| `POST /api/launch-map/extract-content-frequency` | `launch_map_extract_frequency` |
| `POST /api/launch-map/apply-strategy-and-reset` | `launch_map_apply_strategy` |
| `POST /api/launch-map/site-creation-todo` | `launch_map_todo` |
| `POST /api/launch-map/site-texts` | `launch_map_site_texts` |
| `POST /api/launch-map/generate-structured-post` | `launch_map_structured_post` |
| `POST /api/launch-map/generate-posts-from-strategy` | `launch_map_posts_from_strategy` |
| `POST /api/trends/generate-product-image` | `trends_generate_image` |
| `POST /api/trends/analyse-ia` | `trends_analyse` |
| `POST /api/ugc/shooting-photo` | `ugc_shooting_photo` |
| `POST /api/ugc/shooting-product` | `ugc_shooting_product` |
| `POST /api/ugc/generate-mannequin` | `ugc_generate_mannequin` |
| `POST /api/ugc/virtual-tryon` | `ugc_virtual_tryon` |

## API Consommation

`GET /api/usage/ai` — Retourne la consommation du mois :

```json
{
  "used": 2.34,
  "budget": 34,
  "remaining": 31.66,
  "tokens": 3166,
  "tokensBudget": 3400,
  "plan": "base",
  "costs": { "brand_strategy": 6, "ugc_scripts": 3, ... }
}
```

## Affichage UI

### Navbar (Header)
- **TokenDisplay** : jauge + "X / Y jetons"
- Couleurs : vert (>30%), orange (15-30%), rouge (<15%)
- Rafraîchit après chaque génération (`usage:refresh`)

### Sidebar
- Encart compact "X jetons / Y" en bas

### Boutons de génération
- **GenerationCostBadge** : "(X jetons)" à côté de chaque CTA IA
- Composant : `@/components/ui/generation-cost-badge`
- Hook : `useAIUsage()` pour `costFor(feature)` et `refresh`

## Migration Prisma

```bash
npx prisma migrate dev --name add-ai-usage
```

## Personnalisation des coûts

Modifier `lib/ai-usage-config.ts` pour ajuster :
- `AI_FEATURE_COSTS` : coût par fonctionnalité
- `AI_BUDGET_BY_PLAN` : budget mensuel par plan
