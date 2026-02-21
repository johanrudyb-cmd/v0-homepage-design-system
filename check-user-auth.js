const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const TARGET_EMAIL = 'johanrudyb@gmail.com'; // Ou modifiez ici si c'est un autre email

async function main() {
    console.log(`🔍 Vérification Auth pour : ${TARGET_EMAIL}`);

    try {
        const user = await prisma.user.findUnique({
            where: { email: TARGET_EMAIL }
        });

        if (!user) {
            console.error('❌ Utilisateur NON TROUVÉ dans la base de données !');
            console.log('Liste des utilisateurs disponibles :');
            const allUsers = await prisma.user.findMany({ select: { email: true } });
            console.log(allUsers.map(u => u.email));
            return;
        }

        console.log(`✅ Utilisateur trouvé (ID: ${user.id})`);
        console.log(`   Hash actuel: ${user.password ? user.password.substring(0, 15) + '...' : 'AUCUN PASSWORD !'}`);

        // Test Force Login
        if (TARGET_EMAIL === 'johanrudyb@gmail.com') {
            console.log('ℹ️ Règle Force Login active dans le code : "admin123" devrait marcher.');
        }

        // Si on veut reset le password pour être sûr
        /*
        const newHash = await bcrypt.hash('admin123', 10);
        await prisma.user.update({
            where: { email: TARGET_EMAIL },
            data: { password: newHash }
        });
        console.log('✅ Password réinitialisé à "admin123" (pour être sûr)');
        */

    } catch (e) {
        console.error('❌ Erreur technique:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
