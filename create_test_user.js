
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'test@outfity.fr';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            plan: 'pro',
            name: 'Test OUTFITY'
        },
        create: {
            email,
            name: 'Test OUTFITY',
            password: hashedPassword,
            plan: 'pro'
        }
    });

    console.log('--- COMPTE TEST CRÉÉ ---');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Plan:', user.plan);
    console.log('------------------------');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
