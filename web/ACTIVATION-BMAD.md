# 🚀 Guide d'Activation Rapide - Agents BMAD

## ✅ Les agents BMAD sont maintenant activés !

### Comment utiliser les agents dans Cursor

1. **Ouvrez le chat Cursor** (Ctrl+L ou Cmd+L)

2. **Tapez le nom de l'agent avec @** :
   \`\`\`
   @bmad-orchestrator
   \`\`\`

3. **L'agent s'active automatiquement** et affiche ses commandes

4. **Utilisez les commandes avec * ** :
   \`\`\`
   *help
   *create-prd
   *develop-story
   \`\`\`

## 🎯 Agents Disponibles

| Agent | Commande | Rôle Principal |
|-------|----------|----------------|
| 🎭 Orchestrator | `@bmad-orchestrator` | Coordinateur, peut orchestrer tous les agents |
| 🧙 Master | `@bmad-master` | Exécuteur universel |
| 📊 Analyst | `@analyst` | Recherche, brainstorming, analyse |
| 📋 PM | `@pm` | Product Manager, PRD, stratégie |
| 🏗️ Architect | `@architect` | Architecture système |
| 💻 Dev | `@dev` | Développement, implémentation |
| 🧪 QA | `@qa` | Tests, qualité, revue de code |
| 📝 PO | `@po` | Product Owner, validation |
| 🏃 SM | `@sm` | Scrum Master, création de stories |
| 🎨 UX Expert | `@ux-expert` | Design UX/UI |

## 🚀 Démarrage Rapide

### Option 1 : Commencer avec l'Orchestrateur (Recommandé)

\`\`\`
@bmad-orchestrator
*help
\`\`\`

L'orchestrateur vous guidera vers le bon agent selon vos besoins.

### Option 2 : Utiliser un Agent Spécifique

**Pour créer un PRD :**
\`\`\`
@pm
*create-prd
\`\`\`

**Pour créer une architecture :**
\`\`\`
@architect
*create-full-stack-architecture
\`\`\`

**Pour développer une story :**
\`\`\`
@dev
*develop-story
\`\`\`

## 📖 Commandes Essentielles

Tous les agents supportent :
- `*help` - Voir toutes les commandes
- `*status` - Voir le contexte actuel
- `*exit` - Quitter le mode agent

## 🔍 Où Trouver Plus d'Informations

- **Guide complet des commandes** : `COMMANDES-BMAD.md`
- **Configuration BMAD** : `.bmad-core/core-config.yaml`
- **Base de connaissances** : `.bmad-core/data/bmad-kb.md`

## 💡 Exemple de Workflow Complet

1. **Planification** (Web UI recommandé pour économiser les tokens) :
   - `@analyst` → `*perform-market-research`
   - `@pm` → `*create-prd`
   - `@architect` → `*create-full-stack-architecture`

2. **Développement** (IDE) :
   - `@sm` → `*draft` (créer la prochaine story)
   - `@dev` → `*develop-story` (implémenter)
   - `@qa` → `*review {story}` (révision qualité)

## ⚠️ Notes Importantes

- **Toutes les commandes nécessitent le préfixe `*`** (astérisque)
- **Changez d'agent** en tapant simplement `@nouvel-agent`
- **Utilisez `*help`** pour voir les commandes spécifiques à chaque agent
- **Les agents sont déjà configurés** - pas besoin d'installation supplémentaire

---

**Les agents BMAD sont prêts à l'emploi ! 🎉**

Tapez simplement `@bmad-orchestrator` dans le chat Cursor pour commencer.
