import { prisma } from '@/lib/prisma';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { PlanSelector } from './PlanSelector';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Gestion Utilisateurs | Admin',
};

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50, // Top 50 récents
    });

    return (
        <div className="p-10 space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-[#1D1D1F]">Utilisateurs</h1>
                    <p className="text-[#6e6e73]">Liste des 50 dernières inscriptions sur la plateforme.</p>
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-[#F5F5F7]">
                            <TableRow>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Plan Actuel</TableHead>
                                <TableHead>Inscription</TableHead>
                                <TableHead>Client Stripe</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-[#1D1D1F]">{user.name || 'N/A'}</span>
                                            <span className="text-xs text-[#86868b]">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.plan === 'pro' ? 'default' : user.plan === 'enterprise' ? 'destructive' : 'secondary'}
                                            className="capitalize mb-2"
                                        >
                                            {user.plan}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-[#6e6e73]">
                                        {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell className="text-xs font-mono text-[#86868b]">
                                        {user.stripeCustomerId || '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <PlanSelector userId={user.id} initialPlan={user.plan} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
