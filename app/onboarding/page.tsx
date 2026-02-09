import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { OnboardingView } from '@/components/onboarding/OnboardingView';

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin?redirect=/onboarding');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        <OnboardingView />
      </div>
    </div>
  );
}
