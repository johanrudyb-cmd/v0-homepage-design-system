# Design System Mode/Fashion - OUTFITY

*Document créé via BMAD-Method - UX Expert*

## Date
2025-01-23

## Objectif
Créer une identité visuelle **mode/fashion** distinctive, élégante et professionnelle, différente des outils génériques comme Copify.

## Identité Visuelle

### Philosophie
- **Élégant** : Design épuré avec espacements généreux
- **Mode** : Palette de couleurs inspirée des marques de luxe
- **Professionnel** : Outil sérieux pour créateurs de mode
- **Moderne** : Typographie élégante, animations subtiles

## Palette de Couleurs

### Couleurs Principales

```css
/* Primary - Noir Mode (comme les marques de luxe) */
--primary: 0 0% 10%;           /* Noir mode */
--primary-foreground: 0 0% 98%; /* Blanc */

/* Secondary - Beige/Camel Mode */
--secondary: 35 20% 85%;       /* Beige mode */
--secondary-foreground: 0 0% 15%;

/* Accent - Doré Mode (accent premium) */
--accent: 45 100% 50%;         /* Doré mode */
--accent-foreground: 0 0% 10%;

/* Muted - Beige clair */
--muted: 35 15% 95%;           /* Beige très clair */
--muted-foreground: 0 0% 40%;

/* Border - Beige subtil */
--border: 35 10% 88%;          /* Beige subtil */
```

### Inspiration
- **Noir** : Élégance, sophistication (comme les marques de luxe)
- **Beige/Camel** : Mode, chaleur, premium
- **Doré** : Accent premium, CTA importants
- **Blanc** : Pureté, espace, clarté

## Typographie

### Fonts
- **Sans-serif** : Inter (300, 400, 500, 600) - Texte principal
- **Display** : Playfair Display (400, 500, 600) - Titres élégants

### Hiérarchie
- **H1** : `text-4xl lg:text-5xl`, `font-light`, `tracking-[0.1em]`
- **H2** : `text-3xl lg:text-4xl`, `font-light`, `tracking-[0.03em]`
- **H3** : `text-2xl lg:text-3xl`, `font-light`
- **Body** : `font-light`, `leading-relaxed`, `tracking-wide`

### Caractéristiques
- **Letter-spacing** : Généreux pour élégance
- **Font-weight** : Light (300) pour modernité
- **Line-height** : Relaxed pour aération

## Composants UI

### Button
- **Style** : Arrondis subtils (`rounded-sm`)
- **Typography** : `font-light`, `tracking-wider`, `uppercase` pour variants default/outline
- **Variants** :
  - `default` : Noir sur blanc (mode)
  - `outline` : Bordure noire, hover inversé
  - `ghost` : Transparent, hover subtil

### Card
- **Style** : Bordure subtile (`border-border/50`)
- **Background** : Blanc pur ou `bg-card/50` pour transparence
- **Hover** : `hover:border-foreground/40` pour interaction

### Input
- **Style** : Arrondis subtils, bordure beige
- **Typography** : `font-light`, `tracking-wide`
- **Height** : `h-11` pour confort

## Layout

### Sidebar
- **Width** : 288px (w-72)
- **Background** : Beige très clair (`--sidebar-background`)
- **Logo** : Cercle noir avec initiales "SM"
- **Navigation** : Typographie légère, espacements généreux
- **Active state** : Bordure gauche noire (`border-l-2`)

### Header
- **Height** : 80px (h-20)
- **Background** : Blanc avec backdrop-blur
- **Search** : Input élégant avec icône
- **User** : Avatar circulaire noir

### Main Content
- **Padding** : 48px (p-12)
- **Max-width** : 7xl (1280px) centré
- **Espacement** : 48px entre sections (space-y-12)

## Éléments Visuels Mode

### Séparateurs
- Lignes fines (`h-px`) avec `bg-foreground/20`
- Utilisés pour séparer les sections élégamment

### Badges
- Arrondis (`rounded-full`)
- Fond accent avec transparence (`bg-accent/20`)
- Typographie : `text-[10px]`, `uppercase`, `tracking-wider`

### Transitions
- Toutes les interactions ont des transitions douces
- Hover states subtils et élégants

## Différences avec Copify

| Élément | Copify (Tech) | OUTFITY (Mode) |
|---------|---------------|------------------|
| **Couleurs** | Bleu tech | Noir/Beige/Doré |
| **Typographie** | Medium/Bold | Light (300) |
| **Letter-spacing** | Tight | Wide/Generous |
| **Arrondis** | Rounded-lg | Rounded-sm (subtils) |
| **Espacements** | Standards | Généreux |
| **Identité** | Outil générique | Mode/Fashion |

## Application

### Pages Mises à Jour
- ✅ Page d'accueil (`app/page.tsx`)
- ✅ Dashboard (`app/dashboard/page.tsx`)
- ✅ Signin/Signup (`app/auth/*`)
- ✅ Sidebar (`components/layout/Sidebar.tsx`)
- ✅ Header (`components/layout/Header.tsx`)
- ✅ Composants UI (Button, Card, Input)

### Pages à Mettre à Jour
- ⏳ Toutes les autres pages (trends, brands, spy, sourcing, ugc, design-studio, launch-map)

## Résultat

L'application a maintenant une **identité visuelle mode/fashion distinctive** :
- ✅ Palette de couleurs mode (noir, beige, doré)
- ✅ Typographie élégante (light, letter-spacing généreux)
- ✅ Design épuré avec espacements généreux
- ✅ Éléments visuels mode (séparateurs, badges)
- ✅ Différenciation claire des outils génériques

---

**Créé par** : UX Expert via BMAD-Method  
**Date** : 2025-01-23  
**Status** : ✅ Design system mode créé et appliqué
