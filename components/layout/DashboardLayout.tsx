'use client';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-72">
        <Header />
        <main className="min-h-[calc(100vh-5rem)]">{children}</main>
      </div>
    </div>
  );
}
