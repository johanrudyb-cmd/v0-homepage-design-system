'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function DashboardRefresh() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    // Attendre un peu pour que le refresh se termine
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Auto-refresh toutes les 60 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 60000); // 60 secondes

    return () => clearInterval(interval);
  }, [router]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="uppercase tracking-widest text-xs font-normal"
    >
      {isRefreshing ? 'Actualisation...' : 'Actualiser'}
    </Button>
  );
}
