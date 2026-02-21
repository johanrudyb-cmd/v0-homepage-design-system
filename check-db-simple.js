const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    console.log('--- TEST DE CONNEXION ---');
    try {
        const user = await prisma.user.findFirst();
        console.log('✅ CONNEXION RÉUSSIE !');
    } catch (e) {
        console.error('❌ ÉCHEC :', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
