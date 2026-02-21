import { prisma } from './lib/prisma';

async function check() {
    try {
        const products = await prisma.trendProduct.findMany({ take: 1 });
        console.log("DB Connection OK");
        console.log("Sample product fields:", products[0] ? Object.keys(products[0]) : "No products found");
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        process.exit();
    }
}

check();
