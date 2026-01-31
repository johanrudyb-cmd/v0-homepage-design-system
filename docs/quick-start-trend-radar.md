# Quick Start - Trend Radar

*Guide rapide pour démarrer*

## 🚀 En 3 Étapes

### 1. Migration Base de Données

```bash
# Arrêter serveur (Ctrl+C)
npm run db:generate
npm run db:push
```

---

### 2. Scanner les Marques

**Via interface** :
- Aller sur `/trends`
- Cliquer "Scanner les marques"
- Attendre 2-3 minutes

**Via API** :
```bash
curl -X POST http://localhost:3000/api/trends/scan-big-brands
```

---

### 3. Voir les Tendances

Les tendances confirmées (3+ leaders) apparaissent automatiquement dans l'interface.

---

## ✅ C'est Prêt !

Le Trend Radar est maintenant **100% fonctionnel** avec :
- ✅ Scraping 5 grandes marques
- ✅ Détection tendances (3+ leaders)
- ✅ Interface avec alertes
- ✅ CRON job quotidien

---

**Temps total** : 5 minutes
