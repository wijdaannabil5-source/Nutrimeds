/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    'better-sqlite3',
    'better-auth',
    '@better-auth/kysely-adapter',
    'kysely',
  ],
};

export default nextConfig;
