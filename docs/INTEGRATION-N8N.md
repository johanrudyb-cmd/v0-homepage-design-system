# 🔄 Guide d'Intégration n8n

*Date: 10 février 2026*

## 🎯 Pourquoi n8n pour votre projet ?

Votre application a plusieurs cas d'usage parfaits pour n8n :

1. **CRON Jobs** : Vous avez déjà 4 CRON jobs dans `vercel.json`
2. **Webhooks** : Webhook Stripe existant
3. **Automatisations** : Scraping trends, refresh données, emails
4. **Intégrations API** : Multiples APIs externes (Higgsfield, OpenAI, Stripe, etc.)

**Avantages de n8n** :
- ✅ Interface visuelle pour créer des workflows
- ✅ Gestion centralisée des automatisations
- ✅ Monitoring et logs intégrés
- ✅ Pas besoin de modifier le code pour ajouter des workflows
- ✅ Support de 400+ intégrations

---

## 📋 Options d'Implémentation

### Option 1 : n8n Cloud (Recommandé pour commencer)

**Avantages** :
- ✅ Setup en 5 minutes
- ✅ Pas de maintenance serveur
- ✅ HTTPS inclus
- ✅ Plan gratuit disponible

**Inconvénients** :
- ⚠️ Coût mensuel (gratuit jusqu'à 250 exécutions/mois)
- ⚠️ Données hébergées chez n8n

**Prix** : Gratuit jusqu'à 250 exécutions/mois, puis à partir de 20€/mois

---

### Option 2 : n8n Self-Hosted sur Vercel (via Docker)

**Avantages** :
- ✅ Contrôle total
- ✅ Données restent sur votre infrastructure
- ✅ Pas de limite d'exécutions

**Inconvénients** :
- ⚠️ Nécessite un serveur dédié (pas compatible Vercel Serverless)
- ⚠️ Maintenance requise

**Recommandation** : Utiliser Railway, Render, ou DigitalOcean

---

### Option 3 : n8n Self-Hosted via Railway/Render (Recommandé pour production)

**Avantages** :
- ✅ Setup simple (1-click deploy)
- ✅ HTTPS automatique
- ✅ Scaling automatique
- ✅ Plan gratuit disponible

**Prix** : Gratuit sur Railway (500h/mois), Render (750h/mois)

---

## 🚀 Implémentation Recommandée : n8n Cloud

### Étape 1 : Créer un compte n8n Cloud

1. Aller sur [n8n.cloud](https://n8n.cloud)
2. Créer un compte gratuit
3. Noter votre **API Key** (Settings → API)

### Étape 2 : Configurer les Variables d'Environnement

Ajouter dans Vercel (ou `.env` local) :

```env
# n8n Configuration
N8N_API_URL=https://votre-instance.n8n.cloud
N8N_API_KEY=votre_api_key_ici
N8N_WEBHOOK_URL=https://votre-instance.n8n.cloud/webhook
```

### Étape 3 : Créer un Webhook Endpoint dans votre App

Créer `app/api/n8n/webhook/route.ts` :

```typescript
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification (optionnel mais recommandé)
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (authHeader !== `Bearer ${process.env.N8N_WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Traiter les données depuis n8n
    // Exemple : notification, mise à jour DB, etc.
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[n8n webhook]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Étape 4 : Créer un Client n8n Helper

Créer `lib/n8n.ts` :

```typescript
/**
 * Client n8n pour déclencher des workflows depuis votre app
 */

const N8N_API_URL = process.env.N8N_API_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

interface TriggerWorkflowOptions {
  workflowId: string;
  data: Record<string, unknown>;
}

/**
 * Déclencher un workflow n8n via API
 */
export async function triggerN8nWorkflow({ workflowId, data }: TriggerWorkflowOptions) {
  if (!N8N_API_URL || !N8N_API_KEY) {
    console.warn('[n8n] API URL ou Key non configurée');
    return null;
  }

  try {
    const response = await fetch(`${N8N_API_URL}/api/v1/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY,
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`n8n API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[n8n] Erreur lors du déclenchement du workflow:', error);
    return null;
  }
}

/**
 * Déclencher un workflow via webhook (plus simple)
 */
export async function triggerN8nWebhook(webhookPath: string, data: Record<string, unknown>) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('[n8n] Webhook URL non configurée');
    return null;
  }

  try {
    const response = await fetch(`${webhookUrl}/${webhookPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[n8n] Erreur webhook:', error);
    return null;
  }
}
```

---

## 🔧 Cas d'Usage Concrets pour votre App

### Cas d'Usage 1 : Automatiser les CRON Jobs

**Actuellement** : CRON jobs dans `vercel.json`

**Avec n8n** :
1. Créer un workflow avec **Schedule Trigger**
2. Appeler votre API endpoint
3. Gérer les erreurs et notifications

**Workflow n8n** :
```
Schedule Trigger (tous les jours à 2h)
  ↓
HTTP Request → POST /api/cron/track-inventory
  ↓
Si erreur → Envoyer email/Slack
```

**Avantages** :
- ✅ Interface visuelle pour gérer les schedules
- ✅ Logs et monitoring intégrés
- ✅ Retry automatique en cas d'erreur
- ✅ Notifications faciles

---

### Cas d'Usage 2 : Automatiser les Emails Post-Achat

**Actuellement** : Géré dans le code

**Avec n8n** :
1. Webhook depuis votre app après achat Stripe
2. Workflow n8n :
   - Recevoir webhook
   - Récupérer données utilisateur depuis votre API
   - Envoyer email de bienvenue (via Gmail/SendGrid)
   - Ajouter à Airtable pour tracking
   - Envoyer notification Slack

**Code dans votre app** :

```typescript
// app/api/stripe/webhook/route.ts
import { triggerN8nWebhook } from '@/lib/n8n';

export async function POST(request: Request) {
  // ... traitement Stripe existant ...
  
  // Après traitement réussi
  if (event.type === 'checkout.session.completed') {
    await triggerN8nWebhook('stripe-purchase', {
      userId: session.metadata.userId,
      amount: session.amount_total,
      plan: session.metadata.plan,
    });
  }
  
  // ...
}
```

---

### Cas d'Usage 3 : Automatiser le Scraping de Trends

**Actuellement** : CRON job qui appelle `/api/cron/scan-trends`

**Avec n8n** :
1. Schedule Trigger (tous les jours à 6h)
2. Appeler votre API
3. Si nouvelles trends détectées :
   - Envoyer notification
   - Créer post automatique sur LinkedIn/Twitter
   - Envoyer email digest aux utilisateurs premium

---

### Cas d'Usage 4 : Synchronisation avec Airtable

**Actuellement** : Mentionné dans l'architecture mais pas implémenté

**Avec n8n** :
1. Webhook depuis votre app lors de création de devis
2. Workflow n8n :
   - Recevoir données devis
   - Créer ligne dans Airtable
   - Envoyer email à l'usine
   - Créer tâche dans Trello/Asana

---

## 📝 Exemple de Workflow Complet : Notification Post-Achat

### Dans n8n :

1. **Webhook Trigger**
   - Path: `stripe-purchase`
   - Method: POST

2. **HTTP Request Node** (Récupérer infos utilisateur)
   - Method: GET
   - URL: `{{ $env.NEXT_PUBLIC_APP_URL }}/api/users/{{ $json.userId }}`
   - Headers: `Authorization: Bearer {{ $env.API_SECRET }}`

3. **Gmail Node** (Envoyer email)
   - To: `{{ $json.user.email }}`
   - Subject: "Bienvenue sur OUTFITY !"
   - Body: Template HTML

4. **Airtable Node** (Ajouter à la base)
   - Table: "Customers"
   - Fields: userId, plan, purchaseDate

5. **Slack Node** (Notification équipe)
   - Channel: #sales
   - Message: "Nouvel abonnement : {{ $json.plan }}"

---

## 🔐 Sécurité

### 1. Authentification Webhook

Toujours vérifier l'authentification dans vos endpoints webhook :

```typescript
// Vérifier le secret webhook
const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
const providedSecret = request.headers.get('x-webhook-secret');

if (webhookSecret !== providedSecret) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 2. Variables d'Environnement Sensibles

Dans n8n Cloud :
- Settings → Variables
- Ajouter vos secrets (API keys, tokens, etc.)
- Utiliser `{{ $env.VARIABLE_NAME }}` dans les workflows

---

## 🚀 Migration Progressive

### Phase 1 : Setup Initial (Semaine 1)
- [ ] Créer compte n8n Cloud
- [ ] Configurer variables d'environnement
- [ ] Créer webhook endpoint dans votre app
- [ ] Tester avec un workflow simple

### Phase 2 : Migration CRON Jobs (Semaine 2)
- [ ] Migrer 1 CRON job vers n8n (ex: `track-inventory`)
- [ ] Tester en production
- [ ] Migrer les autres CRON jobs progressivement

### Phase 3 : Automatisations Avancées (Semaine 3+)
- [ ] Automatiser emails post-achat
- [ ] Synchronisation Airtable
- [ ] Notifications Slack/Discord
- [ ] Autres workflows selon besoins

---

## 📚 Ressources

- **Documentation n8n** : https://docs.n8n.io/
- **n8n Cloud** : https://n8n.cloud
- **Templates n8n** : https://n8n.io/workflows
- **API n8n** : https://docs.n8n.io/api/

---

## 💡 Prochaines Étapes

1. **Créer le compte n8n Cloud** (5 min)
2. **Créer le fichier `lib/n8n.ts`** avec le code ci-dessus
3. **Créer un workflow de test** dans n8n
4. **Tester depuis votre app** avec `triggerN8nWebhook()`

**Besoin d'aide ?** Je peux vous aider à créer les workflows spécifiques pour votre cas d'usage ! 🚀
