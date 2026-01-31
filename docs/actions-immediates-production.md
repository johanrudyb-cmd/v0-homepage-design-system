# Actions Immédiates pour Rendre l'App 100% Fonctionnelle

*Document créé via BMAD-Method - Analyst*

## Date : 2025-01-26

---

## 🎯 Objectif

Liste **concrète et actionnable** de ce qu'il faut faire MAINTENANT pour rendre l'app fonctionnelle.

---

## 🔴 CRITIQUE - À Faire MAINTENANT (30 min)

### 1. Seed Données (15 min)

#### 1.1 Seed Usines
```bash
npm run db:seed-factories
```

**Résultat** : 20 usines de démo créées dans Sourcing Hub

**Vérification** :
- Aller sur `/sourcing`
- Vérifier qu'il y a des usines affichées

---

#### 1.2 Seed Produits Tendances
```bash
# Option 1 : Via l'interface (recommandé)
# Aller sur /trends et cliquer sur un bouton seed (si existe)

# Option 2 : Via API
curl -X POST http://localhost:3000/api/trends/seed
```

**OU créer un script** :
```bash
# Créer scripts/seed-trends.js
node scripts/seed-trends.js
```

**Résultat** : 50+ produits de démo créés dans Tendances & Hits

**Vérification** :
- Aller sur `/trends`
- Vérifier qu'il y a des produits affichés

---

### 2. Configurer APIs (10 min)

#### 2.1 Vérifier `.env.local`
```env
# CRITIQUE - Doit être configuré
OPENAI_API_KEY=sk-votre-vraie-cle-ici
HIGGSFIELD_API_KEY=votre-vraie-cle-ici

# Si manquant, l'app ne peut pas générer de designs/scripts
```

#### 2.2 Tester les APIs
1. **Design Studio** :
   - Aller sur `/design-studio`
   - Créer une marque si nécessaire
   - Générer un design
   - **Vérifier** : Design généré avec succès (pas d'erreur)

2. **UGC Lab** :
   - Aller sur `/ugc`
   - Générer un script
   - **Vérifier** : Script généré avec succès

---

### 3. Vérifier Base de Données (5 min)

```bash
# Régénérer Prisma client
npm run db:generate

# Push le schéma
npm run db:push

# Vérifier la connexion
npm run db:test
```

---

## 🟡 IMPORTANT - À Faire Cette Semaine (4-6h)

### 1. Implémenter Export PDF (4-6h)

#### 1.1 Export PDF Tech Pack
- [ ] Créer route `/api/designs/[id]/export-pdf`
- [ ] Utiliser `pdfkit` (déjà installé)
- [ ] Générer PDF avec données complètes
- [ ] Tester l'export

#### 1.2 Export PDF Brand Spy
- [ ] Créer route `/api/spy/[id]/export-pdf`
- [ ] Générer PDF avec analyse complète
- [ ] Tester l'export

---

## 📋 Checklist Complète

### Avant de Rendre Public

#### Fonctionnel
- [ ] Authentification fonctionne (inscription/connexion)
- [ ] Design Studio génère vraiment (testé avec vraie API)
- [ ] UGC Lab génère vraiment (testé avec vraie API)
- [ ] Sourcing Hub affiche des usines (seed exécuté)
- [ ] Tendances & Hits affiche des produits (seed exécuté)
- [ ] Brand Spy analyse vraiment (testé avec vraie URL)

#### Données
- [ ] Au moins 20 usines dans Sourcing Hub
- [ ] Au moins 50 produits dans Tendances & Hits
- [ ] Brand Spy retourne des données (même estimées)

#### APIs
- [ ] `OPENAI_API_KEY` configurée et testée
- [ ] `HIGGSFIELD_API_KEY` configurée et testée
- [ ] Génération design testée et fonctionne
- [ ] Génération script testée et fonctionne

#### Base de Données
- [ ] Prisma client régénéré
- [ ] Schéma poussé en DB
- [ ] Connexion testée

#### Sécurité
- [ ] Variables d'env configurées
- [ ] `NEXTAUTH_SECRET` fort
- [ ] Rate limiting activé
- [ ] Headers de sécurité configurés

---

## 🚀 Plan d'Action Immédiat

### Maintenant (30 min)

1. **Seed usines** :
   ```bash
   npm run db:seed-factories
   ```

2. **Seed produits** :
   - Créer script ou appeler API seed

3. **Vérifier APIs** :
   - Tester génération design
   - Tester génération script

4. **Tester chaque module** :
   - Launch Map
   - Design Studio
   - Sourcing Hub
   - UGC Lab
   - Brand Spy
   - Tendances & Hits

---

### Cette Semaine (4-6h)

1. **Implémenter Export PDF**
2. **Tests complets end-to-end**
3. **Améliorer gestion d'erreurs**

---

## ✅ Une Fois Complété

**L'app sera ~85% fonctionnelle** (acceptable MVP) :
- ✅ Tous les modules opérationnels
- ✅ Données de démo disponibles
- ✅ Générations IA fonctionnelles
- ⚠️ Export PDF manquant (peut être Phase 2)
- ⚠️ Données Brand Spy estimées (acceptable MVP)

**Pour 100%** :
- ⏳ Export PDF implémenté
- ⏳ APIs réelles Brand Spy (Phase 2)

---

**Temps total pour MVP fonctionnel** : **30-45 minutes** (seeds + APIs)

**Temps total pour 100%** : **5-7 heures** (seeds + APIs + Export PDF)
