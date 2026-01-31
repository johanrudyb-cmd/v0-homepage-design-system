# Workflow : De la Tendance à la Production

*Document créé via BMAD-Method - Dev + UX*

## Date : 2025-01-26

---

## 🎯 Objectif

Permettre aux utilisateurs de **copier directement les tendances** pour créer des designs et envoyer des emails pré-remplis aux fournisseurs.

---

## 🔄 Workflow Complet

```
1. DÉTECTION DE TENDANCE
   ↓
   Utilisateur voit une tendance confirmée dans /trends
   ↓

2. ACTION 1 : CRÉER UN DESIGN
   ↓
   Clic sur "Créer un Design"
   ↓
   Redirection vers /design-studio avec données pré-remplies
   ↓
   Type, Coupe, Matériau automatiquement remplis
   ↓
   Prompt personnalisé avec infos de la tendance
   ↓
   Génération du tech pack et mockup
   ↓

3. ACTION 2 : DEMANDER UN DEVIS
   ↓
   Clic sur "Demander un Devis"
   ↓
   Génération automatique de l'email fournisseur
   ↓
   Redirection vers /sourcing avec email pré-rempli
   ↓
   Sélection d'une usine
   ↓
   Modal avec message pré-rempli
   ↓
   Boutons : Copier, Aperçu, Ouvrir Email
   ↓
   Envoi du devis avec email professionnel
```

---

## 🎨 Fonctionnalité 1 : Créer un Design depuis une Tendance

### Comment ça marche

1. **Dans `/trends` ou `/trends/predictions`** :
   - Utilisateur voit une tendance
   - Clic sur **"Créer un Design"**

2. **Redirection vers Design Studio** :
   - Formulaire **pré-rempli automatiquement** :
     - Type : "Cargo" (depuis la tendance)
     - Coupe : "Loose Fit" (depuis la tendance)
     - Matériau : "Coton" (depuis la tendance)
     - Prompt personnalisé : Contient toutes les infos de la tendance

3. **Génération** :
   - L'utilisateur peut modifier si besoin
   - Clique sur "Générer"
   - Le Design Studio génère le tech pack et mockup avec les infos de la tendance

### Exemple de Prompt Généré

```
Produit tendance détecté : Loose Fit Cargo Pant
Type : Cargo
Coupe : Loose Fit
Matériau : Coton
Couleur : Noir
Style : Streetwear
Détecté chez 5 marques : Zara, ASOS, Zalando, H&M, Uniqlo
Prix moyen marché : 89.99€
Tendance forte en : FR
```

---

## 📧 Fonctionnalité 2 : Email Pré-rempli pour Fournisseur

### Comment ça marche

1. **Dans `/trends` ou `/trends/predictions`** :
   - Utilisateur voit une tendance
   - Clic sur **"Demander un Devis"**

2. **Génération de l'email** :
   - Email professionnel **automatiquement généré** avec :
     - Sujet : "Demande de devis - Loose Fit Cargo Pant"
     - Corps : Message complet avec toutes les infos

3. **Redirection vers Sourcing Hub** :
   - Alerte affichée : "Email pré-rempli depuis la tendance"
   - Utilisateur sélectionne une usine
   - Clic sur "Demander un devis"

4. **Modal avec email pré-rempli** :
   - Message déjà rempli
   - Boutons disponibles :
     - **Aperçu** : Voir l'email formaté
     - **Copier** : Copier dans le presse-papier
     - **Ouvrir Email** : Ouvrir le client email avec tout pré-rempli

### Exemple d'Email Généré

```
Sujet : Demande de devis - Loose Fit Cargo Pant

Bonjour [Nom de l'usine],

Nous sommes intéressés par la production du produit suivant :

📦 DÉTAILS DU PRODUIT
────────────────────────────────────────
Type : Cargo
Coupe : Loose Fit
Matériau : Coton
Couleur : Noir
Style : Streetwear

📊 CONTEXTE MARCHÉ
────────────────────────────────────────
Ce produit est une tendance confirmée détectée chez 5 marques majeures :
• Zara, ASOS, Zalando, H&M, Uniqlo
• Prix moyen marché : 89.99€
• Score de tendance : 5/5

💰 INFORMATIONS COMMERCIALES
────────────────────────────────────────
Quantité souhaitée : [À remplir]
Prix cible : [À remplir]

❓ INFORMATIONS DEMANDÉES
────────────────────────────────────────
Pourriez-vous nous fournir :
• Prix unitaire selon la quantité
• Délai de production
• MOQ (Minimum Order Quantity)
• Échantillons disponibles
• Certifications (si applicable)

Nous restons à votre disposition pour toute question.

Cordialement,
[Votre Nom]
[Votre Marque]
```

---

## 🎯 Boutons Disponibles

### Sur chaque Tendance

1. **🎨 Créer un Design**
   - Pré-remplit le Design Studio
   - Redirige vers `/design-studio?type=Cargo&cut=Loose Fit&material=Coton&prompt=...`

2. **📧 Demander un Devis**
   - Génère l'email fournisseur
   - Redirige vers `/sourcing?trend={emailData}`

---

## 📋 Détails Techniques

### API Endpoints

#### POST `/api/trends/to-design`
Convertit une tendance en données Design Studio

**Body** :
```json
{
  "productType": "Cargo",
  "cut": "Loose Fit",
  "material": "Coton",
  "color": "Noir",
  "style": "Streetwear",
  "productName": "Loose Fit Cargo Pant",
  "averagePrice": 89.99,
  "brands": ["Zara", "ASOS", "Zalando"]
}
```

**Response** :
```json
{
  "success": true,
  "designData": {
    "type": "Cargo",
    "cut": "Loose Fit",
    "material": "Coton",
    "details": {
      "seams": true,
      "pockets": true,
      "zipper": false,
      "buttons": false,
      "hood": false,
      "collar": false
    },
    "customPrompt": "Produit tendance détecté : Loose Fit Cargo Pant\n..."
  }
}
```

#### POST `/api/trends/supplier-email`
Génère un email fournisseur depuis une tendance

**Body** :
```json
{
  "productType": "Cargo",
  "cut": "Loose Fit",
  "material": "Coton",
  "productName": "Loose Fit Cargo Pant",
  "averagePrice": 89.99,
  "brands": ["Zara", "ASOS", "Zalando"],
  "confirmationScore": 5,
  "quantity": 500,
  "targetPrice": 45
}
```

**Response** :
```json
{
  "success": true,
  "emailData": {
    "subject": "Demande de devis - Loose Fit Cargo Pant",
    "body": "Bonjour,\n\nNous sommes intéressés...",
    "productDetails": {
      "type": "Cargo",
      "cut": "Loose Fit",
      "material": "Coton",
      "averagePrice": 89.99
    }
  }
}
```

---

## 🎨 Interface Utilisateur

### Page `/trends` - Trend Radar

Chaque tendance a maintenant **2 boutons** :

```
┌─────────────────────────────────────────────┐
│ Loose Fit Cargo Pant                        │
│ [Cargo] [Loose Fit] [Coton]                │
│ 5 marques : Zara, ASOS, Zalando...          │
│ Prix moyen : 89.99€                         │
│                                             │
│ [🎨 Créer un Design] [📧 Demander un Devis] │
└─────────────────────────────────────────────┘
```

### Page `/design-studio`

Si venant d'une tendance, le formulaire est **pré-rempli** :

```
┌─────────────────────────────────────────────┐
│ Type: [Cargo ✓]                            │
│ Coupe: [Loose Fit ✓]                       │
│ Matériau: [Coton ✓]                        │
│                                             │
│ Prompt personnalisé:                        │
│ [Produit tendance détecté : Loose Fit...]  │
│                                             │
│ [Générer le Design]                         │
└─────────────────────────────────────────────┘
```

### Page `/sourcing`

Si venant d'une tendance, **alerte affichée** :

```
┌─────────────────────────────────────────────┐
│ 📧 Email Pré-rempli depuis la Tendance     │
│ Un message professionnel a été généré...   │
│ Produit : Cargo • Loose Fit • Coton        │
└─────────────────────────────────────────────┘
```

### Modal "Demander un Devis"

Email **pré-rempli** avec boutons :

```
┌─────────────────────────────────────────────┐
│ Demander un devis                          │
│ [Nom de l'usine]                           │
├─────────────────────────────────────────────┤
│                                             │
│ Sujet: Demande de devis - Loose Fit...     │
│                                             │
│ [👁️ Aperçu] [📋 Copier] [📧 Ouvrir Email]  │
│                                             │
│ Message pour le fournisseur:               │
│ ┌─────────────────────────────────────┐   │
│ │ Bonjour,                            │   │
│ │                                     │   │
│ │ Nous sommes intéressés par...       │   │
│ │ [Message pré-rempli]                │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ 💡 Message pré-rempli depuis la tendance   │
│                                             │
│ [Annuler] [Envoyer la demande]             │
└─────────────────────────────────────────────┘
```

---

## ✅ Avantages

1. **Gain de Temps** : Plus besoin de recopier manuellement les infos
2. **Précision** : Toutes les données de la tendance sont incluses
3. **Professionnalisme** : Email formaté et complet
4. **Contexte** : Le fournisseur comprend la tendance du marché
5. **Action Rapide** : De la détection à la production en quelques clics

---

## 🔄 Exemple d'Utilisation

### Scénario : Utilisateur voit une tendance "Loose Fit Cargo"

1. **Détection** : Tendance confirmée (5 marques, score 5/5)
2. **Action** : Clic sur "Créer un Design"
3. **Design Studio** : Formulaire pré-rempli
4. **Génération** : Tech pack et mockup créés
5. **Action** : Clic sur "Demander un Devis"
6. **Sourcing** : Email pré-rempli généré
7. **Sélection** : Choisit une usine
8. **Envoi** : Email envoyé avec toutes les infos

**Résultat** : De la tendance à la demande de devis en **2 minutes** ⚡

---

**Créé via BMAD-Method** 🎯
