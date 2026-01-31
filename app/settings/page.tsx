import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Settings as SettingsIcon, User, Mail, Lock, Image as ImageIcon } from 'lucide-react';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { PreferencesForm } from '@/components/settings/PreferencesForm';

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/auth/signin');
  }

  // Récupérer les données utilisateur depuis la base de données (pas depuis le JWT)
  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      plan: true,
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-1">
                Paramètres
              </h1>
              <p className="text-muted-foreground text-sm">
                Gérez votre profil et vos préférences
              </p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <SettingsForm user={user} />

        {/* Preferences Form */}
        <div className="mt-8">
          <PreferencesForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
