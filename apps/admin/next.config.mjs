/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    useTypeScriptCli: true,
  }
};

export default nextConfig;
