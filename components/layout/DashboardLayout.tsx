'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { DashboardTutorial } from '@/components/dashboard/DashboardTutorial';
import { PageTransition } from './PageTransition';
import { PaywallGate } from '@/components/paywall/PaywallGate';

function DashboardTutorialGate() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const showTutorial = pathname === '/dashboard' && searchParams.get('tutorial') === '1';
  return showTutorial ? <DashboardTutorial /> : null;
}

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Sidebar />
      <div className="pl-72 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 min-h-[calc(100vh-4rem)] flex flex-col">
          <PageTransition className="flex-1 min-h-0 flex flex-col">
            <PaywallGate>{children}</PaywallGate>
          </PageTransition>
        </main>
      </div>
      <Suspense fallback={null}>
        <DashboardTutorialGate />
      </Suspense>
    </div>
  );
}
