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
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    // Ne déclencher la transition que si le pathname change (pas au premier mount)
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        prevPathnameRef.current = pathname;
        requestAnimationFrame(() => setIsTransitioning(false));
      }, 150);
      return () => clearTimeout(timer);
    }
    prevPathnameRef.current = pathname;
    setDisplayChildren(children);
  }, [pathname, children]);

  // Toujours la même structure pour éviter le hydration mismatch (pas de branche !mounted)
  return (
    <div
      className={cn(
        'w-full',
        isTransitioning
          ? 'opacity-0 translate-y-3 scale-[0.98]'
          : 'opacity-100 translate-y-0 scale-100',
        'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        className
      )}
    >
      {displayChildren}
    </div>
  );
}
