import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import PDFDocument from 'pdfkit';

export const runtime = 'nodejs';

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

    // Créer le PDF
    const doc = new PDFDocument({ margin: 50 });

    // En-tête
    doc.fontSize(20).text('Tech Pack', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Design: ${design.type}`, { align: 'center' });
    if (design.cut) {
      doc.text(`Coupe: ${design.cut}`, { align: 'center' });
    }
    if (design.material) {
      doc.text(`Matière: ${design.material}`, { align: 'center' });
    }
    doc.moveDown();

    // Informations de contact
    doc.fontSize(10).text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, {
      align: 'right',
    });
    if (user.name) {
      doc.text(`Par: ${user.name}`, { align: 'right' });
    }
    doc.text(`Email: ${user.email}`, { align: 'right' });
    doc.moveDown(2);

    // Flat Sketch
    if (design.flatSketchUrl) {
      doc.fontSize(14).text('Flat Sketch (Recto/Verso)', { underline: true });
      doc.moveDown();
      doc.fontSize(10).fillColor('blue').text(`Image disponible à: ${design.flatSketchUrl}`);
      doc.fillColor('black');
      doc.moveDown();
    }

    // Tech Pack - Composants
    if (design.techPack) {
      doc.fontSize(14).text('Composants du Tech Pack', { underline: true });
      doc.moveDown(0.5);

      const techPack = design.techPack as Record<string, any>;

      Object.entries(techPack).forEach(([key, value]) => {
        // Nouvelle page si nécessaire
        if (doc.y > 700) {
          doc.addPage();
        }

        const componentName = key.replace(/([A-Z])/g, ' $1').trim();
        const componentValue =
          typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);

        doc.fontSize(11).font('Helvetica-Bold').text(`${componentName}:`);
        doc.font('Helvetica').fontSize(10).text(componentValue, { indent: 20 });
        doc.moveDown(0.5);
      });
    }

    // Footer
    doc.fontSize(8)
      .text(
        `Document généré par SaaS Mode - ${new Date().toLocaleDateString('fr-FR')}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

    // Convertir le stream en buffer (ATTACHER LES LISTENERS AVANT doc.end())
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    });

    // Retourner le PDF
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="tech-pack-${id}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la génération du PDF' },
      { status: 500 }
    );
  }
}
