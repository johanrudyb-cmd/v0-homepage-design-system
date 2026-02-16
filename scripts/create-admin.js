const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'contact@outfity.fr';
    const name = 'Admin OUTFITY';
    const password = 'AdminOutfity2026!'; // Change this password after first login

    console.log(`[Script] Création du compte admin pour: ${email}`);

    // Vérifier si utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        console.log('[Script] L\'utilisateur existe déjà. Mise à jour du mot de passe...');
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                plan: 'enterprise' // On s'assure qu'il est en plan enterprise
            },
        });
        console.log('[Script] Mot de passe mis à jour avec succès.');
    } else {
        console.log('[Script] Création de l\'utilisateur...');
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                plan: 'enterprise', // Plan admin par défaut
            },
        });
        console.log(`[Script] Utilisateur créé avec succès: ${user.id}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
