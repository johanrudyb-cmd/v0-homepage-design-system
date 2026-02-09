import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import PDFDocument from 'pdfkit';

export const runtime = 'nodejs';

// Fonction pour télécharger une image depuis une URL (relative ou absolue)
async function fetchImageAsBuffer(url: string, origin: string): Promise<Buffer | null> {
  try {
    const fullUrl = url.startsWith('http') ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
    const response = await fetch(fullUrl);
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

    const origin = new URL(request.url).origin;

    // Créer le PDF avec marges (bufferPages: true pour pouvoir switchToPage et ajouter le footer sur chaque page)
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      bufferPages: true,
      info: {
        Title: `Tech Pack - ${design.type}`,
        Author: user.name || user.email,
        Subject: 'Tech Pack Professionnel',
        Creator: 'OUTFITY',
      }
    });

    // Couleurs
    const primaryColor = '#000000';
    const secondaryColor = '#666666';

    const mockupSpec = (design.mockupSpec || {}) as Record<string, unknown>;
    const techPackHeader = design.techPack as Record<string, unknown> | null;
    const measurementsTableHeader = techPackHeader?.measurementsTable as { size: string }[] | undefined;
    const sizeRange = measurementsTableHeader?.length
      ? `${measurementsTableHeader[0]?.size || ''} - ${measurementsTableHeader[measurementsTableHeader.length - 1]?.size || ''}`
      : '—';
    const formatDatePdf = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Header type TechPackGenerator : 4 colonnes (Season | Brand | Art No. | Size Range) + Product Name | Fabric
    const left = 50;
    const pageWidth = doc.page.width - 100;
    const rowH = 18;
    const rawSeason = (mockupSpec.season as string) || '';
    const seasonValue = rawSeason ? (/^\d{4}$/.test(String(rawSeason).trim()) ? `${String(rawSeason).trim()} / SS/FW` : rawSeason) : '—';
    const productName = design.brand.name ? `${design.brand.name} ${design.type}` : design.type;
    const fabric = design.material || (techPackHeader?.materials as { composition?: string }[])?.[0]?.composition || (mockupSpec.material as string) || '—';
    const artNo = design.id ? design.id.slice(-8).toUpperCase() : '—';
    const brandName = design.brand.name || 'Ma Marque';
    let tableY = 50;
    const colW = pageWidth / 4;
    doc.fontSize(9).font('Helvetica');
    // Row 1 : Season | Brand | Art No. | Size Range
    doc.fillColor(secondaryColor).text('SEASON', left, tableY + 4);
    doc.fillColor(primaryColor).text(String(seasonValue).slice(0, 15), left, tableY + 12);
    doc.rect(left, tableY, colW, rowH * 2).stroke();
    doc.fillColor(secondaryColor).text('BRAND', left + colW + 5, tableY + 4);
    doc.fillColor(primaryColor).text(String(brandName).slice(0, 18), left + colW + 5, tableY + 12);
    doc.rect(left + colW, tableY, colW, rowH * 2).stroke();
    doc.fillColor(secondaryColor).text('ART NO.', left + colW * 2 + 5, tableY + 4);
    doc.fillColor(primaryColor).text(String(artNo).slice(0, 15), left + colW * 2 + 5, tableY + 12);
    doc.rect(left + colW * 2, tableY, colW, rowH * 2).stroke();
    doc.fillColor(secondaryColor).text('SIZE RANGE', left + colW * 3 + 5, tableY + 4);
    doc.fillColor(primaryColor).text(String(sizeRange).slice(0, 15), left + colW * 3 + 5, tableY + 12);
    doc.rect(left + colW * 3, tableY, colW, rowH * 2).stroke();
    // Row 2 : Product Name (col-span-2) | Fabric (col-span-2)
    tableY += rowH * 2;
    doc.fillColor(secondaryColor).text('PRODUCT NAME', left + 5, tableY + 4);
    doc.fillColor(primaryColor).text(String(productName).slice(0, 45), left + 5, tableY + 12);
    doc.rect(left, tableY, colW * 2, rowH * 2).stroke();
    doc.fillColor(secondaryColor).text('FABRIC COMPOSITION', left + colW * 2 + 5, tableY + 4);
    doc.fillColor(primaryColor).text(String(fabric).slice(0, 45), left + colW * 2 + 5, tableY + 12);
    doc.rect(left + colW * 2, tableY, colW * 2, rowH * 2).stroke();
    doc.y = tableY + rowH * 2 + 20;
    doc.fillColor(primaryColor);

    // Zone visuelle : 2 colonnes — Front View | Back View
    const frontImageUrl = design.productImageUrl || design.flatSketchUrl;
    const backImageUrl = design.flatSketchUrl && design.productImageUrl ? design.flatSketchUrl : null;
    const hasFront = !!frontImageUrl;
    const hasBack = !!backImageUrl && backImageUrl !== frontImageUrl;
    const colWidth = (pageWidth - 10) / 2;
    const zoneY = doc.y;
    const imgMaxH = 260;

    doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('FRONT VIEW', left, zoneY);
    let col1Bottom = zoneY + 12;
    if (hasFront) {
      const frontBuffer = await fetchImageAsBuffer(frontImageUrl, origin);
      if (frontBuffer) {
        try {
          doc.image(frontBuffer, left, col1Bottom, { fit: [colWidth - 5, imgMaxH] });
          col1Bottom += imgMaxH + 5;
        } catch (e) {
          console.error('Erreur inclusion image face:', e);
          doc.fontSize(9).fillColor(secondaryColor).text('—', left, col1Bottom);
          col1Bottom += 20;
        }
      } else {
        doc.fontSize(9).fillColor(secondaryColor).text('—', left, col1Bottom);
        col1Bottom += 20;
      }
    }
    doc.fillColor(primaryColor);

    const rightX = left + colWidth + 5;
    doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('BACK VIEW', rightX, zoneY);
    let col2Bottom = zoneY + 12;
    const backImgUrl = hasBack ? backImageUrl : frontImageUrl;
    if (backImgUrl) {
      const backBuffer = await fetchImageAsBuffer(backImgUrl, origin);
      if (backBuffer) {
        try {
          doc.image(backBuffer, rightX, col2Bottom, { fit: [colWidth - 5, imgMaxH] });
          col2Bottom += imgMaxH + 5;
        } catch (e) {
          console.error('Erreur inclusion image dos:', e);
          doc.fontSize(9).fillColor(secondaryColor).text('—', rightX, col2Bottom);
          col2Bottom += 20;
        }
      } else {
        doc.fontSize(9).fillColor(secondaryColor).text('—', rightX, col2Bottom);
        col2Bottom += 20;
      }
    }
    doc.fillColor(primaryColor);

    doc.y = Math.max(col1Bottom, col2Bottom) + 25;

    // Tech Pack — structure ultra détaillée (TechPackVisual) ou fallback
    const techPack = design.techPack as Record<string, unknown> | null;
    const isTechPackVisual = techPack && Array.isArray(techPack.materials);

    function ensurePage(threshold = 700) {
      if (doc.y > threshold) {
        doc.addPage();
      }
    }

    if (techPack && isTechPackVisual) {
      ensurePage(600);
      const left = 50;
      const width = doc.page.width - 100;

      // ——— Matières et fournitures ———
      const materials = techPack.materials as { name: string; composition?: string; weight?: string; ref?: string }[];
      if (materials?.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('Matières et fournitures', { underline: true });
        doc.moveDown(0.5);
        materials.forEach((m, i) => {
          ensurePage(700);
          if (i % 2 === 0) {
            doc.rect(left, doc.y - 3, width, 22).fillColor('#F5F5F5').fill();
          }
          doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text(m.name, left + 5, doc.y + 2);
          const details = [m.composition, m.weight, m.ref ? `Ref. ${m.ref}` : ''].filter(Boolean).join(' · ');
          if (details) {
            doc.font('Helvetica').fontSize(10).fillColor(secondaryColor).text(details, left + 120, doc.y + 2, { width: width - 130 });
          }
          doc.y += 20;
        });
        doc.moveDown(1);
      }

      // ——— Tableau des mesures (cm) ———
      const measurementsTable = techPack.measurementsTable as { size: string; measurements: Record<string, number> }[] | undefined;
      if (measurementsTable?.length > 0) {
        ensurePage(600);
        doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('Tableau des mesures (cm)', { underline: true });
        doc.moveDown(0.5);
        const cols = Object.keys(measurementsTable[0].measurements || {});
        const colWidth = (width - 60) / (cols.length + 1);
        const rowHeight = 22;
        let tableY = doc.y;
        doc.rect(left, tableY, width, rowHeight).fillColor('#E8E8E8').fill();
        doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold');
        doc.text('Taille', left + 5, tableY + 6);
        cols.forEach((c, i) => {
          const label = c.replace(/([A-Z])/g, ' $1').trim();
          doc.text(label, left + 60 + i * colWidth, tableY + 6, { width: colWidth });
        });
        tableY += rowHeight;
        measurementsTable.forEach((row, ri) => {
          ensurePage(700);
          if (ri % 2 === 1) doc.rect(left, tableY, width, rowHeight).fillColor('#F9F9F9').fill();
          doc.font('Helvetica').fillColor(primaryColor).fontSize(10).text(row.size, left + 5, tableY + 6);
          const vals = row.measurements || {};
          cols.forEach((col, ci) => {
            doc.text(String(vals[col] ?? '—'), left + 60 + ci * colWidth, tableY + 6, { width: colWidth });
          });
          tableY += rowHeight;
          doc.y = tableY;
        });
        doc.y = tableY + 10;
        doc.moveDown(0.5);
      }

      // ——— Détails de construction ———
      const constructionNotes = techPack.constructionNotes as string | undefined;
      if (constructionNotes) {
        ensurePage(600);
        doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('Détails de construction', { underline: true });
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(10).fillColor(secondaryColor).text(constructionNotes, { width, align: 'left' });
        doc.moveDown(1);
      }

      // ——— Impression / broderie ———
      const printSpec = techPack.printSpec as { placement: string; width: number; height: number; technique: string; colors?: string[] } | undefined;
      if (printSpec) {
        ensurePage(600);
        doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('Impression / broderie', { underline: true });
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(10).fillColor(secondaryColor);
        doc.text(`Placement: ${printSpec.placement}`, left, doc.y);
        doc.text(`Dimensions (cm): ${printSpec.width} × ${printSpec.height}`, left, doc.y + 14);
        doc.text(`Technique: ${printSpec.technique}`, left, doc.y + 28);
        if (printSpec.colors?.length) doc.text(`Couleurs: ${printSpec.colors.join(', ')}`, left, doc.y + 42);
        doc.y += (printSpec.colors?.length ? 56 : 42) + 10;
        doc.moveDown(0.5);
      }

      // ——— Fournitures (trims) ———
      const trims = techPack.trims as { name: string; ref?: string; placement?: string }[] | undefined;
      if (trims?.length > 0) {
        ensurePage(600);
        doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('Fournitures (boutons, fermetures, etc.)', { underline: true });
        doc.moveDown(0.5);
        trims.forEach((t, i) => {
          ensurePage(700);
          if (i % 2 === 0) doc.rect(left, doc.y - 3, width, 20).fillColor('#F5F5F5').fill();
          doc.fillColor(primaryColor).fontSize(10).font('Helvetica').text(`${t.name}${t.placement ? ` — ${t.placement}` : ''}${t.ref ? ` · Ref. ${t.ref}` : ''}`, left + 5, doc.y + 2, { width: width - 10 });
          doc.y += 22;
        });
        doc.moveDown(0.5);
      }

      // ——— Étiquetage, packaging, conformité ———
      const labeling = techPack.labeling as string | undefined;
      const packaging = techPack.packaging as string | undefined;
      const compliance = techPack.compliance as string | undefined;
      if (labeling || packaging || compliance) {
        ensurePage(600);
        doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('Étiquetage, packaging et conformité', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        if (labeling) {
          doc.font('Helvetica-Bold').fillColor(primaryColor).text('Étiquetage');
          doc.moveDown(0.2);
          doc.font('Helvetica').fillColor(secondaryColor).text(labeling, { width });
          doc.moveDown(0.5);
        }
        if (packaging) {
          doc.font('Helvetica-Bold').fillColor(primaryColor).text('Packaging');
          doc.moveDown(0.2);
          doc.font('Helvetica').fillColor(secondaryColor).text(packaging, { width });
          doc.moveDown(0.5);
        }
        if (compliance) {
          doc.font('Helvetica-Bold').fillColor(primaryColor).text('Conformité');
          doc.moveDown(0.2);
          doc.font('Helvetica').fillColor(secondaryColor).text(compliance, { width });
          doc.moveDown(0.5);
        }
      }
    } else if (techPack && typeof techPack === 'object') {
      // Fallback : composants génériques (clé / valeur)
      ensurePage(600);
      doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('Composants du Tech Pack', { underline: true });
      doc.moveDown(0.5);
      const skipKeys = ['productImageUrl', 'flatSketchFrontUrl', 'flatSketchBackUrl', 'materials', 'measurementsTable', 'constructionNotes', 'printSpec', 'trims', 'labeling', 'packaging', 'compliance'];
      const entries = Object.entries(techPack).filter(([k]) => !skipKeys.includes(k));
      entries.forEach(([key, value], index) => {
        ensurePage(700);
        const componentName = key.replace(/([A-Z])/g, ' $1').trim().split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        const componentValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
        if (index % 2 === 0) doc.rect(50, doc.y - 5, doc.page.width - 100, 25).fillColor('#F5F5F5').fill();
        doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text(`${componentName}:`, 55, doc.y);
        doc.moveDown(0.4);
        doc.font('Helvetica').fontSize(10).fillColor(secondaryColor).text(componentValue, { indent: 20, width: doc.page.width - 120 });
        doc.moveDown(0.8);
        doc.fillColor(primaryColor);
      });
    }

    // Pied de page type TechPackGenerator : Designer Signature | Color Palettes | Manufacturer Note
    if (doc.y > doc.page.height - 120) doc.addPage();
    const footerY = doc.y;
    const footerColW = pageWidth / 3;
    doc.fontSize(8).font('Helvetica-Bold').fillColor(primaryColor).text('DESIGNER SIGNATURE', left, footerY + 4);
    doc.font('Helvetica').fontSize(9).text(user.name || '—', left, footerY + 16);
    doc.rect(left, footerY + 28, footerColW - 10, 24).stroke();
    doc.fontSize(7).fillColor(secondaryColor).text('Sign here...', left + 4, footerY + 38);

    const paletteColors = [
      mockupSpec.colorMain,
      ...(Array.isArray(mockupSpec.colorsSecondary) ? mockupSpec.colorsSecondary : []),
      ...(Array.isArray(mockupSpec.designColors) ? mockupSpec.designColors : []),
    ].filter(Boolean).slice(0, 6) as string[];
    const midX = left + footerColW + 10;
    doc.fontSize(8).font('Helvetica-Bold').fillColor(primaryColor).text('COLOR PALETTES', midX, footerY + 4);
    paletteColors.forEach((c, i) => {
      const cx = midX + 5 + (i % 4) * 28;
      const cy = footerY + 16 + Math.floor(i / 4) * 22;
      const str = String(c);
      const isHex = /^#[0-9A-Fa-f]{3,8}$/.test(str);
      if (isHex) {
        doc.circle(cx + 6, cy + 6, 5).fillAndStroke(str, primaryColor);
      } else {
        doc.circle(cx + 6, cy + 6, 5).stroke(primaryColor);
      }
      doc.font('Helvetica').fontSize(6).fillColor(primaryColor).text(str.slice(0, 10), cx - 2, cy + 18);
    });

    const manuNote = (techPackHeader?.constructionNotes as string) || (techPackHeader?.compliance as string) || 'Ensure all seams are double-stitched. Use premium fabric.';
    const manuNoteX = left + 2 * footerColW + 20;
    doc.fontSize(8).font('Helvetica-Bold').fillColor(primaryColor).text('MANUFACTURER NOTE', manuNoteX, footerY + 4);
    doc.font('Helvetica').fontSize(8).fillColor(secondaryColor).text(manuNote.slice(0, 120), manuNoteX, footerY + 14, { width: footerColW - 20 });
    doc.y = footerY + 58;

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

    // Footer sur chaque page (nécessite bufferPages: true)
    const { start: pageStart, count: pageCount } = doc.bufferedPageRange();
    const dateFooter = new Date().toLocaleDateString('fr-FR');
    for (let i = 0; i < pageCount; i++) {
      const pageIndex = pageStart + i;
      doc.switchToPage(pageIndex);
      doc.fontSize(8)
         .fillColor(secondaryColor)
         .text(
           `OUTFITY - Page ${i + 1} sur ${pageCount} - ${dateFooter}`,
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

    // Nom de fichier avec date (ASCII uniquement pour compatibilité)
    const dateFile = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const safeType = design.type.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const fileName = `tech-pack-${safeType}-${dateFile}.pdf`;

    // Retourner le PDF avec en-têtes stricts (éviter le MIME sniffing qui ouvre en "format Word" dans Adobe)
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Content-Length': String(pdfBuffer.length),
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
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
