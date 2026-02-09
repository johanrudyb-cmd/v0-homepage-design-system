/**
 * Catalogue des mockups disponibles dans public/mockups.
 * Chaque sous-dossier = un type de mockup sélectionnable.
 */

import fs from 'fs';
import path from 'path';

const MOCKUPS_BASE = path.join(process.cwd(), 'public', 'mockups');

export interface MockupCategory {
  id: string;
  label: string;
  fileCount: number;
  files: string[];
}

/** Liste les catégories disponibles et leurs fichiers */
export function getMockupCategories(): MockupCategory[] {
  if (!fs.existsSync(MOCKUPS_BASE)) return [];

  const categories: MockupCategory[] = [];
  const dirs = fs.readdirSync(MOCKUPS_BASE, { withFileTypes: true });

  for (const d of dirs) {
    if (!d.isDirectory()) continue;

    const dirPath = path.join(MOCKUPS_BASE, d.name);
    const files = fs.readdirSync(dirPath).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));

    if (files.length > 0) {
      categories.push({
        id: d.name,
        label: d.name,
        fileCount: files.length,
        files,
      });
    }
  }

  return categories.sort((a, b) => a.label.localeCompare(b.label));
}

/** Retourne les chemins complets des fichiers pour les catégories demandées */
export function getMockupFilesForCategories(categoryIds: string[]): { category: string; filePath: string }[] {
  const result: { category: string; filePath: string }[] = [];

  for (const catId of categoryIds) {
    const dirPath = path.join(MOCKUPS_BASE, catId);
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) continue;

    const files = fs.readdirSync(dirPath).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));

    for (const f of files) {
      result.push({
        category: catId,
        filePath: path.join(dirPath, f),
      });
    }
  }

  return result;
}
