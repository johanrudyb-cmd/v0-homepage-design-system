'use server';

import { prisma } from '@/lib/prisma';
import { getIsAdmin } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';
import { notifyAdmin } from '@/lib/admin-notifications';

export async function updateUserPlan(userId: string, newPlan: string) {
    const isAdmin = await getIsAdmin();

    if (!isAdmin) {
        throw new Error('Non autorisé');
    }

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { plan: newPlan },
        });

        await notifyAdmin({
            title: 'Changement de Plan (Admin)',
            message: `L'utilisateur ${user.email} a été passé en plan "${newPlan}" par un administrateur.`,
            emoji: '🔄',
            type: 'billing',
            priority: 'normal',
            data: { userId: user.id, email: user.email, newPlan }
        });

        revalidatePath('/admin/users');
        return { success: true, user };
    } catch (error) {
        console.error('[Admin Action] User plan update failed:', error);
        return { success: false, error: 'Échec de la mise à jour du plan' };
    }
}
