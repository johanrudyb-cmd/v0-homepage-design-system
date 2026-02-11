'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    title?: string;
    message: string;
    type?: ToastType;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    toast: (payload: Omit<Toast, 'id'>) => void;
    dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const dismiss = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = React.useCallback(
        ({ title, message, type = 'info', duration = 5000 }: Omit<Toast, 'id'>) => {
            const id = Math.random().toString(36).substring(2, 9);
            setToasts((prev) => [...prev, { id, title, message, type, duration }]);

            if (duration > 0) {
                setTimeout(() => dismiss(id), duration);
            }
        },
        [dismiss]
    );

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-[400px] w-full pointer-events-none">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        error: <AlertCircle className="h-5 w-5 text-red-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    };

    const bgColors = {
        success: 'bg-green-50 border-green-100',
        error: 'bg-red-50 border-red-100',
        info: 'bg-blue-50 border-blue-100',
        warning: 'bg-amber-50 border-amber-100',
    };

    return (
        <div
            className={cn(
                'pointer-events-auto flex w-full items-start gap-3 rounded-2xl border p-4 shadow-apple-lg backdrop-blur-md animate-slide-in-right transition-all',
                bgColors[toast.type || 'info'],
                'bg-white/90'
            )}
            role="alert"
        >
            <div className="shrink-0 mt-0.5">{icons[toast.type || 'info']}</div>
            <div className="flex-1 min-w-0">
                {toast.title && (
                    <h4 className="text-sm font-semibold text-[#1D1D1F] mb-1">
                        {toast.title}
                    </h4>
                )}
                <p className="text-sm text-[#1D1D1F]/70 leading-relaxed">
                    {toast.message}
                </p>
            </div>
            <button
                onClick={onDismiss}
                className="shrink-0 rounded-full p-1 hover:bg-black/5 transition-colors"
            >
                <X className="h-4 w-4 text-[#1D1D1F]/40" />
            </button>
        </div>
    );
}
