# Plan d'Intégration : Brand Identity dans l'App Actuelle

*Document créé par : Analyst BMAD (Mary)*  
*Date : 2026-01-26*  
*Objectif : Définir comment intégrer le Brand Identity Wizard dans l'application existante*

---

## 🎯 Vue d'Ensemble de l'Intégration

### Workflow Actuel (Avant)
```
Dashboard → Launch Map → Phase 1 (Calculateur)
                      → Phase 2 (Design Studio)
                      → Phase 3 (Sourcing)
                      → Phase 4 (UGC)
```

### Workflow Nouveau (Après)
```
Dashboard → Brand Identity Wizard (NOUVEAU)
         → Launch Map → Phase 0 (Identité) [NOUVEAU]
                      → Phase 1 (Calculateur)
                      → Phase 2 (Design Studio) [AMÉLIORÉ]
                      → Phase 3 (Sourcing)
                      → Phase 4 (UGC) [AMÉLIORÉ]
         → Brand Dashboard (NOUVEAU)
```

---

## 📋 Modifications Nécessaires

### 1. Base de Données : Schéma Prisma

**Fichier : `prisma/schema.prisma`**

**Modifications à apporter :**

```prisma
model Brand {
  id        String   @id @default(cuid())
  userId    String
  name      String
  
  // NOUVEAU : Identité de marque (tous optionnels)
  logo              String?  // URL du logo sélectionné
  logoVariations    Json?    // { horizontal: url, vertical: url, icon: url }
  colorPalette      Json?    // { primary: "#000", secondary: "#fff", accent: "#..." }
  typography        Json?    // { heading: "Font Name", body: "Font Name" }
  styleGuide        Json?    // { moodboard: [...], references: [...] }
  domain            String?  // Domaine vérifié (.com, .fr)
  socialHandles     Json?    // { instagram: "@nom", twitter: "@nom" }
  
  // NOUVEAU : Métadonnées
  creationMode      String   @default("quick") // "quick" | "deep"
  autoApplyIdentity Boolean  @default(true)    // Toggle application auto
  status            String   @default("draft") // "draft" | "in_progress" | "completed"
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  designs     Design[]
  launchMap   LaunchMap?
  ugcContents UGCContent[]
}
```

**Points importants :**
- ✅ Tous les champs d'identité sont optionnels (null)
- ✅ Compatible avec les marques existantes (pas de breaking change)
- ✅ Migration progressive possible

---

### 2. Nouvelle Page : Brand Identity Wizard

**Fichier : `app/brands/create/page.tsx`** (NOUVEAU)

**Fonctionnalités :**
- Formulaire en 3 étapes
- Génération IA (nom, logo, identité)
- Sélection utilisateur
- Sauvegarde dans Brand model

**Intégration :**
- Redirection vers Launch Map après création
- Ou redirection vers Brand Dashboard

---

### 3. Modification : Launch Map

**Fichier : `components/launch-map/LaunchMapStepper.tsx`**

**Modifications :**

#### Ajouter Phase 0 (Identité)
```typescript
const phases = [
  {
    id: 0,  // NOUVEAU
    title: 'Identité',
    subtitle: 'Créez votre identité de marque',
    description: 'Nom, logo et identité visuelle de votre marque',
  },
  {
    id: 1,
    title: 'Fondations',
    // ... existant
  },
  // ... autres phases
];
```

#### Logique de progression
```typescript
// Si pas d'identité → Phase 0
if (!brand.logo && !brand.colorPalette) {
  setCurrentPhase(0);
}
// Sinon → Phase 1 (ou suivante)
else if (!progress.phase1) {
  setCurrentPhase(1);
}
// ...
```

---

### 4. Modification : Design Studio

**Fichier : `components/design-studio/DesignStudioForm.tsx`**

**Ajouts :**

#### Toggle "Appliquer identité"
```tsx
{brand.logo && brand.colorPalette && (
  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
    <input
      type="checkbox"
      checked={autoApplyIdentity}
      onChange={(e) => setAutoApplyIdentity(e.target.checked)}
      className="w-5 h-5 rounded border-2"
    />
    <label className="text-sm font-semibold">
      Appliquer l'identité de marque (logo + couleurs)
    </label>
  </div>
)}
```

#### Application automatique
```typescript
// Dans la fonction de génération
if (autoApplyIdentity && brand.logo && brand.colorPalette) {
  // Inclure logo et couleurs dans le prompt IA
  prompt += ` avec le logo de ${brand.name} et la palette ${brand.colorPalette}`;
}
```

---

### 5. Modification : UGC AI Lab

**Fichier : `components/ugc/UGCLab.tsx`**

**Ajouts :**

#### Utilisation identité dans scripts
```typescript
// Quand génération script
const scriptPrompt = brand.name 
  ? `Script pour la marque ${brand.name}`
  : 'Script générique';

if (brand.colorPalette) {
  scriptPrompt += ` avec style ${brand.colorPalette.style}`;
}
```

---

### 6. Nouvelle Page : Brand Dashboard

**Fichier : `app/brands/[id]/page.tsx`** (NOUVEAU)

**Fonctionnalités :**
- Aperçu identité (logo, couleurs)
- Liste designs avec identité
- Progression Launch Map
- Actions rapides

---

### 7. Modification : Dashboard Principal

**Fichier : `app/dashboard/page.tsx`**

**Ajouts :**

#### Bouton "Créer une marque"
```tsx
{brands.length === 0 && (
  <Card className="border-2 border-primary/20">
    <CardContent className="p-8 text-center">
      <h3 className="text-xl font-bold mb-2">Créez votre première marque</h3>
      <p className="text-muted-foreground mb-4">
        Définissez votre identité et lancez votre marque
      </p>
      <Link href="/brands/create">
        <Button className="shadow-modern-lg">
          Créer ma marque
        </Button>
      </Link>
    </CardContent>
  </Card>
)}
```

---

## 🔄 Flux d'Intégration Détaillé

### Scénario 1 : Nouvel Utilisateur

```
1. Inscription
   ↓
2. Dashboard (vide)
   ↓
3. Clic "Créer ma marque"
   ↓
4. Brand Identity Wizard (/brands/create)
   ├─ Étape 1 : Concept
   ├─ Étape 2 : Génération IA
   └─ Étape 3 : Sélection
   ↓
5. Marque créée avec identité
   ↓
6. Redirection → Launch Map
   ├─ Phase 0 : Identité (déjà complétée ✓)
   ├─ Phase 1 : Fondations
   └─ ...
```

### Scénario 2 : Utilisateur Existant (Marque sans identité)

```
1. Dashboard
   ↓
2. Launch Map
   ↓
3. Phase 0 apparaît (nouvelle)
   ├─ "Créez votre identité de marque"
   ├─ Clic → Redirection /brands/create
   └─ Ou création inline
   ↓
4. Identité créée
   ↓
5. Retour Launch Map
   ├─ Phase 0 : Complétée ✓
   └─ Phase 1 : Disponible
```

### Scénario 3 : Utilisation des Outils avec Identité

```
1. Design Studio
   ↓
2. Toggle "Appliquer identité" (si identité existe)
   ├─ ON : Logo + couleurs appliqués automatiquement
   └─ OFF : Design générique
   ↓
3. Design créé avec identité (si toggle ON)
```

---

## 📁 Structure de Fichiers à Créer/Modifier

### Nouveaux Fichiers

```
app/
  brands/
    create/
      page.tsx                    # NOUVEAU : Brand Identity Wizard
    [id]/
      page.tsx                    # NOUVEAU : Brand Dashboard

components/
  brands/
    BrandIdentityWizard.tsx       # NOUVEAU : Wizard 3 étapes
    BrandIdentityStep1.tsx        # NOUVEAU : Input concept
    BrandIdentityStep2.tsx        # NOUVEAU : Génération IA
    BrandIdentityStep3.tsx        # NOUVEAU : Sélection
    BrandDashboard.tsx            # NOUVEAU : Vue d'ensemble

app/api/
  brands/
    generate-identity/
      route.ts                    # NOUVEAU : Génération IA (nom, logo, identité)
    [id]/
      route.ts                    # NOUVEAU : GET/PUT pour une marque
```

### Fichiers à Modifier

```
prisma/
  schema.prisma                   # MODIFIER : Ajouter champs identité

components/
  launch-map/
    LaunchMapStepper.tsx          # MODIFIER : Ajouter Phase 0
  design-studio/
    DesignStudioForm.tsx          # MODIFIER : Toggle identité
  ugc/
    UGCLab.tsx                    # MODIFIER : Utiliser identité

app/
  dashboard/
    page.tsx                      # MODIFIER : Bouton créer marque
  launch-map/
    page.tsx                      # MODIFIER : Vérifier identité
```

---

## 🔌 API Routes à Créer

### 1. Génération Identité

**Fichier : `app/api/brands/generate-identity/route.ts`**

```typescript
POST /api/brands/generate-identity
Body: { concept: string, style?: string, target?: string }
Response: {
  names: string[],
  logos: string[],
  colorPalette: { primary: string, secondary: string, ... },
  typography: { heading: string, body: string }
}
```

### 2. Mise à Jour Marque

**Fichier : `app/api/brands/[id]/route.ts`**

```typescript
GET /api/brands/[id]
→ Retourne la marque avec identité

PUT /api/brands/[id]
Body: { logo?, colorPalette?, typography?, ... }
→ Met à jour l'identité
```

---

## 🎨 Modifications UI/UX

### 1. Sidebar

**Fichier : `components/layout/Sidebar.tsx`**

**Ajout :**
```tsx
const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mes Marques', href: '/brands', icon: Building2 }, // NOUVEAU
  // ... existant
];
```

### 2. Header

**Fichier : `components/layout/Header.tsx`**

**Ajout (optionnel) :**
- Sélecteur de marque active (si plusieurs marques)

---

## ✅ Checklist d'Intégration

### Phase 1 : Base de Données
- [ ] Modifier `prisma/schema.prisma` (ajouter champs identité)
- [ ] Exécuter `npm run db:generate`
- [ ] Exécuter `npm run db:push`
- [ ] Vérifier compatibilité avec données existantes

### Phase 2 : Brand Identity Wizard
- [ ] Créer `/app/brands/create/page.tsx`
- [ ] Créer `components/brands/BrandIdentityWizard.tsx`
- [ ] Créer les 3 composants d'étapes
- [ ] Créer API route `/api/brands/generate-identity`
- [ ] Tester génération IA

### Phase 3 : Intégration Launch Map
- [ ] Modifier `LaunchMapStepper.tsx` (ajouter Phase 0)
- [ ] Logique de vérification identité
- [ ] Redirection vers wizard si pas d'identité

### Phase 4 : Application Identité
- [ ] Modifier `DesignStudioForm.tsx` (toggle identité)
- [ ] Modifier `UGCLab.tsx` (utiliser identité)
- [ ] Tester application automatique

### Phase 5 : Brand Dashboard
- [ ] Créer `/app/brands/[id]/page.tsx`
- [ ] Créer `components/brands/BrandDashboard.tsx`
- [ ] Afficher identité + designs + progression

### Phase 6 : Navigation
- [ ] Ajouter "Mes Marques" dans Sidebar
- [ ] Modifier Dashboard (bouton créer marque)
- [ ] Tester navigation complète

---

## 🚀 Ordre d'Implémentation Recommandé

### Sprint 1 : Fondations (Semaine 1)
1. ✅ Modifier schéma Prisma
2. ✅ Créer API route génération identité
3. ✅ Créer Brand Identity Wizard (MVP simple)

### Sprint 2 : Intégration (Semaine 2)
1. ✅ Intégrer Phase 0 dans Launch Map
2. ✅ Ajouter toggle dans Design Studio
3. ✅ Utiliser identité dans UGC Lab

### Sprint 3 : Dashboard (Semaine 3)
1. ✅ Créer Brand Dashboard
2. ✅ Modifier navigation
3. ✅ Tests complets

---

## 🔄 Compatibilité avec Données Existantes

### Marques Sans Identité

**Problème :** Les marques existantes n'ont pas d'identité.

**Solution :**
- Tous les champs sont optionnels (null)
- L'application fonctionne normalement
- Phase 0 apparaît dans Launch Map si identité manquante
- L'utilisateur peut créer l'identité à tout moment

**Code :**
```typescript
// Dans Launch Map
const hasIdentity = brand.logo && brand.colorPalette;

if (!hasIdentity) {
  // Afficher Phase 0
  // Proposer création identité
}
```

---

## 📊 Impact sur les Outils Existants

### Design Studio
- ✅ **Avant :** Génération design générique
- ✅ **Après :** Option d'appliquer identité (toggle)
- ✅ **Rétrocompatibilité :** Toggle OFF = comportement actuel

### UGC AI Lab
- ✅ **Avant :** Scripts génériques
- ✅ **Après :** Utilise nom de marque + style si disponible
- ✅ **Rétrocompatibilité :** Fonctionne sans identité

### Launch Map
- ✅ **Avant :** 4 phases
- ✅ **Après :** 5 phases (Phase 0 ajoutée)
- ✅ **Rétrocompatibilité :** Phase 0 optionnelle

---

## 🎯 Résumé de l'Intégration

**Ce qui change :**
- ✅ Nouvelle page : Brand Identity Wizard
- ✅ Nouvelle page : Brand Dashboard
- ✅ Phase 0 ajoutée dans Launch Map
- ✅ Toggle identité dans Design Studio
- ✅ Utilisation identité dans UGC Lab

**Ce qui reste :**
- ✅ Tous les outils existants fonctionnent
- ✅ Pas de breaking changes
- ✅ Compatible avec marques existantes

**Résultat :**
- ✅ Cycle complet de création
- ✅ Authenticité préservée
- ✅ Pas de surcharge
- ✅ Intégration fluide

---

**Prêt pour l'implémentation ?** Je peux commencer par la Phase 1 (Base de données + Brand Identity Wizard MVP).
