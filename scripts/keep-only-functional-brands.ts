/**
 * Désactive toutes les marques sauf celles actuellement fonctionnelles.
 * Le scan ne tournera que sur Zara et Nike.
 *
 * Usage: npx tsx scripts/keep-only-functional-brands.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Noms des marques à garder actives (sélecteurs + flux OK) */
const FUNCTIONAL_BRANDS = ['Zara', 'Nike', 'H&M'];

async function main() {
  console.log('🔄 Nettoyage des marques : ne garder que les fonctionnelles...\n');

  const all = await prisma.scrapableBrand.findMany({
    select: { name: true, isActive: true },
  });

  let deactivated = 0;
  let kept = 0;

  for (const b of all) {
    const shouldBeActive = FUNCTIONAL_BRANDS.includes(b.name);
    if (shouldBeActive && !b.isActive) {
      await prisma.scrapableBrand.update({
        where: { name: b.name },
        data: { isActive: true },
      });
      console.log(`✅ ${b.name} : réactivée`);
      kept++;
    } else if (!shouldBeActive && b.isActive) {
      await prisma.scrapableBrand.update({
        where: { name: b.name },
        data: { isActive: false },
      });
      console.log(`⏸️  ${b.name} : désactivée`);
      deactivated++;
    } else if (shouldBeActive) {
      console.log(`✓  ${b.name} : déjà active`);
      kept++;
    }
  }

  console.log('\n📊 Résumé :');
  console.log(`   Actives (conservées) : ${kept} (${FUNCTIONAL_BRANDS.join(', ')})`);
  console.log(`   Désactivées : ${deactivated}`);
  console.log('\n💡 Le scan ne scrapera plus que ces marques : npm run scan:trends');
}

main()
  .catch((e) => {
    console.error('❌ Erreur :', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
