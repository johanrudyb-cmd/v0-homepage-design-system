import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#1D1D1F] mb-3">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-3xl bg-white px-4 py-3 text-base text-[#1D1D1F] placeholder:text-[#1D1D1F]/40 shadow-apple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF] transition-all disabled:cursor-not-allowed disabled:opacity-50',
            error && 'ring-2 ring-[#FF3B30]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-[#FF3B30]">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
