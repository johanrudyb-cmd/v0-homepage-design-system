'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Truck, Users } from 'lucide-react';

interface SupplierItem {
  id: string;
  name: string;
  country: string;
  moq?: number;
  leadTime?: number;
  quoteCount?: number;
}

interface Phase3SourcingProps {
  brandId: string;
  onComplete: () => void;
}

export function Phase3Sourcing({ brandId, onComplete }: Phase3SourcingProps) {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [favoriteSuppliers, setFavoriteSuppliers] = useState<SupplierItem[]>([]);
  const [quoteCount, setQuoteCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brandId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [quotesRes, favRes] = await Promise.all([
          fetch(`/api/quotes?brandId=${encodeURIComponent(brandId)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }).catch((err) => {
            console.error('Erreur fetch quotes:', err);
            return { ok: false, json: async () => ({ quotes: [] }) };
          }),
          fetch(`/api/brands/${encodeURIComponent(brandId)}/favorite-factories`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }).catch((err) => {
            console.error('Erreur fetch favorite factories:', err);
            return { ok: false, json: async () => ({ factories: [] }) };
          }),
        ]);

        let quotesData = { quotes: [] };
        try {
          if (quotesRes.ok) {
            quotesData = await quotesRes.json();
          }
        } catch (err) {
          console.error('Erreur parsing quotes:', err);
        }

        const quotes = quotesData.quotes || [];
        const sentQuotes = quotes.filter((q: { status: string }) => q.status === 'sent');
        setQuoteCount(sentQuotes.length);

        if (sentQuotes.length >= 2 && !isCompleted) {
          setIsCompleted(true);
          // Ne pas appeler onComplete automatiquement ici pour éviter les boucles
          // onComplete sera appelé manuellement par l'utilisateur ou après validation
        }

        // Récupérer les favoris d'abord
        let favData = { factories: [] };
        try {
          if (favRes.ok) {
            favData = await favRes.json();
          }
        } catch (err) {
          console.error('Erreur parsing favorite factories:', err);
        }

        const factoriesList = favData.factories || [];
        
        // Créer une map pour fusionner fournisseurs avec devis ET favoris
        const suppliersMap = new Map<string, SupplierItem>();
        
        // D'abord ajouter les fournisseurs qui ont reçu des devis
        for (const q of sentQuotes) {
          const f = q.factory;
          if (!f) continue;
          const existing = suppliersMap.get(f.id);
          if (existing) {
            existing.quoteCount = (existing.quoteCount ?? 0) + 1;
          } else {
            suppliersMap.set(f.id, {
              id: f.id,
              name: f.name,
              country: f.country,
              moq: f.moq,
              leadTime: f.leadTime,
              quoteCount: 1,
            });
          }
        }
        
        // Ensuite ajouter les favoris (s'ils ne sont pas déjà dans la map)
        for (const f of factoriesList) {
          const existing = suppliersMap.get(f.id);
          if (existing) {
            // Si déjà présent (a reçu un devis), on garde le quoteCount existant
            // Sinon on ne fait rien, il est déjà dans la map
          } else {
            // Ajouter le favori comme fournisseur avec qui on travaille
            suppliersMap.set(f.id, {
              id: f.id,
              name: f.name,
              country: f.country,
              moq: f.moq,
              leadTime: f.leadTime,
              quoteCount: 0,
            });
          }
        }
        
        // Tous les fournisseurs (devis + favoris) sont maintenant dans "Fournisseurs avec qui vous travaillez"
        setSuppliers(Array.from(suppliersMap.values()));
        
        // Ne plus afficher une section "Favoris" séparée
        setFavoriteSuppliers([]);
      } catch (error) {
        console.error('Erreur chargement sourcing:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 5000); // Rafraîchir plus souvent pour voir les changements
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId]);

  const renderList = (items: SupplierItem[], title: string, icon: React.ReactNode) => (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
        {icon}
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((s) => (
          <li
            key={s.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
          >
            <span className="font-medium text-foreground">{s.name}</span>
            <span className="text-muted-foreground">{s.country}</span>
            {s.moq != null && <span className="text-muted-foreground">MOQ {s.moq}</span>}
            {s.leadTime != null && <span className="text-muted-foreground">Délai {s.leadTime} j</span>}
            {(s.quoteCount ?? 0) > 0 && (
              <span className="text-primary font-medium">{s.quoteCount} devis</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="space-y-6">
      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : (
        <>
          {suppliers.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              {renderList(suppliers, 'Fournisseurs avec qui vous travaillez', <Truck className="w-4 h-4 text-primary" />)}
            </div>
          )}

          {suppliers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucun fournisseur pour l&apos;instant. Cliquez sur « Travailler avec des fournisseurs » pour choisir des usines et les mettre en favori (étoile).
            </p>
          )}
        </>
      )}

      {quoteCount > 0 && quoteCount < 2 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="text-sm text-amber-800 dark:text-amber-200 font-medium">
            {quoteCount} devis envoyé{quoteCount > 1 ? 's' : ''} sur 2 requis pour valider la phase
          </div>
        </div>
      )}

      {quoteCount >= 2 && !isCompleted && (
        <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
          <div className="text-sm text-success font-medium mb-2">
            ✓ Phase complétée ! Vous avez envoyé {quoteCount} devis.
          </div>
          <Button onClick={() => { setIsCompleted(true); onComplete(); }} variant="default" size="sm">
            Valider et passer à la phase suivante
          </Button>
        </div>
      )}

      <div className="mt-8">
        <Link href="/launch-map/sourcing">
          <Button className="bg-stone-900 hover:bg-stone-800 text-white font-medium tracking-wide uppercase text-xs py-3 px-6 gap-2">
            <Users className="w-4 h-4" />
            Travailler avec des fournisseurs
          </Button>
        </Link>
      </div>
    </div>
  );
}
