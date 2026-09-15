/**
 * Démarrage du serveur : recharge l'état du back-office depuis la persistance
 * active (JSON local en mode démo, Supabase en production) avant le trafic.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { initPersistance, flush } = await import('@/lib/server/persistence');
  const store = await import('@/lib/admin/store');

  await initPersistance({
    exporter: () => store.exporterSnapshot(),
    hydrater: (snapshot) => store.hydraterStore(snapshot),
  });

  // Écrire toute modification en attente à l'arrêt du serveur
  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.once(signal, () => {
      void flush();
    });
  }
}
