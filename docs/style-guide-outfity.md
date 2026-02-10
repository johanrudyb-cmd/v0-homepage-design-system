# Guide de Style OUTFITY
## Design System & Règles de Développement

**Version**: 1.0  
**Date**: 2026-02-10  
**Basé sur**: Apple Design Language  
**Statut**: Référence Officielle

---

## 🎨 Philosophie de Design

### Principes Fondamentaux
1. **Minimalisme Luxueux**: Simplicité élégante inspirée d'Apple
2. **Clarté Visuelle**: Hiérarchie claire, espaces généreux
3. **Fluidité**: Animations douces et transitions élégantes
4. **Accessibilité**: WCAG 2.1 AA minimum
5. **Performance**: Optimisation maximale (Lighthouse > 90)

### Inspiration
- **Apple Design Language**: Minimalisme, élégance, attention aux détails
- **Squircle**: Arrondis prononcés (rounded-3xl)
- **Glassmorphism**: Effets de profondeur subtils
- **Typography**: Grandes tailles, tracking négatif

---

## 🎨 Palette de Couleurs

### Couleurs Principales

#### Background
```css
/* Fond principal - Gris Apple très léger */
--background: #F5F5F7
bg-[#F5F5F7]
```

#### Foreground (Texte)
```css
/* Texte principal - Gris anthracite */
--foreground: #1D1D1F
text-[#1D1D1F]
```

#### Primary (Noir Apple)
```css
/* Noir pur pour éléments importants */
--primary: #000000
bg-black text-white
```

#### Secondary/Accent (Bleu Apple)
```css
/* Bleu Apple pour éléments interactifs */
--secondary: #007AFF
--accent: #007AFF
bg-[#007AFF] text-white

/* Hover state */
--apple-blue-dark: #0056CC
hover:bg-[#0056CC]
```

### Couleurs de Statut

```css
/* Success - Vert */
--success: hsl(142, 76%, 36%)
text-green-600

/* Error - Rouge */
--error: hsl(0, 84%, 60%)
text-red-500

/* Warning - Orange */
--warning: hsl(38, 92%, 50%)
text-orange-500

/* Info - Bleu Apple */
--info: #007AFF
text-[#007AFF]
```

### Couleurs UI

```css
/* Card - Blanc pur */
--card: #FFFFFF
bg-white

/* Muted - Gris clair */
--muted: hsl(0, 0%, 90%)
bg-gray-200

/* Border - Gris très clair */
--border: hsl(0, 0%, 90%)
border-gray-200
```

### ⚠️ Règles d'Utilisation

**✅ À FAIRE**:
- Utiliser `#F5F5F7` pour tous les backgrounds de page
- Utiliser `#1D1D1F` pour tout le texte principal
- Utiliser `#007AFF` uniquement pour éléments interactifs (boutons, liens)
- Utiliser `#000000` pour titres importants et CTAs primaires
- Utiliser `#FFFFFF` pour cartes et conteneurs

**❌ À ÉVITER**:
- Ne JAMAIS utiliser de couleurs vives non définies
- Ne PAS utiliser de bleu pour du texte non-interactif
- Ne PAS mélanger différents gris (utiliser uniquement ceux définis)
- Ne PAS utiliser de dégradés sauf cas spécifiques (header)

---

## 📝 Typographie

### Police
```tsx
// Définie dans layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

// Utilisation
font-sans // = Inter
```

### Hiérarchie des Titres

```tsx
// H1 - Hero Titles
<h1 className="text-6xl lg:text-7xl font-semibold tracking-tight">
  Titre Principal
</h1>

// H2 - Section Titles
<h2 className="text-5xl lg:text-6xl font-semibold tracking-tight">
  Titre de Section
</h2>

// H3 - Subsection Titles
<h3 className="text-3xl lg:text-4xl font-semibold tracking-tight">
  Sous-titre
</h3>

// H4 - Card Titles
<h4 className="text-2xl font-semibold tracking-tight">
  Titre de Carte
</h4>

// H5 - Small Headings
<h5 className="text-xl font-semibold">
  Petit Titre
</h5>
```

### Corps de Texte

```tsx
// Paragraphe normal
<p className="text-base leading-relaxed text-[#1D1D1F]">
  Texte de paragraphe standard
</p>

// Texte large (intro, lead)
<p className="text-lg lg:text-xl leading-relaxed text-[#1D1D1F]">
  Texte d'introduction
</p>

// Texte petit (caption, metadata)
<p className="text-sm text-gray-600">
  Légende ou métadonnées
</p>

// Texte très petit (legal, footnotes)
<p className="text-xs text-gray-500">
  Mentions légales
</p>
```

### Poids de Police

```tsx
// Regular (400) - Texte normal
font-normal

// Medium (500) - Boutons, labels
font-medium

// Semibold (600) - Titres, emphasis
font-semibold
```

### Letter Spacing (Tracking)

```tsx
// Titres - Tracking négatif (Apple style)
tracking-tight  // -0.02em (H3, H4, H5)
tracking-tighter // -0.025em (H2)
// H1 utilise -0.03em (défini dans globals.css)

// Texte normal - Légèrement négatif
// Défini globalement: letter-spacing: -0.011em
```

### ⚠️ Règles Typographiques

**✅ À FAIRE**:
- Toujours utiliser `tracking-tight` ou `tracking-tighter` pour les titres
- Utiliser `leading-relaxed` pour les paragraphes
- Utiliser `font-semibold` (600) pour tous les titres
- Respecter la hiérarchie H1 > H2 > H3 > H4 > H5

**❌ À ÉVITER**:
- Ne JAMAIS utiliser `font-bold` (700) - pas dans le design system
- Ne PAS utiliser `tracking-wide` ou `tracking-wider`
- Ne PAS utiliser de polices autres qu'Inter
- Ne PAS utiliser `leading-tight` pour les paragraphes

---

## 🔘 Boutons

### Bouton Primary (CTA Principal)

```tsx
<button className="
  bg-black text-white
  px-8 py-4
  rounded-3xl
  font-medium
  transition-apple
  hover:bg-gray-900
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]
  touch-target
">
  Action Principale
</button>
```

### Bouton Secondary (CTA Secondaire)

```tsx
<button className="
  bg-[#007AFF] text-white
  px-8 py-4
  rounded-3xl
  font-medium
  transition-apple
  hover:bg-[#0056CC]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]
  touch-target
">
  Action Secondaire
</button>
```

### Bouton Outline

```tsx
<button className="
  bg-transparent text-black
  border-2 border-black
  px-8 py-4
  rounded-3xl
  font-medium
  transition-apple
  hover:bg-black hover:text-white
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]
  touch-target
">
  Action Tertiaire
</button>
```

### Bouton Ghost

```tsx
<button className="
  bg-transparent text-[#007AFF]
  px-6 py-3
  rounded-2xl
  font-medium
  transition-apple
  hover:bg-gray-100
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]
  touch-target
">
  Lien d'Action
</button>
```

### Tailles de Boutons

```tsx
// Large (Hero CTAs)
px-8 py-4 text-lg

// Medium (Default)
px-6 py-3 text-base

// Small (Compact areas)
px-4 py-2 text-sm
```

### ⚠️ Règles Boutons

**✅ À FAIRE**:
- Toujours utiliser `rounded-3xl` (ou `rounded-2xl` pour small)
- Toujours inclure `transition-apple` pour animations
- Toujours inclure `focus-visible:ring-2` pour accessibilité
- Toujours utiliser `touch-target` (min 44px × 44px)
- Utiliser `font-medium` (500) pour le texte

**❌ À ÉVITER**:
- Ne JAMAIS utiliser `rounded-md` ou `rounded-lg`
- Ne PAS oublier les états hover/focus
- Ne PAS utiliser de boutons < 44px de hauteur
- Ne PAS utiliser `font-bold` dans les boutons

---

## 📦 Cartes & Conteneurs

### Card Standard

```tsx
<div className="
  bg-white
  rounded-3xl
  p-6 lg:p-8
  shadow-apple
  transition-apple
  hover:shadow-apple-lg
">
  {/* Contenu */}
</div>
```

### Card Interactive (Clickable)

```tsx
<div className="
  bg-white
  rounded-3xl
  p-6 lg:p-8
  shadow-apple
  transition-apple
  hover:shadow-apple-lg
  hover:scale-[1.02]
  cursor-pointer
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]
">
  {/* Contenu */}
</div>
```

### Glassmorphism Card

```tsx
<div className="
  glass
  rounded-3xl
  p-6 lg:p-8
  border border-white/20
">
  {/* Contenu */}
</div>
```

### ⚠️ Règles Cartes

**✅ À FAIRE**:
- Toujours utiliser `rounded-3xl` pour les cartes
- Utiliser `shadow-apple` pour ombres subtiles
- Utiliser `p-6 lg:p-8` pour padding responsive
- Ajouter `hover:shadow-apple-lg` pour cartes interactives

**❌ À ÉVITER**:
- Ne PAS utiliser `shadow-lg` ou `shadow-xl` (trop prononcé)
- Ne PAS utiliser `rounded-lg` ou `rounded-xl`
- Ne PAS oublier le padding responsive

---

## 🎭 Animations & Transitions

### Transitions Standard

```tsx
// Transition Apple (smooth et élégante)
transition-apple // all 0.3s cubic-bezier(0.16, 1, 0.3, 1)

// Transition rapide
transition-apple-fast // all 0.2s

// Transition lente
transition-apple-slow // all 0.5s
```

### Animations d'Entrée

```tsx
// Fade in
animate-fade-in

// Slide in from bottom
animate-slide-in-up

// Slide in from top
animate-slide-in-down

// Slide in from left
animate-slide-in-right

// Slide in from right
animate-slide-in-left

// Scale in
animate-scale-in

// Page transition
animate-page-transition
```

### Animations de Liste (Stagger)

```tsx
<div className="animate-stagger">
  <div>Item 1</div> {/* delay: 0.05s */}
  <div>Item 2</div> {/* delay: 0.1s */}
  <div>Item 3</div> {/* delay: 0.15s */}
  {/* ... jusqu'à 8 items */}
</div>
```

### Animations Continues

```tsx
// Spin (loading)
animate-apple-spin

// Pulse (attention)
animate-apple-pulse

// Marquee (défilement)
animate-marquee
animate-marquee-slow
```

### ⚠️ Règles Animations

**✅ À FAIRE**:
- Toujours utiliser `transition-apple` pour transitions
- Utiliser `cubic-bezier(0.16, 1, 0.3, 1)` pour courbe Apple
- Limiter durée animations à 0.5s max (sauf marquee)
- Utiliser `animate-stagger` pour listes

**❌ À ÉVITER**:
- Ne PAS utiliser `transition-all` sans cubic-bezier
- Ne PAS créer d'animations > 1s (sauf cas spéciaux)
- Ne PAS abuser des animations (distraction)

---

## 📐 Espacements & Layout

### Padding & Margin

```tsx
// Sections
py-16 lg:py-24 // Vertical spacing sections
px-6 lg:px-12 // Horizontal padding responsive

// Cartes
p-6 lg:p-8 // Padding cartes

// Boutons
px-6 py-3 // Medium buttons
px-8 py-4 // Large buttons

// Espacement entre éléments
space-y-4 // Vertical spacing (1rem)
space-y-6 // Vertical spacing (1.5rem)
space-y-8 // Vertical spacing (2rem)
```

### Grid & Flex

```tsx
// Grid responsive
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

// Flex center
flex items-center justify-center

// Flex between
flex items-center justify-between

// Flex column
flex flex-col space-y-4
```

### Container

```tsx
// Container centré avec max-width
<div className="max-w-7xl mx-auto px-6 lg:px-12">
  {/* Contenu */}
</div>
```

### ⚠️ Règles Layout

**✅ À FAIRE**:
- Utiliser `max-w-7xl` pour containers principaux
- Toujours ajouter padding responsive (`px-6 lg:px-12`)
- Utiliser `gap-6` ou `gap-8` pour grids
- Respecter espacement vertical cohérent

**❌ À ÉVITER**:
- Ne PAS utiliser de padding fixes (toujours responsive)
- Ne PAS mélanger différents gaps dans une même section

---

## 🔗 Liens

### Lien Interactif (Navigation)

```tsx
<a href="/page" className="link-interactive">
  Lien de Navigation
</a>

// Ou avec Tailwind
<a href="/page" className="
  text-[#007AFF]
  hover:text-[#0056CC]
  transition-colors duration-200
  no-underline
">
  Lien de Navigation
</a>
```

### Lien dans Texte

```tsx
// Les liens dans le texte ne doivent PAS être bleus automatiquement
// Utiliser uniquement si nécessaire
<p>
  Texte normal avec <a href="#" className="underline">lien souligné</a>
</p>
```

### ⚠️ Règles Liens

**✅ À FAIRE**:
- Utiliser `link-interactive` pour liens de navigation
- Utiliser `#007AFF` pour couleur de lien
- Ajouter `hover:text-[#0056CC]` pour hover state
- Utiliser `transition-colors duration-200`

**❌ À ÉVITER**:
- Ne PAS rendre tous les liens bleus automatiquement
- Ne PAS oublier les états hover
- Ne PAS utiliser de soulignement par défaut (sauf dans texte)

---

## 📱 Responsive Design

### Breakpoints Tailwind

```tsx
// Mobile first
sm: 640px   // Petit mobile
md: 768px   // Tablette portrait
lg: 1024px  // Tablette landscape / Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large desktop
```

### Patterns Responsive

```tsx
// Texte responsive
text-4xl lg:text-6xl

// Padding responsive
px-6 lg:px-12
py-12 lg:py-24

// Grid responsive
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Hidden responsive
hidden lg:block // Caché mobile, visible desktop
lg:hidden // Visible mobile, caché desktop
```

### Safe Area (Mobile)

```tsx
// Pour gérer les encoches (iPhone, etc.)
<body className="safe-area-padding">
  {/* Contenu */}
</body>
```

### Touch Targets

```tsx
// Zone tactile minimale 44px × 44px (Apple/WCAG)
<button className="touch-target">
  {/* min-height: 44px; min-width: 44px; */}
</button>
```

### ⚠️ Règles Responsive

**✅ À FAIRE**:
- Toujours design mobile-first
- Utiliser `lg:` pour desktop (1024px+)
- Respecter touch targets 44px minimum
- Tester sur vrais devices (iPhone, Android)

**❌ À ÉVITER**:
- Ne PAS oublier les breakpoints intermédiaires
- Ne PAS créer de touch targets < 44px
- Ne PAS négliger les tests mobile

---

## ♿ Accessibilité

### Focus States

```tsx
// Focus visible (keyboard navigation)
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-[#007AFF]
focus-visible:ring-offset-2
```

### ARIA Labels

```tsx
// Boutons icon-only
<button aria-label="Fermer le menu">
  <XIcon />
</button>

// Images décoratives
<img src="..." alt="" aria-hidden="true" />

// Images informatives
<img src="..." alt="Description précise" />
```

### Contraste

```tsx
// Ratio minimum WCAG AA
// Texte normal: 4.5:1
// Texte large (18px+): 3:1

// Combinaisons validées:
text-[#1D1D1F] on bg-[#F5F5F7] ✅
text-white on bg-black ✅
text-white on bg-[#007AFF] ✅
```

### ⚠️ Règles Accessibilité

**✅ À FAIRE**:
- Toujours ajouter `focus-visible:ring-2`
- Utiliser ARIA labels pour éléments non-textuels
- Respecter ratios de contraste WCAG AA
- Tester avec lecteur d'écran

**❌ À ÉVITER**:
- Ne JAMAIS supprimer les focus states
- Ne PAS oublier les alt text sur images
- Ne PAS utiliser couleur seule pour information

---

## 🎯 Composants Réutilisables

### Structure de Composant

```tsx
// components/ui/Button.tsx
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'rounded-3xl font-medium transition-apple touch-target',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]',
        
        // Variants
        variant === 'primary' && 'bg-black text-white hover:bg-gray-900',
        variant === 'secondary' && 'bg-[#007AFF] text-white hover:bg-[#0056CC]',
        variant === 'outline' && 'bg-transparent text-black border-2 border-black hover:bg-black hover:text-white',
        variant === 'ghost' && 'bg-transparent text-[#007AFF] hover:bg-gray-100',
        
        // Sizes
        size === 'sm' && 'px-4 py-2 text-sm',
        size === 'md' && 'px-6 py-3 text-base',
        size === 'lg' && 'px-8 py-4 text-lg',
        
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Utilisation

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg">
  Action Principale
</Button>
```

---

## 📋 Checklist Développement

### Avant de Créer un Composant

- [ ] Vérifier si composant similaire existe déjà
- [ ] Respecter la palette de couleurs définie
- [ ] Utiliser `rounded-3xl` pour arrondis
- [ ] Ajouter `transition-apple` pour animations
- [ ] Inclure focus states (`focus-visible:ring-2`)
- [ ] Respecter touch targets (44px min)
- [ ] Tester responsive (mobile, tablet, desktop)
- [ ] Valider contraste WCAG AA
- [ ] Ajouter ARIA labels si nécessaire
- [ ] Documenter props et usage

### Avant de Commit

- [ ] Code lint sans erreurs (`npm run lint`)
- [ ] TypeScript sans erreurs
- [ ] Composant testé visuellement
- [ ] Responsive validé
- [ ] Accessibilité vérifiée
- [ ] Performance optimale (Lighthouse > 90)

---

## 🚫 Anti-Patterns à Éviter

### ❌ Couleurs

```tsx
// ❌ MAUVAIS
bg-blue-500 // Bleu générique
bg-red-600 // Rouge générique
text-gray-700 // Gris non défini

// ✅ BON
bg-[#007AFF] // Bleu Apple
bg-red-500 // Rouge défini dans design system
text-[#1D1D1F] // Gris anthracite défini
```

### ❌ Arrondis

```tsx
// ❌ MAUVAIS
rounded-md // Trop petit
rounded-lg // Pas assez prononcé
rounded-xl // Pas le standard

// ✅ BON
rounded-3xl // Standard cartes/boutons
rounded-2xl // Petits éléments
```

### ❌ Transitions

```tsx
// ❌ MAUVAIS
transition-all // Sans cubic-bezier
duration-1000 // Trop long

// ✅ BON
transition-apple // Avec cubic-bezier Apple
transition-apple-fast // Rapide mais smooth
```

### ❌ Typographie

```tsx
// ❌ MAUVAIS
font-bold // Pas dans le design system
tracking-wide // Contraire au style Apple
leading-tight // Trop serré pour paragraphes

// ✅ BON
font-semibold // Poids défini (600)
tracking-tight // Tracking négatif Apple
leading-relaxed // Lecture confortable
```

---

## 📚 Ressources & Références

### Documentation
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Apple HIG**: https://developer.apple.com/design/human-interface-guidelines
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/

### Fichiers Clés
- `app/globals.css` - Variables CSS et animations
- `tailwind.config.ts` - Configuration Tailwind
- `app/layout.tsx` - Configuration police (Inter)

### Outils
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Lighthouse**: Chrome DevTools
- **Axe DevTools**: Extension accessibilité

---

## 🔄 Mises à Jour

### Historique
- **v1.0** (2026-02-10): Version initiale basée sur design system existant

### Prochaines Évolutions
- Composants UI réutilisables (Button, Card, Input, etc.)
- Storybook pour documentation visuelle
- Tests visuels automatisés
- Dark mode complet

---

**Document maintenu par**: Design & Development Team  
**Dernière mise à jour**: 2026-02-10  
**Prochaine revue**: 2026-03-10

---

*Ce guide est la référence officielle pour tout développement sur OUTFITY. Tout écart doit être justifié et documenté.*
