/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    useTypeScriptCli: true,
    serverActions: {
      allowedOrigins: ['49.233.13.58:3000', 'localhost:3000'],
    },
  }
};

export default nextConfig;
