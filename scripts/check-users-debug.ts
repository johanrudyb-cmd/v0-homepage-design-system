
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            role: true,
            isBrandCreator: true,
            isInfluencer: true,
            isAffiliate: true,
        }
    });

    console.log('--- USERS IN DATABASE ---');
    if (users.length === 0) {
        console.log('NO USERS FOUND. DATABASE IS EMPTY.');
    } else {
        users.forEach(user => {
            console.log(`Email: ${user.email} | ID: ${user.id}`);
            console.log(`Roles: Admin=${user.role}, BrandCreator=${user.isBrandCreator}, Influencer=${user.isInfluencer}, Affiliate=${user.isAffiliate}`);
            console.log('-------------------------');
        });
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
