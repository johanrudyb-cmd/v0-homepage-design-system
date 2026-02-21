const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Tentative de connexion à la base de données...');
    try {
        const count = await prisma.user.count();
        console.log(`✅ Connexion RÉUSSIE ! Il y a ${count} utilisateurs.`);
    } catch (e) {
        console.error('❌ ÉCHEC de la connexion :');
        console.error(e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
