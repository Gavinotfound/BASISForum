import path from 'node:path';
import { fileURLToPath } from 'node:url';

const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
  experimental: {
    useTypeScriptCli: true,
    serverActions: {
      allowedOrigins: ['49.233.13.58:3000', 'localhost:3000'],
    },
  }
};

export default nextConfig;
