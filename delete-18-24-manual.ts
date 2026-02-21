
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Deleting OLD 18-24 items manually...');
    // Delete items with 'preview' in sourceUrl AND sourceBrand Global Partner/ASOS
    const deleted = await prisma.trendProduct.deleteMany({
        where: {
            OR: [
                { sourceBrand: 'Global Partner', sourceUrl: { contains: 'preview' } },
                { sourceBrand: 'ASOS', sourceUrl: { contains: 'preview' } } // JIC
            ]
        },
    });
    console.log(`Deleted ${deleted.count} items.`);
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
