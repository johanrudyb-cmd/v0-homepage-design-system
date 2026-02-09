# AI Design Generation Prompt - Médias Biangory

*Prompt optimisé pour v0.dev, Lovable.ai, Figma AI, ou outils similaires*

---

## 🎯 PROMPT PRINCIPAL - Homepage & Design System

```
# Média Biangory - Homepage & Design System

## High-Level Goal
Create a modern, professional, and distinctive homepage for Médias Biangory, a media platform dedicated to fashion business content. The design must reflect a sophisticated brand identity (black, gold, pink, white) while remaining functional and accessible. The interface should be mobile-first optimized for Instagram audience, with clear content discovery and strategic call-to-actions.

## Tech Stack & Context
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS with custom color palette
- **Language**: TypeScript
- **Approach**: Mobile-first responsive design
- **Target**: Fashion professionals, entrepreneurs, and Instagram audience

## Visual Design Specifications

### Color Palette
- **Primary (Black)**: #000000 / #1a1a1a - Main backgrounds, primary text, navigation
- **Secondary (Gold)**: #D4AF37 / #F5D76E - Premium accents, important CTAs, highlights
- **Accent (Pink)**: #FF69B4 / #FFB6C1 - Creative elements, interactions, secondary highlights
- **Neutral (White)**: #FFFFFF / #F8F8F8 - Text on dark backgrounds, spaces, clarity
- **Success**: #10B981 - Confirmations, success states
- **Warning**: #F59E0B - Warnings, important notices
- **Error**: #EF4444 - Errors, destructive actions
- **Neutral Gray**: #6B7280 / #9CA3AF - Secondary text, borders, subtle backgrounds

### Typography
- **Font Family**: System fonts (Inter, -apple-system, sans-serif) or modern font (Poppins, Montserrat)
- **H1**: 48px/3rem (desktop), 36px/2.25rem (mobile), Weight: 700, Line-height: 1.2
- **H2**: 36px/2.25rem (desktop), 28px/1.75rem (mobile), Weight: 600, Line-height: 1.3
- **H3**: 24px/1.5rem (desktop), 20px/1.25rem (mobile), Weight: 600, Line-height: 1.4
- **Body**: 16px/1rem, Weight: 400, Line-height: 1.6
- **Small**: 14px/0.875rem, Weight: 400, Line-height: 1.5

### Spacing Scale (4px base)
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px, 4xl: 96px

### Design Principles
1. Clarity over complexity - Prioritize content clarity and simple navigation
2. Mobile-first, desktop-enhanced - Optimize for mobile, enrich on desktop
3. Content is king - Design serves content, readability is paramount
4. Elegant professionalism - Modern, professional with creative touch reflecting fashion sector
5. Accessible by default - WCAG AA compliance, inclusive design
6. Strategic CTAs - CTAs placed at maximum engagement moments

## Detailed Step-by-Step Instructions

### Step 1: Configure Tailwind CSS with Custom Colors
1. Create or update `tailwind.config.js` with custom color palette
2. Add colors: black (primary), gold (secondary), pink (accent), white (neutral)
3. Configure spacing scale based on 4px increments
4. Set up typography scale with specified font sizes and weights

### Step 2: Create Design System Components
1. **Button Component** (`components/ui/Button.tsx`):
   - Variants: primary (gold), secondary (pink), tertiary (text with icon), ghost (transparent)
   - States: default, hover, active, disabled, loading
   - Mobile: Minimum 44x44px touch target
   - Use gold (#D4AF37) for primary CTAs, pink (#FF69B4) for secondary

2. **Typography Component** (`components/ui/Typography.tsx`):
   - H1, H2, H3, Body, Small variants
   - Responsive sizing (mobile/desktop)
   - Proper line heights and weights

3. **Card Component** (`components/ui/Card.tsx`):
   - Article card: image, title, date, description, link
   - Hover state: subtle elevation with shadow
   - Responsive: 1 column mobile, 2-3 columns desktop

4. **Navigation Component** (`components/layout/Navigation.tsx`):
   - Header with logo, menu items (Accueil, Articles, Podcasts, Vidéos, Partenariats, Boutique)
   - Mobile: Hamburger menu with overlay
   - Desktop: Horizontal menu
   - CTA Newsletter button visible in header
   - Cart icon with counter (if items in cart)

5. **Footer Component** (`components/layout/Footer.tsx`):
   - Legal links (CGV, CGU, Privacy Policy, Legal Notice)
   - Social links (Instagram, YouTube, Spotify)
   - Contact / About links
   - Compact on mobile, full on desktop

### Step 3: Create Homepage Layout
1. **Hero Section** (`components/sections/Hero.tsx`):
   - Full-width section with black background
   - Logo Médias Biangory centered or left-aligned
   - Main headline (H1): "Le média business de la mode"
   - Subheadline describing value proposition
   - Primary CTA button (gold): "S'inscrire à la newsletter"
   - Secondary CTA (pink outline): "Découvrir les articles"
   - Mobile: Stacked layout, centered text
   - Desktop: Side-by-side layout with image/illustration option

2. **Latest Articles Section** (`components/sections/LatestArticles.tsx`):
   - Section title (H2): "Derniers articles"
   - Grid of 3-6 article cards
   - Each card: Featured image, title, date, category, excerpt, "Lire plus" link
   - "Voir tous les articles" button at bottom
   - Mobile: 1 column
   - Tablet: 2 columns
   - Desktop: 3 columns

3. **Latest Podcasts Section** (`components/sections/LatestPodcasts.tsx`):
   - Section title (H2): "Derniers podcasts"
   - Grid of 2-3 podcast cards
   - Each card: Thumbnail, title, date, duration, platform icon, "Écouter" link
   - "Voir tous les podcasts" button
   - Mobile: 1 column, Desktop: 2-3 columns

4. **Latest Videos Section** (`components/sections/LatestVideos.tsx`):
   - Section title (H2): "Dernières vidéos"
   - Grid of 2-3 video cards
   - Each card: YouTube thumbnail, title, date, duration, "Regarder" link
   - "Voir toutes les vidéos" button
   - Mobile: 1 column, Desktop: 2-3 columns

5. **Shop Section** (`components/sections/Shop.tsx`):
   - Section title (H2): "Boutique"
   - Grid of 3-6 product cards
   - Each card: Product image, title, price, "Voir" button
   - "Voir la boutique" button
   - Mobile: 1-2 columns, Desktop: 3-4 columns

6. **Partnerships Section** (`components/sections/Partnerships.tsx`):
   - Section title (H2): "Partenariats"
   - Short description of partnership opportunities
   - CTA button (gold): "Découvrir les opportunités"
   - Link to /partenariats page

### Step 4: Implement Responsive Breakpoints
1. Mobile: 0-767px (1 column layouts, hamburger menu)
2. Tablet: 768-1023px (2 columns possible, adapted menu)
3. Desktop: 1024-1439px (2-3 columns, horizontal menu)
4. Wide: 1440px+ (max-width container, centered content)

### Step 5: Add Accessibility Features
1. All images have alt text
2. All buttons have aria-labels
3. Keyboard navigation support (Tab, Enter, Esc)
4. Focus indicators: 2px outline with contrasting color
5. Color contrast ratios: Minimum 4.5:1 for normal text, 3:1 for large text
6. Semantic HTML structure (header, nav, main, section, footer)

### Step 6: Implement Animations & Micro-interactions
1. Page load: Subtle fade-in (200ms, ease-out)
2. Button hover: Light elevation/scale (150ms, ease-in-out)
3. Card hover: Elevation with shadow (200ms, ease-out)
4. Form validation: Light shake for errors (300ms, ease-in-out)
5. Respect `prefers-reduced-motion` media query

## Code Examples & Constraints

### Tailwind Config Example
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          light: '#1a1a1a',
        },
        secondary: {
          DEFAULT: '#D4AF37',
          light: '#F5D76E',
        },
        accent: {
          DEFAULT: '#FF69B4',
          light: '#FFB6C1',
        },
        neutral: {
          DEFAULT: '#FFFFFF',
          gray: '#F8F8F8',
        },
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
      },
    },
  },
}
```

### Button Component Structure
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}
```

### Article Card Structure
```typescript
// components/ui/ArticleCard.tsx
interface ArticleCardProps {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  featuredImage: string;
  slug: string;
}
```

## Strict Scope

### Files to Create/Modify
- `tailwind.config.js` - Custom color palette and spacing
- `components/ui/Button.tsx` - Button component with variants
- `components/ui/Typography.tsx` - Typography component
- `components/ui/Card.tsx` - Base card component
- `components/ui/ArticleCard.tsx` - Article-specific card
- `components/layout/Navigation.tsx` - Header navigation
- `components/layout/Footer.tsx` - Footer component
- `components/sections/Hero.tsx` - Hero section
- `components/sections/LatestArticles.tsx` - Latest articles section
- `components/sections/LatestPodcasts.tsx` - Latest podcasts section
- `components/sections/LatestVideos.tsx` - Latest videos section
- `components/sections/Shop.tsx` - Shop section
- `components/sections/Partnerships.tsx` - Partnerships section
- `app/page.tsx` - Homepage layout combining all sections

### Files to NOT Modify
- Do NOT modify existing API routes
- Do NOT modify database schemas
- Do NOT modify authentication logic
- Do NOT modify existing utility functions unless explicitly needed

### Constraints
- Use TypeScript for all components
- Use Tailwind CSS for all styling (no inline styles)
- Follow Next.js 14+ App Router conventions
- Ensure mobile-first responsive design
- Maintain WCAG AA accessibility standards
- Use semantic HTML5 elements
- Optimize images (WebP format, lazy loading)
- Ensure all interactive elements are keyboard accessible

## Expected Output

A complete, responsive homepage for Médias Biangory with:
1. Modern, professional design using black, gold, pink, white color palette
2. Mobile-first responsive layout (mobile, tablet, desktop)
3. All sections: Hero, Latest Articles, Latest Podcasts, Latest Videos, Shop, Partnerships
4. Reusable design system components (Button, Typography, Card, Navigation, Footer)
5. Accessible markup and interactions
6. Smooth animations and micro-interactions
7. Optimized performance (lazy loading, image optimization)

## Next Steps After Generation

1. Review all generated code for accuracy
2. Test responsive breakpoints on real devices
3. Validate accessibility with screen readers and keyboard navigation
4. Test color contrast ratios
5. Optimize images and assets
6. Add actual content data (replace placeholders)
7. Connect to backend APIs for dynamic content
8. Test performance (Lighthouse score > 80)
```

---

## 📋 PROMPT ALTERNATIF - Pour Figma AI / Design Tools

```
# Médias Biangory - Design System & Homepage Wireframe

## Project Overview
Create a comprehensive design system and homepage wireframe for Médias Biangory, a fashion business media platform.

## Brand Identity
- **Colors**: Black (#000000), Gold (#D4AF37), Pink (#FF69B4), White (#FFFFFF)
- **Style**: Modern, professional, elegant with creative fashion touch
- **Tone**: Sophisticated but accessible, content-focused

## Design System Components to Create

### 1. Color Palette
- Primary: Black (#000000, #1a1a1a)
- Secondary: Gold (#D4AF37, #F5D76E)
- Accent: Pink (#FF69B4, #FFB6C1)
- Neutral: White (#FFFFFF, #F8F8F8)
- Semantic: Success (#10B981), Warning (#F59E0B), Error (#EF4444)

### 2. Typography Scale
- H1: 48px/36px (desktop/mobile), Bold 700
- H2: 36px/28px, Semi-bold 600
- H3: 24px/20px, Semi-bold 600
- Body: 16px, Regular 400
- Small: 14px, Regular 400

### 3. Component Library
Create the following components with all states:
- Button (Primary, Secondary, Tertiary, Ghost) - Default, Hover, Active, Disabled
- Input/Form Fields - Default, Focus, Error, Success
- Card (Article, Product, Media) - Default, Hover
- Navigation (Header, Footer, Breadcrumbs)
- Typography (H1-H3, Body, Small, Link)

### 4. Homepage Layout
Create wireframe/mockup with:
- Hero Section: Logo, headline, CTAs
- Latest Articles: 3-6 article cards in grid
- Latest Podcasts: 2-3 podcast cards
- Latest Videos: 2-3 video cards
- Shop Section: 3-6 product cards
- Partnerships Section: Description + CTA
- Footer: Links, social, contact

### 5. Responsive Breakpoints
- Mobile (375px): 1 column, hamburger menu
- Tablet (768px): 2 columns, adapted menu
- Desktop (1280px): 3 columns, horizontal menu

### 6. Accessibility Considerations
- Color contrast ratios documented
- Focus states for all interactive elements
- Touch target sizes (minimum 44x44px)
- Screen reader considerations

## Deliverables
1. Design system file with all components
2. Homepage wireframe (low-fidelity)
3. Homepage mockup (high-fidelity)
4. Mobile, tablet, desktop variations
5. Component specifications document
```

---

## 🎨 PROMPT POUR COMPOSANTS INDIVIDUELS

### Article Card Component
```
Create an ArticleCard component for Médias Biangory with:
- Featured image (16:9 aspect ratio, WebP optimized)
- Title (H3, black text)
- Date and category (small text, gray)
- Excerpt (body text, 2-3 lines max)
- "Lire plus" link (gold color)
- Hover state: subtle elevation with shadow
- Responsive: Full width mobile, fixed width desktop
- Accessible: Proper alt text, keyboard navigation
```

### Navigation Component
```
Create a responsive Navigation component with:
- Logo (left-aligned, links to homepage)
- Menu items: Accueil, Articles, Podcasts, Vidéos, Partenariats, Boutique
- Newsletter CTA button (gold, visible in header)
- Cart icon with counter (if items present)
- Mobile: Hamburger menu with slide-out overlay
- Desktop: Horizontal menu
- Active state indication for current page
- Keyboard accessible (Tab navigation)
```

---

## 📝 NOTES IMPORTANTES

**⚠️ Rappel Critique** : Tout code généré par IA nécessitera une révision humaine attentive, des tests complets, et des raffinements pour être considéré comme prêt pour la production.

**Structure du Prompt** :
1. **High-Level Goal** : Oriente l'IA sur l'objectif principal
2. **Detailed Instructions** : Étapes numérotées pour guider l'IA
3. **Code Examples** : Exemples concrets et contraintes
4. **Strict Scope** : Définit ce qui peut être modifié et ce qui ne peut pas l'être

**Approche Recommandée** :
- Générer un composant à la fois plutôt que tout l'application d'un coup
- Itérer sur les résultats pour affiner
- Tester chaque composant individuellement
- Valider l'accessibilité et la performance

---

**Document créé par** : UX Expert (Sally)  
**Date** : 2025-01-23  
**Pour** : Génération de designs avec outils AI (v0.dev, Lovable.ai, Figma AI)
