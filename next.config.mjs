/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // Hook d'instrumentation (Next 14) : charge la persistance au démarrage du serveur.
  experimental: { instrumentationHook: true },
  webpack: (config, { isServer, nextRuntime }) => {
    // instrumentation.ts est compilé aussi pour Edge : fs/path y sont stubbés
    // (la garde NEXT_RUNTIME dans register() garantit qu'ils ne s'exécutent jamais).
    if (isServer && nextRuntime === 'edge') {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        'fs/promises': false,
      };
    }
    return config;
  },
};

export default nextConfig;
