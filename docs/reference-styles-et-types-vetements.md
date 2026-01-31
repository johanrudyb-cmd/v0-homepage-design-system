# Référence : styles et types de vêtements à intégrer

Document à donner à Gemini (ou autre outil) pour récupérer les **bons liens** (pages New In / Best Sellers ou catégories) par marque. L’app utilise ces valeurs pour les filtres, la détection de tendances et le matching usines.

---

## 1. STYLES (à utiliser tels quels)

Liste officielle utilisée dans les préférences, filtres et tendances :

| Style |
|-------|
| Streetwear |
| Minimaliste |
| Luxe |
| Y2K |
| Vintage |
| Sportswear |
| Casual |
| Formel |
| Bohème |
| Gothique |
| Preppy |
| Athleisure |
| Workwear |
| Punk |
| Grunge |
| Chic |
| Élégant |
| Décontracté |
| Féminin |
| Masculin |
| Unisexe |
| Éthique |
| Durable |
| Haute couture |
| Prêt-à-porter |

**Styles les plus utilisés par le scraper** (détection auto depuis le nom du produit) :  
Streetwear, Minimaliste, Luxe, Y2K, Sportswear, Casual.

---

## 2. TYPES DE VÊTEMENTS (productType)

Valeurs reconnues dans le code pour tendances, design et matching usines :

### Tops
| Type |
|------|
| T-shirt |
| Shirt |
| Polo |
| Hoodie |
| Sweatshirt |
| Sweater |
| Tank Top |

### Bas
| Type |
|------|
| Pantalon |
| Jeans |
| Cargo |
| Chinos |
| Short |
| Shorts |
| Trousers |
| Joggers |

### Manteaux / Vestes
| Type |
|------|
| Veste |
| Jacket |
| Coat |
| Bomber |
| Parka |
| Blazer |

### Accessoires
| Type |
|------|
| Cap |
| Beanie |
| Bag |
| Backpack |

### Sous-vêtements / Basiques
| Type |
|------|
| Underwear |
| Socks |

**Types détectés automatiquement** par le scraper à partir du nom du produit :  
T-shirt, Hoodie, Pantalon, Cargo, Veste, Short.

---

## 3. COUPES (cut)

Valeurs utilisées pour le regroupement des tendances (type + coupe + matériau) :

| Coupe |
|-------|
| Loose Fit |
| Slim Fit |
| Regular Fit |
| Wide Leg |
| Oversized (souvent mappé en Loose Fit) |

---

## 4. MATÉRIAUX (material)

| Matériau |
|----------|
| Coton |
| Denim |
| Polyester |
| Lin |
| Wool |
| Cashmere |
| Leather |
| Nylon |
| Jersey |
| Fleece |
| Canvas |
| Modal |
| Bamboo |
| Synthétique |

**Matériaux détectés par le scraper** : Coton, Denim, Polyester, Lin.

---

## 5. CATÉGORIES HAUT / BAS / ACCESSOIRES

Utilisées dans certains flux (ex. trends-scraper) pour regrouper :

| Catégorie |
|-----------|
| Haut |
| Bas |
| Accessoires |

---

## 6. CE DONT GEMINI A BESOIN POUR LES LIENS

Pour chaque **marque** ciblée (Zara, ASOS, Zalando, H&M, Uniqlo, Mango, Bershka, Pull&Bear, Nike, Adidas, etc.), il faut des URLs qui pointent vers :

1. **New In / Nouveautés** : page ou section « Nouveautés » ou « New In » (femme, homme ou mixte selon la marque).
2. **Best Sellers / Meilleures ventes** : page ou section « Best Sellers » / « Meilleures ventes ».

Ou, si tu veux du plus granulaire, des liens par **type de produit** et/ou **style** :

- Ex. Zara :  
  - New In femme  
  - Best Sellers femme  
  - (optionnel) sous-pages par catégorie : T-shirts, Hoodies, Pantalons, Vestes, etc.
- Ex. ASOS :  
  - New In  
  - Best Sellers  
  - (optionnel) sous-pages par type : T-Shirts, Hoodies, Joggers, etc.

**Format utile pour Gemini** :  
« Pour chaque marque [liste], donne l’URL exacte de la page **New In** et l’URL exacte de la page **Best Sellers** (ou équivalent). Si possible, précise aussi les URLs des catégories principales : T-shirts, Hoodies, Pantalons, Vestes, Shorts, Joggers. »

---

## 7. RÉSUMÉ POUR COPIER-COLLER À GEMINI

```
Liste des STYLES à utiliser tels quels :
Streetwear, Minimaliste, Luxe, Y2K, Vintage, Sportswear, Casual, Formel, Bohème, Gothique, Preppy, Athleisure, Workwear, Punk, Grunge, Chic, Élégant, Décontracté, Féminin, Masculin, Unisexe, Éthique, Durable, Haute couture, Prêt-à-porter

Liste des TYPES DE VÊTEMENTS (productType) :
T-shirt, Shirt, Polo, Hoodie, Sweatshirt, Sweater, Tank Top, Pantalon, Jeans, Cargo, Chinos, Short, Shorts, Trousers, Joggers, Veste, Jacket, Coat, Bomber, Parka, Blazer, Cap, Beanie, Bag, Backpack, Underwear, Socks

Liste des COUPES : Loose Fit, Slim Fit, Regular Fit, Wide Leg

Liste des MATÉRIAUX : Coton, Denim, Polyester, Lin, Wool, Cashmere, Leather, Nylon, Jersey, Fleece, Canvas, Modal, Bamboo, Synthétique

Consigne : Pour les marques [Zara, ASOS, Zalando, H&M, Uniqlo, Mango, Bershka, Pull&Bear, Nike, Adidas], fournis les URLs exactes des pages "New In / Nouveautés" et "Best Sellers / Meilleures ventes". Si possible, ajoute les URLs des catégories par type de vêtement (T-shirts, Hoodies, Pantalons, Vestes, Shorts, Joggers) pour chaque marque.
```

Tu peux remplacer la liste des marques entre crochets par celle que tu utilises vraiment.
