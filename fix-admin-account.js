const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();
const ADMIN_EMAIL = 'johanrudyb@gmail.com';
const ADMIN_PASSWORD = 'admin123';

async function main() {
    console.log('🔄 DÉMARRAGE DE LA RÉPARATION DU COMPTE ADMIN...');

    try {
        // 1. Lister tous les users pour voir ce qu'il y a
        const users = await prisma.user.findMany();
        console.log(`📊 Il y a ${users.length} utilisateurs dans la base.`);
        users.forEach(u => console.log(`   - ${u.email} (ID: ${u.id})`));

        // 2. Chercher le compte cible
        const existingUser = await prisma.user.findUnique({
            where: { email: ADMIN_EMAIL }
        });

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        if (existingUser) {
            console.log(`⚠️ L'utilisateur ${ADMIN_EMAIL} existe déjà.`);
            // On met à jour le mot de passe pour être sûr
            await prisma.user.update({
                where: { email: ADMIN_EMAIL },
                data: { password: hashedPassword }
            });
            console.log(`✅ Mot de passe RÉINITIALISÉ à "${ADMIN_PASSWORD}".`);
        } else {
            console.log(`❌ L'utilisateur ${ADMIN_EMAIL} N'EXISTE PAS.`);
            console.log('🛠️ Création du compte en cours...');

            await prisma.user.create({
                data: {
                    email: ADMIN_EMAIL,
                    name: 'Admin Johan',
                    password: hashedPassword,
                    plan: 'enterprise', // On vous met direct en plan max
                    role: 'ADMIN'       // Si vous avez un champ role
                }
            });
            console.log(`✅ Compte CRÉÉ avec succès ! (Pass: ${ADMIN_PASSWORD})`);
        }

    } catch (e) {
        if (e.code === 'P2002') {
            console.log('⚠️ Conflit unique (probablement déjà créé).');
        } else {
            console.error('❌ ERREUR TECHNIQUE:', e);
            // Si erreur de champ 'role' ou 'plan' manquant, on réessaie plus simple
            if (e.message.includes('Unknown argument')) {
                console.log('🔄 Tentative de création simplifiée (sans role/plan)...');
                try {
                    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
                    await prisma.user.create({
                        data: {
                            email: ADMIN_EMAIL,
                            name: 'Admin Johan',
                            password: hashedPassword
                        }
                    });
                    console.log(`✅ Compte CRÉÉ (Version Simple) !`);
                } catch (e2) {
                    console.error('❌ ECHEC FINAL:', e2.message);
                }
            }
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
