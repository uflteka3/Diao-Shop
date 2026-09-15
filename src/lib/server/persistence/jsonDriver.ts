import { mkdir, readFile, rename, writeFile } from 'fs/promises';
import path from 'path';
import type { Driver } from './types';

/** Driver JSON local — mode démonstration durable (survit au redémarrage du serveur). */
function fichier(): string {
  return path.join(process.cwd(), '.data', 'db.json');
}

export const jsonDriver: Driver = {
  nom: 'json',
  async charger() {
    try {
      const brut = await readFile(fichier(), 'utf8');
      const snapshot = JSON.parse(brut);
      if (!snapshot || !Array.isArray(snapshot.products)) return null;
      return snapshot;
    } catch {
      return null; // fichier absent ou illisible → amorçage sur les données de démonstration
    }
  },
  async persister(snapshot) {
    const dossier = path.dirname(fichier());
    await mkdir(dossier, { recursive: true });
    const tmp = `${fichier()}.tmp`;
    await writeFile(tmp, JSON.stringify(snapshot), 'utf8');
    await rename(tmp, fichier()); // écriture atomique
  },
};
