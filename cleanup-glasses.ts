import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.trendProduct.deleteMany({
        where: {
            OR: [
                { name: { contains: 'lunette', mode: 'insensitive' } },
                { name: { contains: 'glasses', mode: 'insensitive' } },
                { name: { contains: 'sunglasses', mode: 'insensitive' } },
                { name: { contains: 'eyewear', mode: 'insensitive' } },
                { name: { contains: 'monture', mode: 'insensitive' } }
            ]
        }
    });
    console.log('Deleted glasses/eyewear:', result.count);
}

main().finally(() => prisma.$disconnect());
