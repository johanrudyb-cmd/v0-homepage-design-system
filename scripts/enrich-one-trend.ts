/**
 * Script pour tester l'enrichissement IA d'une tendance via GPT
 *
 * Usage: npx tsx scripts/enrich-one-trend.ts [productId]
 * Si pas d'ID fourni, prend le premier produit avec des champs manquants.
 *
 * Prérequis: CHATGPT_API_KEY dans .env (ou OPENAI_API_KEY utilisée comme fallback)
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });
// Fallback si CHATGPT_API_KEY absente mais OPENAI_API_KEY présente
if (!process.env.CHATGPT_API_KEY && process.env.OPENAI_API_KEY) {
  process.env.CHATGPT_API_KEY = process.env.OPENAI_API_KEY;
}
import { prisma } from '@/lib/prisma';
import { enrichProductDetails, isChatGptConfigured } from '@/lib/api/chatgpt';

function hasMissingFields(p: {
  style?: string | null;
  material?: string | null;
  color?: string | null;
  careInstructions?: string | null;
  description?: string | null;
  cut?: string | null;
  estimatedCogsPercent?: number | null;
  complexityScore?: string | null;
  sustainabilityScore?: number | null;
  visualAttractivenessScore?: number | null;
  dominantAttribute?: string | null;
}): boolean {
  if (!p.material || p.material.trim() === '' || p.material === 'Non spécifié') return true;
  if (!p.style || p.style.trim() === '') return true;
  if (!p.color || p.color.trim() === '') return true;
  if (!p.careInstructions || p.careInstructions.trim() === '') return true;
  if (p.estimatedCogsPercent == null) return true;
  if (!p.complexityScore || p.complexityScore.trim() === '') return true;
  if (p.sustainabilityScore == null) return true;
  if (p.visualAttractivenessScore == null) return true;
  if (!p.dominantAttribute || p.dominantAttribute.trim() === '') return true;
  return false;
}

async function main() {
  const productId = process.argv[2];

  if (!isChatGptConfigured()) {
    console.error('❌ CHATGPT_API_KEY non configurée dans .env');
    process.exit(1);
  }
  console.log('✅ API GPT configurée\n');

  let product;
  if (productId) {
    product = await prisma.trendProduct.findUnique({ where: { id: productId } });
    if (!product) {
      console.error(`❌ Produit introuvable: ${productId}`);
      process.exit(1);
    }
  } else {
    // Prendre un produit avec des champs manquants
    const products = await prisma.trendProduct.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
    });
    product = products.find((p) => hasMissingFields(p));
    if (!product) {
      console.error('❌ Aucun produit avec champs manquants trouvé. Tous les produits semblent complets.');
      process.exit(1);
    }
  }

  console.log('📦 Produit sélectionné:');
  console.log(`   ID: ${product.id}`);
  console.log(`   Nom: ${product.name}`);
  console.log(`   Catégorie: ${product.category}`);
  console.log(`   Champs manquants: ${hasMissingFields(product) ? 'Oui' : 'Non'}\n`);

  console.log('⏳ Enrichissement en cours via GPT...');
  const enriched = await enrichProductDetails({
    name: product.name ?? '',
    category: product.category ?? '',
    material: product.material,
    style: product.style,
    color: product.color,
    careInstructions: product.careInstructions,
    description: product.description,
    cut: product.cut,
    averagePrice: product.averagePrice ?? 0,
    imageUrl: product.imageUrl,
    estimatedCogsPercent: product.estimatedCogsPercent,
    complexityScore: product.complexityScore,
    sustainabilityScore: product.sustainabilityScore,
    visualAttractivenessScore: product.visualAttractivenessScore,
    dominantAttribute: product.dominantAttribute,
  });

  const updates: Record<string, unknown> = {};
  if (enriched.style != null && (!product.style || product.style.trim() === '')) updates.style = enriched.style;
  if (enriched.material != null && (!product.material || product.material === 'Non spécifié')) updates.material = enriched.material;
  if (enriched.color != null && (!product.color || product.color.trim() === '')) updates.color = enriched.color;
  if (enriched.careInstructions != null && (!product.careInstructions || product.careInstructions.trim() === '')) updates.careInstructions = enriched.careInstructions;
  if (enriched.description != null && (!product.description || product.description.trim() === '')) updates.description = enriched.description;
  if (enriched.cut != null && (!product.cut || product.cut.trim() === '')) updates.cut = enriched.cut;
  if (enriched.estimatedCogsPercent != null && product.estimatedCogsPercent == null) updates.estimatedCogsPercent = enriched.estimatedCogsPercent;
  if (enriched.complexityScore != null && (!product.complexityScore || product.complexityScore.trim() === '')) updates.complexityScore = enriched.complexityScore;
  if (enriched.sustainabilityScore != null && product.sustainabilityScore == null) updates.sustainabilityScore = enriched.sustainabilityScore;
  if (enriched.visualAttractivenessScore != null && product.visualAttractivenessScore == null) updates.visualAttractivenessScore = enriched.visualAttractivenessScore;
  if (enriched.dominantAttribute != null && (!product.dominantAttribute || product.dominantAttribute.trim() === '')) updates.dominantAttribute = enriched.dominantAttribute;

  if (Object.keys(updates).length === 0) {
    console.log('ℹ️  Aucun champ à mettre à jour (réponse IA vide ou déjà complets).');
    console.log('   Données reçues de l\'IA:', JSON.stringify(enriched, null, 2));
    return;
  }

  await prisma.trendProduct.update({
    where: { id: product.id },
    data: updates,
  });

  console.log('✅ Enrichissement terminé ! Champs mis à jour:');
  Object.entries(updates).forEach(([k, v]) => console.log(`   • ${k}: ${typeof v === 'string' && v.length > 60 ? v.slice(0, 60) + '...' : v}`));
  console.log(`\n👉 Voir le produit: /trends/${product.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
