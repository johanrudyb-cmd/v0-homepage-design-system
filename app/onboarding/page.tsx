import { getCurrentUser, getIsAdmin } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { OnboardingView } from '@/components/onboarding/OnboardingView';
import { prisma } from '@/lib/prisma';

export default async function OnboardingPage() {
  const authUser = await getCurrentUser();
  if (!authUser) {
    redirect('/auth/signin?redirect=/onboarding');
  }

  const isAdmin = await getIsAdmin();

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { plan: true }
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        <OnboardingView userPlan={user?.plan || 'free'} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
