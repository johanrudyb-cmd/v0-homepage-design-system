import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import PDFDocument from 'pdfkit';

export const runtime = 'nodejs';

function formatRevenue(revenue: number | null): string {
  if (!revenue) return 'Non disponible';
  if (revenue >= 1000000) return `${(revenue / 1000000).toFixed(1)}M€`;
  if (revenue >= 1000) return `${(revenue / 1000).toFixed(0)}K€`;
  return `${revenue.toFixed(0)}€`;
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

    const analysis = await prisma.brandSpyAnalysis.findFirst({
      where: { id, userId: user.id },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analyse non trouvée' }, { status: 404 });
    }

    // Créer le PDF
    const doc = new PDFDocument({ margin: 50 });

    // En-tête
    doc.fontSize(20).text('Rapport Brand Spy', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`URL analysée: ${analysis.shopifyUrl}`, {
      align: 'center',
    });
    doc.moveDown();

    // Informations de contact
    doc.fontSize(10).text(
      `Généré le: ${new Date(analysis.createdAt).toLocaleDateString('fr-FR')}`,
      { align: 'right' }
    );
    if (user.name) {
      doc.text(`Par: ${user.name}`, { align: 'right' });
    }
    doc.text(`Email: ${user.email}`, { align: 'right' });
    doc.moveDown(2);

    // Estimation CA
    doc.fontSize(14).text('Estimation du Chiffre d\'Affaires', {
      underline: true,
    });
    doc.moveDown(0.5);
    doc.fontSize(16)
      .font('Helvetica-Bold')
      .text(formatRevenue(analysis.estimatedRevenue), { indent: 20 });
    doc.font('Helvetica')
      .fontSize(10)
      .text('/ mois (estimé)', { indent: 20 });
    doc.fontSize(9)
      .fillColor('gray')
      .text('Basé sur le trafic estimé et un panier moyen de 80-120€', {
        indent: 20,
      })
      .fillColor('black');
    doc.moveDown();

    // Stack technique
    doc.fontSize(14).text('Stack Technique', { underline: true });
    doc.moveDown(0.5);
    const stack = analysis.stack as { apps?: string[] } | null;
    if (stack?.apps && stack.apps.length > 0) {
      stack.apps.forEach((app) => {
        doc.fontSize(10).text(`• ${app}`, { indent: 20 });
      });
    } else {
      doc.fontSize(10).fillColor('gray').text('Aucune app détectée', { indent: 20 }).fillColor('black');
    }
    doc.moveDown();

    // Thème Shopify
    doc.fontSize(14).text('Thème Shopify', { underline: true });
    doc.moveDown(0.5);
    if (analysis.theme) {
      const themeText = typeof analysis.theme === 'string' 
        ? analysis.theme 
        : (analysis.theme as any)?.name || 'Thème détecté';
      doc.fontSize(10).text(themeText, { indent: 20 });
    } else {
      doc.fontSize(10).fillColor('gray').text('Thème non détecté', { indent: 20 }).fillColor('black');
    }
    doc.moveDown();

    // Stratégie publicitaire
    doc.fontSize(14).text('Stratégie Publicitaire', { underline: true });
    doc.moveDown(0.5);
    const adStrategy = analysis.adStrategy as {
      platform?: string;
      activeAds?: number;
      estimatedSpend?: number;
    } | null;

    if (adStrategy) {
      if (adStrategy.platform) {
        doc.fontSize(10).text(`Plateforme dominante: ${adStrategy.platform}`, {
          indent: 20,
        });
      }
      if (adStrategy.activeAds !== undefined) {
        doc.text(`Publicités actives: ${adStrategy.activeAds}`, { indent: 20 });
      }
      if (adStrategy.estimatedSpend !== undefined) {
        doc.text(
          `Budget estimé: ${formatRevenue(adStrategy.estimatedSpend)} / mois`,
          { indent: 20 }
        );
      }
    } else {
      doc.fontSize(10).fillColor('gray').text('Données publicitaires non disponibles', {
        indent: 20,
      }).fillColor('black');
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
        'Content-Disposition': `attachment; filename="brand-spy-${id}.pdf"`,
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
