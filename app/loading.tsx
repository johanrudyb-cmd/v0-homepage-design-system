'use client';

import { useEffect, useState } from 'react';

export default function Loading() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/50 backdrop-blur-sm transition-opacity duration-300">
            <div className="flex flex-col items-center gap-4">
                {/* Apple Style Spinner */}
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-[#F5F5F7] rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-[#007AFF] rounded-full animate-spin"></div>
                </div>
                <p className="text-sm font-medium text-[#1D1D1F]/60 animate-pulse">
                    Chargement...
                </p>
            </div>
        </div>
    );
}
