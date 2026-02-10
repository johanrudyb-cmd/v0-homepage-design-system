'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      key={pathname}
      className={cn(
        'w-full flex-1 flex flex-col',
        'animate-in fade-in slide-in-from-bottom-2 duration-300 ease-apple',
        className
      )}
    >
      {children}
    </div>
  );
}

