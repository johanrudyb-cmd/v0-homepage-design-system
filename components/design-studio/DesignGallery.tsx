'use client';

import { Card, CardContent } from '@/components/ui/card';

interface Design {
  id: string;
  type: string;
  cut: string | null;
  material: string | null;
  flatSketchUrl: string | null;
  status: string;
  createdAt: Date;
}

interface DesignGalleryProps {
  designs: Design[];
}

export function DesignGallery({ designs }: DesignGalleryProps) {
  if (designs.length === 0) {
    return (
      <Card className="border-stone-200">
        <CardContent className="pt-6">
          <p className="text-sm text-stone-600 font-light text-center py-8">
            Aucun design généré pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-stone-200">
      <CardContent className="pt-6">
        <h3 className="text-lg font-light text-stone-900 mb-4">
          Mes designs ({designs.length})
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {designs.map((design) => (
            <div
              key={design.id}
              className="border border-stone-200 rounded-lg p-4 hover:border-stone-300 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {design.flatSketchUrl && (
                  <img
                    src={design.flatSketchUrl}
                    alt={design.type}
                    className="w-20 h-20 object-cover rounded border border-stone-200"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium text-stone-900">{design.type}</div>
                  <div className="text-sm text-stone-600 font-light">
                    {design.cut} - {design.material}
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    {new Date(design.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="text-xs">
                  <span
                    className={`px-2 py-1 rounded ${
                      design.status === 'completed'
                        ? 'bg-amber-100 text-amber-700'
                        : design.status === 'processing'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {design.status === 'completed'
                      ? 'Terminé'
                      : design.status === 'processing'
                      ? 'En cours'
                      : 'En attente'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
