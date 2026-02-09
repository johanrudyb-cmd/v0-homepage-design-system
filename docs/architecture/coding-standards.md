# Standards de code - OUTFITY

Référence pour l'agent Dev BMAD. Voir aussi `docs/saas-architecture.md`.

## Langage & typage
- TypeScript strict. Pas de `any` sauf cas documenté.
- Nommage : camelCase (variables, fonctions), PascalCase (composants, types).

## React / Next.js
- Composants fonctionnels, hooks. Server Components par défaut ; `'use client'` si état ou événements.
- Fichiers : un composant principal par fichier, nom du fichier = nom du composant (PascalCase).
- Routes : App Router dans `app/`. API dans `app/api/`.

## Styles
- Tailwind CSS. Pas de CSS global sauf variables/thème.
- Composants UI réutilisables dans `components/ui/`.

## Données
- Prisma pour la BDD. Requêtes dans les Server Components ou API routes.
- Pas de requêtes directes depuis les Client Components ; passer les données en props ou utiliser API.

## Qualité
- Lint : `npm run lint`. Pas d’erreurs avant commit.
- Imports : chemins `@/` pour `components`, `lib`, `app`.
