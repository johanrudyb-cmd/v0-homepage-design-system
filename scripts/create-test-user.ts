import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'test@mediabiangory.com';
    const password = 'Test123!';
    const name = 'Test User';

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('🔍 Recherche de l\'utilisateur existant...');

    // Supprimer l'utilisateur s'il existe
    const deleted = await prisma.user.deleteMany({
        where: { email },
    });

    if (deleted.count > 0) {
        console.log('🗑️  Ancien utilisateur supprimé');
    }

    console.log('✨ Création du nouvel utilisateur...');
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            plan: 'free',
        },
    });

    console.log('✅ Utilisateur créé avec succès!');
    console.log('\n📧 Email:', email);
    console.log('🔑 Mot de passe:', password);
    console.log('👤 ID:', user.id);
    console.log('\n✅ Vous pouvez maintenant vous connecter avec ces identifiants.');

    // Test de vérification du hash
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('\n🔍 Vérification du hash:', isValid ? '✅ OK' : '❌ ERREUR');
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
