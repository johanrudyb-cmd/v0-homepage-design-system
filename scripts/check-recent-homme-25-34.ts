/**
 * Vérifie les produits récents 25-34 ans homme (Zalando).
 * Usage: npx tsx scripts/check-recent-homme-25-34.ts
 *
 * 25-34 ans = Zalando (segment homme)
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Total Zalando homme
  const totalHomme = await prisma.trendProduct.count({
    where: {
      segment: 'homme',
      sourceBrand: 'Zalando',
      sourceUrl: { not: null },
    },
  });

  // Récemment ajoutés (7 derniers jours)
  const addedLast7d = await prisma.trendProduct.count({
    where: {
      segment: 'homme',
      sourceBrand: 'Zalando',
      sourceUrl: { not: null },
      createdAt: { gte: last7d },
    },
  });

  // Récemment ajoutés (24h)
  const addedLast24h = await prisma.trendProduct.count({
    where: {
      segment: 'homme',
      sourceBrand: 'Zalando',
      sourceUrl: { not: null },
      createdAt: { gte: last24h },
    },
  });

  // Les 10 derniers ajoutés
  const last10 = await prisma.trendProduct.findMany({
    where: {
      segment: 'homme',
      sourceBrand: 'Zalando',
      sourceUrl: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      name: true,
      category: true,
      createdAt: true,
      marketZone: true,
    },
  });

  console.log('\n=== 25-34 ans HOMME (Zalando) ===\n');
  console.log(`Total produits homme Zalando : ${totalHomme}`);
  console.log(`Ajoutés les 7 derniers jours  : ${addedLast7d}`);
  console.log(`Ajoutés les 24 dernières h   : ${addedLast24h}`);
  console.log('\n10 derniers produits ajoutés :');
  last10.forEach((p, i) => {
    const d = p.createdAt.toISOString().slice(0, 19).replace('T', ' ');
    console.log(`  ${i + 1}. ${p.name} (${p.category}) — ${d}`);
  });
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
