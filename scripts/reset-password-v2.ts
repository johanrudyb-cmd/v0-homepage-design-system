
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

    // We explicitly check if user exists first to decide update or create
    const existingUser = await prisma.user.findUnique({ where: { email } });

    try {
        if (existingUser) {
            // Update existing user
            const user = await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    emailVerified: new Date(),
                },
            });
            console.log(`✅ Password updated for existing user ${user.email}`);
            console.log(`🔑 New password: ${newPassword}`);
        } else {
            // Create new user
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
        }

    } catch (error) {
        console.error('Error during operation:', error);
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
