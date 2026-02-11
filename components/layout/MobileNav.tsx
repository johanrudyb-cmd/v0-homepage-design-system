'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    TrendingUp,
    Map,
    Settings,
    CircleUser
} from 'lucide-react';

const mobileLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tendances', href: '/trends', icon: TrendingUp },
    { name: 'Launch Map', href: '/launch-map', icon: Map },
    { name: 'Compte', href: '/settings', icon: CircleUser },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-black/5 px-4 pb-safe-area-inset-bottom">
            <div className="flex justify-around items-center h-16">
                {mobileLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                                isActive ? "text-[#007AFF]" : "text-[#1D1D1F]/40"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive ? "fill-current/10" : "")} />
                            <span className="text-[10px] font-medium">{link.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
