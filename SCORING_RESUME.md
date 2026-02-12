# 🎯 Système de Score de Tendance - Résumé Rapide

## 📊 Comment ça marche ?

```
┌─────────────────────────────────────────────────────────────┐
│                    SCORE DE TENDANCE (0-100)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔄 Récurrence (40 pts)     ← Combien de fois vu ?        │
│  ⏰ Fraîcheur (25 pts)      ← Récent ? Vu récemment ?     │
│  🌍 Multi-zones (20 pts)    ← EU + US + ASIA ?            │
│  📈 Croissance (10 pts)     ← % Zalando                   │
│  ❤️  Engagement (5 pts)      ← Favoris utilisateurs       │
│  👥 Multi-segment (+5 pts)  ← Homme + Femme ?             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Seuils de décision

| Score | Statut | Action |
|-------|--------|--------|
| **70-100** | 🔥 Tendance forte | ✅ Garder + Mettre en avant |
| **50-69** | 📈 Tendance modérée | ✅ Garder + Surveiller |
| **30-49** | 🌱 Tendance émergente | ✅ Garder temporairement |
| **0-29** | ❌ Tendance obsolète | 🗑️ **SUPPRIMER** |

## 🔄 Workflow automatique

```
┌──────────────┐
│   SCRAPING   │  ← Tous les mardis 12h
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  NOUVEAUX    │  ← Produits ajoutés en base
│  PRODUITS    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  CALCUL DES  │  ← Tous les produits réévalués
│    SCORES    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  NETTOYAGE   │  ← Suppression si score < 30
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   BASE DE    │  ← Seulement les vraies tendances
│   DONNÉES    │
│   PROPRE     │
└──────────────┘
```

## 💡 Exemples

### ✅ GARDER (Score = 85)
```
Cargo baggy beige
├─ Récurrence: 8x → 40 pts
├─ Fraîcheur: Vu aujourd'hui → 25 pts
├─ Multi-zones: EU + US → 10 pts
├─ Croissance: +50% → 5 pts
└─ Engagement: 10 favoris → 5 pts
= 85/100 → TENDANCE FORTE 🔥
```

### ❌ SUPPRIMER (Score = 10)
```
Pull rouge basique
├─ Récurrence: 2x → 10 pts
├─ Fraîcheur: Vu il y a 20j → 0 pts
├─ Multi-zones: FR uniquement → 0 pts
├─ Croissance: Aucune → 0 pts
└─ Engagement: 0 favoris → 0 pts
= 10/100 → OBSOLÈTE ❌
```

## 🛠️ Commandes rapides

```bash
# Simulation (voir ce qui serait supprimé)
npx tsx scripts/cleanup-trends.ts --dry-run

# Nettoyage réel
npx tsx scripts/cleanup-trends.ts

# Via API (automatique)
curl -X POST http://localhost:3000/api/cron/cleanup-trends \
  -H "Authorization: Bearer changez_moi_en_production"
```

## 🎯 Résultat

**Avant** : 500 produits (dont 300 obsolètes)
**Après** : 200 produits (seulement les vraies tendances)

✅ Base de données propre
✅ Tendances pertinentes
✅ Automatique
✅ Intelligent
