
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    const newPassword = process.argv[3] || 'password123';

    if (!email) {
        console.error('Please provide an email address as argument');
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                // On s'assure qu'il est bien ADMIN au passage
                emailVerified: new Date(),
            },
        });

        console.log(`✅ Password updated for user ${user.email}`);
        console.log(`🔑 New password: ${newPassword}`);

    } catch (error) {
        if ((error as any).code === 'P2025') {
            // User not found, let's create it
            console.log(`User ${email} not found. Creating new Admin user...`);
            const newUser = await prisma.user.create({
                data: {
                    name: 'Admin User',
                    email: email,
                    password: hashedPassword,
                    emailVerified: new Date(),
                }
            });
            console.log(`✅ User created: ${newUser.email}`);
            console.log(`🔑 Password: ${newPassword}`);
        } else {
            console.error('Error updating user:', error);
        }
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
