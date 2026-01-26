# Information sur le Seed des Usines

## ⚠️ Données de Démonstration

**IMPORTANT** : Les usines créées par le script de seed sont **FICTIVES** et servent uniquement à :
- Tester les fonctionnalités du Sourcing Hub
- Démonstrer l'application
- Développement et tests

### Ce qui est FICTIF

- ✅ **Noms d'usines** : Inventés pour la démo
- ✅ **Emails** : Domaines fictifs (ex: `@textileportugal.pt`)
- ✅ **Téléphones** : Numéros fictifs
- ✅ **Spécialités, MOQ, délais** : Données réalistes mais inventées

### Ce qui est RÉALISTE

- ✅ **Pays** : Vrais pays (Portugal, Turquie, Chine, etc.)
- ✅ **Certifications** : Vraies certifications (OEKO-TEX, GOTS)
- ✅ **MOQ typiques** : Basés sur standards de l'industrie
- ✅ **Délais** : Basés sur délais réels de l'industrie

---

## Utilisation

### Pour le Développement / MVP

Les données mockées sont **parfaitement adaptées** pour :
- ✅ Tests fonctionnels
- ✅ Démonstrations
- ✅ Développement des fonctionnalités
- ✅ Validation UX

### Pour la Production

**Vous devrez remplacer** les données mockées par :

1. **Option A : Usines réelles vérifiées**
   - Rechercher de vraies usines
   - Obtenir autorisations
   - Vérifier les informations
   - Mettre à jour la base de données

2. **Option B : Système d'inscription**
   - Permettre aux usines de créer leur profil
   - Système de vérification/modération
   - Les usines s'inscrivent elles-mêmes

3. **Option C : Curation manuelle**
   - Équipe qui recherche et ajoute des usines
   - Validation avant publication
   - Maintenance régulière

---

## Script de Seed

### Exécution

```bash
npm run db:seed-factories
```

### Données Créées

- **20 usines** de démonstration
- **Répartition géographique** :
  - Portugal : 5 usines
  - Turquie : 6 usines
  - Chine : 6 usines
  - Autres pays EU : 3 usines

### Caractéristiques

Chaque usine inclut :
- Nom et pays
- MOQ (50-1000)
- Spécialités variées
- Délais de livraison (25-50 jours)
- Certifications
- Contacts (fictifs)
- Rating (4.3-4.8)

---

## Recommandations

### Phase MVP

✅ **Utiliser les données mockées** - Parfait pour tester et démontrer

### Phase Production

⏳ **Remplacer par vraies données** - Nécessaire pour valeur réelle

### Stratégie Recommandée

1. **MVP** : Données mockées (actuel)
2. **Beta** : Ajouter 5-10 vraies usines vérifiées
3. **Production** : Système d'inscription + curation

---

**Document créé par** : Analyst BMAD  
**Date** : 2025-01-23  
**Status** : Information sur données de démonstration
