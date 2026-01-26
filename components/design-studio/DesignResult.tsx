'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Design {
  id: string;
  type: string;
  cut: string | null;
  material: string | null;
  flatSketchUrl: string | null;
  techPack: any;
  prompt: string | null;
  status: string;
}

interface DesignResultProps {
  design: Design;
}

export function DesignResult({ design }: DesignResultProps) {
  const handleExportPDF = async () => {
    try {
      const response = await fetch(`/api/designs/${design.id}/export-pdf`);
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tech-pack-${design.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Erreur lors de l\'export du PDF');
    }
  };

  return (
    <Card className="border-stone-200">
      <CardHeader>
        <CardTitle className="text-xl font-light tracking-wide">
          Design généré
        </CardTitle>
        <CardDescription className="font-light">
          {design.type} - {design.cut} - {design.material}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Flat Sketch */}
        {design.flatSketchUrl && (
          <div>
            <h3 className="text-sm font-medium text-stone-700 mb-3">
              Flat Sketch (Recto/Verso)
            </h3>
            <div className="border border-stone-200 rounded-lg p-4 bg-stone-50">
              <img
                src={design.flatSketchUrl}
                alt="Flat sketch"
                className="w-full h-auto rounded"
              />
            </div>
          </div>
        )}

        {/* Tech Pack */}
        {design.techPack && (
          <div>
            <h3 className="text-sm font-medium text-stone-700 mb-3">
              Tech Pack - Composants
            </h3>
            <div className="border border-stone-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-stone-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-stone-700">
                      Composant
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-stone-700">
                      Spécifications
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {Object.entries(design.techPack).map(([key, value]: [string, any]) => (
                    <tr key={key}>
                      <td className="px-4 py-3 font-medium text-stone-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleExportPDF}
            className="bg-stone-900 hover:bg-stone-800 text-white font-light tracking-wide uppercase text-xs py-2 px-4"
          >
            Exporter en PDF
          </Button>
          <Button
            variant="outline"
            className="border-stone-300 text-stone-700 font-light tracking-wide uppercase text-xs py-2 px-4"
          >
            Modifier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
