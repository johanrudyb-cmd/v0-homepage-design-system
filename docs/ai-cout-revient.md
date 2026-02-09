# Coût de revient IA — Media Biangory

Estimation du coût réel par fonctionnalité selon les APIs utilisées (tarifs 2025).

**Note :** Tech pack, mockups et design sont créés par l'utilisateur (pas d'IA) — coût 0.  
Virtual try-on : ~2,50 $ coût réel. Budget 5€ calibré pour **max 3 cycles** complets.

---

## 1. APIs utilisées

| Fournisseur | Modèle / Service | Usage dans l'app |
|-------------|------------------|------------------|
| **OpenAI** | GPT-4 / GPT-4o | Scripts UGC, tendances, vision (analyse image) — fallback si Claude absent |
| **Anthropic** | Claude Sonnet 4.5 | Scripts UGC, analyse marque, tendances — prioritaire si configuré |
| **Ideogram** | Ideogram 3.0 | Logos (optionnel), tendances (images) |
| **Higgsfield** | Soul / Edit | UGC shooting photo, mannequin, virtual try-on |

---

## 2. Tarifs unitaires (référence 2025)

### OpenAI GPT-4o
- **Input** : ~5 $/1M tokens ≈ 0,0045 €/1K tokens  
- **Output** : ~15 $/1M tokens ≈ 0,014 €/1K tokens  
- **Moyenne mixte** : ~0,01 €/1K tokens  

*Source : [OpenAI Pricing](https://platform.openai.com/docs/pricing)*

### Anthropic Claude Sonnet 4
- **Input** : ~3 $/1M tokens ≈ 0,003 €/1K tokens  
- **Output** : ~15 $/1M tokens ≈ 0,014 €/1K tokens  
- **Moyenne mixte** : ~0,008 €/1K tokens  

*Source : [Anthropic Pricing](https://docs.anthropic.com/en/docs/about-claude/pricing)*

### Ideogram 3.0
- **Génération image** : ~0,06–0,12 €/image (selon résolution et options)  
- **Référence** : ~0,08 €/image  

*Source : [Ideogram API](https://about.ideogram.ai/api-pricing)*

### Higgsfield
- **Text-to-image (Soul) 720p** : 1,5 crédits ≈ 0,08 €/image  
- **Text-to-image 1080p** : 3 crédits ≈ 0,18 €/image  
- **Image-to-image (shooting)** : ~0,10–0,15 €/image  

*Source : [Higgsfield Pricing](https://docs.higgsfield.ai/pricing)*

---

## 3. Coût estimé par fonctionnalité

| Fonctionnalité | API(s) | Tokens / images | Coût estimé (€) |
|----------------|--------|------------------|-----------------|
| **Scripts UGC** (5 scripts) | Claude ou GPT-4 | ~3K in + ~1K out × 5 | 0,03–0,05 |
| **Stratégie marque** | Claude | ~5K in + ~2K out | 0,06–0,10 |
| **Analyse marque** | Claude | ~8K in + ~3K out | 0,08–0,12 |
| **Logo (Ideogram)** | Ideogram | 1 image | 0,08–0,12 |
| **Parse site web** | Claude/GPT | ~2K in + ~1K out | 0,02–0,04 |
| ~~Design généré~~ | — | Créé par l'utilisateur | 0 |
| ~~Design questionnaire~~ | — | Créé par l'utilisateur | 0 |
| ~~Description produit~~ | — | Créé par l'utilisateur | 0 |
| ~~Tech pack~~ | — | Rempli par l'utilisateur | 0 |
| ~~Mockup de base~~ | — | Importé par l'utilisateur | 0 |
| ~~Sticker~~ | — | Créé par l'utilisateur | 0 |
| **Recommandations launch map** | Claude/GPT | ~3K in + ~1K out | 0,04–0,06 |
| **Textes site** | Claude/GPT | ~2K in + ~1K out | 0,03–0,05 |
| **Post structuré** | Claude/GPT | ~2K in + ~800 out | 0,03–0,05 |
| **Posts depuis stratégie** | Claude/GPT | ~4K in + ~2K out | 0,06–0,10 |
| **Extract content frequency** | Claude/GPT | ~1K in + ~500 out | 0,02–0,03 |
| **Apply strategy** | Claude/GPT | ~3K in + ~1K out | 0,04–0,06 |
| **Site creation todo** | Claude | ~2K in + ~1K out | 0,03–0,05 |
| **Image tendance** | GPT (prompt) + Ideogram | 1 prompt + 1 image | 0,10–0,15 |
| **Analyse tendance** | Claude/GPT | ~2K in + ~1K out | 0,03–0,06 |
| **Check trend image** | GPT Vision | ~1K in + ~300 out | 0,02–0,04 |
| **Hybrid radar scan** | GPT | ~2K in + ~500 out | 0,02–0,04 |
| **Shooting photo** | Higgsfield | 1 image (image-to-image) | 0,10–0,18 |
| **Shooting product** | Higgsfield | 1 image | 0,08–0,15 |
| **Générer mannequin** | Higgsfield | 1 image | 0,10–0,18 |
| **Virtual try-on** | Higgsfield | 1 image (image-to-image) | 0,08–0,12 |
| **Match factories** | Claude/GPT | ~2K in + ~500 out | 0,02–0,04 |

---

## 4. Résumé : coût moyen par appel (fonctionnalités IA réellement utilisées)

| Type | Coût moyen (€) |
|------|----------------|
| **Texte court** (analyse, extraction) | 0,02–0,04 |
| **Texte long** (stratégie, scripts) | 0,04–0,10 |
| **Image Ideogram** (logo, tendances) | 0,08–0,15 |
| **Image Higgsfield** (shooting, mannequin, try-on) | 0,08–0,18 |

---

## 5. Budget 5 € — équivalent en usage

Avec un budget de **5 € / mois** pour le plan de base (max **3 cycles complets**) :

| Usage | Équivalent |
|-------|------------|
| **3 cycles complets** (avec 1 virtual try-on) | ~4,70 € |
| **3 cycles sans virtual try-on** | ~2,20 € |
| **2 virtual try-ons** (seuls) | 5 € |

Virtual try-on = 2,50 € / appel. Pour tenir 3 cycles dans 5 €, limiter à **1 virtual try-on** par mois ou répartir sur les cycles.

---

## 6. Recommandations

1. **Prioriser Claude** pour le texte long : coût inférieur à GPT-4 pour des réponses plus longues.
2. **Cache** : réutiliser les images tendances (clé `trendKey`) pour limiter les coûts.
3. **Limites** : les valeurs dans `lib/ai-usage-config.ts` sont alignées avec ces estimations.
4. **Surveillance** : suivre les facturations OpenAI, Anthropic, Ideogram et Higgsfield pour ajuster les coûts dans la config.

---

## 7. Révision des coûts

À mettre à jour régulièrement selon :
- Changements de tarifs des fournisseurs
- Nouvelles fonctionnalités IA
- Évolution des `max_tokens` et des prompts
- Répartition réelle Claude vs GPT (si les deux sont configurés)
