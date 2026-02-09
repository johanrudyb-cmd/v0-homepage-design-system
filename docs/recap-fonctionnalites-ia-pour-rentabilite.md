# Récapitulatif des fonctionnalités IA — Media Biangory

**Document destiné à l’analyse de rentabilité avec Gemini.**  
Référence : février 2025.

---

## 1. Fournisseurs IA utilisés

| Fournisseur | Clé env | Modèle(s) | Usage principal |
|-------------|---------|-----------|-----------------|
| **OpenAI** | `CHATGPT_API_KEY` | GPT-4 / GPT-4o | Vision, texte court, fallback Claude |
| **Anthropic** | `ANTHROPIC_API_KEY` | Claude Sonnet 4.5 | Texte long, stratégie, scripts, analyse |
| **Ideogram** | `IDEogram_API_KEY` | Ideogram 3.0 | Logos, designs, mockups, images tendances |
| **Higgsfield** | `HIGGSFIELD_API_KEY` + `HIGGSFIELD_API_SECRET` | Soul (text-to-image), Seedream Edit (image-to-image) | Mockups produit, shooting photo, mannequin |
| **The New Black** | `NEWBLACK_API_KEY` ou `TNB_API_KEY` | API Clothing | Mockup avec design sur mannequin |

---

## 2. Inventaire des fonctionnalités IA par route

### 2.1 UGC (User Generated Content)

| Fonctionnalité | Route API | IA utilisée | Modèle | Type appel | Coût estimé (€) | Feature key |
|----------------|-----------|-------------|--------|------------|-----------------|-------------|
| Scripts UGC (5 scripts) | `POST /api/ugc/scripts` | Claude (prioritaire) ou GPT-4 | Claude Sonnet 4.5 / GPT-4 | Texte | 0,03 | `ugc_scripts` |
| Virtual Try-On | `POST /api/ugc/virtual-tryon` | Higgsfield | *virtual-tryon* (à documenter) | Image (try-on) | 2,50 | `ugc_virtual_tryon` |
| Générer mannequin | `POST /api/ugc/generate-mannequin` | Higgsfield | Soul (text-to-image) | Texte → image | 0,12 | `ugc_generate_mannequin` |
| Shooting photo | `POST /api/ugc/shooting-photo` | Higgsfield | Seedream Edit (image-to-image) | Image → image | 0,12 | `ugc_shooting_photo` |
| Shooting product | `POST /api/ugc/shooting-product` | Higgsfield | Soul (text-to-image) | Texte → image | 0,40 (4 images) | `ugc_shooting_product` |

**Note Virtual Try-On** : la route importe `generateVirtualTryOn` depuis `@/lib/api/higgsfield`, mais cette fonction n’existe pas dans le fichier actuel. À implémenter ou à brancher sur une autre API (ex. The New Black vto_stream).

---

### 2.2 Marques (Brands)

| Fonctionnalité | Route API | IA utilisée | Modèle | Type appel | Coût estimé (€) | Feature key |
|----------------|-----------|-------------|--------|------------|-----------------|-------------|
| Stratégie marque | `POST /api/brands/strategy` | Claude | Claude Sonnet 4.5 | Texte long | 0,06 | `brand_strategy` |
| Analyse marque | `POST /api/brands/analyze` | GPT + Claude | GPT-4 + Claude | Texte | 0,04 | `brand_analyze` |
| Logo | `POST /api/brands/[id]/generate-logo` | Ideogram | Ideogram 3.0 | Texte → image | 0,10 | `brand_logo` |
| Parse site web | `POST /api/brands/parse-website` | Claude | Claude Sonnet 4.5 | Texte | 0,02 | `brand_parse_website` |
| Template stratégie | `POST /api/brands/strategy/template` | Claude + GPT | Claude + GPT | Texte | ~0,08 | - |
| Visual identity (template) | `POST /api/brands/strategy/creator-visual-identity` | Claude | Claude Sonnet 4.5 | Texte | ~0,04 | - |
| Visual identity (brand) | `POST /api/brands/analyze/visual-identity` | Claude | Claude Sonnet 4.5 | Texte | ~0,04 | - |

---

### 2.3 Launch Map

| Fonctionnalité | Route API | IA utilisée | Modèle | Type appel | Coût estimé (€) | Feature key |
|----------------|-----------|-------------|--------|------------|-----------------|-------------|
| Recommandations | `POST /api/launch-map/recommendations` | Claude | Claude Sonnet 4.5 | Texte | 0,04 | `launch_map_recommendations` |
| Textes site | `POST /api/launch-map/site-texts` | Claude | Claude Sonnet 4.5 | Texte | 0,03 | `launch_map_site_texts` |
| Post structuré | `POST /api/launch-map/generate-structured-post` | Claude | Claude Sonnet 4.5 | Texte | 0,03 | `launch_map_structured_post` |
| Posts depuis stratégie | `POST /api/launch-map/generate-posts-from-strategy` | Claude | Claude Sonnet 4.5 | Texte | 0,05 | `launch_map_posts_from_strategy` |
| Extract content frequency | `POST /api/launch-map/extract-content-frequency` | Claude | Claude Sonnet 4.5 | Texte court | 0,02 | `launch_map_extract_frequency` |
| Apply strategy | `POST /api/launch-map/apply-strategy-and-reset` | Claude | Claude Sonnet 4.5 | Texte | 0,04 | `launch_map_apply_strategy` |
| Site creation todo | `POST /api/launch-map/regenerate-site-todo` | Claude | Claude Sonnet 4.5 | Texte | 0,02 | `launch_map_todo` |
| Mockup base | `POST /api/launch-map/design/generate-base-mockup` | Ideogram | Ideogram 3.0 | Texte → image | ~0,08 | `design_base_mockup` |
| Mockup avec design | `POST /api/launch-map/design/generate-mockup-with-design` | The New Black | API Clothing | Texte → image | À estimer | - |
| Sticker | `POST /api/launch-map/design/generate-sticker` | Ideogram | Ideogram 3.0 | Texte → image (transparent) | ~0,08 | `design_generate_sticker` |

---

### 2.4 Design Studio

| Fonctionnalité | Route API | IA utilisée | Modèle | Type appel | Coût estimé (€) | Feature key |
|----------------|-----------|-------------|--------|------------|-----------------|-------------|
| Design depuis questionnaire | `POST /api/designs/generate-from-questionnaire` | Ideogram + GPT | Ideogram 3.0 + GPT-4 | Texte + image | 0 | `design_from_questionnaire` |
| Design généré | `POST /api/designs/generate` | GPT + Ideogram | GPT-4 + Ideogram | Texte + image | 0 | `design_generate` |
| Description produit | `POST /api/designs/[id]/generate-product-description` | GPT | GPT-4 | Texte | 0 | `design_product_description` |
| Tech pack visuel | `POST /api/designs/[id]/generate-tech-pack` | GPT | GPT-4 | Texte | 0 | `design_tech_pack` |

---

### 2.5 Tendances (Trends)

| Fonctionnalité | Route API | IA utilisée | Modèle | Type appel | Coût estimé (€) | Feature key |
|----------------|-----------|-------------|--------|------------|-----------------|-------------|
| Image produit tendance | `POST /api/trends/generate-product-image` | GPT + Ideogram | GPT-4 + Ideogram 3.0 | Texte + image | 0,10 | `trends_generate_image` |
| Analyse tendance | `POST /api/trends/analyse-ia` | GPT | GPT-4 | Texte | 0,05 | `trends_analyse` |
| Check image tendance | `POST /api/trends/check-trend-image` | GPT Vision | GPT-4o | Image → texte | 0,03 | `trends_check_image` |
| Hybrid radar scan | `POST /api/trends/hybrid-radar/scan` | GPT Vision | GPT-4o | Image → texte | 0,04 | `trends_hybrid_scan` |
| Business analysis | `POST /api/trends/hybrid-radar/business-analysis` | GPT | GPT-4 | Texte | ~0,03 | - |
| Enrichissement tendances (cron) | `lib/trend-enricher.ts` | GPT + Ideogram | GPT-4 + Ideogram 3.0 | Texte + image | ~0,10 / tendance | - |

---

## 3. Résumé par fournisseur

| Fournisseur | Fonctionnalités principales | Coût unitaire typique |
|-------------|-----------------------------|------------------------|
| **OpenAI GPT** | Scripts UGC (fallback), analyse marque, analyse tendance, vision (check image, hybrid radar, business analysis), prompt image, tech pack, enhance prompt | ~0,01 €/1K tokens |
| **Anthropic Claude** | Scripts UGC, stratégie marque, analyse marque, recommandations, textes site, posts, extract frequency, apply strategy, site todo, parse website | ~0,008 €/1K tokens |
| **Ideogram** | Logos, mockups base, sticker, design questionnaire, flat sketch, image tendance | ~0,08 €/image |
| **Higgsfield** | Mannequin, shooting photo, shooting product (4 images), virtual try-on | 0,08–0,40 €/image ; try-on ~2,50 € |
| **The New Black** | Mockup avec design (clothing) | À documenter |

---

## 4. Coûts par feature (référence `lib/ai-usage-config.ts`)

| Feature key | Coût (€) | Jetons (1€=100) |
|-------------|----------|-----------------|
| ugc_scripts | 0,03 | 3 |
| brand_strategy | 0,06 | 6 |
| brand_analyze | 0,04 | 4 |
| brand_logo | 0,10 | 10 |
| brand_parse_website | 0,02 | 2 |
| launch_map_recommendations | 0,04 | 4 |
| launch_map_site_texts | 0,03 | 3 |
| launch_map_structured_post | 0,03 | 3 |
| launch_map_posts_from_strategy | 0,05 | 5 |
| launch_map_extract_frequency | 0,02 | 2 |
| launch_map_apply_strategy | 0,04 | 4 |
| launch_map_todo | 0,02 | 2 |
| trends_generate_image | 0,10 | 10 |
| trends_analyse | 0,05 | 5 |
| trends_check_image | 0,03 | 3 |
| trends_hybrid_scan | 0,04 | 4 |
| ugc_shooting_photo | 0,12 | 12 |
| ugc_shooting_product | 0,40 | 40 |
| ugc_generate_mannequin | 0,12 | 12 |
| ugc_virtual_tryon | 2,50 | 250 |
| factories_match | 0,02 | 2 |

---

## 5. Budgets et limites par plan

| Plan | Budget mensuel (€) | Jetons | Virtual try-on max/mois |
|------|--------------------|--------|-------------------------|
| free | 5 | 500 | 1 |
| starter | 5 | 500 | 1 |
| base | 34 | 3400 | 5 |
| growth | 75 | 7500 | 15 |
| pro | 150 | 15000 | 50 |
| enterprise | illimité | illimité | illimité |

---

## 6. Fichiers de référence

- `lib/ai-usage-config.ts` — coûts et limites par feature
- `lib/ai-usage.ts` — logique de suivi et quotas
- `lib/api/chatgpt.ts` — OpenAI GPT-4
- `lib/api/claude.ts` — Anthropic Claude Sonnet 4.5
- `lib/api/higgsfield.ts` — Higgsfield Soul + Seedream Edit
- `lib/api/ideogram.ts` — Ideogram 3.0
- `lib/api/TnbService.ts` — The New Black (clothing, vto_stream)
- `docs/ai-cout-revient.md` — détail des coûts
- `docs/llm-split.md` — répartition GPT vs Claude

---

## 7. Points d’attention pour la rentabilité

1. **Virtual Try-On** : coût ~2,50 €/appel, très impactant. Limité à 1–5 selon le plan.
2. **Shooting product** : 4 images par appel (0,40 €).
3. **Claude prioritaire** pour le texte long : coût inférieur à GPT pour réponses longues.
4. **The New Black** : coût à documenter pour mockup avec design.
5. **Virtual Try-On** : fonction `generateVirtualTryOn` manquante dans `higgsfield.ts` — l’app peut planter si utilisée.
