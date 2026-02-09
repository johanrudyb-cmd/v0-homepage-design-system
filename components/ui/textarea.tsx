import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
          className={cn(
            'flex min-h-[140px] w-full rounded-3xl bg-white px-4 py-3 text-base text-[#1D1D1F] placeholder:text-[#1D1D1F]/40 shadow-apple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF] transition-all disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
