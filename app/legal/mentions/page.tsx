import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mentions légales | OUTFITY',
  description: 'Mentions légales et informations sur l\'éditeur de la plateforme OUTFITY - BIANGORY.',
};

export default function MentionsPage() {
  return (
    <article className="bg-white rounded-2xl border border-[#F2F2F2] p-8 md:p-12 shadow-sm">
      <h1 className="text-3xl font-bold text-[#1D1D1F] mb-2">
        Mentions légales
      </h1>
      <p className="text-sm text-[#6e6e73] mb-8">
        Dernière mise à jour : Février 2026
      </p>

      <div className="prose prose-neutral max-w-none text-[#1D1D1F] space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-[#1D1D1F] mt-8 mb-3">
            1. Éditeur du site
          </h2>
          <p className="text-[#6e6e73] leading-relaxed">
            La plateforme OUTFITY est éditée par&nbsp;:<br /><br />
            <strong className="text-[#1D1D1F]">BIANGORY</strong><br />
            Auto-entreprise<br />
            Immatriculée au RCS de TOURS sous le numéro 92907536400018<br />
            Siège social : 1 ALLÉE D&apos;ARTOIS, 37000 TOURS
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1D1D1F] mt-8 mb-3">
            2. Directeur de la publication
          </h2>
          <p className="text-[#6e6e73] leading-relaxed">
            Le directeur de la publication est le titulaire de l&apos;auto-entreprise BIANGORY.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1D1D1F] mt-8 mb-3">
            3. Hébergement
          </h2>
          <p className="text-[#6e6e73] leading-relaxed">
            Le site et la plateforme sont hébergés par des prestataires situés dans l&apos;Union
            européenne ou présentant des garanties de conformité équivalentes. Les données peuvent
            être hébergées par des prestataires tiers (hébergeurs, solutions de paiement) comme
            indiqué dans la politique de confidentialité et les{' '}
            <Link href="/legal/terms" className="text-[#007AFF] hover:underline">
              CGV/CGU
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1D1D1F] mt-8 mb-3">
            4. Propriété intellectuelle
          </h2>
          <p className="text-[#6e6e73] leading-relaxed">
            Tous les éléments de la Plateforme (code, design, bases de données de tendances,
            structure) restent la propriété exclusive du Prestataire (BIANGORY). Toute extraction
            automatisée des données (scraping) est strictement interdite. L&apos;ensemble du
            contenu de ce site (textes, images, graphismes, logo) est protégé par le droit
            d&apos;auteur et le droit des marques. Toute reproduction ou exploitation non
            autorisée peut constituer une contrefaçon sanctionnée par le Code de propriété
            intellectuelle.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1D1D1F] mt-8 mb-3">
            5. Limitation de responsabilité
          </h2>
          <p className="text-[#6e6e73] leading-relaxed">
            Le Prestataire agit en tant que fournisseur de technologies et de données. Il
            n&apos;est ni fabricant de vêtements, ni agent commercial, ni conseiller financier.
            Les informations diffusées sur ce site sont fournies à titre indicatif. L&apos;éditeur
            s&apos;efforce d&apos;en assurer l&apos;exactitude mais ne peut garantir l&apos;absence
            d&apos;erreur ou d&apos;omission. L&apos;utilisation du site et des services reste sous
            la responsabilité de l&apos;utilisateur. Les liens éventuels vers des sites tiers
            n&apos;engagent pas la responsabilité de l&apos;éditeur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1D1D1F] mt-8 mb-3">
            6. Contact
          </h2>
          <p className="text-[#6e6e73] leading-relaxed">
            Pour toute question relative aux mentions légales ou au site&nbsp;:{' '}
            <a href="mailto:contact@outfity.fr" className="text-[#007AFF] hover:underline">
              contact@outfity.fr
            </a>
            . Vous pouvez également utiliser la page{' '}
            <Link href="/contact" className="text-[#007AFF] hover:underline">
              Contact
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
