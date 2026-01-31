# Debug : Pourquoi les Tendances ne s'Affichent Pas

*Document créé via BMAD-Method - Dev*

## Date : 2025-01-26

---

## 🔍 Diagnostic

### Problème
Les tendances ne s'affichent pas dans l'onglet `/trends`.

### Causes Possibles

1. **Aucune donnée dans la base** ❌
   - Aucun scan n'a été exécuté
   - La table `TrendSignal` est vide

2. **Données non confirmées** ⚠️
   - Des produits ont été scrapés mais ne sont pas confirmés
   - Une tendance est confirmée seulement si **3+ marques** ont le même produit

3. **Erreur dans l'API** ❌
   - L'API `/api/trends/confirmed` retourne une erreur
   - Problème de connexion à la base de données

---

## ✅ Solutions

### Solution 1 : Lancer un Scan

**Via l'interface** :
1. Aller sur `/trends`
2. Cliquer sur **"Lancer le scan des tendances"**
3. Attendre 2-5 minutes

**Via l'API** :
```bash
curl -X POST http://localhost:3000/api/trends/scan-big-brands
```

**Résultat attendu** :
- Produits scrapés depuis les 49 marques configurées
- Tendances détectées si 3+ marques ont le même produit
- Affichage automatique dans `/trends`

---

### Solution 2 : Vérifier les Données

**Via Prisma Studio** :
```bash
npm run db:studio
```

**Vérifier** :
1. Table `TrendSignal` :
   - Nombre de signaux : `SELECT COUNT(*) FROM "TrendSignal"`
   - Signaux confirmés : `SELECT COUNT(*) FROM "TrendSignal" WHERE "isConfirmed" = true`
   - Signaux non confirmés : `SELECT COUNT(*) FROM "TrendSignal" WHERE "isConfirmed" = false`

2. Table `ScrapableBrand` :
   - Marques actives : `SELECT COUNT(*) FROM "ScrapableBrand" WHERE "isActive" = true`
   - Doit être 49 marques

---

### Solution 3 : Vérifier les Logs

**Console du navigateur** (F12) :
- Vérifier les erreurs dans la console
- Vérifier les appels API dans l'onglet Network

**Logs serveur** :
- Vérifier les logs du serveur Next.js
- Chercher les erreurs `[Trend Scan]` ou `[Trend Detector]`

---

## 🔧 Améliorations Apportées

### 1. Message d'Aide
Si aucune tendance n'est trouvée, un message s'affiche avec :
- Explication du problème
- Bouton pour lancer le scan
- Indication du temps d'attente

### 2. Amélioration du Groupement
- Meilleur regroupement des tendances par type + coupe + matériau
- Calcul correct du prix moyen
- Tri par score de confirmation

### 3. Gestion des Erreurs
- Messages d'erreur plus clairs
- Fallback si l'API échoue

---

## 📊 Workflow Complet

```
1. Utilisateur va sur /trends
   ↓
2. TrendRadar charge les tendances via /api/trends/confirmed
   ↓
3. Si aucune tendance :
   → Affiche message d'aide avec bouton "Lancer le scan"
   ↓
4. Utilisateur clique sur "Lancer le scan"
   ↓
5. POST /api/trends/scan-big-brands
   → Scrape les 49 marques configurées
   → Détecte les tendances (3+ marques = confirmé)
   → Sauvegarde dans TrendSignal
   ↓
6. Rechargement automatique
   → Les tendances s'affichent
```

---

## 🎯 Prochaines Étapes

1. **Lancer un scan** pour avoir des données
2. **Vérifier les sélecteurs CSS** des marques (peuvent nécessiter ajustement)
3. **Surveiller les erreurs** de scraping
4. **Ajuster les priorités** si certaines marques ne fonctionnent pas

---

**Créé via BMAD-Method** 🎯
