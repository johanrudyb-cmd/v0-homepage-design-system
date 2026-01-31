'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

interface SearchResult {
  type: 'page' | 'tool' | 'brand';
  title: string;
  description: string;
  href: string;
}

const searchableItems: SearchResult[] = [
  { type: 'page', title: 'Tableau de bord', description: 'Vue d\'ensemble de votre progression', href: '/dashboard' },
  { type: 'tool', title: 'Design Studio', description: 'Générez des tech packs professionnels', href: '/design-studio' },
  { type: 'tool', title: 'Sourcing Hub', description: 'Trouvez des usines qualifiées', href: '/sourcing' },
  { type: 'tool', title: 'UGC AI Lab', description: 'Créez votre contenu marketing', href: '/ugc' },
  { type: 'page', title: 'Tendances', description: 'Produits tendance scrapés & analyse photo', href: '/trends' },
  { type: 'page', title: 'Marques Tendances', description: 'Explorez les marques populaires', href: '/brands' },
  { type: 'tool', title: 'Analyseur de tendances', description: 'Analyse tendances & prévisions IA', href: '/spy' },
  { type: 'page', title: 'Créer ma marque', description: 'Guide complet de création', href: '/launch-map' },
  { type: 'page', title: 'Paramètres', description: 'Gérez votre profil et préférences', href: '/settings' },
  { type: 'page', title: 'Notifications', description: 'Voir toutes vos notifications', href: '/notifications' },
];

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = searchableItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered.slice(0, 6));
      setIsOpen(true);
      setFocusedIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && focusedIndex >= 0 && results[focusedIndex]) {
      e.preventDefault();
      router.push(results[focusedIndex].href);
      setQuery('');
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (href: string) => {
    router.push(href);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tool':
        return 'Outil';
      case 'page':
        return 'Page';
      case 'brand':
        return 'Marque';
      default:
        return '';
    }
  };

  return (
    <div className="flex-1 max-w-lg relative" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Rechercher..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-muted/50 border-2 border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-background border-2 border-border rounded-xl shadow-modern-lg z-50 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={`${result.href}-${index}`}
              onClick={() => handleSelect(result.href)}
              className={`p-4 cursor-pointer transition-colors ${
                index === focusedIndex
                  ? 'bg-primary/10'
                  : 'hover:bg-muted/30'
              } ${index === 0 ? 'rounded-t-xl' : ''} ${
                index === results.length - 1 ? 'rounded-b-xl' : 'border-b border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary uppercase">
                      {getTypeLabel(result.type)}
                    </span>
                    <h4 className="font-semibold text-sm text-foreground truncate">
                      {result.title}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                    {result.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-background border-2 border-border rounded-xl shadow-modern-lg z-50 p-8 text-center">
          <p className="text-sm text-muted-foreground font-medium">
            Aucun résultat pour "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
