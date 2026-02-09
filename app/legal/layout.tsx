import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <header className="bg-white border-b border-[#F2F2F2] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#6e6e73] hover:text-[#007AFF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-10 pb-20">{children}</main>
    </div>
  );
}
