import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-[#1D1D1F]/5 text-[#1D1D1F]',
      secondary: 'bg-[#007AFF]/10 text-[#007AFF]',
      outline: 'bg-white/80 backdrop-blur-sm text-[#1D1D1F] shadow-apple',
      destructive: 'bg-[#FF3B30]/10 text-[#FF3B30]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
