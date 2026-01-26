# 🔧 Guide de Correction - Problème Prisma

## Problème

Les modèles `TrendProduct` et `ProductFavorite` ont été ajoutés au schéma Prisma, mais le client Prisma n'a pas été régénéré. Cela cause l'erreur :

```
Cannot read properties of undefined (reading 'findMany')
```

## Solution

### Étape 1 : Arrêter le serveur de développement

**Important** : Le serveur doit être arrêté pour déverrouiller les fichiers Prisma.

1. Trouvez le terminal où `npm run dev` tourne
2. Appuyez sur `Ctrl+C` pour arrêter le serveur
3. Attendez que le serveur soit complètement arrêté

### Étape 2 : Régénérer le client Prisma

Une fois le serveur arrêté, exécutez :

```bash
npm run db:generate
```

Cette commande va :
- Lire le schéma Prisma (`prisma/schema.prisma`)
- Générer le client TypeScript avec les nouveaux modèles
- Créer les types TypeScript pour `TrendProduct` et `ProductFavorite`

### Étape 3 : Pousser les changements à la base de données

```bash
npm run db:push
```

Cette commande va :
- Créer les tables `TrendProduct` et `ProductFavorite` dans PostgreSQL
- Synchroniser le schéma avec la base de données

### Étape 4 : Redémarrer le serveur

```bash
npm run dev
```

## Vérification

Après ces étapes, le module **Tendances & Hits** devrait fonctionner correctement :
- ✅ Pas d'erreur `Cannot read properties of undefined`
- ✅ Les favoris fonctionnent
- ✅ Les produits s'affichent

## Alternative : Script Automatique

Un script a été créé pour faciliter la correction :

```bash
npm run db:fix
```

**Note** : Vous devez quand même arrêter le serveur avant d'exécuter ce script.

## En Cas d'Erreur

Si vous obtenez toujours l'erreur `EPERM: operation not permitted` :

1. **Vérifiez que le serveur est bien arrêté**
   - Fermez tous les terminaux avec `npm run dev`
   - Vérifiez le gestionnaire de tâches Windows (Ctrl+Shift+Esc)
   - Cherchez les processus Node.js et arrêtez-les

2. **Redémarrez votre éditeur** (Cursor)
   - Parfois l'éditeur garde des fichiers ouverts

3. **Réessayez les commandes**

## Commandes Rapides

```bash
# Arrêter serveur (Ctrl+C dans le terminal du serveur)
# Puis :
npm run db:generate && npm run db:push && npm run dev
```

---

**Créé par** : Agent Dev BMAD  
**Date** : 2025-01-23
