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
  const prevPathnameRef = useRef<string>(pathname);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Ne déclencher la transition que si le pathname change vraiment
    if (prevPathnameRef.current !== pathname && mounted) {
      setIsTransitioning(true);
      
      // Animation de sortie puis entrée
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        prevPathnameRef.current = pathname;
        
        // Réinitialiser l'état de transition après un court délai pour l'animation d'entrée
        requestAnimationFrame(() => {
          setIsTransitioning(false);
        });
      }, 150);

      return () => clearTimeout(timer);
    } else {
      // Si le pathname n'a pas changé ou au premier rendu, mettre à jour directement
      setDisplayChildren(children);
      prevPathnameRef.current = pathname;
    }
  }, [pathname, children, mounted]);

  if (!mounted) {
    return <div className={cn('w-full', className)}>{children}</div>;
  }

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
