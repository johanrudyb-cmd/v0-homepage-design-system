'use client';

import { cn } from '@/lib/utils';

interface AppleLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AppleLoader({ size = 'md', className }: AppleLoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'border-2 border-[#007AFF]/20 border-t-[#007AFF] rounded-full',
          'animate-apple-spin',
          sizeClasses[size]
        )}
        aria-label="Chargement"
        role="status"
      />
    </div>
  );
}

interface AppleLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function AppleLoadingSpinner({ size = 'md', text, className }: AppleLoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <AppleLoader size={size} />
      {text && (
        <p className="text-sm text-[#1D1D1F]/60 animate-fade-in">{text}</p>
      )}
    </div>
  );
}

interface AppleSkeletonProps {
  className?: string;
  lines?: number;
}

export function AppleSkeleton({ className, lines = 1 }: AppleSkeletonProps) {
  if (lines === 1) {
    return <div className={cn('skeleton h-4 w-full', className)} />;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'skeleton h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}
