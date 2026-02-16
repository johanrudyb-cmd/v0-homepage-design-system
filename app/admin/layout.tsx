import { getIsAdmin } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Newspaper,
    Users,
    BarChart3,
    ShieldCheck,
    Settings,
    AppWindow,
    ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const isAdmin = await getIsAdmin();

    if (!isAdmin) {
        redirect('/dashboard');
    }

    const navItems = [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Blog', href: '/admin/blog', icon: Newspaper },
        { label: 'Simulateur Shopify', href: '/admin/shopify-simulator', icon: AppWindow },
        { label: 'Utilisateurs', href: '/admin/users', icon: Users },
        { label: 'Métriques', href: '/admin/metrics', icon: BarChart3 },
        { label: 'Sécurité', href: '/admin/security', icon: ShieldCheck },
    ];

    return (
        <div className="flex min-h-screen bg-[#F5F5F7]">
            <Toaster position="top-right" richColors />
            {/* Sidebar Admin */}
            <aside className="w-64 bg-white border-r border-[#F2F2F2] sticky top-0 h-screen flex flex-col">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">A</span>
                        </div>
                        <span className="font-bold text-xl tracking-tighter">ADMIN</span>
                    </Link>

                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#6e6e73] hover:text-black hover:bg-[#F5F5F7] rounded-lg transition-all"
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-[#F2F2F2]">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm text-[#6e6e73] hover:text-black transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour à l'App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
