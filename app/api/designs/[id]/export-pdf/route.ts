import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import PDFDocument from 'pdfkit';

export const runtime = 'nodejs';

// Fonction pour télécharger une image depuis une URL
async function fetchImageAsBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Erreur téléchargement image:', error);
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const design = await prisma.design.findFirst({
      where: { id },
      include: { brand: true },
    });

    if (!design) {
      return NextResponse.json({ error: 'Design non trouvé' }, { status: 404 });
    }

    // Vérifier que le design appartient à l'utilisateur
    if (design.brand.userId !== user.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Créer le PDF avec marges
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      info: {
        Title: `Tech Pack - ${design.type}`,
        Author: user.name || user.email,
        Subject: 'Tech Pack Professionnel',
        Creator: 'SaaS Mode',
      }
    });

    // Couleurs
    const primaryColor = '#000000';
    const secondaryColor = '#666666';
    const accentColor = '#000000';

    // En-tête avec ligne décorative
    doc.rect(50, 50, doc.page.width - 100, 60)
       .fillColor(primaryColor)
       .fill();
    
    doc.fillColor('#FFFFFF')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('TECH PACK', 50, 65, { align: 'center', width: doc.page.width - 100 });
    
    doc.fontSize(12)
       .font('Helvetica')
       .text(design.brand.name || 'Ma Marque', 50, 95, { align: 'center', width: doc.page.width - 100 });
    
    doc.fillColor(primaryColor);
    doc.moveDown(2);

    // Informations du design
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Informations du Design', { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor(secondaryColor)
       .text('Type:', 50, doc.y, { continued: true })
       .fillColor(primaryColor)
       .font('Helvetica-Bold')
       .text(` ${design.type}`);
    
    if (design.cut) {
      doc.moveDown(0.3);
      doc.font('Helvetica')
         .fillColor(secondaryColor)
         .text('Coupe:', { continued: true })
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text(` ${design.cut}`);
    }
    
    if (design.material) {
      doc.moveDown(0.3);
      doc.font('Helvetica')
         .fillColor(secondaryColor)
         .text('Matière:', { continued: true })
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text(` ${design.material}`);
    }

    doc.moveDown(1);
    doc.fillColor(primaryColor);

    // Flat Sketch avec image
    if (design.flatSketchUrl) {
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Flat Sketch (Recto/Verso)', { underline: true });
      doc.moveDown(0.5);

      // Télécharger et inclure l'image
      const imageBuffer = await fetchImageAsBuffer(design.flatSketchUrl);
      
      if (imageBuffer) {
        try {
          // Calculer la taille pour que l'image tienne dans la page
          const maxWidth = doc.page.width - 100;
          const maxHeight = 300;
          
          doc.image(imageBuffer, {
            fit: [maxWidth, maxHeight],
            align: 'center',
          });
          doc.moveDown(0.5);
        } catch (imageError) {
          console.error('Erreur inclusion image:', imageError);
          doc.fontSize(10)
             .fillColor(secondaryColor)
             .text(`Image disponible à: ${design.flatSketchUrl}`);
          doc.fillColor(primaryColor);
        }
      } else {
        doc.fontSize(10)
           .fillColor(secondaryColor)
           .text(`Image disponible à: ${design.flatSketchUrl}`);
        doc.fillColor(primaryColor);
      }
      
      doc.moveDown(1);
    }

    // Tech Pack - Composants
    if (design.techPack) {
      // Nouvelle page si nécessaire
      if (doc.y > 600) {
        doc.addPage();
      }

      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Composants du Tech Pack', { underline: true });
      doc.moveDown(0.5);

      const techPack = design.techPack as Record<string, any>;
      const entries = Object.entries(techPack);

      entries.forEach(([key, value], index) => {
        // Nouvelle page si nécessaire
        if (doc.y > 700) {
          doc.addPage();
        }

        const componentName = key
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        const componentValue =
          typeof value === 'object' 
            ? JSON.stringify(value, null, 2) 
            : String(value);

        // Fond alterné pour lisibilité
        if (index % 2 === 0) {
          doc.rect(50, doc.y - 5, doc.page.width - 100, 25)
             .fillColor('#F5F5F5')
             .fill();
        }

        doc.fillColor(primaryColor)
           .fontSize(11)
           .font('Helvetica-Bold')
           .text(`${componentName}:`, 55, doc.y);
        
        doc.moveDown(0.4);
        doc.font('Helvetica')
           .fontSize(10)
           .fillColor(secondaryColor)
           .text(componentValue, { 
             indent: 20, 
             width: doc.page.width - 120,
             align: 'left'
           });
        
        doc.moveDown(0.8);
        doc.fillColor(primaryColor);
      });
    }

    // Informations de génération
    doc.addPage();
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Informations', { underline: true });
    doc.moveDown(0.5);

    const dateStr = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor(secondaryColor)
       .text(`Généré le: ${dateStr}`);
    
    if (user.name) {
      doc.moveDown(0.3);
      doc.text(`Par: ${user.name}`);
    }
    
    doc.moveDown(0.3);
    doc.text(`Email: ${user.email}`);

    if (design.brand.name) {
      doc.moveDown(0.3);
      doc.text(`Marque: ${design.brand.name}`);
    }

    // Footer sur chaque page
    const pageCount = doc.bufferedPageRange().count;
    const dateFooter = new Date().toLocaleDateString('fr-FR');
    
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
         .fillColor(secondaryColor)
         .text(
           `SaaS Mode - Page ${i + 1} sur ${pageCount} - ${dateFooter}`,
           50,
           doc.page.height - 30,
           { align: 'center', width: doc.page.width - 100 }
         );
    }

    // Convertir le stream en buffer
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    });

    // Nom de fichier avec date
    const dateFile = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `tech-pack-${design.type.toLowerCase().replace(/\s+/g, '-')}-${dateFile}.pdf`;

    // Retourner le PDF
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de la génération du PDF' },
      { status: 500 }
    );
  }
}
