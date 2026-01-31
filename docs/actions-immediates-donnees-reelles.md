# Actions Immédiates pour Données Réelles

*Document créé via BMAD-Method - Analyst*

## Date : 2025-01-26

---

## 🎯 Objectif

Remplacer **immédiatement** les données fictives par des données réelles.

---

## 🔴 ACTION 1 : Scraper Produits Tendances (1 heure)

### Commande

```bash
# Démarrer le serveur
npm run dev

# Dans un autre terminal, scraper les produits
curl -X POST http://localhost:3000/api/trends/scrape
```

**OU** via l'interface :
- Aller sur `/api/trends/scrape` (nécessite authentification)

### Résultat

- ✅ 50-100 produits **réels** scrapés depuis stores Shopify
- ✅ Vrais prix, vraies images, vraies descriptions
- ✅ Remplace les 22 produits fictifs

### Fichiers Créés

- ✅ `lib/trends-scraper.ts` (scraper produits)
- ✅ `app/api/trends/scrape/route.ts` (route API)

---

## 🔴 ACTION 2 : Curation Usines Réelles (2-3 semaines)

### Étapes

1. **Rechercher usines réelles** :
   - Google : "fabricant textile Portugal"
   - LinkedIn : Recherche "manufacturer fashion"
   - Salons : Première Vision, Texworld

2. **Contacter usines** :
   - Email : Proposer partenariat
   - Échange : Visibilité vs Commission
   - Vérifier informations

3. **Créer script d'import** :
   ```bash
   # Créer scripts/import-real-factories.js
   # Importer usines réelles dans la base
   ```

4. **Remplacer usines fictives** :
   - Supprimer usines fictives
   - Importer usines réelles

### Résultat

- ✅ 20-30 usines **réelles** vérifiées
- ✅ Contacts fonctionnels
- ✅ Données garanties exactes

---

## 🟡 ACTION 3 : Brand Spy - APIs Payantes (Optionnel)

### Si Budget Disponible (248€/mois)

1. **SimilarWeb API** (199€/mois) :
   - Trafic réel
   - Sources de trafic
   - Géolocalisation

2. **Wappalyzer API** (49€/mois) :
   - Apps précises
   - Stack technique

### Résultat

- ✅ Trafic 100% réel (au lieu d'estimations)
- ✅ Apps 95% précises (au lieu de 70%)

---

## 📋 Checklist Immédiate

### Maintenant (1 heure)
- [ ] Scraper produits tendances (`npm run scrape:trends`)
- [ ] Vérifier produits importés dans `/trends`
- [ ] Supprimer produits fictifs (optionnel)

### Cette Semaine (2-3 semaines)
- [ ] Rechercher 20-30 usines réelles
- [ ] Contacter usines pour partenariat
- [ ] Créer script d'import usines réelles
- [ ] Remplacer usines fictives

### Si Budget (1 semaine)
- [ ] Créer compte SimilarWeb
- [ ] Intégrer SimilarWeb API
- [ ] Créer compte Wappalyzer
- [ ] Intégrer Wappalyzer API

---

## ✅ Après Actions

**Données réelles** :
- ✅ Tendances & Hits : 50-100 produits réels
- ✅ Sourcing Hub : 20-30 usines réelles (dans 2-3 semaines)
- ⚠️ Brand Spy : Estimations (ou APIs payantes)

**État** : **~90% données réelles** (vs 0% actuellement)

---

**Document créé par** : Analyst  
**Date** : 2025-01-26  
**Status** : Actions immédiates
