'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Design {
  id: string;
  type: string;
  flatSketchUrl: string | null;
}

interface VirtualTryOnProps {
  brandId: string;
  designs: Design[];
}

export function VirtualTryOn({ brandId, designs }: VirtualTryOnProps) {
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [garmentType, setGarmentType] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setSelectedDesign(''); // Réinitialiser la sélection de design
    }
  };

  const handleGenerate = async () => {
    if (!selectedDesign && !uploadedFile) {
      setError('Veuillez sélectionner un design ou uploader un fichier');
      return;
    }

    if (!garmentType) {
      setError('Veuillez sélectionner le type de vêtement');
      return;
    }

    setIsGenerating(true);
    setError('');
    setResult(null);

    try {
      let designUrl = '';

      if (uploadedFile) {
        // Uploader le fichier
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('brandId', brandId);

        const uploadResponse = await fetch('/api/ugc/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Erreur lors de l\'upload');
        }

        const uploadData = await uploadResponse.json();
        designUrl = uploadData.url;
      } else if (selectedDesign) {
        const design = designs.find((d) => d.id === selectedDesign);
        if (design?.flatSketchUrl) {
          designUrl = design.flatSketchUrl;
        }
      }

      if (!designUrl) {
        throw new Error('Aucune image disponible');
      }

      // Générer le Virtual Try-On
      const response = await fetch('/api/ugc/virtual-tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          designUrl,
          garmentType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      setResult(data.imageUrl);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Formulaire */}
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="text-xl font-light tracking-wide">
            Virtual Try-On
          </CardTitle>
          <CardDescription className="font-light">
            Générez une image de mannequin portant votre design
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélection design existant */}
          {designs.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Utiliser un design existant
              </label>
              <select
                value={selectedDesign}
                onChange={(e) => {
                  setSelectedDesign(e.target.value);
                  setUploadedFile(null); // Réinitialiser l'upload
                }}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                disabled={isGenerating}
              >
                <option value="">Sélectionner un design...</option>
                {designs.map((design) => (
                  <option key={design.id} value={design.id}>
                    {design.type}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* OU Upload */}
          <div className="relative">
            <div className="text-sm font-medium text-stone-700 mb-2">
              {designs.length > 0 ? 'OU' : ''} Uploader un logo/design
            </div>
            <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isGenerating}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer block"
              >
                {uploadedFile ? (
                  <div>
                    <div className="text-sm text-stone-900 font-medium">
                      {uploadedFile.name}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">
                      Cliquez pour changer
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm text-stone-600">
                      Cliquez pour uploader
                    </div>
                    <div className="text-xs text-stone-500 mt-1">
                      PNG, JPG jusqu'à 10MB
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Type de vêtement */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Type de vêtement *
            </label>
            <select
              value={garmentType}
              onChange={(e) => setGarmentType(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              disabled={isGenerating}
            >
              <option value="">Sélectionner...</option>
              <option value="T-shirt">T-shirt</option>
              <option value="Hoodie">Hoodie</option>
              <option value="Sweatshirt">Sweatshirt</option>
              <option value="Pantalon">Pantalon</option>
              <option value="Short">Short</option>
              <option value="Veste">Veste</option>
            </select>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (!selectedDesign && !uploadedFile) || !garmentType}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-light tracking-wide uppercase text-xs py-3"
          >
            {isGenerating ? 'Génération en cours...' : 'Générer le Virtual Try-On'}
          </Button>
        </CardContent>
      </Card>

      {/* Résultat */}
      {result && (
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-xl font-light tracking-wide">
              Résultat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-stone-200 rounded-lg p-4 bg-stone-50">
              <img
                src={result}
                alt="Virtual Try-On"
                className="w-full h-auto rounded"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = result;
                  link.download = 'virtual-tryon.jpg';
                  link.click();
                }}
                className="bg-stone-900 hover:bg-stone-800 text-white font-light tracking-wide uppercase text-xs py-2 px-4"
              >
                Télécharger
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
