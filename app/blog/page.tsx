import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata = {
  title: 'Blog | OUTFITY',
  description: 'Actualités et articles sur la mode, le lancement de marque et les outils créateurs - OUTFITY par BIANGORY.',
};

export default function BlogPage() {
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
      <main className="max-w-3xl mx-auto px-6 py-10 pb-20">
        <article className="bg-white rounded-2xl border border-[#F2F2F2] p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#007AFF]/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#007AFF]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1D1D1F]">Blog OUTFITY</h1>
              <p className="text-[#6e6e73] text-sm mt-1">
                Actualités, tendances et conseils pour créateurs de marque
              </p>
            </div>
          </div>
          <p className="text-[#6e6e73] leading-relaxed mb-6">
            OUTFITY, plateforme éditée par BIANGORY, accompagne les créateurs et marques de mode
            avec des outils de Market Intelligence, Sourcing, Studio IA et Stratégie. Ce blog
            sera dédié aux actualités du secteur, aux tendances et aux bonnes pratiques pour
            développer sa marque.
          </p>
          <p className="text-[#6e6e73] leading-relaxed">
            Les articles seront publiés prochainement. En attendant, découvrez nos{' '}
            <Link href="/#features" className="text-[#007AFF] hover:underline">
              fonctionnalités
            </Link>
            , la{' '}
            <Link href="/#faq-section" className="text-[#007AFF] hover:underline">
              FAQ
            </Link>
            {' '}et la page{' '}
            <Link href="/about" className="text-[#007AFF] hover:underline">
              À propos
            </Link>
            .
          </p>
        </article>
      </main>
    </div>
  );
}
