
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AGE_SOURCE_BRANDS: Record<string, string[]> = {
    '18-24': ['ASOS', 'Global Partner'],
    '25-34': ['Zalando'],
};

async function getStats() {
    const segments = ['homme', 'femme'];
    const ageRanges = ['18-24', '25-34'];

    const results = [];
    let grandTotal = 0;

    for (const ageRange of ageRanges) {
        for (const segment of segments) {
            const sourceBrands = AGE_SOURCE_BRANDS[ageRange] || AGE_SOURCE_BRANDS['25-34'];
            const segmentFilter = segment === 'femme' ? ['femme', 'fille'] : ['homme', 'garcon'];

            const count = await prisma.trendProduct.count({
                where: {
                    sourceBrand: { in: sourceBrands },
                    sourceUrl: { not: null },
                    marketZone: 'EU',
                    segment: { in: segmentFilter },
                }
            });

            results.push({ ageRange, segment, count });
            grandTotal += count;
        }
    }

    console.log('--- STATS TENDANCES PAR FILTRE ---');
    results.forEach(r => {
        console.log(`${r.segment} (${r.ageRange}) : ${r.count} produits`);
    });
    console.log('----------------------------------');
    console.log(`TOTAL CUMULÉ : ${grandTotal} produits`);
}

getStats()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
