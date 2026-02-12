# 🎯 Système de Score de Tendance - Guide Complet

## 📊 Principe

Au lieu de supprimer systématiquement les anciennes tendances à chaque scraping, on utilise un **système de scoring intelligent** qui évalue chaque produit selon plusieurs critères mesurables.

---

## 🧮 Comment fonctionne le score (0-100) ?

### 1. **Récurrence** (40 points max)
- **Qu'est-ce que c'est ?** Combien de fois le produit apparaît dans vos scrapes
- **Pourquoi ?** Si un produit apparaît souvent, c'est qu'il est vraiment tendance
- **Calcul** : +5 points par apparition (max 40)
- **Exemple** : 
  - Vu 1 fois = 5 points
  - Vu 5 fois = 25 points
  - Vu 8+ fois = 40 points

### 2. **Fraîcheur** (25 points max)
- **Qu'est-ce que c'est ?** Depuis combien de temps le produit est présent
- **Pourquoi ?** Les tendances récentes sont plus pertinentes
- **Calcul** :
  - Produit récent (< 7 jours) = +15 points
  - Produit moyen (7-14 jours) = +10 points
  - Produit ancien (14-30 jours) = +5 points
  - **Pénalité** si pas vu récemment :
    - Vu aujourd'hui = +10 points
    - Vu il y a 3 jours = +7 points
    - Vu il y a 7 jours = +3 points
    - Vu il y a 14+ jours = pénalité de -2 points par jour

### 3. **Multi-zones** (20 points max)
- **Qu'est-ce que c'est ?** Présence dans plusieurs marchés géographiques
- **Pourquoi ?** Si un produit est tendance en EU + US + ASIA, c'est une tendance globale forte
- **Calcul** : +10 points par zone supplémentaire
- **Exemple** :
  - 1 zone (FR uniquement) = 0 points
  - 2 zones (FR + US) = 10 points
  - 3 zones (FR + US + ASIA) = 20 points

### 4. **Croissance source** (10 points max)
- **Qu'est-ce que c'est ?** Le % de croissance indiqué par Zalando (si disponible)
- **Pourquoi ?** Zalando affiche parfois "+15%" sur certains produits
- **Calcul** : Pourcentage / 10
- **Exemple** :
  - Zalando dit "+15%" = 1.5 points
  - Zalando dit "+50%" = 5 points
  - Zalando dit "+100%" = 10 points

### 5. **Engagement utilisateurs** (5 points max)
- **Qu'est-ce que c'est ?** Nombre de favoris dans votre app
- **Pourquoi ?** Si vos utilisateurs aiment le produit, c'est un bon signal
- **Calcul** : +0.5 point par favori (max 5)
- **Exemple** :
  - 0 favoris = 0 points
  - 5 favoris = 2.5 points
  - 10+ favoris = 5 points

### 6. **Bonus multi-segment** (+5 points)
- **Qu'est-ce que c'est ?** Le produit existe en version homme ET femme
- **Pourquoi ?** C'est une tendance unisexe, donc plus forte
- **Calcul** : +5 points si présent dans 2+ segments

---

## 🎯 Seuils de décision

### Score >= 70 : **Tendance forte** 🔥
- Récurrence élevée
- Présence récente
- Multi-zones
- **Action** : Garder et mettre en avant

### Score 50-69 : **Tendance modérée** 📈
- Présence régulière
- Potentiel intéressant
- **Action** : Garder et surveiller

### Score 30-49 : **Tendance émergente** 🌱
- Début de tendance
- À surveiller
- **Action** : Garder temporairement

### Score < 30 : **Tendance obsolète** ❌
- Récurrence faible
- Pas vu récemment
- **Action** : Supprimer

---

## 🔄 Workflow automatique

### Après chaque scraping :

1. **Scraping** : Récupération des nouveaux produits
2. **Calcul des scores** : Tous les produits sont réévalués
3. **Nettoyage** : Suppression des produits avec score < 30
4. **Résultat** : Base de données propre avec seulement les vraies tendances

---

## 💡 Exemples concrets

### Exemple 1 : Tendance forte (Score = 85)
```
Produit : "Cargo baggy beige"
- Récurrence : 8 fois → 40 points
- Fraîcheur : Vu aujourd'hui, créé il y a 5 jours → 25 points
- Multi-zones : EU + US → 10 points
- Croissance : Zalando "+50%" → 5 points
- Engagement : 10 favoris → 5 points
Total : 85/100 → ✅ GARDER (tendance forte)
```

### Exemple 2 : Tendance obsolète (Score = 25)
```
Produit : "Pull rouge basique"
- Récurrence : 2 fois → 10 points
- Fraîcheur : Vu il y a 20 jours, créé il y a 35 jours → 5 - 26 = -21 → 0 points
- Multi-zones : FR uniquement → 0 points
- Croissance : Pas de données → 0 points
- Engagement : 0 favoris → 0 points
Total : 10/100 → ❌ SUPPRIMER (obsolète)
```

### Exemple 3 : Tendance émergente (Score = 42)
```
Produit : "Veste sans manches cargo"
- Récurrence : 3 fois → 15 points
- Fraîcheur : Vu il y a 2 jours, créé il y a 8 jours → 10 + 7 = 17 points
- Multi-zones : EU uniquement → 0 points
- Croissance : Zalando "+30%" → 3 points
- Engagement : 2 favoris → 1 point
- Multi-segment : Homme + Femme → 5 points
Total : 41/100 → ✅ GARDER (émergente, à surveiller)
```

---

## 🛠️ Utilisation

### 1. Nettoyage manuel (simulation)
```bash
npx tsx scripts/cleanup-trends.ts --dry-run
```
Affiche ce qui serait supprimé sans rien supprimer.

### 2. Nettoyage manuel (réel)
```bash
npx tsx scripts/cleanup-trends.ts
```
Supprime réellement les produits obsolètes.

### 3. Nettoyage automatique (via API)
```bash
# Simulation
curl -X POST http://localhost:3000/api/cron/cleanup-trends \
  -H "Authorization: Bearer changez_moi_en_production" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'

# Réel
curl -X POST http://localhost:3000/api/cron/cleanup-trends \
  -H "Authorization: Bearer changez_moi_en_production"
```

### 4. Statistiques (sans nettoyage)
```bash
curl -X GET http://localhost:3000/api/cron/cleanup-trends \
  -H "Authorization: Bearer changez_moi_en_production"
```

---

## 🤖 Intégration avec n8n

Pour automatiser le nettoyage après chaque scraping, ajoutez un nœud dans votre workflow n8n :

1. Après le nœud "Refresh Zalando"
2. Ajoutez un nœud HTTP Request :
   - **Method** : POST
   - **URL** : `http://localhost:3000/api/cron/cleanup-trends`
   - **Headers** : `Authorization: Bearer changez_moi_en_production`
   - **Body** : `{}`

---

## 📊 Avantages de ce système

### ✅ Intelligent
- Ne supprime pas aveuglément
- Garde les vraies tendances
- Détecte les tendances émergentes

### ✅ Automatique
- Pas besoin d'intervention manuelle
- S'adapte aux données
- Recalcule à chaque scraping

### ✅ Transparent
- Score explicable (0-100)
- Raisons claires
- Rapports détaillés

### ✅ Flexible
- Seuils ajustables
- Poids des critères modifiables
- Mode dry-run pour tester

---

## 🎯 Résultat final

Votre base de données contiendra **uniquement les vraies tendances** :
- Produits récurrents
- Présence récente
- Tendances globales
- Engagement utilisateurs

**Fini les anciennes tendances qui polluent votre app !** 🎉
