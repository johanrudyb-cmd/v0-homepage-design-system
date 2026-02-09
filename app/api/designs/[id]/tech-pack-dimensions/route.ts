/**
 * Sauvegarde des dimensions du tech pack pour un design.
 * PATCH /api/designs/[id]/tech-pack-dimensions
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      modifyDimensions,
      measurementsTable,
      season,
      colorMain,
      material,
      labeling,
      compliance,
      designerName,
      manufacturer,
      printWidth,
      printHeight,
      speedDemon,
    } = body as {
      modifyDimensions?: boolean;
      measurementsTable?: { size: string; measurements: Record<string, number> }[];
      season?: string;
      colorMain?: string;
      material?: string;
      labeling?: string;
      compliance?: string;
      designerName?: string;
      manufacturer?: string;
      printWidth?: number;
      printHeight?: number;
      speedDemon?: Record<string, unknown>;
    };

    const design = await prisma.design.findFirst({
      where: { id, brand: { userId: user.id } },
    });

    if (!design) {
      return NextResponse.json({ error: 'Design non trouvé' }, { status: 404 });
    }

    const existingTechPack = (design.techPack as Record<string, unknown>) || {};
    const existingMockupSpec = (design.mockupSpec as Record<string, unknown>) || {};

    const updatedTechPack: Record<string, unknown> = {
      ...existingTechPack,
      modifyDimensions: modifyDimensions === true,
      measurementsTable: measurementsTable ?? existingTechPack.measurementsTable,
    };
    if (labeling !== undefined) updatedTechPack.labeling = labeling;
    if (compliance !== undefined) updatedTechPack.compliance = compliance;
    if (designerName !== undefined) updatedTechPack.designerName = designerName;
    if (manufacturer !== undefined) updatedTechPack.manufacturer = manufacturer;
    if (printWidth !== undefined || printHeight !== undefined) {
      const existingPrint = (existingTechPack.printSpec as Record<string, unknown>) || {};
      updatedTechPack.printSpec = {
        ...existingPrint,
        width: printWidth ?? (existingPrint.width as number),
        height: printHeight ?? (existingPrint.height as number),
        placement: existingPrint.placement ?? 'Poitrine (centre)',
        technique: existingPrint.technique ?? 'Sérigraphie',
        colors: Array.isArray(existingPrint.colors) ? existingPrint.colors : [],
      };
    }
    if (speedDemon !== undefined && speedDemon !== null) {
      const existingSpeedDemon = (existingTechPack.speedDemon as Record<string, unknown>) || {};
      updatedTechPack.speedDemon = { ...existingSpeedDemon, ...speedDemon };
    }

    const hasMockupPatch = season !== undefined || colorMain !== undefined;
    const updatedMockupSpec = hasMockupPatch ? { ...existingMockupSpec, ...(season !== undefined && { season }), ...(colorMain !== undefined && { colorMain }) } : existingMockupSpec;

    await prisma.design.update({
      where: { id },
      data: {
        techPack: updatedTechPack,
        ...(hasMockupPatch ? { mockupSpec: updatedMockupSpec } : {}),
        ...(material !== undefined ? { material } : {}),
      },
    });

    // Marquer la phase 4 (Tech Pack) du Launch Map comme complétée
    await prisma.launchMap.upsert({
      where: { brandId: design.brandId },
      update: { phase4: true },
      create: {
        brandId: design.brandId,
        phase1: false,
        phase2: false,
        phase3: false,
        phase4: true,
        phase5: false,
        phase6: false,
        phase7: false,
      },
    });

    return NextResponse.json({ success: true, techPack: updatedTechPack });
  } catch (error: unknown) {
    console.error('[designs/tech-pack-dimensions]', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
