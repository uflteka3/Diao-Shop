import type { Driver, Kind, Snapshot } from './types';
import { jsonDriver } from './jsonDriver';
import { supabaseDriver } from './supabaseDriver';

/**
 * Persistance du back-office — la source de vérité dépend de DATA_PROVIDER :
 *  - `mock`    : fichier JSON local `.data/db.json` (mode démonstration durable) ;
 *  - `supabase` : les 9 tables Supabase (production).
 * Le store mémoire reste la couche de lecture synchrone ; chaque mutation marque
 * les données « sales » et un flush (300 ms) les écrit via le driver actif.
 *
 * IMPORTANT : l'état vit dans `globalThis` — Next.js compile instrumentation.ts
 * et les routes en graphes séparés ; sans global, les routes verraient un
 * driver non initialisé.
 */

interface EtatPersistance {
  driver: Driver | null;
  exporter: (() => Snapshot) | null;
  dirty: Map<Kind, Set<string>>;
  timer: ReturnType<typeof setTimeout> | null;
  file: Promise<void>;
}

const globalRef = globalThis as unknown as { __dsPersistance?: EtatPersistance };
const etat: EtatPersistance =
  globalRef.__dsPersistance ?? { driver: null, exporter: null, dirty: new Map(), timer: null, file: Promise.resolve() };
globalRef.__dsPersistance = etat;

export function marquerSale(kind: Kind, id?: string): void {
  if (!etat.driver) return; // avant init (build…) : rien à persister
  const set = etat.dirty.get(kind) ?? new Set<string>();
  if (id) set.add(id);
  else set.add('*');
  etat.dirty.set(kind, set);
  if (etat.timer) clearTimeout(etat.timer);
  etat.timer = setTimeout(() => {
    void flush();
  }, 300);
}

export async function flush(): Promise<void> {
  if (!etat.driver || !etat.exporter || etat.dirty.size === 0) return;
  const capture = new Map(etat.dirty);
  etat.dirty.clear();
  const d = etat.driver;
  const exp = etat.exporter;
  etat.file = etat.file
    .then(() => d.persister(exp(), capture))
    .catch((erreur) => console.error(`[persistance:${d.nom}] échec d'écriture :`, erreur));
  await etat.file;
}

/** Chargé une seule fois au démarrage du serveur (instrumentation.ts). */
export async function initPersistance(options: {
  exporter: () => Snapshot;
  hydrater: (snapshot: Snapshot) => void;
}): Promise<void> {
  etat.exporter = options.exporter;
  etat.driver = choisirDriver();
  try {
    const snapshot = await etat.driver.charger();
    if (snapshot) {
      options.hydrater(snapshot);
      console.log(`[persistance:${etat.driver.nom}] données existantes chargées (${snapshot.products.length} produits, ${snapshot.orders.length} commandes).`);
    } else {
      marquerSale('products');
      marquerSale('orders');
      marquerSale('settings');
      marquerSale('messages');
      await flush();
      console.log(`[persistance:${etat.driver.nom}] amorçage initial (données de démonstration).`);
    }
  } catch (erreur) {
    console.error('[persistance] échec du chargement initial (le serveur démarre avec les données de démonstration) :', erreur);
  }
}

function choisirDriver(): Driver {
  const provider = (process.env.DATA_PROVIDER ?? 'mock').toLowerCase();
  if (provider === 'supabase') {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return supabaseDriver;
    console.warn('[persistance] DATA_PROVIDER=supabase mais SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants → repli sur JSON local.');
  }
  return jsonDriver;
}

export type { Kind, Snapshot };
export { jsonDriver, supabaseDriver };
