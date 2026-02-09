# Spec : Questionnaire mockup → photo produit + tech pack visuel hyper détaillé

## 1. Vue d’ensemble

- **Mockup** : l’utilisateur répond à un **maximum de questions** (produit, coupe, matière, couleurs, détails, style, etc.) → l’IA génère **une photo produit** de l’article (flottant, sans mannequin, style e‑commerce).
- **Tech pack** : à partir du même article (et du design sauvegardé), le système génère un **tech pack visuel et hyper détaillé** (PDF / vue dédiée) pour fournisseurs.

---

## 2. Flux « Questions → photo produit » (mockup)

### 2.1 Objectif

Un questionnaire structuré remplace les champs libres. Chaque réponse enrichit le prompt envoyé à l’IA (ex. Higgsfield) pour obtenir **une seule photo produit** fidèle aux choix.

### 2.2 Questions à prévoir (liste indicative)

**Produit & coupe**
- Type de vêtement : T-shirt, Sweat, Hoodie, Polo, Veste, Pantalon, Short, Robe, Accessoire, etc.
- Coupe : Regular, Oversized, Slim, Cintré, Droite, etc.
- Longueur : Court, Mi-long, Long (selon type)

**Matières & couleurs**
- Matière principale : Coton, Coton bio, Jersey, Molleton, French terry, etc.
- Grammage (si pertinent) : 180 g/m², 250 g/m², etc.
- Couleur principale (nom + ref si possible)
- Couleurs secondaires (bords côte, broderie, etc.)

**Détails de conception**
- Encolure : Crew, Col rond, V, Col montant, etc.
- Manches : Sans manches, Courtes, 3/4, Longues, raglan, etc.
- Ourlet : Droit, Fendu, Faux ourlet, etc.
- Poche(s) : Aucune, Poitrine, Côté, Kangaroo, etc.
- Fermeture : Aucune, Boutons, Zip, etc. (si veste / gilet)

**Design / impression**
- Type de visuel : Aucun, Logo, Texte, Illustration, Photo, Mixte
- Placement : Poitrine, Dos, Manche, Dos complet, etc.
- Technique : Sérigraphie, Broderie, Transfert, DTF, etc.
- Couleur(s) du visuel

**Contexte de rendu (pour le prompt photo)**
- Fond : Neutre / Blanc, Gris clair, Ombre légère, Flottant dans le vide
- Style photo : E‑commerce, Lookbook, Minimaliste
- Angle : Face, 3/4, Dos (ou « face principale » par défaut)

**Optionnel (pour raffiner encore)**
- Inspirations / références (texte court)
- Message ou nom de marque à intégrer au visuel (si applicable)

### 2.3 Données à stocker

- **Réponses au questionnaire** : soit dans un JSON dédié (ex. `MockupQuestionnaire` ou `Design.mockupSpec`), soit dans des champs structurés sur `Design` / `LaunchMap`.
- **Lien avec le design** : chaque design généré doit pointer vers le jeu de réponses utilisé (pour re-génération ou tech pack).

Proposition de structure (à adapter au schéma Prisma) :

```ts
interface MockupQuestionnaireAnswers {
  productType: string;
  cut: string;
  length?: string;
  material: string;
  weight?: string;
  colorMain: string;
  colorsSecondary?: string[];
  neckline: string;
  sleeves: string;
  hem?: string;
  pockets?: string;
  closure?: string;
  designType: 'none' | 'logo' | 'text' | 'illustration' | 'photo' | 'mixed';
  designPlacement?: string;
  designTechnique?: string;
  designColors?: string[];
  backgroundStyle: 'white' | 'light_gray' | 'floating_void' | 'shadow';
  photoStyle: 'ecommerce' | 'lookbook' | 'minimal';
  viewAngle?: 'front' | 'three_quarter' | 'back';
  brandName?: string;
  notes?: string;
}
```

### 2.4 Génération de la photo produit

- **Entrée** : `MockupQuestionnaireAnswers` (et éventuellement `brandId` pour cohérence marque).
- **Traitement** :
  - Construire un **prompt texte** en anglais (ou langue du modèle) à partir de toutes les réponses.
  - Appeler l’API de génération d’image (ex. Higgsfield) avec ce prompt.
- **Sortie** : URL de l’image générée, sauvegardée sur le design (ex. `productImageUrl` ou `flatSketchUrl` selon usage actuel).

Exemple de prompt (à affiner selon le modèle) :

```
Professional product photography, [productType], [cut] cut, [material], [colorMain],
[neckline] neckline, [sleeves] sleeves, [designType] on [designPlacement],
[backgroundStyle] background, no mannequin, floating garment, [photoStyle] style,
front view, 8k, square crop.
```

### 2.5 Intégration dans l’app

- **Où** : soit une nouvelle étape dans le Launch Map (ex. « Définir mon article » avant « Design »), soit une page dédiée « Créer un mockup » qui alimente ensuite la phase Design.
- **UX** : formulaire par étapes (steps) ou sections (Produit, Matières, Détails, Design, Rendu), avec prévisualisation des réponses et bouton « Générer la photo produit » à la fin.
- Après génération : affichage de la photo + option « Utiliser pour le design » / « Passer au tech pack ».

---

## 3. Système de tech pack visuel et hyper détaillé

### 3.1 Objectif

Produire un **tech pack visuel** utilisable par un fournisseur : pas seulement du texte ou du JSON, mais des **pages structurées avec schémas, cotes, matières, et consignes claires**.

### 3.2 Contenu cible du tech pack (sections)

1. **Couverture / en-tête**
   - Nom de la marque, référence article, nom du design, date, version.

2. **Photo produit (mockup)**
   - La photo générée par le questionnaire (face, et optionnellement 3/4 ou dos si dispo).

3. **Flat sketch / vue à plat**
   - Vue(s) à plat (face / dos) avec annotations :
     - Points de mesure (emmanchure, longueur, tour de poitrine, etc.)
     - Détails de construction (poches, fermetures, ourlets)

4. **Tableau des mesures (specs)**
   - Par taille (S, M, L, XL…) : longueur totale, tour de poitrine, tour de taille, tour de bassin, longueur manche, etc.
   - Tolérances (± cm) si pertinent.

5. **Matières et fournitures**
   - Tissu principal : composition, grammage, fournisseur ou référence.
   - Tissus secondaires (bord côte, doublure si applicable).
   - Fournitures : boutons, zip, étiquettes, etc. avec références ou photos si possible.

6. **Détails de construction**
   - Type de coutures (surpiquage, surjet, etc.).
   - Ourlets (largeur, finition).
   - Emmanchures, encolure, manches (description + schéma si utile).

7. **Impression / broderie**
   - Placement (schéma avec repères).
   - Dimensions du visuel (largeur × hauteur).
   - Technique (sérigraphie, DTF, broderie) et couleurs (Pantone ou références).
   - Fichier artwork (lien ou « à fournir séparément »).

8. **Étiquetage et packaging**
   - Position et type d’étiquettes (composition, marque, taille).
   - Consignes d’emballage (pliage, sachet, carton) si nécessaire.

9. **Notes et contraintes**
   - Normes (OEKO-TEX, GOTS, etc.), pays de production, délais, MOQ.

### 3.3 Sources des données

- **Questionnaire mockup** : type, coupe, matière, couleurs, encolure, manches, ourlet, poches, fermeture, design (type, placement, technique).
- **Design existant** : `Design.techPack` (JSON actuel), `flatSketchUrl`, `productImageUrl`, placement du visuel.
- **IA** : génération / complétion des sections manquantes (tableau de mesures type, libellés de construction, références fournitures) à partir du type de produit et des réponses.

### 3.4 Génération du tech pack

- **Option A – PDF unique**  
  Générer un PDF multi-pages à partir d’un template :
  - Page 1 : couverture + photo produit.
  - Page 2 : flat sketch + tableau des mesures.
  - Page 3 : matières + fournitures.
  - Page 4 : construction + impression/broderie.
  - Page 5 : étiquetage + notes.

- **Option B – Vue web + export PDF**  
  Une page « Tech pack » qui affiche les sections en HTML (avec images, tableaux, schémas) et propose « Télécharger le PDF ». Le PDF est généré à la volée (comme aujourd’hui) mais avec un layout dédié « tech pack visuel » (sections ci‑dessus).

- **Option C – Éditeur minimal**  
  L’utilisateur peut corriger / compléter certaines sections (texte, cotes) avant d’exporter en PDF.

Recommandation : commencer par **Option B** (vue web structurée + export PDF enrichi) pour garder une seule source de vérité (données + design) et un PDF professionnel.

### 3.5 Modèle de données (extension)

- **Design** (existant) : garder `techPack` (JSON) pour les champs structurés (tissu, bord côte, etc.).
- **Nouveau ou étendu** : un bloc « tech pack visuel » pouvant inclure :
  - Référence à la photo produit (URL).
  - Référence au flat sketch (URL).
  - Tableau des mesures (JSON ou table dédiée).
  - Sections texte (construction, étiquetage, notes) générées par l’IA ou saisies.

Exemple d’extension du JSON `techPack` :

```ts
interface TechPackVisual {
  productImageUrl?: string;
  flatSketchFrontUrl?: string;
  flatSketchBackUrl?: string;
  measurementsTable?: { size: string; measurements: Record<string, number> }[];
  materials: { name: string; composition?: string; weight?: string; ref?: string }[];
  trims?: { name: string; ref?: string; placement?: string }[];
  constructionNotes?: string;
  printSpec?: { placement: string; width: number; height: number; technique: string; colors: string[] };
  labeling?: string;
  packaging?: string;
  compliance?: string;
}
```

---

## 4. Ordre de mise en œuvre suggéré

1. **Phase 1 – Questionnaire mockup**
   - Définir le schéma des réponses (DB ou JSON sur Design/LaunchMap).
   - Créer l’UI du questionnaire (étapes ou sections).
   - Construire le prompt à partir des réponses et brancher l’appel à Higgsfield (ou autre).
   - Sauvegarder l’URL de la photo produit sur le design et lier les réponses au design.

2. **Phase 2 – Tech pack visuel (données)**
   - Étendre `Design.techPack` (ou équivalent) avec les champs du tech pack visuel (mesures, matières, construction, impression).
   - Enrichir `generateTechPack` (Claude/GPT) pour remplir ces champs à partir du type de produit et du questionnaire.

3. **Phase 3 – Tech pack visuel (rendu)**
   - Page ou vue « Tech pack » qui affiche toutes les sections (photo, flat, tableau, matières, etc.).
   - Adapter l’export PDF (route existante ou nouvelle) pour générer un PDF multi-pages avec ce contenu.
   - Optionnel : édition légère (texte, cotes) avant export.

4. **Phase 4 – Raffinements**
   - Plus de questions dans le questionnaire si besoin.
   - Plus de champs dans le tech pack (normes, fournisseurs, etc.).
   - Templates PDF alternatifs (par type de produit ou par marque).

---

## 5. Résumé

| Élément | Description |
|--------|-------------|
| **Mockup** | Questionnaire détaillé → prompt riche → **une photo produit** (IA). |
| **Données mockup** | Stocker toutes les réponses (produit, coupe, matière, couleurs, détails, design, rendu). |
| **Tech pack** | **Visuel** : photo + flat + mesures + matières + construction + impression + étiquetage + notes. |
| **Génération** | IA pour compléter les sections du tech pack à partir du type de produit et du questionnaire. |
| **Livrable** | Vue web dédiée + **export PDF** du tech pack complet. |

Ce document peut servir de base pour les tickets (questionnaire, API photo, extension tech pack, PDF visuel).

---

## 6. Implémentation déjà en place

- **Types** : `lib/mockup-and-techpack-types.ts` — `MockupQuestionnaireAnswers`, `TechPackVisual`, `buildProductPhotoPrompt()`.
- **API** : `POST /api/designs/generate-from-questionnaire` — body `{ brandId, questionnaire }` → retourne `{ imageUrl, prompt, questionnaire }` (Higgsfield).
- **Schéma Prisma** : `Design` a `productImageUrl` (photo produit) et `mockupSpec` (JSON des réponses questionnaire). `techPack` reste en JSON pour le tech pack texte + visuel.
- **À faire** : UI questionnaire (étapes), sauvegarde Design avec `productImageUrl` + `mockupSpec`, puis génération et affichage du tech pack visuel (vue + PDF).
