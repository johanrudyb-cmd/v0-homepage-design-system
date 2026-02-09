# Configuration Stripe (mode démo)

## 1. Créer un compte Stripe

1. Va sur [stripe.com](https://stripe.com) et crée un compte
2. Active le **mode test** (bannière "Mode test" en haut du dashboard)

## 2. Récupérer les clés API

1. Dashboard Stripe → **Developers** → **API keys**
2. En mode test, copie :
   - **Secret key** (sk_test_...)
   - **Publishable key** (pk_test_...)

## 3. Configurer `.env`

Ajoute dans ton fichier `.env` :

```env
# Stripe (mode démo)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx

# URL de base (pour redirections après paiement)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Tester les paiements

1. Lance l'app : `npm run dev`
2. Va sur **Mes quotas** (ou clique sur "Acheter des crédits supplémentaires")
3. Clique sur un pack → redirection vers Stripe Checkout
4. Utilise une carte de test Stripe :
   - **Numéro** : `4242 4242 4242 4242`
   - **Date** : n'importe quelle date future
   - **CVC** : n'importe quel 3 chiffres

## 5. Webhooks (optionnel en dev)

Pour traiter les paiements réussis (créditer les packs) :

```bash
# Installer Stripe CLI : https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copie le `whsec_...` affiché et ajoute dans `.env` :

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
```

## Packs disponibles

| Pack           | Prix   | Description                    |
|----------------|--------|--------------------------------|
| Logos+         | 9,90€  | 10 logos supplémentaires       |
| Photos+        | 14,90€ | Shooting photo & produit       |
| Scripts+       | 4,90€  | Scripts UGC en masse           |
| Virtual Try-On | 7,90€  | Module Premium à l'essai      |
