import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Prisma and the pg driver stay outside the bundler: the generated client
  // loads its runtime from node_modules and the adapter opens a native socket.
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
};

export default nextConfig;
