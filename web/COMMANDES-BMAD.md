# Guide Complet des Commandes BMAD

Ce document liste toutes les commandes disponibles pour chaque agent du framework BMAD-Method.

## ⚠️ Important : Format des Commandes

**Toutes les commandes doivent être préfixées par `*` (astérisque) dans les environnements web UI.**

**Dans les IDEs :**
- **Claude Code, Windsurf, Trae** : `/agent-name` (ex: `/bmad-master`)
- **Cursor** : `@agent-name` (ex: `@bmad-master`)
- **Roo Code** : Sélectionner le mode depuis le sélecteur
- **GitHub Copilot** : Ouvrir la vue Chat et sélectionner **Agent** depuis le sélecteur de mode

---

## 🎭 BMad Orchestrator

**Rôle** : Coordinateur principal et expert de la méthode BMad

### Commandes Principales
- `*help` - Afficher le guide avec les agents et workflows disponibles
- `*agent [nom]` - Se transformer en agent spécialisé (liste si aucun nom spécifié)
- `*chat-mode` - Démarrer le mode conversationnel pour assistance détaillée
- `*checklist [nom]` - Exécuter une checklist (liste si aucun nom spécifié)
- `*doc-out` - Sortir le document complet
- `*kb-mode` - Charger la base de connaissances complète BMad
- `*party-mode` - Chat de groupe avec tous les agents
- `*status` - Afficher le contexte actuel, l'agent actif et la progression
- `*task [nom]` - Exécuter une tâche spécifique (liste si aucun nom spécifié)
- `*yolo` - Activer/désactiver le mode sans confirmation
- `*exit` - Retourner à BMad ou quitter la session

### Commandes de Workflow
- `*workflow [nom]` - Démarrer un workflow spécifique (liste si aucun nom)
- `*workflow-guidance` - Obtenir de l'aide personnalisée pour choisir le bon workflow
- `*plan` - Créer un plan de workflow détaillé avant de commencer
- `*plan-status` - Afficher la progression du plan de workflow actuel
- `*plan-update` - Mettre à jour le statut du plan de workflow

---

## 🧙 BMad Master

**Rôle** : Exécuteur universel de toutes les capacités BMad

### Commandes
- `*help` - Afficher la liste numérotée des commandes
- `*create-doc {template}` - Exécuter la tâche create-doc (sans template = liste les templates disponibles)
- `*doc-out` - Sortir le document complet vers le fichier de destination actuel
- `*document-project` - Exécuter la tâche document-project.md
- `*execute-checklist {checklist}` - Exécuter la tâche execute-checklist (sans checklist = liste les checklists disponibles)
- `*kb` - Activer/désactiver le mode KB (charge bmad-kb.md pour répondre aux questions)
- `*shard-doc {document} {destination}` - Exécuter la tâche shard-doc sur le document fourni
- `*task {task}` - Exécuter une tâche (si non trouvée ou non spécifiée, liste les tâches disponibles)
- `*yolo` - Activer/désactiver le mode YOLO
- `*exit` - Quitter (confirmer)

---

## 📊 Analyst (Business Analyst)

**Rôle** : Analyste business spécialisé en recherche, brainstorming et analyse

### Commandes
- `*help` - Afficher la liste numérotée des commandes
- `*brainstorm {topic}` - Faciliter une session de brainstorming structurée
- `*create-competitor-analysis` - Créer une analyse concurrentielle (task create-doc avec competitor-analysis-tmpl.yaml)
- `*create-project-brief` - Créer un brief de projet (task create-doc avec project-brief-tmpl.yaml)
- `*doc-out` - Sortir le document complet en cours vers le fichier de destination actuel
- `*elicit` - Exécuter la tâche advanced-elicitation
- `*perform-market-research` - Effectuer une recherche de marché (task create-doc avec market-research-tmpl.yaml)
- `*research-prompt {topic}` - Exécuter la tâche create-deep-research-prompt.md
- `*yolo` - Activer/désactiver le mode YOLO
- `*exit` - Dire au revoir en tant qu'Analyste Business et abandonner cette persona

---

## 📋 PM (Product Manager)

**Rôle** : Gestionnaire de produit spécialisé en PRD et stratégie produit

### Commandes
- `*help` - Afficher la liste numérotée des commandes
- `*correct-course` - Exécuter la tâche correct-course
- `*create-brownfield-epic` - Exécuter la tâche brownfield-create-epic.md
- `*create-brownfield-prd` - Créer un PRD brownfield (task create-doc.md avec template brownfield-prd-tmpl.yaml)
- `*create-brownfield-story` - Exécuter la tâche brownfield-create-story.md
- `*create-epic` - Créer un epic pour projets brownfield (task brownfield-create-epic)
- `*create-prd` - Créer un PRD (task create-doc.md avec template prd-tmpl.yaml)
- `*create-story` - Créer une user story à partir des exigences (task brownfield-create-story)
- `*doc-out` - Sortir le document complet vers le fichier de destination actuel
- `*shard-prd` - Exécuter la tâche shard-doc.md pour le prd.md fourni (demander si non trouvé)
- `*yolo` - Activer/désactiver le mode YOLO
- `*exit` - Quitter (confirmer)

---

## 🏗️ Architect

**Rôle** : Architecte système spécialisé en design technique et architecture

### Commandes
- `*help` - Afficher la liste numérotée des commandes
- `*create-backend-architecture` - Créer une architecture backend (create-doc avec architecture-tmpl.yaml)
- `*create-brownfield-architecture` - Créer une architecture brownfield (create-doc avec brownfield-architecture-tmpl.yaml)
- `*create-front-end-architecture` - Créer une architecture frontend (create-doc avec front-end-architecture-tmpl.yaml)
- `*create-full-stack-architecture` - Créer une architecture fullstack (create-doc avec fullstack-architecture-tmpl.yaml)
- `*doc-out` - Sortir le document complet vers le fichier de destination actuel
- `*document-project` - Exécuter la tâche document-project.md
- `*execute-checklist {checklist}` - Exécuter la tâche execute-checklist (par défaut -> architect-checklist)
- `*research {topic}` - Exécuter la tâche create-deep-research-prompt
- `*shard-prd` - Exécuter la tâche shard-doc.md pour l'architecture.md fourni (demander si non trouvé)
- `*yolo` - Activer/désactiver le mode YOLO
- `*exit` - Dire au revoir en tant qu'Architecte et abandonner cette persona

---

## 💻 Dev (Developer)

**Rôle** : Développeur full-stack spécialisé en implémentation

### Commandes
- `*help` - Afficher la liste numérotée des commandes
- `*develop-story` - Implémenter une story (ordre: Lire tâche → Implémenter → Tests → Validations → Mettre à jour checkbox → Répéter)
- `*explain` - Expliquer en détail ce qui a été fait et pourquoi (comme pour former un junior)
- `*review-qa` - Exécuter la tâche apply-qa-fixes.md
- `*run-tests` - Exécuter le linting et les tests
- `*exit` - Dire au revoir en tant que Développeur et abandonner cette persona

**Note importante** : Le développeur ne peut modifier QUE les sections suivantes des fichiers story :
- Tasks / Subtasks Checkboxes
- Dev Agent Record section et toutes ses sous-sections
- Agent Model Used
- Debug Log References
- Completion Notes List
- File List
- Change Log
- Status

---

## 🧪 QA (Test Architect)

**Rôle** : Architecte de test et conseiller qualité

### Commandes
- `*help` - Afficher la liste numérotée des commandes
- `*gate {story}` - Exécuter la tâche qa-gate pour écrire/mettre à jour la décision de qualité gate
- `*nfr-assess {story}` - Exécuter la tâche nfr-assess pour valider les exigences non-fonctionnelles
- `*review {story}` - Révision adaptative et complète basée sur les risques (produit: mise à jour QA Results + gate file)
- `*risk-profile {story}` - Exécuter la tâche risk-profile pour générer une matrice d'évaluation des risques
- `*test-design {story}` - Exécuter la tâche test-design pour créer des scénarios de test complets
- `*trace {story}` - Exécuter la tâche trace-requirements pour mapper les exigences aux tests (Given-When-Then)
- `*exit` - Dire au revoir en tant que Test Architect et abandonner cette persona

**Note importante** : QA ne peut modifier QUE la section "QA Results" des fichiers story.

---

## 📝 PO (Product Owner)

**Rôle** : Product Owner technique et gardien du processus

### Commandes
- `*help` - Afficher la liste numérotée des commandes
- `*correct-course` - Exécuter la tâche correct-course
- `*create-epic` - Créer un epic pour projets brownfield (task brownfield-create-epic)
- `*create-story` - Créer une user story à partir des exigences (task brownfield-create-story)
- `*doc-out` - Sortir le document complet vers le fichier de destination actuel
- `*execute-checklist-po` - Exécuter la tâche execute-checklist (checklist po-master-checklist)
- `*shard-doc {document} {destination}` - Exécuter la tâche shard-doc sur le document fourni vers la destination spécifiée
- `*validate-story-draft {story}` - Exécuter la tâche validate-next-story sur le fichier story fourni
- `*yolo` - Activer/désactiver le mode YOLO (on = saute les confirmations de sections doc)
- `*exit` - Quitter (confirmer)

---

## 🏃 SM (Scrum Master)

**Rôle** : Scrum Master technique spécialisé en préparation de stories

### Commandes
- `*help` - Afficher la liste numérotée des commandes
- `*correct-course` - Exécuter la tâche correct-course.md
- `*draft` - Exécuter la tâche create-next-story.md
- `*story-checklist` - Exécuter la tâche execute-checklist.md avec la checklist story-draft-checklist.md
- `*exit` - Dire au revoir en tant que Scrum Master et abandonner cette persona

**Note importante** : SM ne peut PAS implémenter des stories ou modifier du code.

---

## 🎨 UX Expert

**Rôle** : Expert UX/UI spécialisé en design d'expérience utilisateur

### Commandes
- `*help` - Afficher la liste numérotée des commandes
- `*create-front-end-spec` - Exécuter la tâche create-doc.md avec le template front-end-spec-tmpl.yaml
- `*generate-ui-prompt` - Exécuter la tâche generate-ai-frontend-prompt.md
- `*exit` - Dire au revoir en tant qu'Expert UX et abandonner cette persona

---

## 📚 Commandes Universelles

Ces commandes sont disponibles pour tous les agents :

- `*help` - Afficher les commandes disponibles
- `*status` - Afficher le contexte actuel et la progression
- `*exit` - Quitter le mode agent actuel

---

## 🔄 Workflow de Développement Recommandé

### Phase 1 : Planification (Web UI recommandé)
1. `*analyst` → `*perform-market-research` ou `*create-project-brief`
2. `*pm` → `*create-prd`
3. `*architect` → `*create-full-stack-architecture` (ou variante selon besoin)
4. `*po` → `*execute-checklist-po` (validation)

### Phase 2 : Développement (IDE recommandé)
1. `*sm` → `*draft` (créer la prochaine story)
2. `*dev` → `*develop-story` (implémenter)
3. `*qa` → `*review {story}` (révision qualité)
4. Répéter jusqu'à complétion de l'epic

---

## 💡 Conseils d'Utilisation

1. **Toujours utiliser `*help`** pour voir les commandes disponibles pour l'agent actuel
2. **Changer d'agent = nouveau chat** (sauf Roo Code où on change de mode)
3. **Les commandes nécessitent le préfixe `*`** dans les environnements web UI
4. **Utiliser `*yolo`** pour accélérer les workflows interactifs (saute les confirmations)
5. **`*doc-out`** pour sauvegarder un document en cours de création
6. **`*status`** pour vérifier où vous en êtes dans le workflow

---

## 📖 Ressources Complémentaires

Pour plus d'informations sur :
- Les workflows complets : Utiliser `*kb-mode` avec bmad-orchestrator
- Les templates disponibles : Utiliser `*create-doc` sans paramètre
- Les checklists disponibles : Utiliser `*execute-checklist` sans paramètre
- La base de connaissances : Utiliser `*kb-mode` ou `*kb` selon l'agent

---

*Dernière mise à jour : Basé sur les bundles web BMAD v4*
