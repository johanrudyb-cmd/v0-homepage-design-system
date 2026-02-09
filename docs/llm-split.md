# Répartition des IA pour les textes

Deux modèles sont utilisés pour la génération de texte :

## GPT-4o (OpenAI) — clé `CHATGPT_API_KEY`

- **Analyse visuelle** : analyse d’image produit (coupe, attributs, score tendance) — `analyzeProductImage`
- **Texte court / structuré** : analyse business multi-zones (1–3 phrases), test de connexion
- **Matching usines** : court, structuré

→ Idéal pour la **vision** et les **réponses courtes**.

## Claude Sonnet 3.5 (Anthropic) — clé `ANTHROPIC_API_KEY`

- **Analyse de marque** : positionnement, cible, marketing, recommandations — `generateBrandAnalysis`
- **Analyse tendances** : prévisions France, tendances à venir — `generateTrendsAnalysis`
- **Analyse produit** : potentiel, positionnement, recommandations — `generateProductTrendAnalysis`
- **Conseils tendance + prompt image** : advice, note, imagePrompt — `generateTrendAdviceAndImagePrompt`
- **Scripts UGC** : scripts 15 s pour TikTok/Instagram — `generateUGCScripts`
- **Tech pack + amélioration de prompt** : `generateTechPack`, `enhancePrompt`
- **Prompt pour image produit** : `generateProductImagePrompt`
- **Génération identité marque** : noms, couleurs, typo (route brands/generate-identity)

→ Idéal pour le **texte long** et le **créatif**.

## Fallback

Si `ANTHROPIC_API_KEY` n’est pas configurée, les appels « texte long » utilisent GPT (OpenAI) pour rester compatibles.
