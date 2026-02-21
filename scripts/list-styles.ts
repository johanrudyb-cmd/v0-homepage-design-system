
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const products = await (prisma.trendProduct as any).findMany({
        where: {
            segment: 'homme',
            category: 'TSHIRT'
        },
        select: {
            style: true
        }
    });

    const styles = [...new Set(products.map((p: any) => p.style))];
    console.log('Styles for Homme T-shirts:', JSON.stringify(styles));
}

main().catch(console.error).finally(() => prisma.$disconnect());
