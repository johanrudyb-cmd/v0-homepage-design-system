'use client';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50">
      <Sidebar />
      <div className="pl-72">
        <Header />
        <main className="p-10 bg-stone-50">{children}</main>
      </div>
    </div>
  );
}
